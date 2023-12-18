// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import Select from 'react-select'

import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";

import { ReactSelectStyles } from "@utils"

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
    Form,
    Modal,
    Input,
    Label,
    Button,
    ModalBody,
    ModalHeader,
    FormFeedback,
    Spinner
} from "reactstrap";

import { t } from 'i18next';

import AuthContext from '@context/AuthContext'


import { validate, convertDefaultValue } from "@utils"

import { validateSchema } from '../validateSchema';

import ActiveYearContext from "@context/ActiveYearContext"

import 'react-quill/dist/quill.snow.css'; // Import the Quill styles
import { useQuill } from 'react-quilljs';

import datas from "../Detail"


const EditModal = ({ open, handleEdit, edit_id, refreshDatas }) => {


     // ** Hook

    const { cyear_name, cseason_id} = useContext(ActiveYearContext);
   
    const { watch, control, handleSubmit, reset, setError, setValue, formState: { errors } } = useForm(validate(validateSchema));
    const quillValue = watch("body");

    const [stipendOption, setStipendOption] = useState([]);

    const [is_disabled, setDisabled] = useState(true);

    const { user } = useContext(AuthContext);
    
    // Loader
    const { isLoading, fetchData } = useLoader({});

    // Api
    const stipendApi = useApi().stipend.register
    const discountTypeApi = useApi().settings.discountType

    useEffect(() => {
        if (Object.keys(user).length > 0 && user.permissions.includes('lms-stipend-update')) {
            setDisabled(false)
        }
    }, [user])


    // data avah
    async function getDatas() {
        if (edit_id) {
            const { success, data } = await fetchData(stipendApi.getOne(edit_id))
            if (success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if (data === null) return
                for (let key in data) {
                    if (data[key] !== null)
                        setValue(key, data[key])
                    
                      else setValue(key, '')
                    if (key === 'stipend_type') {
                        setValue(key, data[key]?.id)
                    }   
                }
            }
        }
    }

    async function getStipendType() {
        const { success, data } = await fetchData(discountTypeApi.get())
        if (success) {
            setStipendOption(data)
        }
    }

    useEffect(() => {
        getDatas()
        getStipendType()
        // getDates()
    }, [open])

    // submit data
    async function onSubmit(cdata) {
        cdata['body'] = quill.root.innerHTML
        cdata['lesson_year'] = cyear_name
        cdata['lesson_season'] = cseason_id
       
        cdata = convertDefaultValue(cdata)
        const { success, error } = await fetchData(stipendApi.put(cdata, edit_id))
        if (success) {
            reset()
            handleEdit()
            refreshDatas()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message: error[key].msg });
            }
        }
    }

    // quill config
    const [value, defaultValue] = useState('');
    const {quill, quillRef} = useQuill({

        modules : {
            toolbar: [
              [{ header: '1' }, { header: '2' }, { font: [] }],
              [{ size: [] }],
              ['bold', 'italic', 'underline', 'strike', 'blockquote'],
              [
                { list: 'ordered' },
                { list: 'bullet' },
                { indent: '-1' },
                { indent: '+1' },
              ],
              ['link', 'image', 'video'],
              ['clean'],
            ],
            clipboard: {
              // toggle to add extra line breaks when pasting HTML:
              matchVisual: false,
            },
          },
          value: quillValue ?? ""
    })

    useEffect(
        () =>
        {
            if (quill)
            {
                quill.clipboard.dangerouslyPasteHTML(quillValue)
            }
        },
        [quillValue]
    )
   
    return (
        <Fragment>
            <Modal isOpen={open} toggle={handleEdit} className="modal-dialog-centered modal-lg" style={{maxWidth: '900px', width: '100%'}} onClosed={handleEdit}>
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader className='bg-transparent pb-0' toggle={handleEdit} ></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('Тэтгэлгийн бүртгэл засах')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col lg={12} xs={12}>
                            <Label className="form-label" for="stipend_type">
                                {t('Тэтгэлгийн код')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="stipend_type"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="stipend_type"
                                            id="stipend_type"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.stipend_type })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={stipendOption || []}
                                            value={stipendOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            isDisabled={is_disabled}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.stipend_type && <FormFeedback className='d-block'>{t(errors.stipend_type.message)}</FormFeedback>}
                        </Col>
                        <Col lg={12} xs={12}>
                            <Label className="form-label" for="body">
                                {t('Тайлбар')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                id="body"
                                name="body"
                                render={({field}) => (
                                    <div style={{ width: 'auto',}}>
                                        <div
                                            {...field}
                                            name='body'
                                            id='body'
                                            ref={quillRef}
                                            placeholder={t('Тайлбар бичнэ үү...')}
                                        />
                                    </div>
                                )}
                            />
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="start_date">
                                {t('Бүртгэл эхлэх хугацаа')}
                            </Label>
                            <Controller
                                defaultValue=''
                                name='start_date'
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        // value={dateStart}
                                        id="start_date"
                                        bsSize="sm"
                                        placeholder={t('Сонгох')}
                                        {...field}
                                        type="date"
                                        disabled={is_disabled}
                                        readOnly={is_disabled}
                                        invalid={errors.start_date && true}
                                        
                                    />
                                )}
                            />
                            {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                        </Col>
                        <Col lg={6} xs={12}>
                            <Label className="form-label" for="finish_date">
                                {t('Бүртгэл дуусах хугацаа')}
                            </Label>
                            <Controller
                                defaultValue=''
                                name='finish_date'
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        // value={dateFinish}
                                        id="finish_date"
                                        bsSize="sm"
                                        placeholder={t('Сонгох')}
                                        {...field}
                                        type="date"
                                        disabled={is_disabled}
                                        readOnly={is_disabled}
                                        invalid={errors.finish_date && true}
                                    />
                                )}
                            />
                            {errors.finish_date && <FormFeedback className='d-block'>{t(errors.finish_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Controller
                                control={control}
                                id="is_open"
                                name="is_open"
                                defaultValue={false}
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            className='me-50'
                                            id="is_open"
                                            type="checkbox"
                                            checked={field.value}
                                            disabled={is_disabled}
                                            readOnly={is_disabled}
                                        />
                                    )
                                }}
                            />
                            <Label className="form-label pe-1" for="is_open">
                                {t('Идэвхтэй эсэх')}
                            </Label>
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={is_disabled}>
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline onClick={handleEdit}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    );
};
export default EditModal;
