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
import { convertDefaultValue , validate, ReactSelectStyles} from "@utils"
import { X } from "react-feather";
import Select from 'react-select'
import classnames from "classnames";


const UpdateModal = ({ open, editId, handleEdit, refreshDatas }) => {
    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleEdit} />
    )

    const [orgOption, setOrgOption] = useState([]);
    const [edit_data, setEditData] = useState([]);

    // Loader
    const {isLoading, fetchData } = useLoader({})

    const { control, handleSubmit, setValue, reset, setError, formState: { errors } } = useForm();

    // Api
    const getSchoolApi = useApi().hrms.subschool
    const getPositionApi = useApi().hrms.position
    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(getPositionApi.getOne(editId))
            if(success) {
                setEditData(data)
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')
                    if(key === 'org'){
                        setValue(data[key])
                    }

                }
            }
        }
    }

    /* Сургууль жагсаалт авах функц */
	async function getSchool() {
		const { success, data } = await fetchData(getSchoolApi.get())
		if (success) {
			setOrgOption(data)
		}
	}
     useEffect(() => {
        getDatas()
        getSchool()

    },[editId])

    async function onSubmit(cdata) {
        if(editId) {
            cdata = convertDefaultValue(cdata)
            const { success, error } = await fetchData(getPositionApi.put(cdata, editId))
            if(success) {
                refreshDatas()
                handleEdit()
                reset()
            }
            else {
                /** Алдааны мессэжийг input дээр харуулна */
                for (let key in error) {
                    setError(error[key].field, { type: 'custom', message:  error[key].msg});
                }
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
                    <h5 className="modal-title">{t('Сургуулийн мэдээлэл засах')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                       <Col md={12}>
                            <Label className="form-label" for="org">
                                {t('Сургууль')}
                            </Label>
                            <Controller
                                control={control}
                                // defaultValue={edit_data?.org?.name}
                                defaultValue=''
                                name="org"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="org"
                                            id="org"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select opacity-100', { 'is-invalid': errors.org})}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={orgOption || []}
                                            value={orgOption.find((c) => c.id === value)}
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
                            ></Controller>
                            {errors.org && <FormFeedback className='d-block'>{errors.org.message}</FormFeedback>}
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
                        <Col className='text-center mt-2' md={12}>
                            <Button className="me-2" size='sm' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default UpdateModal;
