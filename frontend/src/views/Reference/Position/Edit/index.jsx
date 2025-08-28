import {
    Row,
    Col,
    Modal,
	Form,
	Input,
	Label,
	Button,
    ModalBody,
	ModalHeader,
    Spinner,
    FormFeedback,
} from "reactstrap";
import { t } from 'i18next';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { useForm, Controller } from "react-hook-form";
import React, { Fragment, useEffect, useState} from 'react'
import { convertDefaultValue, ReactSelectStyles } from "@utils"
import { X } from "react-feather";
import Select from "react-select";
import classnames from "classnames"

const UpdateModal = ({ open, editId, handleEdit, refreshDatas, permission_option, mainPositionData}) => {
    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleEdit} />
    )

    // Loader
    const {isLoading, fetchData } = useLoader({})

    const { control, handleSubmit, setValue, reset, setError, formState: { errors } } = useForm();
    const [mainPositionId, setMainPositionId] = useState('')

    // Api
    const getPositionApi = useApi().hrms.position
    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(getPositionApi.getOne(editId))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')
                    if(key === 'main_position'){
                        setValue(key, data[key]?.id)
                    }

                }
            }
        }
    }

    useEffect(() => {
        getDatas()
    },[editId])

    async function onSubmit(cdata) {
        if(editId) {
            cdata = convertDefaultValue(cdata)

            const necessary_cdata = {
                permissions: cdata.permissions,
                removed_perms: cdata.removed_perms,
                name: cdata.name,
                is_hr: cdata.is_hr,
                is_director: cdata.is_director,
                is_teacher: cdata.is_teacher,
                description: cdata.description,
                main_position: cdata.main_position || null,
            }

            necessary_cdata['permissions'] = necessary_cdata['permissions']?.map((c)=> c.id)
            necessary_cdata['removed_perms'] = necessary_cdata['removed_perms']?.map((c)=> c.id)

            const { success, errors } = await fetchData(getPositionApi.put(necessary_cdata, editId))
            if(success) {
                refreshDatas()
                handleEdit()
                reset()
            }
            else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in errors) {
                    setError(key, { type: 'custom', message:  errors[key]});
                }
                console.log('errors', errors)
            }
        }
	}

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleEdit}
                className="sidebar-md"
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
                backdrop='static'
            >
                {
                    isLoading &&
                        <div className='suspense-loader'>
                            <Spinner size='bg'/>
                            <span className='ms-50'>Түр хүлээнэ үү...</span>
                        </div>
                }

                <ModalHeader
                    className="mb-1"
                    toggle={handleEdit}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Албан тушаалийн мэдээлэл засах')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="name">
                                {t('Нэр')}
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
                                        placeholder={t("Нэр")}
                                        {...field}
                                        type="text"
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{errors.name.message}</FormFeedback>}
                        </Col>
                        <Col md={12} className='d-flex align-items-center mt-1'>
                            <Controller
                                control={control}
                                name="is_hr"
                                defaultValue={false}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        id="is_hr"
                                        type="checkbox"
                                        className="dataTable-check mb-50 me-1"
                                        checked={field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                    />
                                )}
                            />
                            <Label className="checkbox-wrapper" for="is_hr">
                                {t('Хүний нөөцийн ажилтан эсэх')}
                            </Label>
                        </Col>
                        <Col md={12} className='d-flex align-items-center mt-1'>
                            <Controller
                                control={control}
                                name="is_director"
                                defaultValue={false}
                                render={({ field }) => (
                                    <>
                                        <Input
                                            {...field}
                                            id="is_director"
                                            className="dataTable-check mb-50 me-1"
                                            type="checkbox"
                                            bsSize="sm-5"
                                            onChange={(e) => field.onChange(e.target.checked)}
                                            checked={field.value}
                                        />
                                        <Label className="checkbox-wrapper" for="is_director">
                                            {t('Удирдах албан тушаалтан эсэх')}
                                        </Label>
                                    </>
                                )}
                            />
                        </Col>
                        <Col md={12} className='d-flex align-items-center mt-1'>
                            <Controller
                                control={control}
                                name="is_teacher"
                                defaultValue={false}
                                render={({ field }) => (
                                    <>
                                        <Input
                                            {...field}
                                            id="is_teacher"
                                            className="dataTable-check mb-50 me-1"
                                            type="checkbox"
                                            bsSize="sm-5"
                                            onChange={(e) => field.onChange(e.target.checked)}
                                            checked={field.value}
                                        />
                                        <Label className="checkbox-wrapper" for="is_teacher">
                                            {t('Багш эсэх')}
                                        </Label>
                                    </>
                                )}
                            />
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
                                        id ="description"
                                        bsSize="sm"
                                        placeholder={t("Тайлбар")}
                                        {...field}
                                        type="text"
                                        invalid={errors.description && true}
                                    />
                                )}
                            />
                            {errors.description && <FormFeedback className='d-block'>{errors.description.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="main_position">
                                {t('Үндсэн албан тушаалын төрлүүд')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name="main_position"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="main_position"
                                            id="main_position"
                                            classNamePrefix='select'
                                            isClearable={false}
                                            className={classnames('react-select', { 'is-invalid': errors.main_position })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={mainPositionData || []}
                                            value={mainPositionData.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            />
                        </Col>
                         <Col md={12}>
                            <Label className="form-label" for="permissions">
                                {t('Эрх нэмэх')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name="permissions"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="permissions"
                                            id="permissions"
                                            classNamePrefix='select'
                                            isClearable
                                            isMulti
                                            className={classnames('react-select', { 'is-invalid': errors.permissions })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={permission_option || []}
                                            value={value}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                if(val){
                                                    onChange(val || [])
                                                }
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.description}
                                        />
                                    )
                                }}
                            />
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="removed_perms">
                                {t('Эрх устгах')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                name="removed_perms"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="removed_perms"
                                            id="removed_perms"
                                            classNamePrefix='select'
                                            isClearable
                                            isMulti
                                            className={classnames('react-select', { 'is-invalid': errors.removed_perms })}
                                            isLoading={isLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={permission_option || []}
                                            value={value}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                if (val){
                                                    onChange(val || [])
                                                }
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.description}
                                        />
                                    )
                                }}
                            />
                        </Col>
                        <Col className='text-center mt-2' md={12}>
                            <Button className="me-2" size='sm' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" size='sm' type="reset" outline  onClick={handleEdit}>
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
