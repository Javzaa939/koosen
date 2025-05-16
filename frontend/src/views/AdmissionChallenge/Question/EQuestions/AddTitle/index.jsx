import { useEffect, useState } from 'react';
import { MinusCircle, PlusCircle, } from 'react-feather'
import { Controller, useForm } from 'react-hook-form'
import {
    Button,
    Form,
    Modal,
    ModalHeader,
    ModalBody,
    Row,
    Col,
    Label,
    Input,
    FormFeedback,
} from 'reactstrap'
import { useTranslation } from 'react-i18next';
import { validate, ReactSelectStyles } from "@utils";
import * as Yup from "yup";
import useLoader from '@hooks/useLoader';
import useApi from '@hooks/useApi';

import Select from 'react-select'
import classnames from 'classnames'

const validateSchema = Yup.object().shape({
    name: Yup.string().trim().required("Хоосон байна"),
    questions: Yup.array().min(1, "Асуулт нэмнэ үү").required("Хоосон байна")
});

const CHALLENGE_TYPE_ADMISSION = 6

export default function AddTitle({ open, setOpen, getAllTitle, setActiveTitle, examType }) {

    const [questionList, setQuestionList] = useState([])
    const [lessonOption, setLessonOption] = useState([])
    const [isMapRendering, setIsMapRendering] = useState(false)
    const { control, handleSubmit, formState: { errors }, setValue } = useForm(validate(validateSchema))

    const questionAPI = useApi().challenge.question
    const lessonApi = useApi().study.lessonStandart
    const { fetchData, Loader, isLoading } = useLoader({})

    const { t } = useTranslation()

    useEffect(
        () => {
            if (open.editId) {
                getOneTitle()
            } else {
                getAllQuestoin()
            }
        },
        []
    )

    async function getOneTitle() {
        const { success, data } = await fetchData(questionAPI.getOneTitle(open.editId))
        if (success) {
            setValue("questions", data.questions)
            setValue("name", data.title.name)
            setValue("lesson", data.title.lesson)
            setQuestionList(data.other_questions)
        }
    }

    // const getLessons = async () => {
    //     try {
    //         const { success, data } = await fetchData(lessonApi.getList())
    //         if (success) {
    //             setLessonOption(data)
    //         }
    //     }
    //     catch (error) {
    //         console.error("Error fetching lessons:", error);
    //     }

    // }

    async function getAllQuestoin() {
        // to show loader while mapping is processing. because it can be longer then fetchData loading
        setIsMapRendering(true)

        const { success, data } = await fetchData(questionAPI.getTestList(true))
        if (success) {
            setQuestionList(data)
            setIsMapRendering(false)
        }
    }

    async function onSubmit(datas) {
        datas['questions'] = datas['questions']?.map(v => v.id)
        datas['other_questions'] = questionList.map(v => v.id)
        datas['is_admission'] = examType === 'admission' ? true : false
        const { success, data } = await fetchData(open.editId ? questionAPI.putTitle(open.editId, datas) : questionAPI.postTitle(datas))
        if (success) {
            getAllTitle()
            setActiveTitle(0)
            setOpen({ type: false, editId: null })
        }
    }

    // useEffect(
    //     () => {
    //         if (examType !== 'admission') {
    //             getLessons()
    //         }
    //     },
    //     []
    // )

    // to show loader while mapping is processing
    useEffect(() => {
        if (Array.isArray(questionList)) {
            requestAnimationFrame(() => {
                setIsMapRendering(false)
            });
        }
    }, [questionList]);

    return (
        <>
            <Modal
                isOpen={open.type}
                toggle={() => { setOpen({ type: false, editId: null }) }}
                className='sidebar-xl'
                modalClassName='modal-slide-in custom-80'
                contentClassName='p-0'
            >
                <ModalHeader
                    className=""
                    tag="div"
                    style={{ position: "relative" }}
                >
                    <div>
                        <h4 className='mb-0'>Багц асуулт {open.editId ? "засах" : "нэмэх"}</h4>
                    </div>
                </ModalHeader>
                <ModalBody className="w-100 h-100 ">
                    <Row className='g-1' tag={Form} onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="name">
                                {t('Сэдэв')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="name"
                                name="name"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="name"
                                        bsSize="sm"
                                        placeholder={t('Багц асуултын нэр')}
                                        type="text"
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                        </Col>


                        <Controller
                            defaultValue={[]}
                            control={control}
                            id="questions"
                            name="questions"
                            render={({ field: { value, onChange } }) => (
                                <>
                                    <Col md={6} className={errors.questions ? "border-danger rounded" : " "}>
                                        <Label className="form-label" for="questions">
                                            {t('Хичээлийн сэдэвт багцлагдсан асуултууд')}
                                        </Label>
                                        {
                                            value && value?.length > 0 ?
                                                <ul className='border border-2 rounded p-0' style={{ listStyle: "none" }}>
                                                    {
                                                        value.map((question, index) => {
                                                            return (
                                                                <li className='py-25 px-25 d-flex justify-content-between align-items-center' key={index}>
                                                                    <div>
                                                                        <span className='px-25'>
                                                                            {index + 1}.
                                                                        </span>
                                                                        <span>
                                                                            {question.question}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <MinusCircle className='text-danger cursor-pointer' size={16} onClick={() => { setQuestionList([...questionList, question]); onChange(value.filter(v => v.id !== question.id)) }} />
                                                                    </div>
                                                                </li>
                                                            )
                                                        })
                                                    }

                                                </ul>
                                                :
                                                ''
                                        }
                                    </Col>
                                    <Col md={6} className=''>
                                        <Label className="form-label" for="questions">
                                            {t('Багцлах боломжтой асуултууд')}
                                        </Label>
                                        {isMapRendering && Loader}
                                        <ul className='border border-2 rounded p-25' style={{ listStyle: "none" }}>
                                            {
                                                questionList.map((question, index) => {
                                                    return (
                                                        <li className='py-25 px-25 d-flex justify-content-between align-items-center' key={index}>
                                                            <div>
                                                                <span className='px-25'>
                                                                    {index + 1}.
                                                                </span>
                                                                <span>
                                                                    {question.question}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <PlusCircle className='text-primary cursor-pointer' size={16} onClick={() => { onChange([...value, question]); setQuestionList(questionList.filter(v => v.id !== question.id)) }} />
                                                            </div>
                                                        </li>
                                                    )
                                                })
                                            }
                                        </ul>
                                    </Col>
                                </>
                            )}
                        />
                        {errors.questions && <FormFeedback className='d-block'>{t(errors.questions.message)}</FormFeedback>}

                        <Col md={12}>
                            <Button type='submit' className='me-1' color='primary' size='sm'>Хадгалах</Button>
                            <Button color='primary' outline size='sm' onClick={() => { setOpen({ type: false, editId: null }) }}>Буцах</Button>
                        </Col>
                    </Row>

                </ModalBody>
            </Modal>
        </>
    )
};
