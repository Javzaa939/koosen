import React, { Fragment, useState } from 'react'

import { X } from 'react-feather'

import { Controller, useForm } from 'react-hook-form'

import { Modal, Row, Col, Label, ModalHeader, ModalBody, Form, Input, Button, FormFeedback, Spinner } from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import Select from 'react-select'

import { useTranslation } from 'react-i18next'
import classnames from 'classnames'

import { convertDefaultValue, validate, ReactSelectStyles, club_type_option } from '@utils'

import { validateSchema } from '../validateSchema'

const Addmodal = ({ isOpen, handleModal, refreshDatas }) => {

    const { t } = useTranslation()

    const closeBtn = (
        <X className='cursor-pointer' size={15} onClick={handleModal} />
    )

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError } = useForm(validate(validateSchema));

    const { isLoading, Loader, fetchData } = useLoader({ isFullScreen: false })
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const [featurefile, setFeaturedImg] = useState([])
    const [upFiles, setUpFiles] = useState([])
    const [descriptionValue, setDescription] = useState('')

    // Api
    const clubApi = useApi().request.club

    const onChangeFile = (e, action) => {
        if(action == 'Get_File') {
            const files = Array.prototype.slice.call(e.target.files)
            const hereFiles = [...upFiles]
            files.map(file => {
                if(file) hereFiles.push({file: file, description: descriptionValue})
            })
            setFeaturedImg(hereFiles)
            setUpFiles(hereFiles)
            setDescription('')
        }
        else {
            const herFiles = featurefile.splice(action, 1)
            setUpFiles(herFiles)
        }
    }

    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)

        const formData = new FormData()

        for (let key in cdata) {
            formData.append(key, cdata[key])
        }

        featurefile.forEach((file) => {
            formData.append('files', file.file, file.file.name);
            formData.append('descriptions', file.description);
        });

        const { success, error } = await postFetch(clubApi.post(formData))
        if(success) {
            reset()
            refreshDatas()
            handleModal()
        }
        else {
            /** Алдааны мессеж */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message: error[key].msg});
            }
        }
    }

    return (
        <Fragment>
            {isLoading && Loader}
            <Modal
                isOpen={isOpen}
                toggle={handleModal}
                className="sidebar-xl hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={closeBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Клуб нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className='flex-grow-1'>
                    <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
                        <Col xl={6} sm={12}>
                            <Label className='form-label' for='name'>
                                {t('Нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='name'
                                name='name'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='text'
                                        name='name'
                                        id='name'
                                        bsSize='sm'
                                        placeholder={t('Нэр')}
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                        </Col>
                        <Col xl={6} sm={12}>
                            <Label className='form-label' for='type'>
                                {t('Үйл ажиллагааны чиглэл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="type"
                                render={({ field: { value, onChange } }) => {
                                    return (
                                        <Select
                                            name="type"
                                            id="type"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', {'is-invalid': errors.type && true})}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={club_type_option || []}
                                            value={club_type_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                            {errors.type && <FormFeedback className='d-block'>{t(errors.type.message)}</FormFeedback>}
                        </Col>
                        <Col xl={12}>
                            <Label className='form-label' for='purpose'>
                                {t('Зорилго')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='purpose'
                                name='purpose'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='textarea'
                                        name='purpose'
                                        id='purpose'
                                        bsSize='sm'
                                        rows="4"
                                        placeholder={t('Зорилго')}
                                        invalid={errors.purpose && true}
                                    />
                                )}
                            />
                            {errors.purpose && <FormFeedback className='d-block'>{t(errors.purpose.message)}</FormFeedback>}
                        </Col>
                        <Col xl={6} sm={12}>
                            <Label className='form-label' for='start_year'>
                                {t('Байгуулагдсан он')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='start_year'
                                name='start_year'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='number'
                                        name='start_year'
                                        id='start_year'
                                        bsSize='sm'
                                        placeholder={t('Байгуулагдсан он')}
                                        invalid={errors.start_year && true}
                                        onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.start_year && <FormFeedback className='d-block'>{t(errors.start_year.message)}</FormFeedback>}
                        </Col>
                        <Col xl={6} sm={12}>
                            <Label className='form-label' for='member_count'>
                                {t('Идэвхтэй гишүүдийн тоо')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='member_count'
                                name='member_count'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='number'
                                        name='member_count'
                                        id='member_count'
                                        bsSize='sm'
                                        placeholder={t('Идэвхтэй гишүүдийн тоо')}
                                        invalid={errors.member_count && true}
                                        onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.member_count && <FormFeedback className='d-block'>{t(errors.member_count.message)}</FormFeedback>}
                        </Col>
                        <Col xl={12} sm={12}>
                            <Label className='form-label' for='leader'>
                                {t('Удирдагчийн мэдээлэл')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='leader'
                                name='leader'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='text'
                                        name='leader'
                                        id='leader'
                                        bsSize='sm'
                                        placeholder={t('Удирдагчийн мэдээлэл')}
                                        invalid={errors.leader && true}
                                    />
                                )}
                            />
                            {errors.leader && <FormFeedback className='d-block'>{t(errors.leader.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="request">
                                {t('Хүсэлт')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="request"
                                name="request"
                                render={({ field }) => (
                                    <Input
                                        id ="request"
                                        bsSize="sm"
                                        {...field}
                                        type="textarea"
                                        placeholder={t('Хүсэлт')}
                                        invalid={errors.request && true}
                                    />
                                )}
                            />
                            {errors.request && <FormFeedback className='d-block'>{errors.request.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <div className='border rounded p-2 pt-50'>
                                <Col md={12}>
                                    <Label for='description'>
                                        {t('Файлын тайлбар')}
                                    </Label>
                                    <Controller
                                        name='description'
                                        control={control}
                                        defaultValue=''
                                        render={({ field }) => {
                                            field.value = field.value ? field.value : ''
                                            return (
                                                <Input
                                                    id='description'
                                                    type="text"
                                                    bsSize='sm'
                                                    placeholder={t('Файлын тайлбар')}
                                                    value={descriptionValue}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                />
                                            )
                                        }}
                                    />
                                </Col>
                                <Col md={12} className="mt-50">
                                    <Label for='file'>
                                        Файл
                                    </Label>
                                    <Controller
                                        name='file'
                                        control={control}
                                        defaultValue=''
                                        render={({ field }) => {
                                            field.value = field.value ? field.value : ''
                                            return (
                                                <Input
                                                    {...field}
                                                    id='file'
                                                    type="file"
                                                    bsSize='sm'
                                                    onChange={(e) => onChangeFile(e, 'Get_File')}
                                                />
                                            )
                                        }}
                                    />
                                </Col>
                                <Row className='mt-50'>
                                    {
                                        featurefile.map((card, index) => {
                                            return (
                                                <div key={index}>
                                                    {
                                                        card.description || card?.file?.name
                                                    }
                                                    <X className='ms-50' role="button" color="red" size={15} onClick={(e) => onChangeFile(e, index)}></X>
                                                </div>
                                            )
                                        })
                                    }
                                </Row>
                            </div>
                        </Col>
                        <Col md={12} className="mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                            {postLoading &&<Spinner size='sm' className='me-1'/>}
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

export default Addmodal

