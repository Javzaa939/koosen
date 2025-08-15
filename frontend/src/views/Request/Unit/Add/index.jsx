// ** React imports
import React, { Fragment, useState, useEffect } from 'react'

import { X } from "react-feather";

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";

import { useTranslation } from 'react-i18next';

import Select from 'react-select'

import classnames from 'classnames';

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { validate, get_unit_list, ReactSelectStyles, get_complain_menus } from "@utils"

import { validateSchema } from '../validateSchema';

const AddModal = ({ isOpen, handleModal, refreshDatas }) => {

    const CloseBtn = <X className="cursor-pointer" size={15} onClick={handleModal} />

    const { t } = useTranslation()

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError } = useForm(validate(validateSchema));

	// Loader
	const { isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // State
    const [unit_option, setUnitOption] = useState(get_unit_list())
    const [position_option, setPositionOption] = useState([])
    const [selectedPositionIds, setPositionIds] = useState([])

    const [menusOption, setMenusOption] = useState([])
    const [menusIds, setMenusIds] = useState([])

    // Api
    const positionApi = useApi().hrms.position
	const requestUnitApi = useApi().request.unit

    async function getPosition() {
        const { success, data } = await fetchData(positionApi.getList())
        if(success) {
            setPositionOption(data)
        }
    }

    useEffect(() => {
        getPosition()
        setMenusOption(get_complain_menus())
    },[])

    async function onSubmit(cdatas) {
        cdatas['position'] = selectedPositionIds
        cdatas['menus'] = menusIds
        const { success, error } = await postFetch(requestUnitApi.post(cdatas))
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
            {
                isLoading &&
                <div className='suspense-loader'>
                    <Spinner size='bg'/>
                    <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                </div>
            }
            <Modal
                isOpen={isOpen}
                toggle={handleModal}
                className="sidebar-lg hr-register"
                modalClassName="modal-slide-in "
                contentClassName="pt-0"
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Хүсэлт шийдвэрлэх нэгж нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className='form-label' for='unit'>
                                Хүсэлтийн нэгж
                            </Label>
                            <Controller
                                name="unit"
                                defaultValue=''
                                control={control}
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="unit"
                                            id="unit"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.unit })}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={unit_option || []}
                                            value={unit_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                            }}
                                            isSearchable={true}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.unit && <FormFeedback className='d-block'>{t(errors.unit.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='position'>
                                Албан тушаал
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="position"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="position"
                                            id="position"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.position })}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={position_option || []}
                                            value={position_option.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setPositionIds(val)
                                            }}
                                            isMulti
                                            isSearchable={true}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.position && <FormFeedback className='d-block'>{t(errors.position.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className='form-label' for='menus'>
                                Хандах цэс
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="menus"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="menus"
                                            id="menus"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.menus })}
                                            placeholder={t(`-- Сонгоно уу --`)}
                                            options={menusOption || []}
                                            value={menusOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setMenusIds(val)
                                            }}
                                            isMulti
                                            isSearchable={true}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
                            ></Controller>
                            {errors.menus && <FormFeedback className='d-block'>{t(errors.menus.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="mt-2">
                            <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                            {postLoading &&<Spinner size='sm' className='me-1'/>}
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline onClick={handleModal}>
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
