import { t } from 'i18next';
import { Fragment, useEffect, useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import '@styles/react/libs/flatpickr/flatpickr.scss';
import classNames from 'classnames';
import { ReactSelectStyles } from '@src/utility/Utils';
import Select from 'react-select'

import {
    Button,
    Col,
    Form,
    FormFeedback, Input, Label,
    Modal,
    ModalBody,
    ModalHeader,
    Row
} from "reactstrap";

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { convertDefaultValue } from "@utils";

import Editor from '../Editor';
import InputFile from '../InputFile';
import { PDF, QUIZ, TEXT, VIDEO } from '../../utils';

const fileTypeOptions = [
    { id: PDF, name: "PDF" },
    { id: VIDEO, name: "Video хичээл" },
    { id: TEXT, name: "TEXT" },
    { id: QUIZ, name: "Шалгалт" },
]

const formFieldNames = {
    title: 'title',
    file_type: 'file_type',
    file: 'file',
    text: 'text',
}

const AddEditOnlineSubInfo = ({ open, handleModal: handleModalOriginal, refreshDatas, editData, elearnId, onlineInfoId }) => {
    const { control, handleSubmit, setError, setValue, reset, formState: { errors }, watch } = useForm({
        defaultValues: {
            ...Object.keys(formFieldNames).reduce((acc, current) => {
                acc[current] = ''
                return acc
            }, [{}])
        }
    })

    const handleModal = () => {
        reset()
        handleModalOriginal()
    }

    const formValues = watch()
    const { fetchData, isLoading, Loader } = useLoader({ isFullScreen: true });
    const remoteApi = useApi().remote

    useEffect(() => {
        if (editData) {
            for (let key in editData) {
                let finalValue = ''
                const value = editData[key]

                if (value !== null && value !== undefined) {
                    if (key == 'file' && editData['file_path']) finalValue = editData['file_path']
                    else finalValue = value
                }

                setValue(key, finalValue)
            }
        }
    }, [editData])

    async function onSubmit(cdata) {
        cdata['elearn'] = elearnId
        cdata['parent_title'] = onlineInfoId
        cdata = convertDefaultValue(cdata)
        const formData = new FormData()
        formData.append('json_data', JSON.stringify(cdata))
        formData.append('file', cdata['file'])
        let apiFunc = null

        if (editData) apiFunc = () => remoteApi.onlineSubInfo.put(formData, editData.id)
        else apiFunc = () => remoteApi.onlineSubInfo.post(formData)

        const { success, errors } = await fetchData(apiFunc())

        if (success) {
            reset()
            refreshDatas()
            handleModal()
        } else {
            /** Алдааны мессеж */
            for (let key in errors) {
                setError(key, { type: 'custom', message: errors[key][0] });
            }
        }
    }

    const [radioFileType, setRadioFileType] = useState(`${formFieldNames.file}-file`)

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="modal-dialog-centered modal-lg"
                contentClassName="pt-0"
                fade={true}
                backdrop='static'
            >
                <ModalHeader toggle={handleModal}></ModalHeader>
                {
                    editData !== undefined
                        ?
                        <ModalHeader className='bg-transparent pb-0' cssModule={{ 'modal-title': 'w-100 text-center' }}>
                            <h4>{t('Цахим хичээлийн хэсэг засах')}</h4>
                        </ModalHeader>
                        :
                        <ModalHeader className='bg-transparent pb-0' cssModule={{ 'modal-title': 'w-100 text-center' }}>
                            <h4>{t('Цахим хичээлийн хэсэг нэмэх')}</h4>
                        </ModalHeader>
                }
                <ModalBody className="flex-grow-50 mb-3 t-0">
                    {isLoading && Loader}
                    <Row tag={Form} onSubmit={handleSubmit(onSubmit)}>
                        <Col md={6}>
                            <Label className='form-label' for='title'>
                                {t('Хичээлийн нэр гарчиг')}
                            </Label>
                            <Controller
                                control={control}
                                name={formFieldNames.title}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='text'
                                        name={field.name}
                                        id={field.name}
                                        bsSize='sm'
                                        placeholder={t('Хичээлийн нэр гарчиг')}
                                        invalid={errors[field.name] && true}
                                    />
                                )}
                            />
                            {errors[formFieldNames.title] && <FormFeedback className='d-block'>{t(errors[formFieldNames.title].message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for={formFieldNames.file_type}>
                                {t('Материалын төрөл')}
                            </Label>
                            <Controller
                                control={control}
                                name={formFieldNames.file_type}
                                render={({ field }) => {
                                    return (
                                        <Select
                                            name={field.name}
                                            id={field.name}
                                            classNamePrefix='select'
                                            isClearable
                                            className={classNames('react-select', { 'is-invalid': errors[field.name] })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={fileTypeOptions || []}
                                            value={field.value && fileTypeOptions.find((c) => c.id === field.value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                field.onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors[formFieldNames.file_type] && <FormFeedback className='d-block'>{t(errors[formFieldNames.file_type].message)}</FormFeedback>}
                        </Col>
                        {[PDF, VIDEO].includes(formValues[formFieldNames.file_type]) && <Col md={12} className='mt-1 text-center'>
                            <Label className="form-label" for={formFieldNames.file}>
                                {t('Файл')}
                            </Label>
                            <Controller
                                control={control}
                                name={formFieldNames.file}
                                render={({ field: { ref, ...rest } }) => {
                                    return (
                                        <Row className='mt-1'>
                                            <Col md={6} className='text-end'>
                                                <Input
                                                    className='me-1'
                                                    type='radio'
                                                    value={`${rest.name}-file`}
                                                    name={`${rest.name}-file_source`}
                                                    id={`${rest.name}-file`}
                                                    checked={radioFileType === `${rest.name}-file`}
                                                    onChange={(e) => { setRadioFileType(e.target.value) }}
                                                />
                                                <Label className='form-label' for={`${rest.name}-file`}>
                                                    {t('Файл сонгох')}
                                                </Label>
                                            </Col>
                                            <Col md={6} className='text-start'>
                                                <Input
                                                    className='me-1'
                                                    type='radio'
                                                    value={`${rest.name}-url`}
                                                    name={`${rest.name}-file_source`}
                                                    id={`${rest.name}-url`}
                                                    checked={radioFileType === `${rest.name}-url`}
                                                    onChange={(e) => { setRadioFileType(e.target.value) }}
                                                />
                                                <Label className='form-label' for={`${rest.name}-url`}>
                                                    {t('URL хаяг')}
                                                </Label>
                                            </Col>
                                            <Col md={12}>
                                                {radioFileType === `${rest.name}-file` ?
                                                    <InputFile
                                                        {...rest}
                                                        placeholder={t('Файл сонгоно уу')}
                                                        errors={errors}
                                                        onChange={(e) => {
                                                            rest.onChange(e?.target?.files?.[0] ?? '')
                                                        }}
                                                        accept={formValues[formFieldNames.file_type] === VIDEO ? 'video/*' : 'application/pdf'}
                                                        warning={formValues[formFieldNames.file_type] === VIDEO ? 'Файл оруулна уу. Зөвхөн VIDEO файл хүлээж авна' : 'Файл оруулна уу. Зөвхөн .pdf файл хүлээж авна'}
                                                    />
                                                    :
                                                    <>
                                                        <Input
                                                            {...rest}
                                                            type='text'
                                                            id={rest.name}
                                                            bsSize='sm'
                                                            placeholder={t('URL хаяг')}
                                                            invalid={errors[rest.name] && true}
                                                        />
                                                        {errors[rest.name] && <FormFeedback className='d-block'>{t(errors[rest.name].message)}</FormFeedback>}
                                                    </>
                                                }
                                            </Col>
                                        </Row>
                                    )
                                }}
                            ></Controller>
                        </Col>}
                        {formValues[formFieldNames.file_type] === TEXT && <Col md={12} className='mt-1'>
                            <Label className="form-label" for={formFieldNames.text}>
                                {t('ТEXT төрлийн мэдээлэл')}
                            </Label>
                            <Controller
                                control={control}
                                name={formFieldNames.text}
                                render={({ field: { ref, ...rest } }) => {
                                    return (
                                        <Editor
                                            {...rest}
                                            placeholder={t('ТEXT төрлийн мэдээлэл')}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors[formFieldNames.text] && <FormFeedback className='d-block'>{t(errors[formFieldNames.text].message)}</FormFeedback>}
                        </Col>}
                        <Col md={12} className="text-center mt-2">
                            <Button className='me-2' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" outline type="reset" onClick={() => handleModal()}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}

export default AddEditOnlineSubInfo