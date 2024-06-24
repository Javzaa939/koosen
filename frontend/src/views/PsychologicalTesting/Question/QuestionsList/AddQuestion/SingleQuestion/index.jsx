import { FilePlus, MinusCircle, Plus, X } from 'react-feather'
import { Controller, useFormContext, useFieldArray, useWatch } from 'react-hook-form'
import { Fragment, useState } from 'react'
import Select from 'react-select'
import classnames from "classnames";
import {
    Button,
    Row,
    Col,
    Label,
    Input,
    UncontrolledTooltip
} from 'reactstrap'

import { ReactSelectStyles, get_questionype, get_boolean_list } from "@utils"
import { useTranslation } from 'react-i18next';

import empty from "@src/assets/images/empty-image.jpg"
import Answers from './Answers';

export default function SingleQuestion(props) {
    const { fieldIndex, fieldName, fieldAppend, fieldRemove, } = props

    const [qtypeOption, setTypeOption] = useState(get_questionype())
    const [levelTypeOption, setLevelOption] = useState(get_boolean_list())

    const { control, formState: { errors }, getValues, setError, clearErrors, setValue, watch } = useFormContext()
    const { t } = useTranslation()

    const data = watch()

    const { fields: fieldsAnswer, remove: removeAnswer, append: appendAnswer } = useFieldArray({
        control,
        name: `${fieldName}[${fieldIndex}].answers`
    });


    const questionKindState = useWatch({
        control,
        name: `${fieldName}[${fieldIndex}].kind`,
    })
    const questionAnswersState = useWatch({
        control,
        name: `${fieldName}[${fieldIndex}].answers`,
    })


    function removeItem(index) {
        fieldRemove(index)
    }

    function addAnswer() {
        const datas = getValues()
        if (datas[fieldName][fieldIndex]['kind'] === '') {
            setError(`${fieldName}[${fieldIndex}].kind`, { message: 'Хоосон байна' })
        } else {
            appendAnswer({ value: "", image: "", is_correct: false })
        }

    }
    function duplicateQuestion(index) {
        const que = getValues(`${fieldName}[${index}]`)
        fieldAppend(que)
    }

    return (
        <>
            <Row className='g-0 gx-1 border border-primary border-2  rounded py-1 px-50'>
                <Col md={12} className='d-flex justify-content-between'>
                    <div className='d-flex'>
                        <h4 className='mb-0'>
                            {t('Асуулт')}-{fieldIndex + 1}
                        </h4>
                    </div>
                    <div>
                        <span className='cursor-pointer' onClick={() => { duplicateQuestion(fieldIndex) }}>
                            <FilePlus id={"duplicateIcon" + fieldIndex} />
                            <UncontrolledTooltip
                                placement="top"
                                target={"duplicateIcon" + fieldIndex}
                            >
                                Хуулах
                            </UncontrolledTooltip>
                        </span>
                        <span className='ms-50 text-danger cursor-pointer' onClick={() => { removeItem(fieldIndex) }}>
                            <MinusCircle id={"removeIcon" + fieldIndex} />
                            <UncontrolledTooltip
                                placement="top"
                                target={"removeIcon" + fieldIndex}
                            >
                                Устгах
                            </UncontrolledTooltip>
                        </span>
                    </div>
                </Col>
                <Col md={12} className={'mb-1'}>
                    <Row className={'g-0 gx-1'}>
                        <Col md={6} className=''>
                            <Label className="form-label" for="question">
                                {'Асуулт'}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id={`${fieldName}[${fieldIndex}].question`}
                                name={`${fieldName}[${fieldIndex}].question`}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id={`${fieldName}[${fieldIndex}].question`}
                                        name={`${fieldName}[${fieldIndex}].question`}
                                        bsSize="sm"
                                        placeholder="Асуултаа бичнэ үү"
                                        type="textarea"
                                        invalid={errors?.[fieldName]?.[fieldIndex]?.['question'] && true}
                                    />
                                )}
                            />
                        </Col>
                        <Col md={3} className=''>
                            <Label className="form-label" for="kind">
                                {'Асуултын төрөл'}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id={`${fieldName}[${fieldIndex}].kind`}
                                name={`${fieldName}[${fieldIndex}].kind`}
                                render={({ field: { value, onChange } }) => (
                                    <Select
                                        id={`${fieldName}[${fieldIndex}].kind`}
                                        name={`${fieldName}[${fieldIndex}].kind`}
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors?.[fieldName]?.[fieldIndex]?.['kind'] })}
                                        options={qtypeOption}
                                        value={qtypeOption.find((c) => c.id === value) || ''}
                                        placeholder={'-- Сонгоно уу --'}
                                        noOptionsMessage={() => 'Хоосон байна.'}
                                        onChange={(val) => {
                                            onChange(val?.id || '')

                                            if (val) {
                                                clearErrors(`${fieldName}[${fieldIndex}].kind`)
                                            } else {
                                                setValue(`${fieldName}[${fieldIndex}].answers`, [])
                                            }

                                            if (val?.id == 2 || val?.id == 1) {
                                                setValue(`${fieldName}[${fieldIndex}].answers`, [])
                                                appendAnswer([
                                                    { value: '', image: '', is_correct: false },
                                                    { value: '', image: '', is_correct: false },
                                                    { value: '', image: '', is_correct: false },
                                                    { value: '', image: '', is_correct: false }
                                                ])
                                            }

                                            if (val?.id == 3) {
                                                setValue(`${fieldName}[${fieldIndex}].answers`, [])
                                                appendAnswer([{ value: 'Тийм', image: '', is_correct: false }, { value: 'Үгүй', image: '', is_correct: false }])
                                            }

                                            if (val?.id == 4) {
                                                setValue(`${fieldName}[${fieldIndex}].answers`, [])
                                                appendAnswer([
                                                    { value: 'Маш муу', image: '', is_correct: false },
                                                    { value: 'Муу', image: '', is_correct: false },
                                                    { value: 'Сайн', image: '', is_correct: false },
                                                    { value: 'Маш Сайн', image: '', is_correct: false }
                                                ])
                                            }
                                            if (val?.id == 5) {
                                                setValue(`${fieldName}[${fieldIndex}].answers`, [])
                                            }
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )}
                            />
                        </Col>
                        <Col md={3} className=''>
                            <Label className="form-label" for="level">
                                {'Оноотой эсэх'}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id={`${fieldName}[${fieldIndex}].level`}
                                name={`${fieldName}[${fieldIndex}].level`}
                                render={({ field: { value, onChange } }) => (
                                    <Select
                                        id={`${fieldName}[${fieldIndex}].level`}
                                        name={`${fieldName}[${fieldIndex}].level`}
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors?.[fieldName]?.[fieldIndex]?.['level'] })}
                                        options={levelTypeOption}
                                        value={levelTypeOption.find((c) => c.id === value) || ''}
                                        placeholder={'-- Сонгоно уу --'}
                                        noOptionsMessage={() => 'Хоосон байна.'}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )}
                            />
                        </Col>
                        <Col md={6} className='mt-50'>
                            <Controller
                                defaultValue=''
                                control={control}
                                id={`${fieldName}[${fieldIndex}].image`}
                                name={`${fieldName}[${fieldIndex}].image`}
                                render={({ field: { value, onChange } }) => (
                                    <div className="">
                                        <div className='d-flex justify-content-end' onClick={() => { onChange('') }}>
                                            <X size={15} color='red' className='cursor-pointer'></X>
                                        </div>
                                        <div className="rounded cursor-pointer" style={value ? { maxHeight: "250px", border: "dashed 1px gray" } : { border: "dashed 1px gray" }} onClick={(e) => { e.target?.lastChild?.click() }}>
                                            {
                                                value?.preview ?
                                                    <img className='' id={`logoImg${fieldName}${fieldIndex}`} src={value ? value?.preview : empty} style={{ pointerEvents: "none", width: "100%", maxHeight: "240px", objectFit: "contain" }} />
                                                    :
                                                    <div className='text-center py-25' style={{ pointerEvents: "none" }}>
                                                        Зураг нэмэх
                                                    </div>
                                            }

                                            <input
                                                accept="image/*"
                                                type="file"
                                                id={`${fieldName}[${fieldIndex}].image`}
                                                name={`${fieldName}[${fieldIndex}].image`}
                                                className="form-control d-none"
                                                style={{}}
                                                onChange={(e) => {
                                                    if (e.target.files[0]) {
                                                        let file = e.target.files[0]
                                                        Object.assign(file, {
                                                            preview: URL.createObjectURL(file)
                                                        })
                                                        onChange(file)
                                                    } else {

                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            />
                        </Col>
                        {
                            data?.questions ? (
                                data?.questions[fieldIndex]?.level === 1 ?
                                (
                                    <Col md={3} className=''>
                                        <Label className="form-label" for="score">
                                            {'Асуултын оноо'}
                                        </Label>
                                        <Controller
                                            defaultValue=''
                                            control={control}
                                            id={`${fieldName}[${fieldIndex}].score`}
                                            name={`${fieldName}[${fieldIndex}].score`}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    id={`${fieldName}[${fieldIndex}].score`}
                                                    name={`${fieldName}[${fieldIndex}].score`}
                                                    bsSize="sm"
                                                    placeholder="Асуултын оноо"
                                                    type="number"
                                                    invalid={errors?.[fieldName]?.[fieldIndex]?.['score'] && true}
                                                />
                                            )}
                                        />
                                    </Col>
                                ) : null
                            ) : null
                        }
                    </Row>
                </Col>
                <Col md={12} className={' '}>
                    <div className='d-flex justify-content-between'>
                        <h5 className=''>Хариултын утгууд</h5>
                        <div className='d-flex'>
                            <span style={{ fontSize: "12px" }}>Зөв хариулт сонгоно уу: </span>
                            <div>
                                {
                                    fieldsAnswer.length > 0 && Array(fieldsAnswer.length).fill('').map((v, idx) => {
                                        return (
                                            <Fragment key={idx}>
                                                <span
                                                    className={`ms-50 cursor-pointer p-25 py-0 ${questionAnswersState[idx]?.is_correct == true ? 'border-success bg-light-success' : 'border-secondary'}`}
                                                    style={{ borderRadius: "50%", fontSize: "12px", fontWeight: "bold" }}
                                                    onClick={() => {
                                                        if (questionAnswersState[idx]?.is_correct == true) {
                                                            setValue(`${fieldName}[${fieldIndex}].answers[${idx}].is_correct`, false)
                                                        } else {
                                                            setValue(`${fieldName}[${fieldIndex}].answers[${idx}].is_correct`, true)
                                                            if (questionKindState != 2) {
                                                                questionAnswersState.forEach((v, vIdx) => {
                                                                    if (idx != vIdx) {
                                                                        setValue(`${fieldName}[${fieldIndex}].answers[${vIdx}].is_correct`, false)
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {String.fromCharCode(64 + parseInt(idx + 1, 10))}
                                                </span>
                                            </Fragment>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>

                    <Row className={'g-0 '}>
                        <Col md={12}>
                            {
                                fieldsAnswer.map((item, index) => {
                                    return (
                                        <Col className={`mb-1 p-50 border ${questionAnswersState[index]?.is_correct == true ? 'border-success border-2 bg-light-success' : 'border-2'} rounded`} md={12} key={item.id}>
                                            <Answers
                                                fieldItem={item}
                                                fieldsAnswer={fieldsAnswer}
                                                fieldIndex={index}
                                                fieldName={`${fieldName}[${fieldIndex}].answers[${index}]`}
                                                fieldAppend={appendAnswer}
                                                fieldRemove={removeAnswer}
                                                questionKindState={questionKindState}
                                            />
                                        </Col>
                                    )
                                })
                            }

                        </Col>
                        <Col md={12}>
                            {
                                questionKindState == 3 || questionKindState == 5 ?
                                    null
                                    :
                                    <Button className='w-100 align-items-center py-25' color='secondary' outline size='sm' onClick={() => { addAnswer() }}>
                                        <Plus className='' size={12} /> Хариулт нэмэх
                                    </Button>
                            }
                        </Col>
                    </Row>
                </Col>
            </Row>
        </>
    )
};
