import React, { useState, memo } from 'react'

import { Plus, X } from 'react-feather'

import { Label, Input, Row, Col, Button, FormFeedback, Badge } from 'reactstrap'

import Select from 'react-select'
import classnames from "classnames";

import { ReactSelectStyles, get_kind_list } from "@utils"


import empty from "@src/assets/images/empty-image.jpg"

import ChoiceInput from './ChoiceInput';

import './style.css'

function Question(props) {

    const {
        questions,
        readOnly,
        removeQuestion,
        handleChange,
        handleAddChoice,
        errors,
        handleDeleteImage,
        clickLogoImage
    } = props

    const [qtypeOption, setTypeOption] = useState(get_kind_list())

    return questions.map((rowsData, idx) => {

        const { kind, question, imageUrl, image,  rating_max_count, low_rating_word, high_rating_word, max_choice_count, choices } = rowsData;

        return (
                <div className='added-cards mt-1' key={idx} >
                    <div className={classnames('cardMaster rounded border p-1')}>
                        <Row className='mt-1' >
                            <div className='d-flex justify-content-start'>
                                <h5>{`Асуулт(${idx + 1})`}</h5>
                                <div className='ms-5'>
                                    <Button  color="danger" size='sm' outline onClick={() => removeQuestion(idx)} disabled={readOnly}>
                                        Устгах
                                    </Button>
                                </div>
                            </div>

                            <Row>
                                <Col md={6} className=''>
                                    <Label className="form-label" for="kind">
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
                                        isDisabled={readOnly}
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
                                    <Label className="form-label" for="question">
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
                                            <div className="orgLogoDiv" style={{ minWidth: '150px', width: '100%' }} onChange={(e) => handleChange(idx, '', e.target.name,)}>
                                                <img id={`logoImg${idx}`} src={imageUrl ? imageUrl : image ? image : empty} onClick={() => {readOnly ?  "" : clickLogoImage(idx)}}/>
                                                <input
                                                    accept="image/*"
                                                    type="file"
                                                    id={`logoInput${idx}`}
                                                    name="image"
                                                    className="form-control d-none"
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
                                                <Label for="rating_max_count">Үнэлгээний дээд тоо</Label>
                                                <Input
                                                    type='number'
                                                    bsSize='sm'
                                                    disabled={readOnly}
                                                    name="rating_max_count"
                                                    placeholder='Үнэлгээний дээд тоо'
                                                    defaultValue={rating_max_count}
                                                    onChange={(e) => handleChange(idx, e.target.value, e.target.name)}
                                                />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6} sm={12} className='mt-1'>
                                                <Label for="low_rating_word">Доод үнэлгээг илэрхийлэх үг</Label>
                                                <Input
                                                    type='text'
                                                    name='low_rating_word'
                                                    bsSize='sm'
                                                    disabled={readOnly}
                                                    placeholder='Доод үнэлгээг илэрхийлэх үг'
                                                    defaultValue={low_rating_word}
                                                    onChange={(e) => handleChange(idx, e.target.value, e.target.name)}
                                                />
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6} sm={12} className='mt-1'>
                                                <Label for="high_rating_word">Дээд үнэлгээг илэрхийлэх үг</Label>
                                                <Input
                                                    type='text'
                                                    bsSize='sm'
                                                    disabled={readOnly}
                                                    placeholder='Дээд үнэлгээг илэрхийлэх үг'
                                                    name='high_rating_word'
                                                    defaultValue={high_rating_word}
                                                    onChange={(e) => handleChange(idx, e.target.value, e.target.name)}
                                                />
                                            </Col>
                                        </Row>
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
                                                                disabled={true}
                                                                name='yes_or_no'
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
                                                        <Label for="max_choice_count">Сонголтын хязгаар</Label>
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
