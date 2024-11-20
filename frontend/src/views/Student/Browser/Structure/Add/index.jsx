// ** React imports
import React, { Fragment, useState, useContext, useEffect } from 'react'

import { X } from "react-feather";

import { t } from 'i18next';

import useApi from "@hooks/useApi";
import useToast from "@hooks/useToast";
import useLoader from "@hooks/useLoader";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner, InputGroupText, InputGroup, } from "reactstrap";

import { validate, generateLessonYear, convertDefaultValue } from "@utils"

// import { validateSchema } from './validateSchema';

import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'
import * as Yup from 'yup';

const Addmodal = ({ open, handleModal, refreshDatas, editId }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )


    const validateSchema = Yup.object().shape({
	title: Yup.string()
		.trim()
		.required('Хоосон байна'),
    file: Yup.string()
		.trim()
		.required('Хоосон байна'),

    });


    const addToast = useToast()
    const { school_id } = useContext(SchoolContext)
    const { user } = useContext(AuthContext)

    // ** Hook
    const { control, handleSubmit, reset, setError, formState: { errors }, setValue } = useForm(validate(validateSchema));

    const [file, setFile] = useState(null)
    const [fileName, setFileName] = useState('')

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Api
    const browerApi = useApi().browser

    const getFile = (e, action) => {
        if (action == 'Get') {
            var files = e.target.files
            setFile(files[0])
            setFileName(files[0]?.name)
        } else {
            const dt = new DataTransfer()
            const input = document.getElementById('file')
            const { files } = input

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                if (0 !== i) dt.items.add(file)
            }

            input.files = dt.files
            setFile(null)
            setFileName('')
        }
    }

    // useEffect(() => {
    //     getDatas()
    // },[editId])

    // Хадгалах
	async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        console.log("cdata", cdata);

        const formData = new FormData()

        // if (file) {
        for (let key in cdata) {
            formData.append(key, cdata[key])
        }
        // formData.append('file', file)
        // }
        // else {
        // cdata['file'] = file
        // }
        console.log("formData", formData);
        if(editId){
            const { success, errors } = await fetchData(browerApi.put(formData, editId))
            if(success) {
                reset()
                handleModal()
                refreshDatas()
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
            const { success, errors } = await postFetch(browerApi.post(formData))
            if(success) {
                reset()
                refreshDatas()
                handleModal()
            } else {
                if(errors && Object.keys(errors).length > 0) {
                    /** Алдааны мессэжийг input дээр харуулна */
                    for (let key in errors) {
                        setError(key, { type: 'custom', message: errors[key][0]});
                    }
                }
            }
        }
	}

    // async function getDatas() {
    //     if(editId) {
    //         const { success, data } = await fetchData(browerApi.getOne(editId))
    //         if(success) {
    //             // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
    //             if(data === null) return
    //             for(let key in data) {
    //                 if(data[key] !== null)
    //                     setValue(key, data[key])
    //                 else setValue(key, '')
    //             }
    //             // if (key === 'file') {
    //             //     setFile(data[key])
    //             // }
    //             // if (key === 'file_name') {
    //             //     setFileName(data[key])
    //             // }
    //         }
    //     }
    // }

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
                        <h4>{t(editId ?  t('Их сургуулийн бүтэц зохион байгуулалт засах'): t('Их сургуулийн бүтэц зохион байгуулалт нэмэх'))}</h4>
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
                        <Col xs={12} md={12}>
                            <Label className="form-label" for="file">
                                {t('Файл')}
                            </Label>
                            <InputGroup>
                                <Input
                                    id='file'
                                    type='file'
                                    bsSize='sm'
                                    onChange={(e) => getFile(e, 'Get')}
                                    // invalid={errors.file && !file}
                                />
                                {file
                                    &&
                                    <InputGroupText size="sm">
                                        <X role="button" color="red" size={15} onClick={(e) => getFile(e, 'Delete')}/>
                                    </InputGroupText>
                                }
                            </InputGroup>
                            {
                            fileName &&
                                <p className="mb-0" style={{fontSize: '12px'}}>
                                    <b className="me-1">Файл нэр: </b>{fileName}
                                </p>
                            }
                            {/* {!fileName && <FormFeedback className='d-block'>{t('Хоосон')}</FormFeedback>} */}
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit" >
                                {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            {
                                <Button color="secondary" type="reset" outline  onClick={handleModal}>
                                    {t('Буцах')}
                                </Button>
                            }
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default Addmodal;
