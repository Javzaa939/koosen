import React, { Fragment, useState,  useCallback, useEffect } from 'react'
import {
    Row,
    Col,
    Button,
    Label,
    Input,
    Spinner
} from "reactstrap";

import { ChevronLeft, Check, ChevronRight } from "react-feather"
import Questions from "./Questions"

import useLoader from "@hooks/useLoader";
import useApi from '@hooks/useApi';


const Asuult = ({ handleModal , stepper, data, editData, isEdit, refreshDatas }) => {

    const default_page = [0, 5, 10, 15, 20];

    const [popoverIdx, setPopoverIdx] = useState('')
    const [index_name, setIdx] = useState('')

    const [choiceErrors, setChoiceErrors] = useState({})

    const [questions, setQuestions] = useState([])

    // Loader
	const { isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // API
    const surveyAPI = useApi().survey

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
            if (popoverIdx === cidx) {
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

                    row_choices[choice_idx]['choices'] = ''
                    row_choices[choice_idx]['imageUrl'] = generalDataImg
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

        var selectedIds = data.selected_ids
        if (selectedIds != undefined) {
            delete data.selected_ids

            selectedIds.forEach(element => {
                formData.append('selected_id', element)
            });
        }

        for (let key in data) {
            formData.append(key, data[key])
        }

        const { success, error } = await postFetch(surveyAPI.post(formData))
        if(success)
        {
            handleModal()
            refreshDatas()
        }

        // // Update хийх хэсэг
        // if (Object.keys(editData).length > 0) {

        //     const { success, error } = await fetchData(questionAPI.put(formData, editData?.id))
        //     if(success)
        //     {
        //         handleModal()
        //     }
        // } else {
        //     const { success, error } = await fetchData(questionAPI.post(formData))
        //     if(success)
        //     {
        //         handleModal()
        //         refreshDatas()
        //     }
        // }
    }

    useEffect(
        () =>
        {
            if ( Object.keys(editData).length > 0) {

				for(let key in editData) {
					if(key === 'questions' && editData[key].length > 0) {
						setQuestions([...editData[key]])
					}
				}
            }
        },
        [editData]
    )

    // function DisabledButton(){
    //     if () {
    //         <Button color='primary' className='btn-next' type="submit" onClick={onSubmit} >
    //             <span className='align-middle d-sm-inline-block d-none'>Бүртгэх <Check size={14} className='align-middle ms-sm-25 ms-0' /></span>
    //         </Button>
    //     } else {
    //         <Button color='primary' className='btn-next' type="submit" >
    //             <span className='align-middle d-sm-inline-block d-none'>Бүртгэх <Spinner size={14} className='align-middle ms-sm-25 ms-0' /></span>
    //         </Button>
    //     }
    // }
    return (
        <Fragment>
            <Row>
                <h3>{'Судалгааны асуулт'} {isEdit ?  'засах' : 'нэмэх'}</h3>
                {
                    !isEdit &&
                        <Col
                            md={4}
                            sm={12}
                        >
                            <hr></hr>
                            <Label className='form-label'>
                                {"Хуудсанд харуулах асуултын тоо"}
                            </Label>
                            <Input
                                type="select"
                                bsSize="sm"
                                style={{ height: "30px", width: '100%' }}
                                onChange={(e) => handlePerPage(e)}
                            >
                                {default_page.map((page, idx) => (
                                    <option key={idx} value={page}>
                                        {page}
                                    </option>
                                ))}
                            </Input>
                        </Col>
                }

                <Questions
                    questions={questions}
                    removeQuestion={removeDataField}
                    handleChange={onHandleChange}
                    handleAddChoice={handleAddChoice}
                    errors={choiceErrors}
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

                <div className=''>
                    <Button  color="primary" size='sm' className="mt-2" onClick={() => handleAddQuestion(null)}>
                        Асуулт нэмэх
                    </Button>
                </div>
            </Row>
            <Col md={12} className="text-center mt-2">
                <div className='d-flex justify-content-between mt-3'>
                    <Button color='secondary' className='btn-prev' outline onClick={() => stepper.previous()}>
                        <ChevronLeft size={14} className='align-middle me-sm-25 me-0'></ChevronLeft>
                        <span className='align-middle d-sm-inline-block d-none'>Өмнөх</span>
                    </Button>
                    <Button color='primary' className='btn-next ' type="submit" onClick={onSubmit}>
                        <span className='align-middle d-sm-inline-block'>Бүртгэх <ChevronRight size={14} className='align-middle ms-sm-25 ms-0' /></span>
                    </Button>
                </div>
            </Col>
        </Fragment>
    )
}
export default Asuult;


