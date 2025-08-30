// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'
import { X } from "react-feather";
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
	Form,
	Modal,
	Input,
	Label,
	Button,
    Spinner,
	ModalBody,
	ModalHeader,
	FormFeedback,
} from "reactstrap";

import { validate, convertDefaultValue, ReactSelectStyles } from "@utils"
import { t } from 'i18next';

import SchoolContext from "@context/SchoolContext"

import { validateSchema } from './validateSchema';
import Select from "react-select";
import classnames from "classnames"

const AddModal = ({ open, handleModal, refreshDatas, permission_option, mainPositionData}) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )
    const { school_id } = useContext(SchoolContext)

    // ** Hook
    const { control, handleSubmit, reset, setError, formState: { errors }, setValue } = useForm(validate(validateSchema));

    const [is_loading, setLoader] = useState(false)
    const [mainPositionId, setMainPositionId] = useState('')
    const [permissionId, setPermissionId] = useState([])
    const [removepermissionId, setRemovePermissionId] = useState([])
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Api
    const orgPositionApi = useApi().hrms.position

    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
        if (permissionId.length > 0){
            cdata['permissions'] = permissionId.map((c)=> c.id)
        }
        // cdata['removed_perms'] = removepermissionId.map((c)=> c.id)

        cdata['org'] = school_id

        const { success, error } = await postFetch(orgPositionApi.post(cdata))
        if(success) {
            reset()
            handleModal()
            refreshDatas()
        } else {
            setLoader(false)
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
                className="sidebar-md"
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
                backdrop='static'
            >
                {
                    is_loading &&
                        <div className='suspense-loader'>
                            <Spinner size='bg'/>
                            <span className='ms-50'>Түр хүлээнэ үү...</span>
                        </div>
                }

                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Албан тушаалийн мэдээлэл нэмэх')}</h5>

                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="name">
                                {t('Нэр')} <span style={{ color: 'red' }}>*</span>
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
                                {t('Тайлбар')} <span style={{ color: 'red' }}>*</span>
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
                                        type="textarea"
                                        invalid={errors.description && true}
                                    />
                                )}
                            />
                            {errors.description && <FormFeedback className='d-block'>{errors.description.message}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="permissions">
                                {t('Эрх нэмэх')} <span style={{ color: 'red' }}>*</span>
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
                                            isLoading={postLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={permission_option || []}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val.id || '')
                                                setPermissionId(val || [])
                                                }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.description}
                                        />
                                    )
                                }}
                            />
                            {errors.permissions && <FormFeedback>{errors.permissions.message}</FormFeedback>}

                        </Col>
                        {/* <Col md={12}>
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
                                            isLoading={postLoading}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={permission_option || []}
                                            value={permission_option.find((c) => c.id===value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                if (val){
                                                    onChange(val.id || '')
                                                    setRemovePermissionId(val.map(v => v.id))
                                                }
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.description}
                                        />
                                    )
                                }}
                            />
                        </Col> */}
                        <Col md={12} className='text-center'>
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
export default AddModal;
