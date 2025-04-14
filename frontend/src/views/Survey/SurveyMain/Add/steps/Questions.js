import React, { useState, memo } from 'react'

import { Plus, X } from 'react-feather'

import { Label, Input, Row, Col, Button, FormFeedback, Badge } from 'reactstrap'

import Select from 'react-select'
import classnames from "classnames";

import { ReactSelectStyles, get_questionype } from "@utils"

import empty from "@src/assets/images/empty-image.jpg"

import ChoiceInput from './ChoiceInput';

import '../style.css'
import { useTranslation } from 'react-i18next';

function Question(props) {

    const { t } = useTranslation()

    const {
        questions,
        readOnly,
        removeQuestion,
        handleChange,
        handleAddChoice,
        onHandleRatingWordChange,
        errors,
        handleDeleteImage,
        clickLogoImage,
        setQuestions,
        titleIndex,
        copyQuestion,
        surveyType,
        questionTitles
    } = props

    const [qtypeOption, setTypeOption] = useState(get_questionype())

    return questions.map((rowsData, idx) => {

        const { kind: rowsDataKind, question, imageUrl, image,  rating_max_count: rowsDataRatingMaxCount, rating_words: rowsDataRatingWords, max_choice_count, choices, yes_or_no } = rowsData;
        let rating_max_count = rowsDataRatingMaxCount
        let kind = rowsDataKind
        let rating_words = rowsDataRatingWords
        const isNotFirstGlobalQuestion = titleIndex !== 0 || (titleIndex === 0 && idx !== 0)

        if (surveyType === 'satisfaction') {
            // to block "kind" input
            kind = qtypeOption.find((c) => c.name === 'Үнэлгээ')?.id
            if (rowsData.kind !== kind) handleChange(idx, kind, 'kind')

            // to reflect rating max count
            if (isNotFirstGlobalQuestion) {
                rating_max_count = questionTitles[0].questions[0].rating_max_count
                if (rowsData.rating_max_count !== rating_max_count) handleChange(idx, rating_max_count, 'rating_max_count')
            }

            // to reflect rating words
            if (isNotFirstGlobalQuestion) {
                rating_words = questionTitles[0].questions[0].rating_words

                // to avoid state recursive infinite loops, change only if not equal
                for (let i = 0; i < rating_words.length; i++) {
                    const firstGlobalQuestionRatingWord = rating_words[i]
                    const currentRatingWord = rowsData.rating_words[i]
                    if (currentRatingWord !== firstGlobalQuestionRatingWord) onHandleRatingWordChange(idx, i, firstGlobalQuestionRatingWord)
                }
            }
        }

        return (
                <div className='added-cards mt-1' key={idx} >
                    <div className={classnames('cardMaster rounded border p-1')}>
                        <Row className='mt-1' >
                            <Row>
                            <div className='d-flex justify-content-between'>
                                <h5>{`Асуулт(${idx + 1})`}</h5>
                                <Row>
                                    <Col className=''>
                                        <Button  color="primary" size='sm' outline onClick={() => copyQuestion(idx)} disabled={readOnly}>
                                            Хуулах
                                        </Button>
                                    </Col>
                                    <Col className=''>
                                        <Button  color="danger" size='sm' outline onClick={() => removeQuestion(idx, questions, setQuestions)} disabled={readOnly}>
                                            Устгах
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                                <Col md={6} className=''>
                                    <Label className="form-label" htmlFor="kind">
                                        {'Асуултын төрөл'}
                                    </Label>
                                    <Select
                                        name="kind"
                                        id="kind"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select')}
                                        options={qtypeOption}
                                        value={kind ? qtypeOption.find((c) => c.id === kind ) : ''}
                                        placeholder={'-- Сонгоно уу --'}
                                        noOptionsMessage={() => 'Хоосон байна.'}
                                        isDisabled={surveyType === 'satisfaction' ? true : readOnly}
                                        onChange={(val) => {
                                            handleChange(idx, val?.id, 'kind')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} className='mt-1'>
                                    <Label className="form-label" htmlFor="question">
                                        {'Асуулт'}
                                    </Label>
                                    <Input
                                        id ="question"
                                        name ="question"
                                        disabled={readOnly}
                                        bsSize="sm"
                                        placeholder="Асуултаа бичнэ үү"
                                        type="text"
                                        value={question || ''}
                                        onChange={(e) => handleChange(idx, e.target.value, e.target.name,)}
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6} className='mt-1'>
                                    <div className="d-flex custom-flex">
                                        <div className="me-2">
                                            <div className='d-flex justify-content-end' onClick={() => { readOnly ?  "" : handleDeleteImage(idx)}}>
                                                <X size={15} color='red' className=''></X>
                                            </div>
                                            <div className="orgLogoDiv image-responsive" onChange={(e) => handleChange(idx, '', e.target.name,)}>
                                                <img id={`logoImg${idx}`} className="image-responsive" src={imageUrl ? imageUrl : image ? image : empty} onClick={() => {readOnly ?  "" : clickLogoImage(`${titleIndex}-${idx}`)}}/>
                                                <input
                                                    accept="image/*"
                                                    type="file"
                                                    id={`logoInput${titleIndex}-${idx}`}
                                                    name="image"
                                                    className="form-control d-none image-responsive"
                                                    onChange={(e) => handleChange(idx, e.target.files, e.target.name)}
                                                    disabled={readOnly}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            {
                                kind == 4
                                ?
                                    <>
                                        <Row>
                                            <Col md={6} sm={12} className='mt-1'>
                                                <Label htmlFor="rating_max_count">Үнэлгээний дээд тоо</Label>
                                                <Input
                                                    type='number'
                                                    bsSize='sm'
                                                    disabled={surveyType === 'satisfaction' && isNotFirstGlobalQuestion ? true : readOnly}
                                                    name="rating_max_count"
                                                    id='rating_max_count'
                                                    placeholder='Үнэлгээний дээд тоо'
                                                    defaultValue={rating_max_count}
                                                    onChange={(e) => handleChange(idx, e.target.value, e.target.name)}
                                                />
                                            </Col>
                                        </Row>
                                        {
                                            Array.from({ length: rating_max_count }, (_, i) =>
                                                <Row key={i}>
                                                    <Col md={6} sm={12} className='mt-1'>
                                                        <Label htmlFor={`rating_words_${i}`}>{i + 1} {t('үнэлгээг илэрхийлэх үг')}</Label>
                                                        <Input
                                                            type='text'
                                                            name={`rating_words_${i}`}
                                                            bsSize='sm'
                                                            disabled={surveyType === 'satisfaction' && isNotFirstGlobalQuestion ? true : readOnly}
                                                            placeholder={`${i + 1} ${t('үнэлгээг илэрхийлэх үг')}`}
                                                            defaultValue={rating_words[i]}
                                                            onChange={(e) => onHandleRatingWordChange(idx, i, e.target.value)}
                                                        />
                                                    </Col>
                                                </Row>
                                            )
                                        }
                                    </>
                                :
                                    kind == 5
                                    ?
                                        null
                                    :
                                        kind == 3
                                        ?
                                            <Col md={6} sm={12} className='mt-1'>
                                                {
                                                    ['Тийм', 'Үгүй'].map((text, tidx) =>
                                                        <div className="form-check mt-1" key={tidx}>
                                                            <Input
                                                                className="form-check-input mb-1"
                                                                type="radio"
                                                                disabled={readOnly}
                                                                name='yes_or_no'
                                                                defaultChecked={yes_or_no ? true : false}
                                                                onClick={(e) => handleChange(idx, text, e.target.name)}
                                                            />
                                                            <Label className="form-check-label">{text}</Label>
                                                        </div>
                                                    )
                                                }
                                            </Col>
                                        :

                                            <Col md={6} sm={12} className='mt-1'>
                                                {(kind == 2 && kind != 3 )&&
                                                    <Col className='my-1' md={6} sm={12}>
                                                        <Label htmlFor="max_choice_count">Сонголтын хязгаар</Label>
                                                        <Input
                                                            type='number'
                                                            bsSize='sm'
                                                            disabled={readOnly}
                                                            invalid={errors && errors.max_choice_count ? true : false}
                                                            name='max_choice_count'
                                                            defaultValue={max_choice_count}
                                                            onChange={(e) => handleChange(idx, e.target.value, e.target.name)}
                                                            placeholder='Сонголтын хязгаар'
                                                        />
                                                        { errors && errors.max_choice_count && <FormFeedback className='d-block'>{errors.max_choice_count.message}</FormFeedback>}
                                                    </Col>
                                                }
                                                {
                                                    kind != 3 &&
                                                        <div className='d-flex justify-content-start'>
                                                            <Label>Хариултын утгууд</Label>
                                                            <Badge color='light-primary' pill className='ms-1' onClick={() => { (kind && !readOnly) ? handleAddChoice(idx) : null}} >
                                                                <Plus size={15} />
                                                            </Badge>
                                                        </div>
                                                }

                                                {
                                                    (kind == 1 || kind == 2) && kind != 3
                                                    &&
                                                        <ChoiceInput
                                                            idx={idx}
                                                            kind={kind}
                                                            choices={choices}
                                                            {...props}
                                                        />
                                                }
                                            </Col>
                            }
                        </Row>
                    </div>
                </div>
        )
    })
}

export default memo(Question)
