import * as Yup from 'yup'
import React, { Fragment, useState, useEffect, useMemo, useCallback } from 'react'

import { X } from 'react-feather'

import { Label, Input, Row, Col, Button, FormFeedback,  Form, Modal, ModalHeader, ModalBody } from 'reactstrap'

import Select from 'react-select'
import classnames from "classnames";

import { Controller, useForm } from "react-hook-form"

import { ReactSelectStyles, validate } from "@utils"

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import '../../style.css'

import Question from './Questions';

import '../../style.css'

const KIND_MULTI_CHOICE = 2 // 'Олон сонголт'

const validateSchema = Yup.object().shape({
    lesson: Yup.string().required("Хоосон байна"),
    subject: Yup.string().required("Хоосон байна"),
})

const AddQuestion = ({ open, handleModal, editData, refreshDatas }) => {

    const closeBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    );

    const default_page = [0, 5, 10, 15, 20];

    const [popoverIdx, setPopoverIdx] = useState('')
    const [index_name, setIdx] = useState('')

    const [subjectId, setSubjectId] = useState('')
    const [lessonId, setLessonId] = useState('')

    const [choiceErrors, setChoiceErrors] = useState({})

    const [questions, setQuestions] = useState([])

    const [lessonOption, setLessonOption] = useState([])
    const [lessonSedevOption, setLessonSedevOption] = useState([])

    // ** Hook
	const { control, handleSubmit, setValue, setError, clearErrors,  formState: { errors } } = useForm(validate(validateSchema))

    // API
    const subjectAPI = useApi().teacher.lesson
    const questionAPI = useApi().challenge.question

    // Loader
	const { isLoading, fetchData } = useLoader({});


    async function getLesson()
    {
        const { success, data } = await fetchData(subjectAPI.get('all'))
        if(success) {
            setLessonOption(data)
        }
    }

    async function getLessonSedev()
    {
        if(lessonId) {
            const { success, data } = await fetchData(subjectAPI.getSedevAll(lessonId))
            if(success) {
                setLessonSedevOption(data)
            }
        }
    }

    useEffect(
        () =>
        {
            getLesson()
        },
        []
    )

    useEffect(
        () =>
        {
            getLessonSedev()
        },
        [lessonId]
    )

    useEffect(
        () =>
        {
            if ( Object.keys(editData).length > 0) {
                setQuestions([...questions, editData])

                if (editData.subject) {
                    setLessonId(parseInt(editData.lesson_id))
                    setSubjectId(editData.subject?.id)

                    // setValue
                    setValue('lesson', parseInt(editData.lesson_id))
                    setValue('subject', editData.subject?.id)
                }
            }

        },
        [editData]
    )

    // Асуултын тоог generate хийх
    function handlePerPage(e) {
        var value = parseInt(e.target.value)

        if (value) {
            handleAddQuestion(value)
        }
	}

    // Сонголтын зурагны popover
    const handlePopOver = useCallback(
        (cidx='', idx="") =>
        {
            if (popoverIdx===cidx) {
                setPopoverIdx('')
            } else {
                setPopoverIdx(cidx)
            }

            setIdx(idx)
        }, [popoverIdx]
    )

    // Асуулт нэмэх
    function handleAddQuestion (generateNumber) {
        var generatesDatas = []

        const cvalues = {
            kind: '',
            imageUrl: '',
            image: '',
            rating_max_count: 5,
            low_rating_word: 'Муу',
            high_rating_word: 'Сайн',
            max_choice_count: '',
            choices: [],
            score: 1,
            yes_or_no: ''
        }

        if (generateNumber === 0) {
            setQuestions(generatesDatas)
        }

        else if (generateNumber) {
            for (let i = 0; i < generateNumber; i++) {
                generatesDatas.push({...cvalues})
            }

            setQuestions([...generatesDatas])

        } else {
            setQuestions([...questions, cvalues]);
        }
    }

    // Асуултын сонголт нэмэх
    const handleAddChoice = useCallback(
        (index) => {
            const data = [...questions];

            var row_choices = questions[index].choices

            const cvalues = {
                choices: '',
                imageUrl: '',
                image: '',
                imageName: '',
                checked: false
            }

            data[index]['choices'] = [...row_choices, cvalues]

            setQuestions(data);
        }, [questions]
    )

    // Сонголтын мөр устгах
    const removeChoicesField = useCallback(
        (index, choice_idx) => {
            const data = [...questions];

            var row_choices = questions[index].choices

            var crow_choices = [...row_choices]

            crow_choices.splice(choice_idx, 1);

            data[index]['choices'] = crow_choices

            setQuestions(data);
        },
        [questions]
    )

    // Асуултын мөр устгах
    const removeDataField = useCallback(
        (index) => {
          const dataRow = [...questions];

          dataRow.splice(index, 1);

          setQuestions(dataRow);
        },
        [questions],
      );


    // Асуулт onChange
    const onHandleChange = useCallback (
        (index, value, name) => {
            const data = [...questions];

            if(data && data.length > 0) {

                if (name === 'image') {
                    if (value.length > 0) {

                        data[index]['image'] = value[0]
                        data[index]['imageName'] = value[0]?.name

                        var generalDataImg = window.URL.createObjectURL(value[0])

                        data[index]['imageUrl'] = generalDataImg
                    }
                } else if (name === 'kind') {
                    if (value === KIND_MULTI_CHOICE && !data[index]['max_choice_count']) {
                        setError('max_choice_count', { type: 'custom', message: 'Хоосон байна'})
                    }

                    data[index][name] = value

                } else if (name === 'max_choice_count' && value) {
                    clearErrors('max_choice_count')
                    data[index][name] = value

                } else if(name === 'yes_or_no') {
                    if (value === 'Тийм') {
                        data[index][name] = 1
                    } else {
                        data[index][name] = 0
                    }
                } else {
                    data[index][name] = value
                }
            }

            setQuestions(data);
        },
        [questions]
    )

    // Асуултын сонголт onChange
    const onHandleChoiceChange = useCallback (
        (index, choice_idx, value, name) =>
        {
            const data = [...questions];
            var row_choices = questions[index].choices

            if (name == 'image') {
                if (value.length > 0) {

                    row_choices[choice_idx]['image'] = value[0]
                    var generalDataImg = window.URL.createObjectURL(value[0])

                    row_choices[choice_idx]['imageUrl'] = generalDataImg
                    row_choices[choice_idx]['choices'] = ''
                    row_choices[choice_idx]['imageName'] = value[0]?.name

                    data[index]['choices'] = row_choices

                    setQuestions(data);
                    setPopoverIdx('')
                }
            } else if (name == 'checked') {
                var kind = questions[index].kind

                row_choices[choice_idx][name] = value

                var max_choice_count = questions[index].max_choice_count
                var checkeds = row_choices.filter((c) => c.checked === true)

                if (kind === KIND_MULTI_CHOICE) {

                    if (checkeds.length > parseInt(max_choice_count)) {
                        setChoiceErrors({
                            idx: choice_idx,
                            message: 'Сонголтын хязгаараас илүү зөв хариу сонгох боломжгүй'
                        })
                    } else {
                        setChoiceErrors({})
                    }
                } else {
                    if (checkeds.length > 1) {
                        setChoiceErrors({
                            idx: choice_idx,
                            message: '1-ээс илүү зөв хариу сонгох боломжгүй'
                        })
                    } else {
                        setChoiceErrors({})
                    }
                }
            } else {

                row_choices[choice_idx][name] = value

                data[index]['choices'] = row_choices

                setQuestions(data);
            }
        }, [questions]
    )

    // Асуултын зураг устгах
    const handleDeleteImage = useCallback(
        (index) =>
        {
            const dataRow = [...questions];
            dataRow[index]['image'] = ''
            dataRow[index]['imageUrl'] = ''
            dataRow[index]['imageName'] = ''

            setQuestions(dataRow);
        },
        [questions]
    )

    // Зураг дээр дарахад
    const clickLogoImage = useCallback(
        (idx) =>
        {
            var logoInput = document.getElementById(`logoInput${idx}`)

            logoInput.click()
        },
        [questions]
    )

    // Хариултын зураг дээр дарахад
    const clickAnswerImg = useCallback(
        (idx) =>
        {
            var logoImgInput = document.getElementById(`imgInput${idx}`)

            logoImgInput.click()
        },
        [questions]
    )

    // Хариултын зураг устгах
    const handleDeleteChoiceImage = useCallback(
        (idx, cIdx) =>
        {
            const data = [...questions];
            var row_choices = questions[idx].choices

            row_choices[cIdx]['image'] = ''
            row_choices[cIdx]['imageUrl'] = ''
            row_choices[cIdx]['imageName'] = ''

            data[idx]['choices'] = row_choices

            setQuestions(data);
        },
        [questions]
    )

    const onSubmit = async() => {

        var formData = new FormData()

        formData.append('subject', subjectId)

        for(let idx in questions) {

            var choices = questions[idx].choices
            var quesionImg = questions[idx].image

            if (quesionImg) {
                formData.append('questionImg', quesionImg)
            }

            for(let ckey in choices) {
                var choiceImg = choices[ckey].image

                if (choiceImg) {
                    formData.append('choiceImg', choiceImg)
                }
            }

            formData.append('question', JSON.stringify(questions[idx]))
        }

        // Update хийх хэсэг
        if (Object.keys(editData).length > 0) {

            const { success, error } = await fetchData(questionAPI.put(formData, editData?.id))
            if(success)
            {
                handleModal()
            }
        } else {
            const { success, error } = await fetchData(questionAPI.post(formData))
            if(success)
            {
                handleModal()
                refreshDatas()
            }
        }
    }

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className='sidebar-xl custom-80'
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={closeBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{"Асуулт нэмэх"}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1" tag={Form} onSubmit={handleSubmit(onSubmit)}>

                    <Row className='my-1' >
                        <Col md={4} sm={12} >
                            <Label className="form-label" for="lesson">
                                {'Хичээл'}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue={lessonId}
                                name="lesson"
                                render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        id="lesson"
                                        name="lesson"
                                        isClearable
                                        placeholder={`-- Сонгоно уу --`}
                                        isLoading={isLoading}
                                        classNamePrefix='select'
                                        className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                        options={lessonOption || []}
                                        value={lessonOption.find((c) => c.id === lessonId)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            setLessonId(val?.id || '')
                                            onChange(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                    )
                                }}
                            />
                            {errors.lesson && <FormFeedback className='d-block'>{errors.lesson.message}</FormFeedback>}
                        </Col>
                        <Col md={4} sm={12}>
                            <Label className="form-label" for="subject">
                                {'Хичээлийн сэдэв'}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue={''}
                                name="subject"
                                render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        id="subject"
                                        name="subject"
                                        isClearable
                                        isLoading={isLoading}
                                        classNamePrefix='select'
                                        className={classnames('react-select', { 'is-invalid': errors.subject })}
                                        placeholder={`-- Сонгоно уу --`}
                                        options={lessonSedevOption || []}
                                        value={lessonSedevOption.find((c) => c.id === subjectId)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            setSubjectId(val?.id || '')
                                            onChange(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.title}
                                    />
                                )
                                }}
                            />
                            {errors.subject && <FormFeedback className='d-block'>{errors.subject.message}</FormFeedback>}
                        </Col>
                        <Col
                            md={4}
                            sm={12}
                        >
                            <Label for="sort-select" className='form-label'>
                                {"Хуудсанд харуулах асуултын тоо"}
                            </Label>
                            <Input
                                type="select"
                                bsSize="sm"
                                disabled={Object.keys(editData).length > 0 ? true : false}
                                style={{ height: "30px", width: '250px' }}
                                onChange={(e) => handlePerPage(e)}
                            >
                                {default_page.map((page, idx) => (
                                    <option key={idx} value={page}>
                                        {page}
                                    </option>
                                ))}
                            </Input>
                        </Col>
                    </Row>

                    <Question
                        questions={questions}
                        removeQuestion={removeDataField}
                        handleChange={onHandleChange}
                        handleAddChoice={handleAddChoice}
                        errors={errors}
                        removeChoicesField={removeChoicesField}
                        onHandleChoiceChange={onHandleChoiceChange}
                        handleDeleteImage={handleDeleteImage}
                        clickLogoImage={clickLogoImage}
                        clickAnswerImg={clickAnswerImg}
                        handlePopOver={handlePopOver}
                        popoverIdx={popoverIdx}
                        handleDeleteChoiceImage={handleDeleteChoiceImage}
                        index_name={index_name}
                        choiceErrors={choiceErrors}
                        readOnly={false}
                    />

                    <hr></hr>

                    <div className=''>
                        <Button  color="primary" size='sm' onClick={() => handleAddQuestion(null)}>
                            Асуулт нэмэх
                        </Button>
                    </div>

                    <div className='d-flex justify-content-start mt-3'>
                        <Button color='primary' className='btn-next' type='submit'>
                            <span className='align-middle d-sm-inline-block d-none'>Хадгалах</span>
                        </Button>
                        <Button color='secondary' className='btn-prev ms-1' outline onClick={handleModal}>
                            <span className='align-middle d-sm-inline-block d-none'>Буцах</span>
                        </Button>
                    </div>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}

export default AddQuestion
