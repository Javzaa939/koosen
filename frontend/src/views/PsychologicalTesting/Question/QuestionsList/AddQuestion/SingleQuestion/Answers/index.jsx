import { MinusCircle, X, } from 'react-feather'
import { Controller, useFormContext } from 'react-hook-form'
import {
    Row,
    Col,
    Input,
} from 'reactstrap'

import { useTranslation } from 'react-i18next';


export default function Answers(props) {
    const { fieldIndex, fieldName, fieldAppend, fieldRemove, fieldsAnswer, fieldItem, questionKindState } = props
    const { t } = useTranslation()

    const { control, formState: { errors } } = useFormContext()


    return (
        <>
            <Row className={'g-0 gx-50'}>
                <Col md={12} className={'d-flex justify-content-between'}>
                    <h6>
                        Хариулт: {String.fromCharCode(64 + parseInt(fieldIndex + 1, 10))}
                    </h6>
                    {

                        questionKindState == 3 ?
                            null
                            :
                            <MinusCircle className='text-danger cursor-pointer' size={18} onClick={() => { fieldRemove(fieldIndex) }} />
                    }

                </Col>
                <Col md={6} className=''>
                    <Controller
                        defaultValue=''
                        control={control}
                        id={`${fieldName}.value`}
                        name={`${fieldName}.value`}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id={`${fieldName}.value`}
                                name={`${fieldName}.value`}
                                bsSize="sm"
                                placeholder="Хариултаа бичнэ үү"
                                type="textarea"
                                disabled={questionKindState == 3}
                            />
                        )}
                    />
                </Col>
                <Col md={6}>
                    <Controller
                        defaultValue=''
                        control={control}
                        id={`${fieldName}.image`}
                        name={`${fieldName}.image`}
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
                                        id={`${fieldName}.image`}
                                        name={`${fieldName}.image`}
                                        className="form-control d-none"
                                        style={{ pointerEvents: "none" }}
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
            </Row>
        </>
    )
};
