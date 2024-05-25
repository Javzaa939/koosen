import React, { Fragment, useState, useEffect, useReducer, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { getPagination, get_leveltype, get_questionype, ReactSelectStyles } from "@utils";
import Select from 'react-select'
import classnames from "classnames";
import {
    Button,
    Form,
    Modal,
    ModalHeader,
    ModalBody,
    Badge,
    Row,
    Col,
    Label,
    Input,
    ListGroup,
    ListGroupItem,
    InputGroup,
    InputGroupText,
    FormFeedback,
    Alert
} from 'reactstrap'
import empty from "@src/assets/images/empty-image.jpg"
import { Edit, Minus, MinusCircle, PlusCircle, Save, X } from "react-feather";
import DataTable from "react-data-table-component";
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

export default function EditModal({ open, handleModal, questionDetail, getDatas }) {
    const [data, setData] = useState(questionDetail)
    const [levelType, setLevelType] = useState(get_leveltype())
    const [questionKind, setQuestionType] = useState(get_questionype())

    const [editQuestion, setEditQuestion] = useState({ id: null, isEdit: false })
    const [editAnswer, setEditAnswer] = useState({ qId: null, id: null, isEdit: false })

    const initialQuestionRow = {
        question: '',
        image: '',
        score: '',
        level: ''
    }
    const questionReducer = (state, action) => {
        switch (action.type) {
            case 'SET_QUESTION':
                return { ...state, question: action.payload }
            case 'SET_LEVEL':
                return { ...state, level: action.payload }
            case 'SET_KIND':
                return { ...state, kind: action.payload }
            case 'SET_SCORE':
                return { ...state, score: action.payload }
            case 'SET_IMAGE':
                return { ...state, image: action.payload }
            case 'SET_RESET':
                return initialQuestionRow
            default:
                return state
        }
    }
    const initialAnswerRow = {
        choices: '',
        image: '',
        score: '',
    }
    const answerReducer = (state, action) => {
        switch (action.type) {
            case 'SET_CHOICES':
                return { ...state, choices: action.payload }
            case 'SET_SCORE':
                return { ...state, score: action.payload }
            case 'SET_IMAGE':
                return { ...state, image: action.payload }
            case 'SET_RESET':
                return initialAnswerRow
            default:
                return state
        }
    }
    const [questionState, dispatchQuestion] = useReducer(questionReducer, initialQuestionRow)
    const [answerState, dispatchAnswer] = useReducer(answerReducer, initialAnswerRow)


    const { isLoading, Loader, fetchData } = useLoader({})
    const questionAPI = useApi().challenge.psychologicalTest


    function handleQuestionEdit(questoinData) {
        setEditQuestion({ id: questoinData.id, isEdit: true })
        dispatchQuestion({ type: 'SET_QUESTION', payload: questoinData.question })
        dispatchQuestion({ type: 'SET_SCORE', payload: questoinData.score })
        dispatchQuestion({ type: 'SET_LEVEL', payload: questoinData.level })
        if (questoinData.image) {
            dispatchQuestion({ type: "SET_IMAGE", payload: { preview: process.env.REACT_APP_SERVER_URL + questoinData.image } })
        }
    }

    async function handleQuestionSave(questionId) {
        const formData = new FormData()
        for (let key in questionState) {
            formData.append(key, questionState[key])
        }
        const { success, data } = await fetchData(questionAPI.put(formData, questionId));
        if (success) {
            if (data) {
                setEditQuestion({ id: null, isEdit: false })
                dispatchQuestion({ type: "SET_RESET" })
                setData(data)
            }
        }
    }

    function handleAnswerEdit(questoinData, answerData) {
        setEditAnswer({ qId: questoinData.id, id: answerData.id, isEdit: true })
        dispatchAnswer({ type: 'SET_CHOICES', payload: answerData.choices })
        dispatchAnswer({ type: 'SET_SCORE', payload: answerData.score })
        if (answerData.image) {
            dispatchAnswer({ type: "SET_IMAGE", payload: { preview: process.env.REACT_APP_SERVER_URL + answerData.image } })
        }
    }

    async function handleAnswerSave(questionId, answerId) {
        const formData = new FormData()
        for (let key in answerState) {
            formData.append(key, answerState[key])
        }
        formData.append("id", answerId)
        const { success, data: newData } = await fetchData(questionAPI.put(formData, questionId, "answer"));
        if (success) {
            if (newData) {
                setEditAnswer({ qId: null, id: null, isEdit: false })
                dispatchAnswer({ type: "SET_RESET" })

                let newChoices = data.choices.map(a => {
                    if (newData.id == a.id) {
                        a = newData
                    }
                    return a
                })
                setData({ ...data, choices: newChoices })
            }
        }
    }
    // function addAnswer(){
        // console.log('run')
    // }

    return (
        <Modal
            isOpen={open}
            className="modal-dialog-centered modal-xl"
        >
            <ModalHeader
                className=""
                tag="div"
                toggle={() => { handleModal(); getDatas() }}
            >
                <div>
                    <h4 className='mb-0'>Асуултын дэлгэрэнгүй</h4>
                </div>
            </ModalHeader>
            <ModalBody className="">
                <Row className="border border-primary p-1 py-50 g-0" style={{}} key={data.id}>
                    <Col md={12} className="d-flex justify-content-end">
                        {
                            editQuestion.isEdit && editQuestion.id == data.id ?
                                <>
                                    <div className="cursor-pointer" onClick={() => { handleQuestionSave(data.id) }}>
                                        <Save className="text-success " size={16} />
                                    </div>
                                    <div className="cursor-pointer ms-50" onClick={() => { setEditQuestion({ id: null, isEdit: false }); dispatchQuestion({ type: "SET_RESET", payload: '' }) }}>
                                        <MinusCircle className="" size={16} />
                                    </div>
                                </>

                                :
                                <>
                                    <div className="cursor-pointer" onClick={() => { handleQuestionEdit(data) }}>
                                        <Edit className="text-info " size={16} />
                                    </div>
                                </>
                        }
                    </Col>
                    <Col md={6} className="" style={{}}>
                        <Row className="g-0 gy-50 mb-50">
                            <Col md={12}>
                                <label className="me-50">Асуулт:</label>
                                {
                                    editQuestion.isEdit && editQuestion.id == data.id ?
                                        // useMemo(() => {
                                        // 	return (<Input
                                        // 		id={"question" + data.id}
                                        // 		name={"question" + data.id}
                                        // 		value={questionState.question || ''}
                                        // 		type="textarea"
                                        // 		bsSize={'sm'}
                                        // 		// onClick={(e) => e.stopPropagation()}
                                        // 		// onMouseDown={(e) => e.stopPropagation()}
                                        // 		onChange={(e) => {
                                        // 			dispatchQuestion({ type: 'SET_QUESTION', payload: e.target.value })
                                        // 		}}
                                        // 	/>)
                                        // }, [dispatchQuestion, questionState])
                                        <Input
                                            id={"question" + data.id}
                                            name={"question" + data.id}
                                            value={questionState.question || ''}
                                            type="textarea"
                                            bsSize={'sm'}
                                            // onClick={(e) => e.stopPropagation()}
                                            // onMouseDown={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                                dispatchQuestion({ type: 'SET_QUESTION', payload: e.target.value })
                                            }}
                                        />
                                        :
                                        <span>{data.question}</span>
                                }
                            </Col>
                            <Col md={12} className="d-flex align-items-center">
                                <label className="me-50">Нийт оноо:</label>
                                {
                                    editQuestion.isEdit && editQuestion.id == data.id ? <span className="">
                                        <Input
                                            value={questionState.score}
                                            type="number"
                                            bsSize={'sm'}
                                            onChange={(e) => {
                                                dispatchQuestion({ type: 'SET_SCORE', payload: e.target.value })
                                            }}
                                        />
                                    </span>
                                        :

                                        <span>
                                            {data.score}
                                        </span>
                                }
                            </Col>
                            <Col md={12} className="d-flex align-items-center">
                                <label className="me-50">Асуултын түвшин:</label>
                                {
                                    editQuestion.isEdit && editQuestion.id == data.id ?
                                        <Select
                                            classNamePrefix='select'
                                            className={classnames('react-select',)}
                                            options={levelType}
                                            value={levelType.find(v => v.id == questionState.level) || ''}
                                            placeholder={'-- Сонгоно уу --'}
                                            noOptionsMessage={() => 'Хоосон байна.'}
                                            onChange={(val) => {
                                                dispatchQuestion({ type: 'SET_LEVEL', payload: val?.id || '' })
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                        :

                                        <span className="">
                                            {levelType.find(v => v.id == data.level)?.name}
                                        </span>
                                }

                            </Col>
                            <Col md={12} className="d-flex align-items-center">
                                <label className="me-50">Асуултын төрөл:</label>
                                {
                                    // editQuestion.isEdit && editQuestion.id == data.id ?
                                    // 	<Select
                                    // 		classNamePrefix='select'
                                    // 		className={classnames('react-select',)}
                                    // 		options={questionKind}
                                    // 		value={questionKind.find(v => v.id == questionState.kind) || ''}
                                    // 		placeholder={'-- Сонгоно уу --'}
                                    // 		noOptionsMessage={() => 'Хоосон байна.'}
                                    // 		onChange={(val) => {
                                    // 			dispatchQuestion({ type: 'SET_KIND', payload: val?.id || '' })
                                    // 		}}
                                    // 		styles={ReactSelectStyles}
                                    // 		getOptionValue={(option) => option.id}
                                    // 		getOptionLabel={(option) => option.name}
                                    // 	/>
                                    // 	:
                                    <span className="">
                                        {questionKind.find(v => v.id == data.kind)?.name}
                                    </span>
                                }
                            </Col>
                        </Row>
                    </Col>
                    <Col md={6} className="ps-1 d-flex flex-column">
                        <label className="me-50">Зураг:</label>
                        {
                            editQuestion.isEdit && editQuestion.id == data.id ?
                                <div className="">
                                    <div className='d-flex justify-content-end' onClick={() => { dispatchQuestion({ type: "SET_IMAGE", payload: "" }) }}>
                                        <X size={15} color='red' className='cursor-pointer'></X>
                                    </div>
                                    <div className="d-flex rounded cursor-pointer w-100" style={questionState.image ? { maxHeight: "240px", border: "dashed 1px gray" } : { border: "dashed 1px gray" }} onClick={(e) => { e.target?.lastChild?.click() }}>
                                        {
                                            questionState.image?.preview ?
                                                <img className='w-100' id={`logoImg`} src={questionState.image ? questionState.image?.preview : empty} style={{ pointerEvents: "none", maxHeight: "240px", objectFit: "contain" }} />
                                                :
                                                <div className='text-center py-25 w-100' style={{ pointerEvents: "none" }}>
                                                    Зураг нэмэх
                                                </div>
                                        }

                                        <input
                                            accept="image/*"
                                            type="file"
                                            className="form-control d-none"
                                            style={{}}
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    let file = e.target.files[0]
                                                    Object.assign(file, {
                                                        preview: URL.createObjectURL(file)
                                                    })
                                                    dispatchQuestion({ type: "SET_IMAGE", payload: file })
                                                } else {
                                                    // dispatchQuestion({type: "SET_IMAGE", payload: ""})
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                :
                                <div className="d-flex ">
                                    {
                                        data.image ?
                                            <img className="" src={process.env.REACT_APP_SERVER_URL + data.image} alt="image" style={{ maxHeight: "240px", maxWidth: "100%" }} />
                                            :
                                            "Зураг байхгүй байна."
                                    }
                                </div>
                        }
                    </Col>
                    <Col md={12} className="mt-50">
                        <div className="d-flex justify-content-between">
                            <div className="pb-25" style={{ fontWeight: 500, }}>Хариултууд:</div>
                            {/* <div className="pb-25" style={{ fontWeight: 500, }}> */}
                                {/* <PlusCircle className="text-primary cursor-pointer" size={16} onClick={() => {addAnswer()}}/> */}
                            {/* </div> */}
                        </div>
                        <Row className="g-0" style={{ fontWeight: 300 }}>
                            {
                                data.choices && data.choices.map((answer, aIdx) => {
                                    return (
                                        <Col className={`border ${answer.score > 0 ? "border-success" : ''} p-25 rounded`} md={3} key={aIdx}>
                                            <div className="d-flex justify-content-between">
                                                <div>{aIdx + 1}.</div>
                                                {
                                                    editAnswer.isEdit && editAnswer.id == answer.id ?
                                                        <div className="d-flex">
                                                            <div className="cursor-pointer" onClick={() => { handleAnswerSave(data.id, answer.id) }}>
                                                                <Save className="text-success " size={14} />
                                                            </div>
                                                            <div className="cursor-pointer ms-50" onClick={() => { setEditAnswer({ qId: null, id: null, isEdit: false }); dispatchAnswer({ type: "SET_RESET", payload: '' }) }}>
                                                                <MinusCircle className="" size={14} />
                                                            </div>
                                                        </div>

                                                        :
                                                        <div className="cursor-pointer" onClick={() => { handleAnswerEdit(data, answer) }}>
                                                            <Edit className="text-info " size={14} />
                                                        </div>
                                                }
                                            </div>
                                            <div>
                                                <label className="me-50">Хариулт:</label>
                                                {
                                                    editAnswer.isEdit && editAnswer.id == answer.id ? <>
                                                        <Input
                                                            value={answerState.choices}
                                                            type="textarea"
                                                            bsSize={'sm'}
                                                            onChange={(e) => {
                                                                dispatchAnswer({ type: 'SET_CHOICES', payload: e.target.value })
                                                            }}
                                                        />
                                                    </>
                                                        :
                                                        <span>
                                                            {answer?.choices}
                                                        </span>
                                                }
                                            </div>
                                            <div>
                                                <label className="me-50">Оноо:</label>
                                                {
                                                    editAnswer.isEdit && editAnswer.id == answer.id ? <>
                                                        <Input
                                                            value={answerState.score}
                                                            type="number"
                                                            bsSize={'sm'}
                                                            onChange={(e) => {
                                                                dispatchAnswer({ type: 'SET_SCORE', payload: e.target.value })
                                                            }}
                                                        />
                                                    </>
                                                        :
                                                        <span>
                                                            {answer?.score}
                                                        </span>
                                                }
                                            </div>
                                            <div>
                                                <label className="">Зураг:</label>
                                                {
                                                    editAnswer.isEdit && editAnswer.id == answer.id ?
                                                        <div className="">
                                                            <div className='d-flex justify-content-end' onClick={() => { dispatchAnswer({ type: "SET_IMAGE", payload: "" }) }}>
                                                                <X size={15} color='red' className='cursor-pointer'></X>
                                                            </div>
                                                            <div className="d-flex rounded cursor-pointer w-100" style={answerState.image ? { maxHeight: "250px", border: "dashed 1px gray" } : { border: "dashed 1px gray" }} onClick={(e) => { e.target?.lastChild?.click() }}>
                                                                {
                                                                    answerState.image?.preview ?
                                                                        <img className='w-100' id={`logoImg`} src={answerState.image ? answerState.image?.preview : empty} style={{ pointerEvents: "none", minHeight: "20px", maxHeight: "140px", objectFit: "contain" }} />
                                                                        :
                                                                        <div className='text-center py-25 w-100' style={{ pointerEvents: "none" }}>
                                                                            Зураг нэмэх
                                                                        </div>
                                                                }

                                                                <input
                                                                    accept="image/*"
                                                                    type="file"
                                                                    className="form-control d-none"
                                                                    style={{}}
                                                                    onChange={(e) => {
                                                                        if (e.target.files[0]) {
                                                                            let file = e.target.files[0]
                                                                            Object.assign(file, {
                                                                                preview: URL.createObjectURL(file)
                                                                            })
                                                                            dispatchAnswer({ type: "SET_IMAGE", payload: file })
                                                                        } else {
                                                                            // dispatchQuestion({type: "SET_IMAGE", payload: ""})
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        :
                                                        <div className="d-flex">
                                                            {
                                                                answer.image ?
                                                                    <img className="w-100" src={process.env.REACT_APP_SERVER_URL + answer.image} alt="image" />
                                                                    :
                                                                    "Зураг байхгүй байна."
                                                            }
                                                        </div>
                                                }
                                            </div>

                                        </Col>
                                    )
                                })
                            }
                        </Row>
                    </Col>
                </Row>

            </ModalBody>
        </Modal>
    )
};
