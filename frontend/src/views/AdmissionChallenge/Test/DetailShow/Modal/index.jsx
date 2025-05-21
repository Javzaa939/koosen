import React, { Fragment, useState, useEffect } from 'react';
import useApi from "@hooks/useApi";
import { Modal, ModalBody, ModalHeader, Card, CardBody, Label, Input, Button, Spinner } from "reactstrap";
import useLoader from "@hooks/useLoader";
import './style.css';

const KIND_ONE_CHOICE = 1; // 'Нэг сонголт'
const KIND_MULTI_CHOICE = 2; // 'Олон сонголт'
const KIND_BOOLEAN = 3; // 'Тийм // Үгүй сонголт'
const KIND_RATING = 4; // 'Үнэлгээ'
const KIND_TEXT = 5; // 'Бичвэр'

// Асуулт бэлдэж өгөх function
function makeQuestionText(question, image, kind) {
    return (
        <div className='qtext'>
            <div>
                <span className='fw-bolder fs-4'>{question}</span>
                <small className='ms-1 fs-5'>{kind === KIND_MULTI_CHOICE ? '(Олон сонголттой)' : '(Нэг сонголттой)'}</small>
            </div>
            {image && (
                <div className='showImgDiv m-1'>
                    <img src={image} alt='question-related' className='w-100' />
                </div>
            )}
        </div>
    );
}

// Үнэлгээтэй асуултын хариултыг render-лэх function
function makeRatingAns(textLow, textHigh, numStars, qIndx, chosen_choice) {
    const radios = [];
    for (let index = 1; index <= numStars; index++) {
        radios.push(
            <div className="m-1" key={index}>
                <Input
                    type="radio"
                    id={`radio-${qIndx}-${index}-in`}
                    value={index}
                    className="form-check-input"
                    checked={chosen_choice === index}
                    readOnly
                />
                <Label for={`radio-${qIndx}-${index}-in`} className="form-label d-flex justify-content-center">
                    {index}
                </Label>
            </div>
        );
    }
    return (
        <div className="d-flex align-items-center ms-2">
            <div>{textLow}</div>
            {radios}
            <div>{textHigh}</div>
        </div>
    );
}

export default function ResultModal({ open, handleModal, datas }) {

    //Loader
    const { isLoading, fetchData } = useLoader({});

    //useState
    const [resultData, setDatas] = useState([]);
    const [totalScore, setTotalScore] = useState([]);
    // API
    const resultApi = useApi().challenge;

    async function getDatas() {
        const { success, data } = await fetchData(resultApi.getTestResult(datas.answer));
        if (success) {
            setDatas(data.question)
            setTotalScore(data.total_score)
        }
    };

    useEffect(() => {
        getDatas()
    }, [])

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="modal-dialog-centered modal-lg"
                contentClassName="pt-0"
                scrollable={true}
            >
                <ModalHeader
                    className='bg-transparent pb-0'
                    toggle={handleModal}>
                </ModalHeader>
                <ModalBody >
                    <Card className='invoice-preview-card'>
                        <CardBody className='invoice-padding pb-0'>
                            <div className='d-flex justify-content-between flex-md-row flex-column invoice-spacing mt-0'>
                                <h3 className='text-primary invoice-logo'>Шалгалт үр дүн</h3>
                                <div className="d-flex gap-2">
                                    <div className='d-flex gap-1'>
                                        <Input
                                            type='radio'
                                            className='form-check-input mb-1 green-checkbox' />
                                        <Label className='form-check-label'>Зөв хариулт</Label>
                                    </div>
                                    <div className='d-flex gap-1'>
                                        <Input
                                            type='radio'
                                            className='form-check-input mb-1 red-checkbox' />
                                        <Label className='form-check-label'>Буруу хариултыг сонгосон</Label>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                        <hr className='invoice-spacing' />
                        <CardBody className='invoice-padding pt-0'>
                            {isLoading ? (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                                    <Spinner />
                                </div>
                            ) : (
                                resultData.map((question, qid) => {
                                    const { kind, question: questionText, rating_max_count, low_rating_word, high_rating_word, image, choices, id, chosen_choice, score } = question;
                                    return (
                                        <Card className='p-2 border-1' key={id}>
                                            <div>
                                                <div className="d-flex gap-1 mt-1 font-weight-bold">
                                                    {qid + 1}.
                                                    <p>{makeQuestionText(questionText, image, kind)}</p>
                                                    {score && (
                                                        <p>{score} оноо / {choices.some(choice => choice.checked && chosen_choice === choice.id) ? score : '0'} оноо</p>
                                                    )}
                                                </div>
                                                <div className="d-flex">
                                                    {kind === KIND_TEXT && (
                                                        <Input
                                                            type='textarea'
                                                            className="form-control mt-1"
                                                            placeholder="Хариултыг бичнэ"
                                                            value={chosen_choice || ''}
                                                            readOnly
                                                        />
                                                    )}
                                                    {(kind === KIND_ONE_CHOICE || kind === KIND_MULTI_CHOICE) && (
                                                        <div className='d-flex flex-row flex-wrap justify-content-center w-100'>
                                                            {choices.map((choice, idx) => {

                                                                const isIncorrect = (Array.isArray(chosen_choice)
                                                                    ? chosen_choice.includes(choice.id) && !choice.checked
                                                                    : chosen_choice === choice.id && !choice.checked);
                                                                return (
                                                                    <div className="form-check my-1 me-3" key={idx}>
                                                                        <Input
                                                                            type={kind === KIND_MULTI_CHOICE ? 'checkbox' : 'radio'}
                                                                            name={`choice${qid}`}
                                                                            className={`form-check-input mb-1 ${choice.checked ? 'green-checkbox' : ''} ${isIncorrect ? 'red-checkbox' : ''}`}
                                                                            readOnly
                                                                            multiple
                                                                        />
                                                                        {choice.image ? (
                                                                            <div className='m-1 ms-0 showChoiceDiv'>
                                                                                <img src={choice.image} alt='choice' />
                                                                            </div>
                                                                        ) : (
                                                                            <Label className="form-check-label" for={`choice${qid}`}>
                                                                                {choice.choices}
                                                                            </Label>
                                                                        )}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                    {kind === KIND_RATING && makeRatingAns(low_rating_word, high_rating_word, rating_max_count, qid, chosen_choice)}
                                                    {kind === KIND_BOOLEAN && ['Тийм', 'Үгүй'].map((text, yIdx) => (
                                                        <div className="form-check my-1 me-3" key={yIdx}>
                                                            <Input
                                                                type="radio"
                                                                id={`yes${id}`}
                                                                name={`yes${qid}`}
                                                                className="form-check-input mb-1"
                                                                checked={chosen_choice === text}
                                                                readOnly
                                                            />
                                                            <Label className="form-check-label">
                                                                {text}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })
                            )}
                            {!isLoading && (
                                <div className='d-flex justify-content-between align-items-center'>
                                    <div>
                                        <p>Нийт {totalScore} / {datas.score} оноо</p>
                                    </div>
                                    <Button color="secondary" onClick={handleModal} >
                                        Буцах
                                    </Button>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </ModalBody>
            </Modal>
        </Fragment>
    );
}