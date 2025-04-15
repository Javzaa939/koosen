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
import { KIND_BOOLEAN, KIND_ESTIMATE_CHOICE, KIND_JISHIH_CHOICE, KIND_MULTI_CHOICE, KIND_ONE_CHOICE, KIND_PROJECT_CHOICE, KIND_RATING, KIND_SHORT_CHOICE, KIND_TEXT, KIND_TOVCH_CHOICE, onChangeFile } from '@src/views/RemoteLesson/utils';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { convertDefaultValue } from "@utils";

import Editor from '../Editor';
import InputFile from '../InputFile';

const formFieldNames = {
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

const kindOptions = [
    { id: KIND_ONE_CHOICE, name: 'Нэг сонголт' },
    { id: KIND_SHORT_CHOICE, name: 'Богино нөхөх хариулт' },
    { id: KIND_JISHIH_CHOICE, name: 'Харгалзуулах, жиших' },
    { id: KIND_ESTIMATE_CHOICE, name: 'Тооцоолж бодох' },
    { id: KIND_PROJECT_CHOICE, name: 'Төсөл боловсруулах' },
    { id: KIND_TOVCH_CHOICE, name: 'Товч хариулт' },
    { id: KIND_MULTI_CHOICE, name: 'Олон сонголт' },
    { id: KIND_BOOLEAN, name: 'Үнэн, Худлыг олох' },
    { id: KIND_TEXT, name: 'Эссэ бичих' },
    { id: KIND_RATING, name: 'Үнэлгээ' },
]

export default function AddEditQuezQuestions({
    open,
    handleModal: handleModalOriginal,
    refreshDatas,
    onlineSubInfoId,
    editData,
}) {
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
                    if (key == 'image' && editData['image_path']) finalValue = editData['image_path']
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
        formData.append('image', cdata['image']?.[0] ?? '')
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
    const [image_old, setImageOld] = useState(formValues?.image_path)

    useEffect(()=>{
        if (formValues?.image_path) setImageOld(formValues?.image_path)
    },[formValues?.image_path])

    const handleDeleteImage = () => {
        setImageOld('')
        setValue(formFieldNames.image, '')
    }

    const clickLogoImage = () => {
        const logoInput = document.getElementById(formFieldNames.image)
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
                            <Label className='form-label' for={formFieldNames.question}>
                                {t('Асуулт')}
                            </Label>
                            <Controller
                                control={control}
                                name={formFieldNames.question}
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
                            {errors[formFieldNames.question] && <FormFeedback className='d-block'>{t(errors[formFieldNames.question].message)}</FormFeedback>}
                        </Col>
                        <Col md={6} className="mt-50">
                            <Label className="form-label" for={formFieldNames.kind}>
                                {t('Асуултын төрөл')}
                            </Label>
                            <Controller
                                control={control}
                                name={formFieldNames.kind}
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
                                            options={kindOptions || []}
                                            value={field.value && kindOptions.find((c) => c.id === field.value)}
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
                            {errors[formFieldNames.kind] && <FormFeedback className='d-block'>{t(errors[formFieldNames.kind].message)}</FormFeedback>}
                        </Col>
                        <Col md={6} className="mt-50">
                            <Label className="form-label" for={formFieldNames.score}>
                                {t('Асуултын оноо')}
                            </Label>
                            <Controller
                                control={control}
                                name={formFieldNames.score}
                                render={({ field }) => {
                                    return (
                                        <Input
                                            {...field}
                                            type='number'
                                            id={field.name}
                                            bsSize='sm'
                                            placeholder={t('Асуултын оноо')}
                                            invalid={errors[field.name] && true}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors[formFieldNames.score] && <FormFeedback className='d-block'>{t(errors[formFieldNames.score].message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="mt-50">
                            <Label for={formFieldNames.image} className='d-block text-center'><span>{t('Зураг')}</span></Label>
                            <Row>
                                <Col className='d-flex justify-content-center'>
                                    <div>
                                        <div className='d-flex justify-content-end'>
                                            <X size={15} color='red' onClick={() => { handleDeleteImage(image_old) }}></X>
                                        </div>
                                        <div className="orgLogoDiv image-responsive">
                                            <img className="image-responsive w-100" src={image_old ? image_old : empty} onClick={() => { clickLogoImage() }} />
                                            <Controller
                                                control={control}
                                                name={formFieldNames.image}
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
                            <Button color="secondary" outline type="reset" onClick={() => handleModal()}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment >
    )
}