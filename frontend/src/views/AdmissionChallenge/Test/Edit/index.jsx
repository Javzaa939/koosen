import { useState, Fragment, useContext, useEffect } from 'react';
import { AuthContext } from "@context/AuthContext";
import { useForm, Controller } from "react-hook-form";
import { convertDefaultValue, ReactSelectStyles } from "@utils";
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

const Editmodal = ({ open, handleModal, refreshDatas, select_datas }) => {

    const { control, handleSubmit, setError, formState: { errors } } = useForm()
	const { fetchData } = useLoader({ isFullScreen: true });
    const { userDetail } = useContext(AuthContext)

    const [selectedLesson, setSelectedLesson] = useState('')
    const [endPicker, setEndPicker] = useState(null)
	const [startPicker, setStartPicker] = useState(null)

    const challengeAPI = useApi().challenge

    async function onSubmit(cdata) {
        cdata['start_date'] = new Date(startPicker).toISOString()
        cdata['end_date'] = new Date(endPicker).toISOString()
        cdata['lesson'] = selectedLesson
        cdata = convertDefaultValue(cdata)

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

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="modal-dialog-centered modal-lg"
                contentClassName="pt-0"
                fade={true}
            >
                <ModalHeader toggle={handleModal}></ModalHeader>
                <ModalHeader className='bg-transparent pb-0' cssModule={{'modal-title': 'w-100 text-center'}}>
                    <h4>{t('Шалгалт нэмэх')}</h4>
                </ModalHeader>
                <ModalBody className="flex-grow-1 mb-3">
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
                                        placeholder={t('Шалгалтын нэр')}
                                        type="text"
                                        invalid={errors.start_date && true}
                                    />
                                )}
                            />
                            {errors.message && <FormFeedback className='d-block'>{t(errors.message.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="description">
                                {t('Тайлбар')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="description"
                                name="description"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="description"
                                        bsSize="sm"
                                        placeholder={t('Шалгалтын дэлгэрэнгүй тайлбар')}
                                        type="textarea"
                                        invalid={errors.description && true}
                                        rows={'6'}
                                    />
                                )}
                            />
                            {errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
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
                                            placeholder={`-- Сонгоно уу --`}
                                            options={select_datas || []}
                                            noOptionsMessage={() => 'Хоосон байна'}
                                            onChange={(val) => {
                                                setSelectedLesson(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
									)
								}}
							></Controller>
                        </Col>
                        <Col md={6}>
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
                                        id ="duration"
                                        bsSize="sm"
                                        placeholder='Үргэлжлэх хугацаа'
                                        {...field}
                                        type="number"
                                        invalid={errors.duration && true}
                                    />
                                )}
                            />
                            {errors.duration && <FormFeedback className='d-block'>{t(errors.duration.message)}</FormFeedback>}
                        </Col>
                        <Col md={6}>
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
                        <Col md={6}>
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
export default Editmodal