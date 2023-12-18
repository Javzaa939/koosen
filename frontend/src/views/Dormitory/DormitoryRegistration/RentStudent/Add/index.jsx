import React, { useEffect, useState } from "react";
import { X } from "react-feather";
import Select from 'react-select'
import { Badge, Button, Col, Collapse, Input, Modal, ModalBody, ModalFooter, ModalHeader,Form,  Row, Label, FormFeedback } from "reactstrap";
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import { Controller, useForm } from "react-hook-form";
import { validate, convertDefaultValue } from "@utils"
import './style.scss'
import { ReactSelectStyles } from "@utils"
import './style.scss'
import classnames from 'classnames'
// import { validateSchema } from "./validateSchema";
import ActiveYearContext from "@context/ActiveYearContext"
import { useContext } from 'react'
import Flatpickr from 'react-flatpickr'
// flatpickr style
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import { validateUser } from "./validateUser";
import { validateTeachers } from "./validateTeachers";

function AddModal({ toggle, modal, is_teacher, refreshDatas }) {

    const judgeList = [

        {
                id:1,
                name: 'Хүсэлт хүлээж авсан'
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

	const {
        Loader,
        isLoading,
        isLoading: teacherLoading,
        fetchData,
        fetchData: teacherFetch
    } = useLoader({ isFullScreen: true });

    const { control, handleSubmit, setError, reset, setValue, formState: { errors } } = useForm(validate(is_teacher ? validateTeachers : validateUser));
    const { cyear_name, cseason_id} = useContext(ActiveYearContext);

        const [teacherOption, setTeacherOption] = useState([])
        const [selected_student, setSelectStudent] = useState({})
        const [dormtype, setDormType] = useState([])
        const [dormlist, setDormlist] = useState([])
        const [collapse, setCollapse] = useState(true)
        const [ sdate, setDate ]= useState(new Date());
        const [fdormlist, setFdormlist] = useState([])

        const [selectedDormType, setSelectedType] = useState('')

        const teacherApi = useApi().hrms.teacher
        const dormtypeApi = useApi().dormitory.type
        const dormlistApi = useApi().dormitory.room
        const dormFamily = useApi().dormitory.request.rent

        async function getTeachers()
        {
            const { success, data } = await teacherFetch(teacherApi.getLongList())
            if (success)
            {
                setTeacherOption(data)
            }
        }

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
            const { success, data } = await fetchData(dormlistApi.getList(selectedDormType.id))
            if (success)
            {
                setDormlist(data)
            }
        }

        useEffect(() => {
            getDormitoryType();
            getDormitoryList();
            getTeachers()
        },[])

        function filterRoomNumbers(val) {
            setFdormlist(dormlist.filter(data => data.room_type.id === val.id));
        }

        useEffect(() => {
            getDormitoryList();
        },[selectedDormType])
        async function onSubmit(cdata){

            cdata['request_date'] = sdate
            cdata['lesson_year'] = cyear_name
            cdata['is_ourteacher'] = is_teacher
            if(selected_student) cdata['teacher'] = selected_student.id
            cdata = convertDefaultValue(cdata)
            const { success, errors } = await fetchData(dormFamily.post(cdata))
            if(success){
                reset()
                refreshDatas()
                toggle()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                console.log(errors);
                for (let key in errors) {
                    setError(key, { type: 'custom', message:  errors[key][0]});
                }
            }
        }

    return(
        <Modal
            isOpen={modal}
            toggle={toggle}
            style={{ maxWidth: 600 }}
            className='sidebar-lg w-100 align-items-start position-absolute'
            modalClassName='modal-slide-in'
            contentClassName='pt-0'>
            <ModalHeader close={closeBtn} className="d-flex">
                <span className="text-nowrap">Дотуур байрны бүртгэл</span> <span className="text-nowrap" style={{ fontWeight: 200, fontSize: 12}}>/ {is_teacher ? 'Багшийн бүртгэл' : 'Сараар түрээслэгч'} /</span>
            </ModalHeader>
                    <Row className="m-1" tag={Form} onSubmit={handleSubmit(onSubmit)}>
                        <Col>
                        {
                            is_teacher ?
                            <div className="mt-1">
                                <div className="mb-50">
                                    Багш
                                </div>
                                    <Select
                                        name="student"
                                        id="student"
                                        classNamePrefix='select'
                                        isClearable
                                        isLoading={teacherLoading}
                                        placeholder={`-- Сонгоно уу --`}
                                        options={teacherOption || []}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {setSelectStudent(val)}}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.code + ' ' + option.last_name + ' ' +  option.first_name}
                                    />
                            </div>
                            :
                            <div className="mt-25 border rounded-3 bg-custom">
                                <div className="p-1 rounded-2 bg-customized" onClick={() => {setCollapse(!collapse)}}>
                                    Сараар түрээслэгч бүртгэх
                                </div>
                                <Collapse isOpen={collapse}>
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
                                                                placeholder={`user@example.com`}
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
                                    </div>
                                </Collapse>
                            </div>

                        }
                    </Col>
                    <Col md={12} sm={12} className='mt-1'>
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
                                    classNamePrefix='select'
                                    placeholder={`-- Сонгоно уу --`}
                                    options={dormtype || []}
                                    value={dormtype.find((c) => c.id === value)}
                                    noOptionsMessage={() => 'Хоосон байна'}
                                    onChange={(val) => {
                                        onChange(val?.id || '');
                                        setSelectedType(val?.id || '')
                                        filterRoomNumbers(val? val : '')
                                        setValue('payment', val?.payment_room?.payment || 0)
                                        setValue('ransom', val?.payment_room?.ransom || 0)
                                        if(!val) setValue('room', '')
                                        }
                                    }
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
                                    options={fdormlist || []}
                                    value={value && fdormlist.find((c) => c.id === value)}
                                    noOptionsMessage={() => 'Хоосон байна'}
                                    onChange={(val) => {onChange(val?.id || '');}}
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
                            <Flatpickr
                                id='request_date'
                                name='request_date'
                                className='form-control'
                                onChange={dates => {
                                    setDate(dates[0]);
                                    }}
                                value={sdate}
                                style={{height: "30px"}}
                                options={{
                                    dateFormat: 'Y-m-d',
                                    utc: true,
                                    time_24hr: true,
                                    // locale: Mongolian
                                }}
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
                                            onChange={(val) => {onChange(val?.id || '',
                                                                setSelectStudent(current => {
                                                                    return {
                                                                        ...current,
                                                                        solved_flag: val?.id || '',
                                                                    }
                                                                })
                                            )}}
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
                                <Input type="textarea" id="solved_message" name="solved_message"/>
                            </div>
                        </div>
                    </Col>
                    <Col md={12} sm={12} className='mt-1 d-flex justify-content-end'>
                        <Button color="primary" type="submit">
                            Хадгалах
                        </Button>
                    </Col>
                </Row>
        </Modal>
    )
}

export default AddModal