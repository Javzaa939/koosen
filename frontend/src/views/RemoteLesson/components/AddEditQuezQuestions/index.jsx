import { t } from 'i18next';
import { Fragment, useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from "react-hook-form";
import '@styles/react/libs/flatpickr/flatpickr.scss';
import classNames from 'classnames';
import Select from 'react-select'
import { X } from 'react-feather';

import {
    Col,
    FormFeedback,
    Input,
    Label,
    Button,
    Form,
    Modal,
    ModalBody,
    ModalHeader,
    Row
} from "reactstrap";

import { ReactSelectStyles } from '@src/utility/Utils';
import empty from "@src/assets/images/empty-image.jpg";
import { onChangeFile } from '@src/views/RemoteLesson/utils';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { convertDefaultValue } from "@utils";

import Editor from '../Editor';
import InputFile from '../InputFile';

const formFieldNames = {
    // OnlineSubInfo model fields
    title: 'title',
    file_type: 'file_type',
    file: 'file',
    text: 'text',

    // QuezQuestions (QUIZ) model fields
    quezQuestions: {
        kind: 'kind',
        question: 'question',
        image: 'image',
        score: 'score',
        yes_or_no: 'yes_or_no',
        rating_max_count: 'rating_max_count',
        low_rating_word: 'low_rating_word',
        high_rating_word: 'high_rating_word',
        max_choice_count: 'max_choice_count',
    }
}

export default function AddEditQuezQuestions({
    open,
    handleModal,
    refreshDatas,
    onlineSubInfoId,
    editData,
}) {
    const { control, handleSubmit, setError, setValue, reset, formState: { errors }, watch } = useForm()
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
        cdata['onlineSubInfoId'] = onlineSubInfoId
        cdata = convertDefaultValue(cdata)
        const formData = new FormData()
        formData.append('json_data', JSON.stringify(cdata))
        formData.append('image', cdata['image'])
        let apiFunc = null

        if (editData) apiFunc = () => remoteApi.quezQuestions.put(formData, editData.id)
        else apiFunc = () => remoteApi.quezQuestions.post(formData)

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

    // #region to save file
    // to get path from duplicated image field, because CDN path in django's filefield became changed
    const image_path = useWatch({
        control,
        name: 'image_path',
    });

    const [image_old, setImageOld] = useState(image_path)

    const handleDeleteImage = () => {
        setImageOld('')
        setValue(formFieldNames.quezQuestions.image, '')
    }

    const clickLogoImage = () => {
        const logoInput = document.getElementById(formFieldNames.quezQuestions.image)
        logoInput.click()
    }
    // #endregion

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
                        <Col md={12}>
                            <Label className='form-label' for={formFieldNames.quezQuestions.question}>
                                {t('Асуулт')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name={formFieldNames.quezQuestions.question}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='text'
                                        id={field.name}
                                        bsSize='sm'
                                        placeholder={t('Асуулт')}
                                        invalid={errors[field.name] && true}
                                    />
                                )}
                            />
                            {errors[formFieldNames.quezQuestions.question] && <FormFeedback className='d-block'>{t(errors[formFieldNames.quezQuestions.question].message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="mt-50">
                            <Label for={formFieldNames.quezQuestions.image} className='d-block text-center'><span>{t('Зураг')}</span></Label>
                            <Row>
                                <Col className='d-flex justify-content-center'>
                                    <div>
                                        <div className='d-flex justify-content-end'>
                                            <X size={15} color='red' onClick={() => { handleDeleteImage(image_old) }}></X>
                                        </div>
                                        <div className="orgLogoDiv image-responsive">
                                            <img className="image-responsive w-100" src={image_old ? image_old : empty} onClick={() => { clickLogoImage() }} />
                                            <Controller
                                                defaultValue=''
                                                control={control}
                                                name={formFieldNames.quezQuestions.image}
                                                render={({ field }) => (
                                                    <input
                                                        accept="image/*"
                                                        type="file"
                                                        id={field.name}
                                                        name={field.name}
                                                        className="form-control d-none image-responsive"
                                                        onChange={(e) => {
                                                            field.onChange(e.target.files)
                                                            onChangeFile(e, setImageOld)
                                                        }
                                                        }
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className='me-2' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" outline type="reset" onClick={() => { handleModal(), reset() }}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment >
    )
}