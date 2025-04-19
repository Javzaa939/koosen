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
});

const subValidateSchema = Yup.object().shape({
    name: Yup.string().trim().required("Хоосон байна"),
    main: Yup.string().trim().required("Хоосон байна"),
});

export default function SeasonQuestions({ setTitleToNextStep }) {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const [addLessonModal, setAddLessonModal] = useState(false)
    const [addSubModal, setAddSubModal] = useState(false)
    const [lesson, setLesson] = useState('')
    const [datas, setDatas] = useState([])
    const [subDatas, setSubDatas] = useState([])

    const { fetchData, Loader, isLoading } = useLoader({})
    const { control, handleSubmit, formState: { errors }, setValue, reset } = useForm(validate(validateSchema))
    const { control: subControl, handleSubmit: handleSubSubmit, formState: { errors : errorSub}, setValue: setSubValue, reset: subReset } = useForm(validate(subValidateSchema))

    const questionAPI = useApi().challenge.graduate

    const handleLessonModal = () => {
        setAddLessonModal(!addLessonModal)
    }

    const handleSubModal = () => {
        setAddSubModal(!addSubModal)
    }

    async function getDatas() {
        const { success, data } = await fetchData(questionAPI.getTitle())
        if (success) {
            setDatas(data)
        }
    }

    async function getSubDatas() {
        const { success, data } = await fetchData(questionAPI.getSubTitle(lesson))
        if (success) {
            setSubDatas(data)
        }
    }

    useEffect(
        () =>
        {
            getDatas()
        },
        []
    )

    useEffect(
        () =>
        {
            getSubDatas()
        },
        [lesson]
    )

    async function onSubmit(datas) {
        const { success, data } = await fetchData(questionAPI.postTitle(datas))
        if (success) {
            getDatas()
            reset()
        }
    }

    async function onSubSubmit(cdata) {
        const { success, data } = await fetchData(questionAPI.postSubTitle(cdata))
        if (success) {
            getSubDatas()
            subReset()
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
                        <h5>Бүлгийн жагсаалт</h5>
                        <div>
                            <Button size='sm' color='primary' onClick={() => handleLessonModal()}>Нэмэх</Button>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <ListGroup tag='div'>
                        {
                            datas?.map((clesson, idx) =>
                                <ListGroupItem
                                    key={idx}
                                    className={classnames('cursor-pointer', {
                                        active: lesson === clesson?.id
                                    })}
                                    onClick={() => toggleList(clesson?.id)}
                                    action
                                >
                                <span className=''>{idx + 1}. {clesson?.name}</span>
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
                            <Button size='sm' color='primary' onClick={() => handleSubModal()}>{t('Нэмэх')}</Button>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <Table bordered size={'md'} responsive hover>
                            <thead>
                                <tr>
                                    <th>№</th>
                                    <th>{t('Үндсэн бүлэг нэр')}</th>
                                    <th>{t('Дэд бүлэг нэр')}</th>
                                    <th>{t('Асуултын тоо')}</th>
                                    <th>{t('Үйлдэл')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    subDatas?.map((data, idx) =>
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td>{data?.main_name}</td>
                                            <td>{data?.name}</td>
                                            <td>{data?.question_count}</td>
                                            <td>
                                                <Badge tag={'a'} color={'light-primary'} id={`add_${idx}`} onClick={() => setTitleToNextStep(data?.id)}>
                                                    <PlusCircle/>
                                                </Badge>
                                                <UncontrolledTooltip target={`add_${idx}`}>{t('Асуулт нэмэх')}</UncontrolledTooltip>
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
                        <ModalHeader toggle={handleLessonModal}>{('Асуултын бүлэг нэмэх')}</ModalHeader>
                        <ModalBody className="w-100 h-100 ">
                        <Row className='g-1' tag={Form} onSubmit={handleSubmit(onSubmit)}>
                            <Col md={12}>
                                <Label className="form-label" for="name">
                                    {t('Бүлгийн нэр')}
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
                                <Button type='submit' className='me-1' color='primary' size='sm'>{t('Хадгалах')}</Button>
                                <Button color='primary' outline size='sm' onClick={() => handleLessonModal()}>{t('Буцах')}</Button>
                            </Col>
                        </Row>
                    </ModalBody>
                    </Modal>
            }
            {
                addSubModal &&
                    <Modal isOpen={addSubModal} className="modal-dialog-centered modal-sm" >
                        <ModalHeader toggle={handleSubModal}>{('Асуултын дэд бүлэг нэмэх')}</ModalHeader>
                        <ModalBody className="w-100 h-100 ">
                            <Row className='g-1' tag={Form} onSubmit={handleSubSubmit(onSubSubmit)}>
                                <Col md={12}>
                                    <Label className="form-label" for="main">
                                        {t('Үндсэн бүлгийн нэр')}
                                    </Label>
                                    <Controller
                                        defaultValue=''
                                        control={subControl}
                                        name="main"
                                        render={({ field: { value, onChange } }) => (
                                            <Select
                                                name="main"
                                                id="main"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select', { 'is-invalid': errorSub.main })}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={datas || []}
                                                value={datas.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна')}
                                                onChange={(val) => {
                                                    onChange(val?.id)
                                                }}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        )}
                                    />
                                    {errorSub.main && <FormFeedback className='d-block'>{t(errorSub.main.message)}</FormFeedback>}
                                </Col>
                                <Col md={12}>
                                    <Label className="form-label" for="name">
                                        {t('Дэд бүлгийн нэр')}
                                    </Label>
                                    <Controller
                                        defaultValue=''
                                        control={subControl}
                                        name="name"
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id={field.name}
                                                bsSize="sm"
                                                placeholder={t('Сэдвийн нэр')}
                                                type="text"
                                                invalid={errorSub[field.name] && true}
                                            />
                                        )}
                                    />
                                    {errorSub.name && <FormFeedback className='d-block'>{t(errorSub.name.message)}</FormFeedback>}
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
