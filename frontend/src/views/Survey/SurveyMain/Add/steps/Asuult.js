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
// import QuestionsBlock from './components/QuestionsBlock';
import { useTranslation } from 'react-i18next';
import QuestionTitles from './components/QuestionTitles';


const Asuult = ({ handleModal , stepper, cdata, editData, isEdit, refreshDatas, setSubmitDatas }) => {

    const { t } = useTranslation()
    const default_page = [0, 5, 10, 15, 20];

    const [popoverIdx, setPopoverIdx] = useState('')
    const [index_name, setIdx] = useState('')

    const [choiceErrors, setChoiceErrors] = useState({})

    // Loader
	const { Loader: postLoader, isLoading: postLoading, fetchData: postFetch } = useLoader({ isFullScreen: true });

    // API
    const surveyAPI = useApi().survey

    // State Array item устгах
    const removeDataField = (index, data, setData) => {
        const dataRow = [...data];
        dataRow.splice(index, 1);
        setData(dataRow);
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

    // #region to manage questions local state
    // Асуулт нэмэх
    function handleAddQuestion (generateNumber, setQuestions, copyIndex) {
        setQuestions((questions) => {
            const generatesDatas = []

            if (copyIndex >= 0) {
                const generatesDatasItem = { ...questions[copyIndex] }
                generatesDatasItem.rating_words = [...questions[copyIndex].rating_words]
                generatesDatasItem.choices = [...questions[copyIndex].choices]
                return [...questions, generatesDatasItem]
            } else {
                const cvalues = {
                    kind: '',
                    imageUrl: '',
                    image: '',
                    rating_max_count: '',
                    rating_words: [],
                    max_choice_count: '',
                    choices: [],
                }

                if (generateNumber === 0) {
                    return generatesDatas
                } else if (generateNumber) {
                    for (let i = 0; i < generateNumber; i++) {
                        generatesDatas.push({...cvalues})
                    }

                    return generatesDatas
                } else {
                    return [...questions, cvalues];
                }
            }
        })
    }

    // Асуултын тоог generate хийх
    function handlePerPage(e, setQuestions) {
        var value = parseInt(e.target.value)

        if (value) {
            handleAddQuestion(value, setQuestions)
        }
	}

    // Асуултын сонголт нэмэх
    const handleAddChoice =
        (index, setQuestions) => {
            setQuestions((questions) => {
                const data = [...questions];

                var row_choices = questions[index].choices

                const cvalues = {
                    choices: '',
                    imageUrl: '',
                    image: '',
                    imageName: '',
                }

                data[index]['choices'] = [...row_choices, cvalues]

                return data;
            })
        }

    // Сонголтын мөр устгах
    const removeChoicesField =
        (index, choice_idx, setQuestions) => {
            setQuestions((questions) => {
                const data = [...questions];

                var row_choices = questions[index].choices

                var crow_choices = [...row_choices]

                crow_choices.splice(choice_idx, 1);

                data[index]['choices'] = crow_choices

                return data;
            })
        }

    // Асуулт onChange
    const onHandleChange =
        (index, value, name, setQuestions) => {
            setQuestions((questions) => {
                const data = [...questions];

                if(data && data.length > 0) {

                    if (name === 'image') {
                        if (value.length > 0) {

                            data[index]['image'] = value[0]
                            data[index]['imageName'] = value[0]?.name

                            var generalDataImg = window.URL.createObjectURL(value[0])

                            data[index]['imageUrl'] = generalDataImg
                        }
                    } else if (name === 'rating_max_count') {
                        questions[index].rating_words.splice(value)
                        data[index][name] = value
                    } else {
                        data[index][name] = value
                    }
                }
                return data;
            })
        }

    // Rating word onChange
    const onHandleRatingWordChange =
        (index, rating_word_idx, value, setQuestions) =>
        {
            setQuestions((questions) => {
                const data = [...questions];
                const row_rating_words = questions[index].rating_words
                row_rating_words[rating_word_idx] = value
                data[index]['rating_words'] = row_rating_words
                return data;
            })
        }

    // Асуултын сонголт onChange
    const onHandleChoiceChange =
        (index, choice_idx, value, name, setQuestions) =>
        {
            setQuestions((questions) => {
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

                        setPopoverIdx('')
                        return data;
                    }
                } else {

                    row_choices[choice_idx][name] = value

                    data[index]['choices'] = row_choices

                    return data;
                }
            })
        }

    // Асуултын зураг устгах
    const handleDeleteImage =
        (index, setQuestions) =>
        {
            setQuestions((questions) => {
                const dataRow = [...questions];
                dataRow[index]['image'] = ''
                dataRow[index]['imageUrl'] = ''
                dataRow[index]['imageName'] = ''

                return dataRow;
            })
        }

    // Зураг дээр дарахад
    const clickLogoImage =
        (idx) =>
        {
            var logoInput = document.getElementById(`logoInput${idx}`)

            logoInput.click()
        }

    // Хариултын зураг дээр дарахад
    const clickAnswerImg =
        (idx) =>
        {
            var logoImgInput = document.getElementById(`imgInput${idx}`)

            logoImgInput.click()
        }

    // Хариултын зураг устгах
    const handleDeleteChoiceImage =
        (idx, cIdx, setQuestions) =>
        {
            setQuestions((questions) => {
                const data = [...questions];
                var row_choices = questions[idx].choices

                row_choices[cIdx]['image'] = ''
                row_choices[cIdx]['imageUrl'] = ''
                row_choices[cIdx]['imageName'] = ''

                data[idx]['choices'] = row_choices

                return data;
            })
        }
    // #endregion

    // #region to manage questions global state
    const onSubmit = async() => {
        var formData = new FormData()
        const questions = []

        for (let i = 0; i < questionTitles.length; i++) {
            const questionTitle = questionTitles[i]
            const questionItems = questionTitle.questions

            for (let j = 0; j < questionItems.length; j++) {
                const questionItem = {...questionItems[j]}
                questionItem.titleName = questionTitle.name
                questions.push(questionItem)
            }
        }

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

        var selectedIds = cdata.selected_ids
        if (selectedIds != undefined) {
            selectedIds.forEach(element => {
                formData.append('selected_id', element)
            });
        }

        for (let key in cdata) {
            if (key != 'selected_ids') {
                formData.append(key, cdata[key])
            }
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

    // useEffect(
    //     () =>
    //     {
    //         if ( Object.keys(editData).length > 0) {

	// 			for(let key in editData) {
	// 				if(key === 'questions' && editData[key].length > 0) {
	// 					setQuestions([...editData[key]])
	// 				}
	// 			}
    //         }
    //     },
    //     [editData]
    // )
    // #endregion

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

    // #region to add question title
    const [questionTitles, setQuestionTitles] = useState([])

    // Асуултын сэдэв нэмэх
    function handleAddQuestionTitle (generateNumber) {
        const generatesDatas = []

        const cvalues = {
            name: '',
        }

        if (generateNumber === 0) {
            setQuestionTitles(generatesDatas)
        } else if (generateNumber) {
            for (let i = 0; i < generateNumber; i++) {
                generatesDatas.push({...cvalues})
            }

            setQuestionTitles(generatesDatas)
        } else {
            setQuestionTitles([...questionTitles, cvalues]);
        }
    }

    // Асуултын сэдвийн тоог generate хийх
    function handleAddQuestionTitleMulti(e) {
        const value = parseInt(e.target.value)

        if (value) {
            handleAddQuestionTitle(value)
        }
	}

    // Асуултын сэдэв onChange
    const onHandleChangeTitle = useCallback (
        (index, value, name) => {
            const data = [...questionTitles];

            if(data && data.length > 0) {
                data[index][name] = value
            }

            setQuestionTitles(data);
        },

        [questionTitles]
    )
    // #endregion

    return (
        <Fragment>
            {postLoading && postLoader}
            <Row>
                <h3>{'Судалгааны асуултын сэдэв'} {isEdit ? 'засах' : 'нэмэх'}</h3>
            </Row>
            <Row>
                {
                    !isEdit &&
                    <Col
                        md={4}
                        sm={12}
                    >
                        <hr></hr>
                        <Label className='form-label'>
                            {"Хуудсанд харуулах асуултын сэдвийн тоо"}
                        </Label>
                        <Input
                            type="select"
                            bsSize="sm"
                            style={{ height: "30px", width: '100%' }}
                            onChange={(e) => handleAddQuestionTitleMulti(e)}
                        >
                            {default_page.map((page, idx) => (
                                <option key={idx} value={page}>
                                    {page}
                                </option>
                            ))}
                        </Input>
                    </Col>
                }
                <QuestionTitles
					removeDataField={removeDataField}
					onHandleChange={onHandleChange}
					handleAddChoice={handleAddChoice}
					choiceErrors={choiceErrors}
					onHandleRatingWordChange={onHandleRatingWordChange}
					handleDeleteImage={handleDeleteImage}
					clickLogoImage={clickLogoImage}
					handlePopOver={handlePopOver}
					popoverIdx={popoverIdx}
					index_name={index_name}
					readOnly={false}
					handleAddQuestion={handleAddQuestion}
					default_page={default_page}
					handlePerPage={handlePerPage}
					isEdit={isEdit}
                    questionTitles={questionTitles}
                    onHandleChangeTitle={onHandleChangeTitle}
                    setQuestionTitles={setQuestionTitles}
                    surveyType={cdata.surveyType}

                    // #region this props are being used in ChoiceInput component
                    removeChoicesField={removeChoicesField}
                    onHandleChoiceChange={onHandleChoiceChange}
                    clickAnswerImg={clickAnswerImg}
                    handleDeleteChoiceImage={handleDeleteChoiceImage}
                    // #endregion
                />
                <div>
                    <Button color="primary" size='sm' className="mt-2" onClick={() => handleAddQuestionTitle(null)}>
                        {t('Асуултын сэдэв нэмэх')}
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


