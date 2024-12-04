// ** React imports
import React, { Fragment, useState, useContext, useEffect } from 'react'


import { t } from 'i18next';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner, InputGroupText, InputGroup, } from "reactstrap";

import { validate, convertDefaultValue } from "@utils"

import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'
import * as Yup from 'yup';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css'

const CreateModal = ({ open, handleModal, refreshDatas, editId, handleEditModal}) => {

    const validateSchema = Yup.object().shape({
	title: Yup.string()
		.trim()
		.required('Хоосон байна'),
    link: Yup.string()
		.trim()
		.required('Хоосон байна'),

    });

    const [value, setValues] = useState('');

    const {quill, quillRef } = useQuill({
        modules: {
            toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ align: [] }],

                    [{ list: 'ordered'}, { list: 'bullet' }],
                    [{ indent: '-1'}, { indent: '+1' }],

                    [{ size: ['small', false, 'large', 'huge'] }],
                    ['link',],

                    [{ color: [] }, { background: [] }],

                    ['clean'],
            ],
        },
        value: value,
        theme: 'snow',
        formats: [
            'header','bold', 'italic', 'underline', 'strike',
            'align', 'list', 'indent',
            'size',
            'link',
            'color', 'background',
            'clean',
        ],
        readOnly: false,
    });

    const { school_id } = useContext(SchoolContext)
    const { user } = useContext(AuthContext)

    // ** Hook
    const { control, handleSubmit, reset, setError, formState: { errors }, setValue } = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Api
    const libraryApi = useApi().browser.library

    // Хадгалах
	async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)

        cdata['body'] = quill.root.innerHTML
        cdata['created_by'] = user.id

        if(editId){
            const { success, errors } = await fetchData(libraryApi.put(cdata, editId))
            if(success) {
                reset()
                refreshDatas()
                handleEditModal()
            }
            else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    setError(key, { type: 'custom', message: errors[key][0]});
                }
            }
        }
        else{
            cdata['created_by'] = user.id
            cdata['updated_by'] = user.id
            const { success, errors } = await postFetch(libraryApi.post(cdata))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            }
            else {
                if(errors && Object.keys(errors).length > 0) {
                    /** Алдааны мессэжийг input дээр харуулна */
                    for (let key in errors) {
                        setError(key, { type: 'custom', message: errors[key][0]});
                    }
                }
            }
        }
	}

    async function getOneDatas() {
        if(editId) {
            const { success, data } = await fetchData(libraryApi.getOne(editId))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])

                    else setValue(key, '')
                }
                if (key === 'body' && quill) {
                    quill.pasteHTML(data[key]);
                }
            }
        }
    }

    useEffect(() => {
        if(editId){
            getOneDatas()
        }
    },[open])

	return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="modal-dialog-centered modal-lg"
                contentClassName="pt-1"
                backdrop='static'
            >
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{editId ? t('Танилцуулга засах') : t('Танилцуулга нэмэх')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="title">
                                {t('Гарчиг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='title'
                                name='title'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='text'
                                        name='title'
                                        bsSize='sm'
                                        id='title'
                                        placeholder='гарчиг'
                                        invalid={errors.title && true}
                                    >
                                    </Input>
                                )}
                            />
                            {errors.title && <FormFeedback className='d-block'>{t(errors.title.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="link">
                                {t('Линк')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='link'
                                name='link'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='text'
                                        name='link'
                                        bsSize='sm'
                                        id='link'
                                        placeholder='гарчиг'
                                        invalid={errors.link && true}
                                    >
                                    </Input>
                                )}
                            />
                            {errors.link && <FormFeedback className='d-block'>{t(errors.link.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} >
                            <Label className='form-label' for='body'>
                                {t('Танилцуулга байршуулах хэсэг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='body'
                                name='body'
                                render={({field}) => (
                                    <div style={{ width: 'auto',}}>
                                        <div
                                            {...field}
                                            name='body'
                                            id='body'
                                            ref={quillRef}
                                        />
                                    </div>
                                )}
                            />
                            {errors.body && <FormFeedback className='d-block'>{t(errors.body.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit" >
                                {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline  onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default CreateModal;
