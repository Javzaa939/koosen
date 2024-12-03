import { useState, Fragment, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { convertDefaultValue, ReactSelectStyles, validate } from "@utils";
import { validateSchema } from "./validationSchema";
import { t } from 'i18next';

import {
	Modal,
	ModalHeader,
	ModalBody,
    Row,
    Form,
    Col,
    Label,
    Input,
    Button,
    FormFeedback,
} from "reactstrap";

import Select from 'react-select';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import Flatpickr from 'react-flatpickr';
import '@styles/react/libs/flatpickr/flatpickr.scss';

const Addmodal = ({ open, handleModal, refreshDatas, select_datas, editData }) => {

    const { control, handleSubmit, setError, setValue, formState: { errors, title, lesson, duration, description,question_count} } = useForm(validate(validateSchema))
	const { fetchData } = useLoader({ isFullScreen: true });

    const [endPicker, setEndPicker] = useState(new Date(editData?.end_date))
	const [startPicker, setStartPicker] = useState(new Date(editData?.start_date))

    const challengeAPI = useApi().challenge

    useEffect(() => {
        if(editData && Object.keys(editData).length > 0) {
            for(let key in editData) {
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

        cdata['start_date'] = new Date(startPicker)
        cdata['end_date'] = new Date(endPicker)
        cdata = convertDefaultValue(cdata)

        if (editData !== undefined) {
            const { success, errors } = await fetchData(challengeAPI.putSelectedTest(cdata, editData?.id))
            if(success) {
                handleModal()
                refreshDatas()
            }
            else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    setError(errors[key].field, { type: 'custom', message:  errors[key].msg});
                }
            }
        } else {
            const { success, error } = await fetchData(challengeAPI.postTest(cdata))
            if(success) {
                handleModal()
                refreshDatas()
            }
            else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message:  error[key].msg});
                }
            }
        }
	}

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
                        <ModalHeader className='bg-transparent pb-0' cssModule={{'modal-title': 'w-100 text-center'}}>
                            <h4>{t('Шалгалт засах')}</h4>
                        </ModalHeader>
                    :
                        <ModalHeader className='bg-transparent pb-0' cssModule={{'modal-title': 'w-100 text-center'}}>
                            <h4>{t('Шалгалт нэмэх')}</h4>
                        </ModalHeader>
                }
                <ModalBody className="flex-grow-50 mb-3 t-0">
                    <Row tag={Form} onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="title">
                                {t('Гарчиг')}
                            </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="title"
                                    name="title"
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            id="title"
                                            bsSize="sm"
                                            placeholder={editData?.title}
                                            type="text"
                                            invalid={errors.title && true}
                                        />
                                    )}
                                />
                            {title}
                            {errors.title && <FormFeedback className='d-block'>{t(errors.title.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className='mt-50'>
                            <Label className="form-label" for="description">
                                {t('Тайлбар')}
                            </Label>
                                <Controller
                                    defaultValue={''}
                                    control={control}
                                    id="description"
                                    name="description"
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            id="description"
                                            bsSize="sm"
                                            placeholder={editData?.description}
                                            type="textarea"
                                            invalid={errors.description && true}
                                            rows={'5'}
                                        />
                                    )}
                                />
                            {description}
                            {errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
                        </Col>
                        <Col md={6} className='mt-50'>
                            <Label className="form-label" for="lesson">
                                {t('Хичээл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="lesson"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            id="lesson"
                                            name="lesson"
                                            isClearable
                                            classNamePrefix='select'
                                            className='react-select'
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            value={select_datas.find((c) => c.id === value)}
                                            options={select_datas || []}
                                            noOptionsMessage={() => 'Хоосон байна'}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.code + ' ' + option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {lesson}
                            {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                        </Col>
                        <Col md={6} className='mt-50'>
                            <Label className="form-label" for="duration">
                                {t('Үргэлжлэх хугацаа (минутаар)')}
                            </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="duration"
                                    name="duration"
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            id ="duration"
                                            bsSize="sm"
                                            placeholder={editData?.duration}
                                            type="number"
                                            invalid={errors.duration && true}
                                        />
                                    )}
                                />
                            {duration}
                            {errors.duration && <FormFeedback className='d-block'>{t(errors.duration.message)}</FormFeedback>}
                        </Col>
                        <Col md={6} className='mt-50'>
                            <Label className="form-label" for="start_date">
                                {t('Эхлэх хугацаа')}
                            </Label>
                            <Flatpickr
                                required
                                id='start_date'
                                name='start_date'
                                className='form-control'
                                onChange={setStartPicker}
                                value={startPicker}
                                style={{height: "30px"}}
                                options={{
                                    enableTime: true,
                                    dateFormat: 'Y-m-d H:i',
                                }}
                            />
                            {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={6} className='mt-50'>
                            <Label className="form-label" for="end_date">
                                {t('Дуусах хугацаа')}
                            </Label>
                            <Flatpickr
                                required
                                id='end_date'
                                name='end_date'
                                className='form-control'
                                onChange={setEndPicker}
                                value={endPicker}
                                style={{height: "30px"}}
                                options={{
                                    enableTime: true,
                                    dateFormat: 'Y-m-d H:i',
                                }}
                            />
                            {errors.end_date && <FormFeedback className='d-block'>{t(errors.end_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={6} className='mt-50'>
                            <Label className="form-label" for="question_count">
                                {t('Асуултын тоо')}
                            </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    id="question_count"
                                    name="question_count"
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            id ="question_count"
                                            bsSize="sm"
                                            placeholder={editData?.question_count}
                                            type="number"
                                            invalid={errors.question_count && true}
                                        />
                                    )}
                                />
                            {question_count}
                            {errors.question_count && <FormFeedback className='d-block'>{t(errors.question_count.message)}</FormFeedback>}
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
export default Addmodal