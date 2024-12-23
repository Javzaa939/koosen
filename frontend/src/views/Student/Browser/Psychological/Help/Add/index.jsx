// ** React imports
import React, { useState, Fragment, useContext, useEffect } from 'react'

import { t } from 'i18next';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, FormFeedback, Spinner} from "reactstrap";

import { validate, convertDefaultValue } from "@utils"
import { Download } from 'react-feather'

import AuthContext from '@context/AuthContext'
import * as Yup from 'yup';

const CreateModal = ({ open, handleModal, refreshDatas, editId, handleEditModal}) => {

    const validateSchema = Yup.object().shape({
	title: Yup.string()
		.trim()
		.required('Хоосон байна'),
    file: Yup.mixed()
        .test(
            'file-required',
            t('Хоосон байна'),
            (value) => (value instanceof FileList && value.length > 0) || (typeof value === 'string' && value.trim() !== '')
        )

    });

    const { user } = useContext(AuthContext)
    const [fileInputKey, setFileInputKey] = useState(0)

    // ** Hook
    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        watch,
        reset
    } = useForm(validate(validateSchema));

    const file = watch('file')

	// Loader
	const { fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Api
    const psycholocalApi = useApi().browser.psycholocal.help

    // Хадгалах
	async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        const formData = new FormData()
        for (const key in cdata) {
            if (key === 'file' && cdata[key] instanceof FileList)
                formData.append(key, cdata[key][0], cdata[key][0].name)
            else
                formData.append(key, cdata[key])
        }
        cdata['created_user'] = user.id
        cdata['updated_user'] = user.id
        // if(editId){
        //     cdata['updated_user'] = user.id
        //     const { success, errors } = await fetchData(psycholocalApi.put(cdata, editId))
        //     if(success) {
        //         reset()
        //         refreshDatas()
        //         handleEditModal()
        //     }
        //     else {
        //         /** Алдааны мессэжийг input дээр харуулна */
        //         for (let key in errors) {
        //             setError(key, { type: 'custom', message: errors[key][0]});
        //         }
        //     }
        // }
        // else
        {

            const { success, errors } = await postFetch(psycholocalApi.post(formData))
            if(success) {
                reset()
                setFileInputKey((prevKey) => prevKey + 1);
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
            const { success, data } = await fetchData(psycholocalApi.getOne(editId))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
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
                className="modal-dialog-centered modal-lg"
                contentClassName="pt-1"
                backdrop='static'
            >
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{editId ? t('Сэтгэл зүйн зөвлөмж') : t('Сэтгэл зүйн зөвлөмж')}</h4>
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
                        <Col md={12} >
                            <Label className="form-label">
                                {t('Файл')}
                            </Label>
                            <Controller
                                defaultValue=""
                                control={control}
                                name="file"
                                render={({ field }) =>
                                    <>
                                        <Input
                                            key={fileInputKey}
                                            name={field.name}
                                            id={field.name}
                                            type="file"
                                            placeholder={t("файл")}
                                            // accept="application/pdf"
                                            invalid={errors.file &&true}

                                            onChange={(e) => field.onChange(e.target.files)}
                                        />
                                        {file && typeof file === 'string' &&
                                            <>
                                                <a href={file} className='me-1'>
                                                    <Download type="button" color='#1a75ff' width={'15px'} />
                                                </a>
                                                {file}
                                            </>
                                        }
                                    </>
                                }
                            />
                            {errors.file && <FormFeedback className='d-block'>{errors.file.message}</FormFeedback>}
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit" >
                                {postLoading &&<Spinner size='sm' className='me-1' />}
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
