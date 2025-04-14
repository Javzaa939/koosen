import { t } from 'i18next';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { X } from 'react-feather';
import { useForm, Controller } from "react-hook-form";

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
import '@styles/react/libs/flatpickr/flatpickr.scss';
import { convertDefaultValue } from "@utils";

import empty from "@src/assets/images/empty-image.jpg";
import { onChangeFile } from '@src/views/RemoteLesson/utils';
import ScrollSelectFilter from '../ScrollSelectFilter';

const AddEditOnlineSubInfo = ({ open, handleModal, refreshDatas, editData, elearnId, onlineInfoId }) => {
    const { control, handleSubmit, setError, setValue, reset, formState: { errors } } = useForm()
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
                            <h4>{t('Цахим хичээл засах')}</h4>
                        </ModalHeader>
                        :
                        <ModalHeader className='bg-transparent pb-0' cssModule={{ 'modal-title': 'w-100 text-center' }}>
                            <h4>{t('Цахим хичээл нэмэх')}</h4>
                        </ModalHeader>
                }
                <ModalBody className="flex-grow-50 mb-3 t-0">
                    {isLoading && Loader}
                    <Row tag={Form} onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Row>
                                <Col md={12}>
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
                            </Row>
                        </Col>
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