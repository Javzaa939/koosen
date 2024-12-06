import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ModalBody, Card, CardBody, CardHeader, Col, Modal,
    ModalHeader, Row, FormFeedback, Form, Table, Button, Label, Input,
    Badge,
    UncontrolledTooltip,
    ListGroupItem,
    ListGroup
} from 'reactstrap'
import Select from 'react-select'
import classnames from 'classnames'
import * as Yup from "yup";
import useLoader from '@hooks/useLoader';
import useApi from '@hooks/useApi';
import { useTranslation } from 'react-i18next';
import { validate, ReactSelectStyles } from "@utils";
import { Controller, useForm } from 'react-hook-form'
import { ChevronsLeft, PlusCircle } from 'react-feather';

const validateSchema = Yup.object().shape({
    name: Yup.string().trim().required("Хоосон байна"),
    lesson: Yup.string().required("Хоосон байна"),
});

export default function SeasonQuestions({teacher_id, handleDetail}) {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const [addLessonModal, setAddLessonModal] = useState(false)
    const [lessonOption, setLessonOption] = useState([])
    const [lessons, setLessons] = useState([])
    const [lesson, setLesson] = useState('')
    const [datas, setDatas] = useState([])

    const { fetchData, Loader, isLoading } = useLoader({})
    const { control, handleSubmit, formState: { errors }, setValue } = useForm(validate(validateSchema))

    const lessonApi = useApi().study.lesson
    const questionAPI = useApi().challenge.question

    const handleLessonModal = () => {
        setAddLessonModal(!addLessonModal)
    }

    async function getLessons() {
        const { success, data } = await fetchData(lessonApi.getOne(''))

        if (success) {
            setLessonOption(data)
        }
    }

    async function getDatas() {
        const { success, data } = await fetchData(questionAPI.getTitle('', true, teacher_id))

        if (success) {
            setDatas(data)

            var groupedData = data.reduce((acc, item) => {
                const key = `${item.lesson__code}-${item.lesson__name}`;

                if (!acc[key]) {
                    acc[key] = {
                        code: item.lesson__code,
                        name: item.lesson__name,
                        id: item.lesson__id,
                        items: []
                    };
                }

                acc[key].items.push(item);

                return acc;
            }, {});

            var result = Object.values(groupedData);
            setLessons(result)
        }
    }

    useEffect(
        () =>
        {
            getLessons()
            getDatas()
        },
        []
    )

    useEffect(
        () =>
        {
            if (lesson) {
                var one_item = lessons?.find((c) => c.id == lesson)
                setDatas(one_item?.items)
            }
        },
        [lesson]
    )

    async function onSubmit(datas) {
        datas['is_season'] = true
        const { success, data } = await fetchData(questionAPI.postTitle(datas))

        if (success) {
            handleLessonModal()
            getDatas()
        }
    }

    const toggleList = lesson_id => {
        if (lesson !== lesson_id) {
            setLesson(lesson_id)
        }
    }

    return (
        <Row>
            <Col md={4}>
                <Card>
                    <CardHeader>
                        <div role="a"  onClick={() => navigate('/challenge-question/') } color='primary'>
                            <ChevronsLeft/>Буцах
                        </div>
                        <h5>Хичээлийн жагсаалт</h5>
                    </CardHeader>
                    <CardBody>
                        <ListGroup tag='div'>
                        {
                            lessons?.map((clesson, idx) =>
                                <ListGroupItem
                                    key={idx}
                                    className={classnames('cursor-pointer', {
                                        active: lesson === clesson?.id
                                    })}
                                    onClick={() => toggleList(clesson?.id)}
                                    action
                                >
                                <span className=''>{idx + 1}. {clesson?.code + ' ' + clesson?.name}</span>
                            </ListGroupItem>
                            )
                        }
                        </ListGroup>
                    </CardBody>
                </Card>
            </Col>
            <Col md={8}>
                <Card>
                    <CardHeader>
                        <h6>{t('Асуултын сэдвийн жагсаалт')}</h6>
                        <div>
                            <Button size='sm' color='primary' onClick={() => handleLessonModal()}>{t('Нэмэх')}</Button>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Table bordered size={'md'} responsive hover>
                            <thead>
                                <tr>
                                    <th>№</th>
                                    <th>{t('Хичээлийн нэр')}</th>
                                    <th>{t('Сэдвийн нэр')}</th>
                                    <th>{t('Асуултын тоо')}</th>
                                    <th>{t('Үйлдэл')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    datas?.map((data, idx) =>
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td>{data?.lesson__code + ' ' + data?.lesson__name}</td>
                                            <td>{data?.name}</td>
                                            <td>{data?.question_count}</td>
                                            <td>
                                                <Badge tag={'a'} color={'light-primary'} id={`add_${idx}`} onClick={() => handleDetail(data?.id)}>
                                                    <PlusCircle/>
                                                </Badge>
                                                <UncontrolledTooltip target={`add_${idx}`}>{t('Сэдэв нэмэх')}</UncontrolledTooltip>
                                            </td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </Table>
                    </CardBody>
                </Card>
            </Col>
            {
                addLessonModal &&
                <Modal isOpen={addLessonModal} className="modal-dialog-centered modal-sm" >
                    <ModalHeader toggle={handleLessonModal}>{('Асуултын сэдэв нэмэх')}</ModalHeader>
                    <ModalBody className="w-100 h-100 ">
                    <Row className='g-1' tag={Form} onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="name">
                                {t('Сэдвийн нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name="name"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id={field.name}
                                        bsSize="sm"
                                        placeholder={t('Сэдвийн нэр')}
                                        type="text"
                                        invalid={errors[field.name] && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="lesson">
                                {t('Хичээл')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="lesson"
                                name="lesson"
                                render={({ field: { value, onChange } }) => (
                                    <Select
                                        name="lesson"
                                        id="lesson"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                        placeholder={t(`-- Сонгоно уу --`)}
                                        options={lessonOption || []}
                                        value={lessonOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.code + ' ' + option.name}
                                    />
                                )}
                            />
                            {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                        </Col>

                        <Col md={12}>
                            <Button type='submit' className='me-1' color='primary' size='sm'>{t('Хадгалах')}</Button>
                            <Button color='primary' outline size='sm' onClick={() => handleLessonModal()}>{t('Буцах')}</Button>
                        </Col>
                    </Row>

                </ModalBody>

                </Modal>
            }
        </Row>
    )
}
