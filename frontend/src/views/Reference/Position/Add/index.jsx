// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'
import { X } from "react-feather";
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
    Spinner,
	ModalBody,
	ModalHeader,
	FormFeedback,
} from "reactstrap";

import { validate, convertDefaultValue, get_emp_state } from "@utils"
import { t } from 'i18next';

import AuthContext from '@context/AuthContext'
import SchoolContext from "@context/SchoolContext"

import { validateSchema } from './validateSchema';

const AddModal = ({ open, handleModal, refreshDatas, editData}) => {

    const rank_type_option = [
        {
            'id': 1,
            'name': 'Дадлагажигч багш',
        },
        {
            'id': 2,
            'name': 'Багш',
        },
        {
            'id': 3,
            'name': 'Ахлах багш',
        },
        {
            'id': 4,
            'name': 'Дэд профессор',
        },
        {
            'id': 5,
            'name': 'Профессор',
        }
    ]

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    // ** Hook
    const { control, handleSubmit, reset, setError, formState: { errors }, setValue, getValues, watch } = useForm(validate(validateSchema));

    const [is_loading, setLoader] = useState(false)
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    const [orgOption, setOrgOption] = useState([]);
    const [checked1, setOnlyCheck1] = useState(false)
    const [checked2, setOnlyCheck2] = useState(false)
    const [checked3, setOnlyCheck3] = useState(false)


    // Loader
	const { fetchData } = useLoader({});

    // Api
    const orgApi = useApi().hrms.subschool
    const orgPositionApi = useApi().hrms.position

    /* Сургууль жагсаалт авах функц */
	async function getSchool() {
		const { success, data } = await fetchData(orgApi.get())
		if (success) {
			setOrgOption(data)
		}
	}

    useEffect(() => {
        getSchool()
    },[])

    async function onSubmit(cdata) {
        cdata = convertDefaultValue(cdata)
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

    useEffect(
        () => {
            if(editData === null) return
            for(let key in editData) {
                if(editData[key] !== null)
                    setValue(key, editData[key])
                else setValue(key,'')
                if (key === 'org') {
                    setValue(key, editData[key]?.id)
                }
            }
        }, [editData,]
    )

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
                    <h5 className="modal-title">{t('Багшийн мэдээлэл нэмэх')}</h5>

                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        {/* <Col md={12}>
                            <Label className="form-label" for="org">
                                {t('Сургууль')}
                            </Label>
                            <Controller
                                control={control}
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
                                            value={value && orgOption.find((c) => c.id === value)}
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
                        </Col> */}
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
                            <Input
                                id="is_hr"
                                className="dataTable-check mb-50 me-1"
                                type="checkbox"
                                bsSize="sm-5"
                                onChange={(e) => setOnlyCheck1(e.target.checked)}
                                checked={checked1}
                            />
                            <Label className="checkbox-wrapper" for="is_hr">
                                {t('Хүний нөөцийн ажилтан эсэх')}
                            </Label>
                        </Col>
                        <Col md={12} className='d-flex align-items-center mt-1'>
                            <Input
                                id="is_director"
                                className="dataTable-check mb-50 me-1"
                                type="checkbox"
                                bsSize="sm-5"
                                onChange={(e) => setOnlyCheck2(e.target.checked)}
                                checked={checked2}
                            />
                            <Label className="checkbox-wrapper" for="is_director">
                                {t('Удирдах албан тушаалтан эсэх')}
                            </Label>
                        </Col>
                        <Col md={12} className='d-flex align-items-center mt-1'>
                            <Input
                                id="is_teacher"
                                className="dataTable-check mb-50 me-1"
                                type="checkbox"
                                bsSize="sm-5"
                                onChange={(e) => setOnlyCheck3(e.target.checked)}
                                checked={checked3}
                            />
                            <Label className="checkbox-wrapper" for="is_teacher">
                                {t('Багш эсэх')}
                            </Label>
                        </Col>
                        {/* <Col md={12}>
                            <Label className="form-label" for="permission">
                                {t('эрх')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="permission"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="permission"
                                            id="permission"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select opacity-100', { 'is-invalid': errors.permission})}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={permission_option || []}
                                            value={value && permission_option.find((c) => c.id === permissionId)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                // onChange(val?.id || '')
                                                setPermissionId(val?.id)
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.permission && <FormFeedback className='d-block'>{errors.permission.message}</FormFeedback>}
                        </Col> */}
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
