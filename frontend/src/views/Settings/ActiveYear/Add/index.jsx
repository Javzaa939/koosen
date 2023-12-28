// ** React imports
import React, { Fragment, useState, useContext } from 'react'

import { X } from "react-feather";

import { t } from 'i18next';

import useApi from "@hooks/useApi";
import useToast from "@hooks/useToast";
import useLoader from "@hooks/useLoader";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Input, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";

import { validate, generateLessonYear, convertDefaultValue } from "@utils"

import { validateSchema } from './validateSchema';
import { useEffect } from 'react';

import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'

const Addmodal = ({ open, handleModal, refreshDatas }) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const addToast = useToast()
    const { school_id } = useContext(SchoolContext)
    const { user } = useContext(AuthContext)

    // ** Hook
    const { control, handleSubmit, reset, setError, formState: { errors } } = useForm(validate(validateSchema));

    const [ seasonOption, setSeason] = useState([])
    const [ prevseasonOption, setprevSeason] = useState([])
    const [ yearOption, setYear] = useState([])
    const [ prevYearOption, setprevYear] = useState([])
    const [ is_view, setIsView] = useState(false)

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Api
    const seasonApi = useApi().settings.season
    const activeyearApi = useApi().settings.activeyear

    //улирлын жагсаалт авах
    async function getSeason () {
        const { success, data } = await fetchData(seasonApi.get())
        if (success) {
            setSeason(data)
            setprevSeason(data)
        }
	}

    // хичээлийн жил жагсаалт авах
    async function getYear () {

        setYear(generateLessonYear( 5))
        setprevYear(generateLessonYear( 5))
	}

    useEffect(() => {
        getSeason()
        getYear()
    },[])

    // Хадгалах
	async function onSubmit(cdata) {
        cdata['created_user'] = user.id
        cdata['updated_user'] = user.id

        cdata = convertDefaultValue(cdata)

        const { success, errors } = await postFetch(activeyearApi.post(cdata))
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

    useEffect(()=>{
        getSeason()
        getYear()
    },[])

	return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="sidebar-lg hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    {
                        <h5 className="modal-title">{t('Ажиллах жилийн тохиргоо оруулах')}</h5>
                    }
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                        <Row tag={Form} className="gy-1" onSubmit={handleSubmit( !is_view ? onSubmit : onSubmitEdit)}>
                        <Col md={12}>
                            <Label className="form-label" for="active_lesson_year">
                                {t('Идэвхтэй хичээлийн жил')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="active_lesson_year"
                                name="active_lesson_year"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="active_lesson_year"
                                        bsSize="sm"
                                        type="select"
                                        invalid={errors.active_lesson_year && true}
                                    >
                                          <option value="">{t(`-- Сонгоно уу --`)}</option>
                                        {
                                            yearOption.map((season, idx) => (
                                                <option key={idx} value={season.id}>{season.name}</option>
                                            ))
                                        }
                                    </Input>
                                )}
                            />
                            {errors.active_lesson_year && <FormFeedback className='d-block'>{t(errors.active_lesson_year.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="active_lesson_season">
                                {t('Идэвхтэй улирал')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='active_lesson_season'
                                name='active_lesson_season'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='select'
                                        name='active_lesson_season'
                                        bsSize='sm'
                                        id='active_lesson_season'
                                        invalid={errors.active_lesson_season && true}
                                    >
                                        <option value="">{t('-- Сонгоно уу --')}</option>
                                        {
                                            seasonOption.map((season, idx) => (
                                                <option key={idx} value={season.id}>{season.season_name}</option>
                                            ))
                                        }
                                    </Input>
                                )}
                            />
                            {errors.active_lesson_season && <FormFeedback className='d-block'>{t(errors.active_lesson_season.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="prev_lesson_year">
                                {t('Өмнөх хичээлийн жил')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="prev_lesson_year"
                                name="prev_lesson_year"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="prev_lesson_year"
                                        bsSize="sm"
                                        type="select"
                                        invalid={errors.prev_lesson_year && true}
                                    >
                                          <option value="">{t('-- Сонгоно уу --')}</option>
                                        {
                                            prevYearOption.map((season, idx) => (
                                                <option key={idx} value={season.id}>{season.name}</option>
                                            ))
                                        }
                                    </Input>
                                )}
                            />
                            {errors.prev_lesson_year && <FormFeedback className='d-block'>{t(errors.prev_lesson_year.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="prev_lesson_season">
                                {t('Өмнөх улирал')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id='prev_lesson_season'
                                name='prev_lesson_season'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='select'
                                        name='prev_lesson_season'
                                        bsSize='sm'
                                        id='prev_lesson_season'
                                        invalid={errors.prev_lesson_season && true}
                                    >
                                        <option value="">{t('-- Сонгоно уу --')}</option>
                                        {
                                            prevseasonOption.map((season, idx) => (
                                                <option key={idx} value={season.id}>{season.season_name}</option>
                                            ))
                                        }
                                    </Input>
                                )}
                            />
                            {errors.prev_lesson_season && <FormFeedback className='d-block'>{t(errors.prev_lesson_season.message)}</FormFeedback>}
                        </Col>
                        <Col xs={12} md={12}>
                            <Label className="form-label" for="start_date">
                                {t('Эхлэх хугацаа')}
                            </Label>
                            <Controller
                                defaultValue=''
                                name='start_date'
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        bsSize='sm'
                                        id='start_date'
                                        placeholder='Сонгох'
                                        type="date"
                                        invalid={errors.start_date && true}
                                    />
                                )}
                            />
                            {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                        </Col>
                        <Col xs={12} md={12}>
                            <Label className="form-label" for="finish_date">
                                {t('Дуусах хугацаа')}
                            </Label>
                            <Controller
                                defaultValue=''
                                name='finish_date'
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        bsSize='sm'
                                        id='finish_date'
                                        placeholder='Сонгох'
                                        type="date"
                                        invalid={errors.finish_date && true}
                                    />
                                )}
                            />
                            {errors.finish_date && <FormFeedback className='d-block'>{t(errors.finish_date.message)}</FormFeedback>}
                        </Col>
                        {/* <Col xs={12}>
                            <Label className="form-label pe-1" for="is_active">
								{t('Идэвхтэй эсэх')}
                            </Label>
                            <Controller
                                control={control}
                                id="is_active"
                                name="is_active"
                                defaultValue={false}
                                render={({ field }) => (
                                    <Input
                                        id="is_active"
                                        type="checkbox"
                                        defaultChecked={field.value}
                                        {...field}
                                    />
                                )}
                            />
                        </Col> */}
                        <Col md={12} className="mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
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
export default Addmodal;
