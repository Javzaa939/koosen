// ** React imports
import React, { Fragment, useState, useContext, useEffect, useRef } from 'react'

import { X } from "react-feather";

import { t } from 'i18next';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, FormFeedback, Spinner, InputGroupText, InputGroup, } from "reactstrap";

import { validate, convertDefaultValue } from "@utils"

import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'
import * as Yup from 'yup';

const CreateModal = ({ open, handleModal, refreshDatas, editId, handleEditModal}) => {

    const validateSchema = Yup.object().shape({
	title: Yup.string()
		.trim()
		.required('Хоосон байна'),
    link: Yup.string()
		.trim()
		.required('Хоосон байна'),

    });

    const { school_id } = useContext(SchoolContext)
    const { user } = useContext(AuthContext)

    // ** Hook
    const { control, handleSubmit, reset, setError, formState: { errors }, setValue } = useForm(validate(validateSchema));

    const [File, setFile] = useState(null)
    const [fileName, setFileName] = useState('')
    const fileInputRef = useRef(null)
    const [error, setFileError] = useState('')
    const [files_name, setFileNames] = useState('')


	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Api
    const browserApi = useApi().browser

    const getFile = (e, action) => {
        if (action == 'Get') {
            var files = e.target.files
            console.log("files", files);
            setFile(files[0])
            setFileName(files[0]?.name)
        }
        else {
            setFile(null)
            setFileError('Хоосон')
        }
    }


    // Хадгалах
	async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)

        const formData = new FormData()

        if (File) {
        for (let key in cdata) {
            formData.append(key, cdata[key])
        }
            formData.append('file', File)
        }
        else {
            cdata['file'] = File
        }


        if(editId){
            const { success, errors } = await fetchData(browserApi.put(formData, editId))
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
            cdata['created_user'] = user.id
            cdata['updated_user'] = user.id
            const { success, errors } = await postFetch(browserApi.post(formData))
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
            const { success, data } = await fetchData(browserApi.getOne(editId))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                setFileNames(data?.file.toString().split("/").pop())
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null && key !== 'file')
                        setValue(key, data[key])

                    else setValue(key, '')
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
                className="modal-dialog-centered modal-md"
                contentClassName="pt-1"
                backdrop='static'
            >
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{editId ? t('Их сургуулийн бүтэц зохион байгуулалт засах') : t('Их сургуулийн бүтэц зохион байгуулалт нэмэх')}</h4>
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
                        <Col xs={12} md={12}>
                            <Label for="file">
                                {t('Файл')}
                            </Label>
                            <InputGroup>
                            <Controller
                                name='file'
                                control={control}
                                defaultValue=''
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            id='file'
                                            type="file"
                                            bsSize='sm'
                                            onChange={(e) => getFile(e, 'Get')}
                                        />
                                    )
                                }}
                            />
                            {error
                                &&
                                <FormFeedback className='d-block'>{t(error)}</FormFeedback>}
                            {File
                                &&
                                <InputGroupText size="sm">
                                    <X role="button" color="red" size={15} onClick={(e) => getFile(e, 'Delete')}/>
                                </InputGroupText>
                            }
                            </InputGroup>
                            {
                                // editId ?
                                //     <p className="mb-0" style={{fontSize: '12px'}}>
                                //         <b className="me-1">Файл нэр: </b>{files_name}
                                //     </p>
                                // :
                                    <p className="mb-0" style={{fontSize: '12px'}}>
                                        <b className="me-1">Файл нэр: </b>{fileName}
                                    </p>
                            }
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
