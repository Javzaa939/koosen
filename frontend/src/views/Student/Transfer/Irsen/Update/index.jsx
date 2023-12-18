// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import Select from 'react-select'

import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";

import { ReactSelectStyles } from "@utils"

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";

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
} from "reactstrap";

import { t } from 'i18next';

import AuthContext from '@context/AuthContext'

import SchoolContext from "@context/SchoolContext"

import { validate, convertDefaultValue } from "@utils"

import { validateSchema } from '../validateSchema';

const UpdateModal = ({ open, handleUpdate, refreshDatas, editDatas, editId }) => {

    // ** Hook
    const { control, handleSubmit, reset, setError, setValue, formState: { errors } } = useForm(validate(validateSchema));

    const [department_option, setDepartmentOption] = useState([])
    const [groupOption, setGroup] = useState([])

    var values = {
        group: '',
        department: ''
    }

    const { user } = useContext(AuthContext)
    const [is_disabled, setDisabled] = useState(true)

    const { school_id } = useContext(SchoolContext)

	// Loader
	const { isLoading, fetchData } = useLoader({});

    // Эрэмбэлэлт
    const [select_value, setSelectValue] = useState(values)

    // Api
    const departmentApi = useApi().hrms.department
    const groupApi = useApi().student.group
    const studentmovementApi = useApi().student.arrived

     // Хөтөлбөрийн багын жагсаалт
     async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get(school_id))
        if(success) {
            setDepartmentOption(data)
        }
    }

     // Ангийн жагсаалт
     async function getGroup() {
        const { success, data } = await fetchData(groupApi.getList(select_value.department))
        if(success) {
            setGroup(data)
        }
    }

    useEffect(() =>
    {
        for(let key in editDatas) {
            if (key == 'now_group') {
                setSelectValue({
                    group: editDatas[key]?.id
                })

                setValue('group', editDatas[key]?.id)
        }}

    }, [editDatas])

    useEffect(() => {
        getDepartmentOption()
        getGroup()
    },[select_value])

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-student-movement-update')&& school_id) {
            setDisabled(false)
        }
    },[user])

    async function onSubmit(cdata) {
        const { success, data } = await fetchData(studentmovementApi.postArrive(cdata, editId))
        if(success)
        {
            refreshDatas()
            handleUpdate({})
        }
	}

	return (
        <Fragment>
            <Modal isOpen={open} toggle={handleUpdate} className="modal-dialog-centered modal-sm" onClosed={handleUpdate}>
                <ModalHeader className='bg-transparent pb-0' toggle={handleUpdate} ></ModalHeader>
                <ModalBody className="px-sm-3 pt-30 pb-3">
                    <div className='text-center'>
                        <h4>{t('Оюутны шилжилт хөдөлгөөн хийх')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        {/* <Col md={12}>
                            <Label className="form-label" for="department">
                                {t('Хөтөлбөрийн баг')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="department"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="department"
                                            id="department"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.department })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={department_option || []}
                                            value={value && department_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => 'Хоосон байна'}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                if (val?.id) {
                                                    setSelectValue(current => {
                                                        return {
                                                            ...current,
                                                            department: val?.id
                                                        }
                                                    })
                                                } else {
                                                    setSelectValue(current => {
                                                        return {
                                                            ...current,
                                                            department: ''
                                                        }
                                                    })
                                                }
                                                setValue('group', '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.department && <FormFeedback className='d-block'>{t(errors.department.message)}</FormFeedback>}
                        </Col> */}
                        <Col md={12}>
                            <Label className="form-label" for="group">
                                {t("Анги")}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue={select_value.group}
                                name="group"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="group"
                                            id="group"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.group })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={groupOption || []}
                                            value={groupOption.find((c) => c.id === select_value.group)}
                                            noOptionsMessage={() => 'Хоосон байна'}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                if (val?.id) {
                                                    setSelectValue(current => {
                                                        return {
                                                            ...current,
                                                            group: val?.id
                                                        }
                                                    })
                                                } else {
                                                    setSelectValue(current => {
                                                        return {
                                                            ...current,
                                                            group: ''
                                                        }
                                                    })
                                                }
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.group && <FormFeedback className='d-block'>{t(errors.group.message)}</FormFeedback>}
                        </Col>
                        <small className='fw-bolder'>{t('Шинэ оюутны код автоматаар үүсгэгдэнэ.')}</small>
                        {/* <Col md={12}>
                            <Label className="form-label" for="code">
                                {t('Оюутны шинэ код')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="code"
                                name="code"
                                render={({ field }) => (
                                    <Input
                                        id ="code"
                                        bsSize="sm"
                                        placeholder={t('Оюутны шинэ код')}
                                        {...field}
                                        type="text"
                                        invalid={errors.code && true}
                                    />
                                )}
                            />
                            {errors.code && <FormFeedback className='d-block'>{t(errors.code.message)}</FormFeedback>}
                        </Col> */}
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline  onClick={handleUpdate}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default UpdateModal;

