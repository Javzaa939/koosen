import React, { useEffect, useState } from "react";
import { X } from "react-feather";
import Select from 'react-select'
import { Button, Col, Input, Modal, ModalBody, FormFeedback, ModalHeader, Row, Form, Label } from "reactstrap";
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import { Controller, useForm } from "react-hook-form";
import { validate, convertDefaultValue } from "@utils"
import { ReactSelectStyles } from "@utils"
import './style.scss'
import classnames from 'classnames'
import { validateSchema } from "./validateSchema";
import ActiveYearContext from "@context/ActiveYearContext"
import { useContext } from 'react'
import Flatpickr from 'react-flatpickr'
// flatpickr style
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

function AddModal({ toggle, isOpen, refreshDatas, handleModal }) {

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

    const notify = () => toast.warn('Тус өрөөнд төлбөрийн тохиргоо хийгдээгүй байна.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored'
        });

    const closeBtn = (
        <X className="close" onClick={handleModal} type="button" />
    );

	const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });

    const { cyear_name, cseason_id} = useContext(ActiveYearContext);
    const { control, handleSubmit, setError, reset, setValue, formState: { errors } } = useForm(validate(validateSchema));

        const [studentOption, setStudentOption] = useState([])
        const [selected_student, setSelectStudent] = useState({})
        const [dormtype, setDormType] = useState([])
        const [dormlist, setDormlist] = useState([])
        const [fdormlist, setFdormlist] = useState([])

        const [selectedDormType, setSelectedType] = useState('')
        const [selectedDormRoom, setSelectedRoom] = useState({})
        const [judgement, setJudgement] = useState({})
        const [formzz, setFormzz] = useState([])
        const [dormPayment, setDormPay] = useState({})
        const [ sdate, setDate ]= useState(new Date());
        const [isvalue, setIsValue] = useState(false)

        const studentApi = useApi().student
        const dormtypeApi = useApi().dormitory.type
        const dormlistApi = useApi().dormitory.room
        const dormpostApi = useApi().dormitory.request
        const dormpaymentApi = useApi().dormitory.payment

        async function getStudents()
        {
            const { success, data } = await fetchData(studentApi.getSimpleList())
            if (success)
            {
                setStudentOption(data)
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

        // async function getDormitoryPayment(id)
        // {
        //     const { success, data } = await fetchData(dormpaymentApi.getOne(id))
        //     if (success)
        //     {
        //         setDormPay(data);
        //         if(data.payment)
        //         {
        //             setValue('payment', data.payment)
        //         }
        //         if(data.ransom){
        //             setValue('ransom', data.ransom)
        //         }
        //     } else {
        //         setValue('payment', '')
        //         setValue('ransom', '')
        //     }
        // }

        function setPayment(data) {

            if(data)
            {
                if(data.payment)
                {
                    setValue('payment', data.payment)
                    setValue('ransom', data.ransom)
                }
                else
                {
                    setValue('payment', '')
                    setValue('ransom', '')
                    notify()
                }
            }
            else
                {
                    setValue('ransom', '')
                    setValue('payment', '')
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

        async function onSubmit(cdata){

            cdata['request_date'] = sdate
            cdata['lesson_year'] = cyear_name
            cdata = convertDefaultValue(cdata)
            const { success, error } = await fetchData(dormpostApi.post(cdata))
            if(success){
                reset()
                refreshDatas()
                handleModal()
            } else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message:  error[key].msg});
                }
            }
        }

        useEffect(() => {
            getStudents();
            getDormitoryType();
            getDormitoryList();
        },[])

        function filterRoomNumbers(val) {
            setFdormlist(dormlist.filter(data => data.room_type.id === val.id));
        }

    return(
        <Modal
            isOpen={isOpen}
            style={{ maxWidth: 600 }}
            className='sidebar-lg w-100 align-items-start position-absolute'
            modalClassName='modal-slide-in'
            contentClassName='pt-0'
            keyboard
            toggle={handleModal}
        >
            <ModalHeader close={closeBtn} toggle={handleModal} className="d-flex">
                <span className="text-nowrap">Дотуур байрны бүртгэл</span> <span className="text-nowrap" style={{ fontWeight: 200, fontSize: 12}}>/ Өөрийн оюутан /</span>
            </ModalHeader>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                />
            <ModalBody className="m-2">
                {/* <Row tag={Form} onSubmit={handleSubmit(onSubmit)}> */}
                <Row tag={Form} onSubmit={handleSubmit(onSubmit)}>
                    <Col md={12} sm={12} className='mt-1'>
                        <Label className="mb-50">
                            Оюутан
                        </Label>
                        <Controller
                            name="student"
                            control={control}
                            defaultValue=''
                            render={({ field: {value, onChange} }) => (
                                <Select
                                    id="student"
                                    placeholder={`-- Сонгоно уу --`}
                                    className={classnames('react-select', { 'is-invalid': errors.student })}
                                    classNamePrefix='select'
                                    isClearable
                                    // invalid={errors.student && true}
                                    bsSize="sm"
                                    isLoading={isLoading}
                                    options={studentOption || []}
                                    value={studentOption.find((c) => c=null? '' :c.id === value)}
                                    // noOptionsMessage={() => 'Хоосон байна'}
                                    onChange={(val) => onChange(val?.id || '')}
                                    styles={ReactSelectStyles}
                                    getOptionValue={(option) => option.id}
                                    getOptionLabel={(option) => option.code + ' ' + option.last_name + ' ' +  option.first_name + ' ' + option.register_num}
                                />
                            )}
                        />
                        {errors.student && <FormFeedback className='d-block'>{errors.student.message}</FormFeedback>}
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
                                    isDisabled={isvalue}
                                    isLoading={isLoading}
                                    classNamePrefix='select'
                                    placeholder={`-- Сонгоно уу --`}
                                    options={dormtype || []}
                                    value={dormtype.find((c) => c.id === value)}
                                    noOptionsMessage={() => 'Хоосон байна'}
                                    onChange={(val) => {
                                        onChange(val?.id || '')
                                        filterRoomNumbers(val? val:'')
                                        setPayment(val? val.payment_room : null)
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
                                    value={fdormlist.find((c) => c.id === value)}
                                    noOptionsMessage={() => 'Хоосон байна'}
                                    onChange={(val) => {onChange(val?.id|| '')
                                                            val? setIsValue(true) :setIsValue(false)
                                                        }}
                                    styles={ReactSelectStyles}
                                    getOptionValue={(option) => option.id}
                                    getOptionLabel={(option) => option.door_number + '-' + option.gateway + '  ' + option.floor + ' давхар'}
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
                        <div>
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
            </ModalBody>
        </Modal>
    )
}

export default AddModal