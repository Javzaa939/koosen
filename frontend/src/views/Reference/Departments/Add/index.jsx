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

import { validate, convertDefaultValue } from "@utils"

import { t } from 'i18next';

import AuthContext from '@context/AuthContext'
import SchoolContext from "@context/SchoolContext"

import { validateSchema } from './validateSchema';

const AddModal = ({ open, handleModal, refreshDatas}) =>{
    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    // ** Hook
    const { control, handleSubmit, reset, setError, formState: { errors } } = useForm(validate(validateSchema));
    var values = {
		subschool_id: '',
	}

    // states
    const [is_loading, setLoader] = useState(false)
    const { isLoading: postLoading, fetchData: postFetch } = useLoader({});
    const [leader_option, setLeaderOption] = useState([])
    const [department, setDepartmentData] = useState([]);
    const [selected, setSelectValue] = useState(values)

    // Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    // Api
    const getLeaderApi = useApi().hrms.department
    const departmentApi = useApi().hrms.department

    /* тэнхимийн эрхлэгч-н жагсаалт авах функц */
    async function getLeaderList() {
        const { success, data } = await fetchData(getLeaderApi.leaderList())
        if (success) {
            setLeaderOption(data)
        }
    }

    useEffect(() => {
        getLeaderList()
    },[])

    async function onSubmit(cdata) {
        cdata['created_user'] = user.id
        cdata['updated_user'] = user.id
        cdata['org'] = 1
        cdata['sub_orgs']= school_id
        cdata = convertDefaultValue(cdata)

        const { success, error } = await postFetch(departmentApi.postRegister(cdata))
        if(success) {
            setLoader(false)
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
                    <h5 className="modal-title">{t('Тэнхимийн мэдээлэл нэмэх')}</h5>

                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="name">
                                {t('Тэнхимийн нэр')}
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
                                        placeholder={t('Тэнхимийн нэр')}
                                        {...field}
                                        type="text"
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="leader">
                                {t('Тэнхимийн эрхлэгч')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="leader"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="leader"
                                            id="leader"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.leader })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={leader_option || []}
                                            value={leader_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => {t('Хоосон байна.')}}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.full_name}

                                        />
                                    )
                                }}
                            />
                            {errors.leader && <FormFeedback className='d-block'>{t(errors.leader.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="social">
                                {t('Нийтийн сүлжээ')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="social"
                                name="social"
                                render={({ field }) => (
                                    <Input
                                        id ="social"
                                        bsSize="sm"
                                        placeholder={t('Нийтийн сүлжээ')}
                                        {...field}
                                        type="textarea"
                                    />
                                )}
                            />
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="address">
                                {t('Хаяг')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="address"
                                name="address"
                                render={({ field }) => (
                                    <Input
                                        id ="address"
                                        bsSize="sm"
                                        placeholder={t('Хаяг')}
                                        {...field}
                                        type="textarea"
                                    />
                                )}
                            />
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="web">
                                {t('Веб')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="web"
                                name="web"
                                render={({ field }) => (
                                    <Input
                                        id ="web"
                                        bsSize="sm"
                                        placeholder={t('Веб')}
                                        {...field}
                                        type="textarea"
                                    />
                                )}
                            />
                        </Col>
                        <Col md={12}>
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
