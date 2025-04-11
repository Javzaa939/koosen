import { t } from 'i18next';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'react-feather';
import { useForm, Controller } from "react-hook-form";
import '@styles/react/libs/flatpickr/flatpickr.scss';
import classNames from 'classnames';
import { ReactSelectStyles } from '@src/utility/Utils';
import Select from 'react-select'

// editor imports
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css'

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
import empty from "@src/assets/images/empty-image.jpg";
import { onChangeFile } from '@src/views/RemoteLesson/utils';

import ScrollSelectFilter from '../ScrollSelectFilter';

const fileTypeOptions = [
    { id: 1, name: "PDF" },
    { id: 2, name: "Video хичээл" },
    { id: 3, name: "TEXT" },
    // { id: 5, name: "Шалгалт" },
]

const inputNameFileType = 'file_type'
const inputNameFileTypeText = 'text'

const AddEditOnlineSubInfo = ({ open, handleModal, refreshDatas, editData, elearnId, onlineInfoId }) => {
    const { control, handleSubmit, setError, setValue, reset, formState: { errors }, watch } = useForm()
    const formValues = watch()
    const { fetchData, isLoading, Loader } = useLoader({ isFullScreen: true });
    const remoteApi = useApi().remote

    useEffect(() => {
        if (editData && Object.keys(editData).length > 0) {
            for (let key in editData) {
                if (editData[key] !== null && editData[key] !== undefined) {
                    setValue(key, editData[key])
                } else {
                    setValue(key, '')
                }
                if (key === 'lesson') {
                    setValue(key, editData[key]?.id || '');
                }
            }
        }
    }, [editData]);

    async function onSubmit(cdata) {
        cdata.elearn = elearnId
        cdata.parent_title = onlineInfoId
        cdata = convertDefaultValue(cdata)
        const { success, errors } = await fetchData(remoteApi.onlineSubInfo.post(cdata))

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

    // #region editor code
    const quillRef = useRef(null);

    const modules = {
        toolbar: [
            [{ 'font': [] }, { 'size': ['small', 'medium', 'large', 'huge'] }],
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'align': [] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            ['link'],
            [{ color: [] }, { background: [] }],
            ['blockquote'],
            //   ['image'],
            ['clean']
        ],
    };

    const formats = [
        'header', 'bold', 'italic', 'underline', 'strike',
        'align', 'list', 'indent',
        'size', 'link',
        // 'image',
        'color', 'background',
        'clean'
    ];
    // #endregion

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="modal-dialog-centered"
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
                                defaultValue=''
                                control={control}
                                name='title'
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
                            {errors.title && <FormFeedback className='d-block'>{t(errors.title.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
                            <Label className="form-label" for={inputNameFileType}>
                                {t('Материалын төрөл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name={inputNameFileType}
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
                            {errors[inputNameFileType] && <FormFeedback className='d-block'>{t(errors[inputNameFileType].message)}</FormFeedback>}
                        </Col>
                        {formValues[inputNameFileType] === 3 && <Col md={12} className='mt-1'>
                            <Label className="form-label" for={inputNameFileTypeText}>
                                {t('ТEXT төрлийн мэдээлэл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name={inputNameFileTypeText}
                                render={({ field }) => {
                                    return (
                                        <>
                                            <style>
                                                {`
                                                .custom-quill .ql-container {
                                                    min-height: 100px;
                                                }
                                            `}
                                            </style>
                                            <ReactQuill
                                                {...field}
                                                id={field.name}
                                                ref={quillRef}
                                                placeholder={t('ТEXT төрлийн мэдээлэл')}
                                                modules={modules}
                                                formats={formats}
                                                theme="snow"
                                                className='custom-quill'
                                            />
                                        </>
                                    )
                                }}
                            ></Controller>
                            {errors[inputNameFileTypeText] && <FormFeedback className='d-block'>{t(errors[inputNameFileTypeText].message)}</FormFeedback>}
                        </Col>}
                        <Col md={12} className="text-center mt-2">
                            <Button className='me-2' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" outline type="reset" onClick={handleModal}>
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