// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import Select from 'react-select'

import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";

import AuthContext from "@context/AuthContext";

import SchoolContext from "@context/SchoolContext"

import ActiveYearContext from "@context/ActiveYearContext"

import { ReactSelectStyles } from "@utils"

import classnames from "classnames";

import { useTranslation } from "react-i18next";

import { useForm, Controller } from "react-hook-form";

import { validate, convertDefaultValue } from "@utils"

import { validateSchema } from '../validateSchema';

import { X } from "react-feather";

import {
    Row,
    Col,
	Form,
	Modal,
	Input,
	Label,
	Button,
	ModalBody,
	ModalHeader,
	FormFeedback,
    Spinner
} from "reactstrap";


const Addmodal = ({ open, handleModal, refreshDatas }) => {

    const { t } = useTranslation()
    const [is_loading, setLoader] = useState(false)
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const [ lesson_option, setLessonOption] = useState([])
    const [ student_option, setStudentOption ] = useState([])

    const { control, handleSubmit, reset, setError, formState: { errors } } = useForm(validate(validateSchema))

    const { school_id } = useContext(SchoolContext)
    const { cyear_name, cseason_id } =useContext(ActiveYearContext)

    // Api
    const lessonApi = useApi().study.lessonStandart
    const studentApi = useApi().student
    const correspondApi = useApi().score.correspond

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // Хичээлийн жагсаалт
    async function getLessonOption() {
        const { success, data } = await fetchData(lessonApi.getList())
        if(success) {
            setLessonOption(data)
        }
    }

    useEffect(()=>{
        getLessonOption()
        getStudentOption()
    },[])

    // Оюутны жагсаалт
    async function getStudentOption() {
        const { success, data } = await fetchData(studentApi.getList('','','',school_id))
        if(success) {
            setStudentOption(data)
        }
    }

	async function onSubmit(cdata) {
        cdata['school'] = school_id
        cdata['lesson_year'] = cyear_name
        cdata['lesson_season'] = cseason_id
        cdata['status'] = '4'

        const { success, errors } = await postFetch(correspondApi.post(cdata))
        if(success) {
            reset()
            handleModal()
            refreshDatas()
            setLoader(false)
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in errors) {
                setError(key, { type: 'custom', message:  errors[key][0]});
            }
        }
	}

	return (
        <Fragment>
            {
                is_loading &&
                    <div className='suspense-loader'>
                        <Spinner size='bg'/>
                        <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                    </div>
            }
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="sidebar-lg hr-register"
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                    >
                <h4 className="modal-title">{t('Дүйцүүлсэн дүнгийн бүртгэл')}</h4>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                    <Col md={12}>
                            <Label className="form-label" for="student">
                                {t("Оюутан")}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="student"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="student"
                                            id="student"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                            isLoading={isLoading}
                                            placeholder={t(`Сонгоно уу`)}
                                            options={student_option|| []}
                                            value={student_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.student && <FormFeedback className='d-block'>{t(errors.student.message)}</FormFeedback>} 
                        </Col>
                    <Col md={12}>
                            <Label className="form-label" for="lesson">
                                {t("Дүйцүүлэх хичээл")}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="lesson"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="lesson"
                                            id="lesson"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                            isLoading={isLoading}
                                            placeholder={t(`Хичээлээ сонгоно уу`)}
                                            options={lesson_option|| []}
                                            value={lesson_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="teach_score">
                                {t("Багшийн оноо")}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="teach_score"
                                name="teach_score"
                                render={({ field }) => (
                                    <Input
                                        id ="teach_score"
                                        bsSize="sm"
                                        placeholder={t('Багшийн оноо')}
                                        {...field}
                                        type="number"
                                        onKeyDown={(e) =>["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                        invalid={errors.teach_score && true}
                                    />
                                )}
                            />
                            {errors.teach_score && <FormFeedback className='d-block'>{t(errors.teach_score.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="exam_score">
                                {t("Шалгалтын оноо")}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="exam_score"
                                name="exam_score"
                                render={({ field }) => (
                                    <Input
                                        id ="exam_score"
                                        bsSize="sm"
                                        placeholder={t('Шалгалтын оноо')}
                                        {...field}
                                        type="number"
                                        onKeyDown={(e) =>["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                        invalid={errors.exam_score && true}
                                    />
                                )}
                            />
                            {errors.exam_score && <FormFeedback className='d-block'>{t(errors.exam_score.message)}</FormFeedback>}
                        </Col>
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
