// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import Select from 'react-select'

import { useTranslation } from 'react-i18next';

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
    Spinner
} from "reactstrap";
import { X } from "react-feather";
import AuthContext from '@context/AuthContext'

import { validate, convertDefaultValue, get_room_type } from "@utils"
import { validateSchema } from '../validateSchema';

const EditModal = ({ open, handleModal, room_id, refreshDatas }) => {
    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )
    // ** Hook
    const { control, handleSubmit, reset, setError, setValue, formState: { errors } } = useForm(validate(validateSchema));

    const { t } = useTranslation()
    const [typeOption, setType] = useState([])
    const [buildingOption, setBuilding] = useState([])
    const [schoolOption, setSchoolOption] =useState([])

    const { user } = useContext(AuthContext)


    const [is_valid, setValid] = useState(true)

	// Loader
	const { isLoading, fetchData } = useLoader({});

    // Api
    const roomApi = useApi().timetable.room
    const buildingApi = useApi().timetable.building
    const schoolApi = useApi().hrms.subschool

    // Тэнхимын жагсаалт
    async function getBuilding() {
        const { success, data } = await fetchData(buildingApi.get())
        if(success) {
            setSchoolOption(data)
        }
    }

    async function getSchools() {
        const { success, data } = await fetchData(schoolApi.get())
        if(success) {
            setSchoolOption(data)
        }
    }

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-timetable-room-update')) {
            setValid(false)
        }
    },[user])

    async function getDatas() {
        if(room_id) {
            const { success, data } = await fetchData(roomApi.getOne(room_id))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key,'')

                    if(key === 'school' || key === 'building') {
                        setValue(key, data[key]?.id)
                    }
                }
            }
        }
    }

    function getAll() {
        Promise.all([
            fetchData(roomApi.getOne(room_id)),
            fetchData(schoolApi.get()),
            fetchData(buildingApi.get())
        ]).then((values) => {
            if (values[0]?.data) {
                var data = values[0]?.data
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key,'')

                    if(key === 'school' || key === 'building') {
                        setValue(key, data[key]?.id)
                    }
                }
            }
            setSchoolOption(values[1].data)
            setBuilding(values[2].data)
        })
    }

    useEffect(() => {
        getAll()
        setType(get_room_type())
    },[])

	async function onSubmit(cdata) {
        cdata['updated_user'] = user.id
        cdata = convertDefaultValue(cdata)
        const { success, error } = await fetchData(roomApi.put(cdata, room_id))
        if(success) {
            reset()
            handleModal()
            refreshDatas()
        } else {
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
                className="sidebar-lg hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
                onClosed={handleModal}
            >
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}

                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    tag="div"
                    close={CloseBtn}
                >
                <h5 className="modal-title" >{t('Өрөөний мэдээлэл засах')}</h5>

                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                         <Col  md={12}>
                            <Label className="form-label" for="school">
                                {t('Сургууль')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="school"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="school"
                                            id="school"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.school })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={schoolOption || []}
                                            value={schoolOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                             {errors.school && <FormFeedback className='d-block'>{t(errors.school.message)}</FormFeedback>}
                        </Col>
                        <Col  md={12}>
                            <Label className="form-label" for="building">
                                {t('Хичээлийн байр')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="building"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="building"
                                            id="building"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.building })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={buildingOption || []}
                                            value={buildingOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                             {errors.building && <FormFeedback className='d-block'>{t(errors.building.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="code">
                                {t('Өрөөний дугаар')}
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
                                        placeholder={t('Өрөөний дугаар')}
                                        {...field}
                                        type="text"
                                        readOnly={is_valid}
                                        invalid={errors.code && true}
                                    />
                                )}
                            />
                            {errors.code && <FormFeedback className='d-block'>{t(errors.code.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="name">
                                {t('Өрөөний нэр')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="name"
                                name="name"
                                render={({ field }) => (
                                    <Input
                                        id ="name"
                                        bsSize="sm"
                                        placeholder={t('Өрөөний нэр')}
                                        {...field}
                                        type="text"
                                        readOnly={is_valid}
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="type">
                                {t('Өрөөний төрөл')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="type"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="type"
                                            id="type"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.type })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={typeOption || []}
                                            value={typeOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            isDisabled={is_valid}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.type && <FormFeedback className='d-block'>{t(errors.type.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="volume">
                                {t('Өрөөний багтаамж')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="volume"
                                name="volume"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="volume"
                                        bsSize="sm"
                                        type="number"
                                        placeholder={t('Өрөөний багтаамж')}
                                        invalid={errors.volume && true}
                                        onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                    />
                                )}
                            />
                            {errors.volume && <FormFeedback className='d-block'>{t(errors.volume.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label  me-1" for="description">
                               {t('Тайлбар')}
                            </Label>
                            <Controller
                                control={control}
                                id="description"
                                name="description"
                                defaultValue=''
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="description"
                                        type="textarea"
                                        bsSize="sm"
                                        readOnly={is_valid}
                                        placeholder={t('Тайлбар')}
                                        invalid={errors.description && true}
                                    />
                                )}
                            />
                            {errors.description && <FormFeedback className='d-block'>{t(errors.description.message)}</FormFeedback>}
                        </Col>
                        <Col className='text-center mt-2' md={12}>
                            <Button className="me-2" disabled={is_valid} size='sm' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            {/* <Button color="secondary" size='sm' type="reset" outline  onClick={handleModal}>
                                {t('Буцах')}
                            </Button> */}
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default EditModal;
