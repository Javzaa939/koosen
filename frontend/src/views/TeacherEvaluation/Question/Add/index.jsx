import React, { Fragment, useState, useEffect, useCallback } from 'react'

import { Label, Input, Col, Button,  Form, Modal, ModalHeader, ModalBody, Spinner } from 'reactstrap'

import { useForm } from "react-hook-form"
import { X } from 'react-feather'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader'
import { t } from 'i18next'

import Question from './Questions';
import './style.css'

const KIND_MULTI_CHOICE = 2 // 'Олон сонголт'

const AddQuestion = ({ open, handleModal, editData, refreshDatas }) => {

    const closeBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    );

    const default_page = [5, 10, 15, 20];

    const [popoverIdx, setPopoverIdx] = useState('')
    const [index_name, setIdx] = useState('')

    const [questions, setQuestions] = useState([])

    // ** Hook
	const { handleSubmit,  setError, clearErrors, setValue, formState: { errors } } = useForm()

    // API
    const evaluationApi = useApi().evaluation.register

    // Loader
	const { isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    useEffect(
        () =>
        {
            if ( Object.keys(editData).length > 0) {
                if(editData === null) return
                setQuestions([...questions, editData])
                for(let key in editData) {
                    if(editData[key] !== null)
                        setValue(key, editData[key])
                    else setValue(key,'')
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
        } else {
            setQuestions([])
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
        }

        if (generateNumber) {
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
        if (editData && Object.keys(editData).length > 0) {

            const { success, error } = await postFetch(evaluationApi.put(formData, editData?.id))
            if(success)
            {
                handleModal()
            }
        } else {
            const { success, error } = await postFetch(evaluationApi.post(formData))
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
                style={{maxWidth: '900px', width: '100%',}}
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
                            style={{ height: "30px", maxWidth: '250px', width: '100%' }}
                            onChange={(e) => handlePerPage(e)}
                        >
                            <option value={''}>
                                {'--Сонгоно уу--'}
                            </option>
                            {default_page.map((page, idx) => (
                                <option key={idx} value={page}>
                                    {page}
                                </option>
                            ))}
                        </Input>
                    </Col>

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
                        readOnly={false}
                    />

                    <hr></hr>

                    <div className=''>
                        <Button  color="primary" size='sm' onClick={() => handleAddQuestion(null)}>
                            Асуулт нэмэх
                        </Button>
                    </div>

                    <div className='d-flex justify-content-start mt-3'>
                        <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
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
