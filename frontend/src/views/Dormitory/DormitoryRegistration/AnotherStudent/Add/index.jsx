import React, { useEffect, useState, useContext } from "react";
import { X } from "react-feather";
import Select from 'react-select'
import { Button, Col, Collapse, Input, Modal, ModalBody, ModalFooter, ModalHeader, Row, Form, Label, FormFeedback } from "reactstrap";
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import { Controller, useForm } from "react-hook-form";
import { validate, convertDefaultValue, formatDate } from "@utils"
import ActiveYearContext from "@context/ActiveYearContext"
import { ReactSelectStyles } from "@utils"
import classnames from 'classnames'
import './style.scss'
// flatpickr style
import '@styles/react/libs/flatpickr/flatpickr.scss'
import Flatpickr from 'react-flatpickr'
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import { validateSchema } from "../validateSchema";



function AddModal({ toggle, modal, handleModal, refreshDatas }) {

    const judgeList = [

        {
                id:1,
                name: 'Оюутан хүсэлт илгээсэн'
        },
        {
                id:2,
                name: 'Баталгаажсан'
        },
        {
                id:4,
                name: 'Зөвшөөрсөн'
        },

    ]

    const closeBtn = (
        <X className="close" onClick={toggle} type="button" />
    );

	const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true });
    const { cyear_name, cseason_id} = useContext(ActiveYearContext);

    const { control, handleSubmit, setError, reset, setValue, formState: { errors } } = useForm(validate(validateSchema));

    const [dormtype, setDormType] = useState([])
    const [dormlist, setDormlist] = useState([])
    const [collapse, setCollapse] = useState(true)
    const [isValue, setIsValue] = useState(false)

    const [selectedDormType, setSelectedType] = useState('')

    const studentApi = useApi().student
    const dormtypeApi = useApi().dormitory.type
    const dormlistApi = useApi().dormitory.room
    const dormitoryApi = useApi().dormitory.request.another

    async function getDormitoryType()
    {
        const { success, data } = await fetchData(dormtypeApi.getList())
        if (success)
        {
            setDormType(data)
        }
    }

    async function getDormitoryList()
    {
        const { success, data } = await fetchData(dormlistApi.getList(selectedDormType))
        if (success)
        {
            setDormlist(data)
        }
    }

    useEffect(() => {
        getDormitoryType();
    },[])

    useEffect(() => {
        getDormitoryList();
    },[selectedDormType])

    async function onSubmit(cdata){
        cdata['lesson_year'] = cyear_name
        cdata['request_date'] = formatDate(cdata['request_date'])
        cdata = convertDefaultValue(cdata)
        const { success, errors } = await fetchData(dormitoryApi.post(cdata))
        if(success){
            reset()
            refreshDatas()
            handleModal()
        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            if(errors && Object.keys(errors).length > 0) {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    setError(key, { type: 'custom', message: errors[key][0]});
                }
            }
        }
    }

    return(
        <Modal
            isOpen={modal}
            toggle={toggle}
            style={{ maxWidth: 1000 }}
            className='sidebar-lg w-100 align-items-start position-absolute'
            modalClassName='modal-slide-in'
            contentClassName='pt-0'
        >
            {/* {isLoading && Loader} */}
            <ModalHeader close={closeBtn} className="d-flex">
                <span className="text-nowrap">Дотуур байрны бүртгэл</span> <span className="text-nowrap" style={{ fontWeight: 200, fontSize: 12}}>/ Гадны оюутан /</span>
            </ModalHeader>
                <div className="m-2">
                    <Row tag={Form} onSubmit={handleSubmit(onSubmit)}>
                        <Col xl={6} lg={6} md={12} className='mt-1'>
                            <div className="m-1">
                                <div className="m-25 pb-25 bg-custom">
                                    <h5 className="p-1" onClick={() => {setCollapse(!collapse)}}>
                                        Гадны оюутан бүртгэл
                                    </h5>
                                    <div>
                                        <div>
                                            <div className="m-1">
                                                <div className='mt-1'>
                                                    <Label className="mb-50">
                                                        Овог
                                                    </Label>
                                                    <Controller
                                                        name="last_name"
                                                        control={control}
                                                        defaultValue=''
                                                        render={({ field }) => (
                                                            <Input
                                                                type="text"
                                                                id="last_name"
                                                                {...field}
                                                                placeholder={`Овог`}
                                                                bsSize="sm"
                                                                invalid={errors.last_name && true}
                                                            />
                                                        )}
                                                    />
                                                    {errors.last_name && <FormFeedback className='d-block'>{errors.last_name.message}</FormFeedback>}
                                                </div>
                                            </div>
                                            <div className="m-1">
                                                <div className='mt-1'>
                                                    <Label className="mb-50">
                                                        Нэр
                                                    </Label>
                                                    <Controller
                                                        name="first_name"
                                                        control={control}
                                                        defaultValue=''
                                                        render={({ field }) => (
                                                            <Input
                                                                type="text"
                                                                id="first_name"
                                                                {...field}
                                                                placeholder={`Өөрийн нэр`}
                                                                bsSize="sm"
                                                                invalid={errors.first_name && true}
                                                            />
                                                        )}
                                                    />
                                                    {errors.first_name && <FormFeedback className='d-block'>{errors.first_name.message}</FormFeedback>}
                                                </div>
                                            </div>
                                            <div className="m-1">
                                                <div className='mt-1'>
                                                    <Label className="mb-50">
                                                        Утасны дугаар
                                                    </Label>
                                                    <Controller
                                                        name="phone_number"
                                                        control={control}
                                                        defaultValue=''
                                                        render={({ field }) => (
                                                            <Input
                                                                type="number"
                                                                id="phone_number"
                                                                {...field}
                                                                placeholder={`Утасны дугаар`}
                                                                bsSize="sm"
                                                                invalid={errors.phone_number && true}
                                                            />
                                                        )}
                                                    />
                                                    {errors.phone_number && <FormFeedback className='d-block'>{errors.phone_number.message}</FormFeedback>}
                                                </div>
                                            </div>
                                            <div className="m-1">
                                                <div className='mt-1'>
                                                    <Label className="mb-50">
                                                        Цахим шуудан
                                                    </Label>
                                                    <Controller
                                                        name="email"
                                                        control={control}
                                                        defaultValue=''
                                                        render={({ field }) => (
                                                            <Input
                                                                type="email"
                                                                id="email"
                                                                {...field}
                                                                placeholder={`oyutan@example.com`}
                                                                bsSize="sm"
                                                                invalid={errors.email && true}
                                                            />
                                                        )}
                                                    />
                                                    {errors.email && <FormFeedback className='d-block'>{errors.email.message}</FormFeedback>}
                                                </div>
                                            </div>
                                            <div className="m-1">
                                                <div className='mt-1'>
                                                    <Label className="mb-50">
                                                        Регистрийн дугаар
                                                    </Label>
                                                    <Controller
                                                        name="register"
                                                        control={control}
                                                        defaultValue=''
                                                        render={({ field }) => (
                                                            <Input
                                                                type="text"
                                                                id="register"
                                                                {...field}
                                                                placeholder={`AA00220033`}
                                                                bsSize="sm"
                                                                invalid={errors.register && true}
                                                            />
                                                        )}
                                                    />
                                                    {errors.register && <FormFeedback className='d-block'>{errors.register.message}</FormFeedback>}
                                                </div>
                                            </div>
                                            <div className="m-1">
                                                <div className='mt-1'>
                                                    <Label className="mb-50">
                                                        Сургууль
                                                    </Label>
                                                    <Controller
                                                        name="school"
                                                        control={control}
                                                        defaultValue=''
                                                        render={({ field }) => (
                                                            <Input
                                                                type="text"
                                                                id="school"
                                                                {...field}
                                                                placeholder={``}
                                                                bsSize="sm"
                                                                invalid={errors.school && true}
                                                            />
                                                        )}
                                                    />
                                                    {errors.school && <FormFeedback className='d-block'>{errors.school.message}</FormFeedback>}
                                                </div>
                                            </div>
                                            <div className="m-1">
                                                <div className='mt-1'>
                                                    <Label className="mb-50">
                                                        Мэргэжил
                                                    </Label>
                                                    <Controller
                                                        name="profession"
                                                        control={control}
                                                        defaultValue=''
                                                        render={({ field }) => (
                                                            <Input
                                                                type="text"
                                                                id="profession"
                                                                {...field}
                                                                placeholder={``}
                                                                bsSize="sm"
                                                                invalid={errors.profession && true}
                                                            />
                                                        )}
                                                    />
                                                    {errors.profession && <FormFeedback className='d-block'>{errors.profession.message}</FormFeedback>}
                                                </div>
                                            </div>
                                            <div className="m-1">
                                                <p className="mb-25">
                                                    Курс
                                                </p>
                                                <Controller
                                                    name="course"
                                                    control={control}
                                                    defaultValue=''
                                                    render={({ field }) => (
                                                        <Input
                                                            type="number"
                                                            id="course"
                                                            {...field}
                                                            placeholder={``}
                                                            bsSize="sm"
                                                            invalid={errors.course && true}
                                                        />
                                                    )}
                                                />
                                                {errors.course && <FormFeedback className='d-block'>{errors.course.message}</FormFeedback>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col>
                            <Col>
                                <Label className="mb-50">
                                    Өрөөний төрөл
                                </Label>
                                <Controller
                                    name="room_type"
                                    control={control}
                                    defaultValue=''
                                    render={({field: {onChange, value}}) =>(
                                        <Select
                                            id="room_type"
                                            className={classnames('react-select', { 'is-invalid': errors.room_type })}
                                            isClearable
                                            isLoading={isLoading}
                                            // isDisabled={isValue}
                                            classNamePrefix='select'
                                            placeholder={`-- Сонгоно уу --`}
                                            options={dormtype || []}
                                            value={dormtype.find((c) => c.id === value)}
                                            noOptionsMessage={() => 'Хоосон байна'}
                                            onChange={(val) => {
                                                onChange(val?.id || '');
                                                setSelectedType(val?.id || '')
                                                setValue('payment', val?.payment_room?.payment || 0)
                                                setValue('ransom', val?.payment_room?.ransom || 0)
                                                if(!val) setValue('room', '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )}
                                />
                                {errors.room_type && <FormFeedback className='d-block'>{errors.room_type.message}</FormFeedback>}
                            </Col>
                            <Col md={12} sm={12} className='mt-1'>
                                <Label className="mb-50">
                                    Өрөөний дугаар
                                </Label>
                                <Controller
                                    name="room"
                                    control={control}
                                    defaultValue=''
                                    render={({ field: {onChange, value} }) => (
                                        <Select
                                            id="room"
                                            className={classnames('react-select', { 'is-invalid': errors.room })}
                                            isClearable
                                            isLoading={isLoading}
                                            classNamePrefix='select'
                                            placeholder={`-- Сонгоно уу --`}
                                            options={dormlist || []}
                                            value={value && dormlist.find((c) => c.id === value)}
                                            noOptionsMessage={() => 'Хоосон байна'}
                                            onChange={(val) =>
                                            {
                                                onChange(val?.id || '')
                                                val? setIsValue(true) : setIsValue(false)
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.gateway + '-' + option.door_number + ' ' + option.floor + ' давхар'}
                                        />
                                    )}
                                />
                                {errors.room && <FormFeedback className='d-block'>{errors.room.message}</FormFeedback>}
                            </Col>
                            <Col md={12} sm={12} className='mt-1'>
                                <Label className="">
                                    Төлбөр
                                </Label>
                                <Controller
                                    name="payment"
                                    control={control}
                                    defaultValue=''
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            disabled
                                            id="payment"
                                            {...field}
                                            placeholder={`-- Мөнгөн дүн --`}
                                            bsSize="sm"
                                            invalid={errors.payment && true}
                                        />
                                    )}
                                />
                                {errors.payment && <FormFeedback className='d-block'>{errors.payment.message}</FormFeedback>}
                            </Col>
                            <Col md={12} sm={12} className='mt-1'>
                                <Label className="mb-50">
                                    Барьцаа төлбөрийн хэмжээ
                                </Label>
                                <Controller
                                    name="ransom"
                                    control={control}
                                    defaultValue=''
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            id="ransom"
                                            disabled
                                            {...field}
                                            placeholder={`-- Мөнгөн дүн --`}
                                            bsSize="sm"
                                            invalid={errors.ransom && true}
                                        />
                                    )}
                                />
                                {errors.ransom && <FormFeedback className='d-block'>{errors.ransom.message}</FormFeedback>}
                            </Col>
                            <Col md={12} sm={12} className='mt-1'>
                                <Label className="mb-50">
                                    Төлсөн төлбөр
                                </Label>
                                <Controller
                                    name="in_balance"
                                    control={control}
                                    defaultValue=''
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            id="in_balance"
                                            {...field}
                                            placeholder={`-- Мөнгөн дүн --`}
                                            bsSize="sm"
                                            invalid={errors.in_balance && true}
                                        />
                                    )}
                                />
                                {errors.in_balance && <FormFeedback className='d-block'>{errors.in_balance.message}</FormFeedback>}
                            </Col>
                            <Col xl={12} className="mt-1">
                                <Label className='form-label' for='request_date'>
                                    Хүсэлт гаргасан огноо
                                </Label>
                                <Controller
                                    name="request_date"
                                    control={control}
                                    defaultValue={new Date()}
                                    render={({ field: { value, onChange } }) => (
                                        <Flatpickr
                                            id='request_date'
                                            name='request_date'
                                            className='form-control'
                                            onChange={dates => {
                                                onChange(dates[0]);
                                            }}
                                            value={value}
                                            style={{height: "30px"}}
                                            options={{
                                                dateFormat: 'Y-m-d',
                                                utc: true,
                                                time_24hr: true,
                                                // locale: Mongolian
                                            }}
                                        />
                                    )}
                                />
                            </Col>
                            <Col className="border rounded-3 bg-custom mt-2">
                                <div className="p-1">
                                    <div md={12} sm={12} className='mt-1'>
                                        <Label className="mb-50">
                                            Шийдвэр
                                        </Label>
                                        <Controller
                                            id="solved_flag"
                                            name="solved_flag"
                                            control={control}
                                            defaultValue=''
                                            render={({ field: { onChange, value } }) => (
                                                <Select
                                                    id="solved_flag"
                                                    className={classnames('react-select', { 'is-invalid': errors.solved_flag })}
                                                    isClearable
                                                    isLoading={isLoading}
                                                    classNamePrefix='select'
                                                    placeholder={`-- Сонгоно уу --`}
                                                    options={judgeList || []}
                                                    value={judgeList.find((c) => c.id === value)}
                                                    noOptionsMessage={() => 'Хоосон байна'}
                                                    onChange={(val) => onChange(val?.id || '')}
                                                    styles={ReactSelectStyles}
                                                    getOptionValue={(option) => option.id}
                                                    getOptionLabel={(option) => option.name}
                                                />
                                            )}
                                        />
                                        {errors.solved_flag && <FormFeedback className='d-block'>{errors.solved_flag.message}</FormFeedback>}
                                    </div>
                                    <div md={12} sm={12} className='mt-1 mb-1'>
                                        <Label className="mb-50">
                                            Шийдвэрийн тайлбар
                                        </Label>
                                        <Controller
                                            id="solved_message"
                                            name="solved_message"
                                            control={control}
                                            defaultValue=''
                                            render={({ field }) => (
                                                <Input {...field} type="textarea" id="solved_message" name="solved_message"/>
                                            )}
                                        />
                                    </div>
                                </div>
                            </Col>
                        </Col>
                        <div className="d-flex justify-content-end">
                            <Button color="primary" type="submit">
                                Хадгалах
                            </Button>
                        </div>
                    </Row>
                </div>

                <ModalFooter className="d-flex justify-content-end">
                </ModalFooter>
        </Modal>
    )
}

export default AddModal
