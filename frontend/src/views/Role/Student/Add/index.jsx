import React, { Fragment, useState, useContext, useEffect } from 'react'
import {
    Col,
    Row,
    Form,
    Modal,
    Label,
    Input,
    Button,
    ModalBody,
    ModalHeader,
    FormFeedback,
    Spinner
} from 'reactstrap'
import Select from 'react-select'
import { X } from 'react-feather'
import useApi from '@hooks/useApi';
import classnames from 'classnames'
import useLoader from '@hooks/useLoader';
import { useTranslation } from 'react-i18next'
import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"
import { Controller, useForm } from 'react-hook-form'
import { validateSchema } from '../Add/validateSchema'
import ActiveYearContext from "@context/ActiveYearContext"
import { validate, ReactSelectStyles, convertDefaultValue } from '@utils'


import Flatpickr from 'react-flatpickr'
// flatpickr style
import '@styles/react/libs/flatpickr/flatpickr.scss'
// import { Mongolian } from "flatpickr/dist/l10n/mn.js"

import moment from 'moment';

const AddModal = ({ isOpen, handleAddModal, refreshDatas }) => {

     const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleAddModal} />
    )

    const { t } = useTranslation()
	const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { cseason_id, cyear_name } = useContext(ActiveYearContext)

    // ** Hook
    const {control, handleSubmit, setError, clearErrors, formState: { errors }, reset } = useForm(validate(validateSchema));

    const { isLoading, Loader, fetchData } = useLoader({ })
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const [select_student, setStudentOption] = useState([])
    const [student_id , setStudentId] = useState('')
    const [bottom_check, setBottomCheck] = useState(3)

    const [startPicker, setStartPicker] = useState(new Date());

    const [student_search_value, setStudentSearchValue] = useState([]);
    const [scroll_bottom_datas, setScrollBottomDatas] = useState([]);

    const hourDelay = (date) => {
        if (!date) {
            return null;
        }

        const newDate = new Date(date.getTime() + (24 * 60 * 60 * 1000));
        return newDate;
    };

    const [endPicker, setEndPicker] = useState(hourDelay(new Date));

    // Api
    const permissionStudentApi = useApi().role.student

    //  Оюутны жагсаалт хайлтаар
    async function getStudentOption(searchValue) {
        const { success, data } = await fetchData(permissionStudentApi.getStudent(searchValue))
        if(success) {
            setStudentOption(data)
        }
    }

    //  Оюутны жагсаалт select ашигласан
    async function getSelectBottomDatas(state){
        const { success, data } = await fetchData(permissionStudentApi.getSelectStudents(state))
        if(success){
            setScrollBottomDatas((prev) => [...prev, ...data])
        }
    }

    useEffect(() => {
        getSelectBottomDatas(2)
    }, []);

    function handleStudentSelect(value){
        getStudentOption(value)
    }

    async function onSubmit(cdata) {
        cdata['created_user'] = user.id
        cdata['updated_user'] = user.id
        cdata['lesson_season']= cseason_id
        cdata['lesson_year']= cyear_name
        cdata['start_date']= moment(startPicker).format('YYYY-MM-DD HH:mm:ss')
        cdata['finish_date']= moment(endPicker).format('YYYY-MM-DD HH:mm:ss')

        cdata = convertDefaultValue(cdata)

        const { success, error } = await postFetch(permissionStudentApi.post(cdata))
        if(success) {
            reset()
            refreshDatas()
            handleAddModal()
        }
        else {
            /** Алдааны мессеж */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message: error[key].msg});
            }
        }
    }

    const handleEndDate = (date) => {
        var end_date = new Date(date);

            if (!startPicker) {
                if (end_date > startPicker) {
                    setError('end_date', { type: 'custom', message: 'Эхлэх хугацаанаас өмнө байх боломжгүй !' });
                } else {
                    setEndPicker(end_date);
                    clearErrors('start_date');
                    clearErrors('end_date');
                }
            } else {
                var start = new Date;
                if (end_date < start ) {
                    setError('start_date', { type: 'custom', message: 'Эхлэх хугацаанаас өмнө байх боломжгүй' });
                    setError('end_date', { type: 'custom', message: 'Дуусах хугацаа нь эхлэх хугацаанаас өмнө байх боломжгүй' });

                } else {
                    setEndPicker(end_date);
                    clearErrors('start_date');
                    clearErrors('end_date');
                }
            }
        }



    const handleStartPicker = (dates) => {
        const start_date = new Date(dates);
        const end_date = new Date(endPicker);

            if (start_date > end_date) {
                setError('start_date', { type: 'custom', message: 'Дуусах хугацаанаас хойш байх боломжгүй' });
            } else {
                setStartPicker(dates)
                clearErrors('start_date')
            }
    };

    return (
        <Fragment>
            {isLoading}
            <Modal
                isOpen={isOpen}
                toggle={handleAddModal}
                className="sidebar-md hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleAddModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Оюутны хичээл сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className='flex-grow-1'>
                    <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
                        <Col sm={12}>
                            <Label className='form-label' for='student'>
                                {t('Оюутан')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="student"
                                render={({ field: {value, onChange } }) => {
                                    return (
                                        <Select
                                            name="student"
                                            id="student"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', {'is-invalid': errors.student})}
                                            placeholder={`Хайх`}
                                            isLoading={isLoading}
                                            loadingMessage={() => "Түр хүлээнэ үү..."}
                                            options={
                                                student_search_value.length === 0
                                                    ? scroll_bottom_datas || []
                                                    : select_student || []
                                            }
                                            value={
                                                student_search_value.length === 0
                                                    ? scroll_bottom_datas.find((c) => c.id === value)
                                                    : select_student.find((c) => c.id === value)
                                            }
                                            noOptionsMessage={() =>
												student_search_value.length > 1
													? t('Хоосон байна')
													: null
                                            }
                                            onMenuScrollToBottom={() => {
                                                if(student_search_value.length === 0){
                                                    setBottomCheck(bottom_check + 1)
                                                    getSelectBottomDatas(bottom_check)
                                                }
                                            }}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setStudentId(val?.id || '')
                                            }}
                                            onInputChange={(e) => {
                                                setStudentSearchValue(e);
                                                if(e.length > 1 && e !== student_search_value){
                                                    handleStudentSelect(e);
                                                } else if (e.length === 0){
                                                    setStudentOption([]);
                                                }
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}
                                        />
                                    )
                                }}
                            />
                            {errors.student && <FormFeedback className='d-block'>{t(errors.student.message)}</FormFeedback>}
                        </Col>
                        <Col xl={12}>
                            <Label className='form-label' for='description'>
                                {t('Тайлбар')}
                            </Label>
                                <Controller
                                    defaultValue=''
                                    control={control}
                                    name='description'
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type='textarea'
                                            name='description'
                                            id='description'
                                            bsSize='sm'
                                            invalid={errors.description && true}
                                        />
                                    )}
                                />
                            {errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
                        </Col>
                        <Col xl={12}>
                            <Label className='form-label' for='start_date'>
                                {t('Эхлэх хугацаа')}
                            </Label>
                            <Controller
                                defaultValue={new Date()}
                                control={control}
                                name='start_date'
                                className="form-control"
                                render={({}) => {
                                    return (
                                        <Flatpickr
                                            id='start_date'
                                            className='form-control'
                                            onChange={dates => {
                                               handleStartPicker(dates[0]);
                                                }}
                                            value={startPicker}
                                            style={{height: "30px"}}
                                            options={{
                                                enableTime: true,
                                                dateFormat: 'Y-m-d H:i',
                                                utc: true,
                                                time_24hr: true,
                                                // locale: Mongolian
                                            }}
                                        />
                                    )
                                }}
                            />
                                {errors.start_date && <FormFeedback className='d-block'>{t(errors.start_date.message)}</FormFeedback>}
                        </Col>

                        <Col>
                            <Label className='form-label' for='end'>
                                Дуусах хугацаа
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                value={endPicker}
                                className={classnames({ 'is-invalid': errors.end_date })}

                                name='end_date'
                                render={() => (
                                <Flatpickr
                                    id='end_date'
                                    name='end_date'
                                    className={`form-control`}
                                    onChange={date => handleEndDate(date[0])}
                                    value={endPicker}
                                    style={{ height: "30px" }}
                                    options={{
                                        enableTime: true,
                                        dateFormat: 'Y-m-d H:i',
                                        // minDate: new Date(startPicker),
                                        time_24hr: true,
                                        // locale: Mongolian
                                    }}
                                />
                                )}
                                />
                                {errors.end_date && <FormFeedback className='d-block'>{t(errors.end_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" outline type="reset" onClick={handleAddModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}
export default AddModal

