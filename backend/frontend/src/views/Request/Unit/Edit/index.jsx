import React, { Fragment, useState, useEffect, useContext } from 'react'

import { useForm, Controller } from "react-hook-form";

import { Row, Col, Form, Modal, Label, Button, ModalBody, ModalHeader, FormFeedback, Spinner } from "reactstrap";

import { useTranslation } from 'react-i18next';

import Select from 'react-select'

import classnames from 'classnames';

import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";

import AuthContext from '@context/AuthContext'

import { validate, get_unit_list, ReactSelectStyles, convertDefaultValue, get_complain_menus } from "@utils"

import { validateSchema } from "../validateSchema";

const EditModal = ({ isOpen, handleModal, editId, refreshDatas }) => {

    const { t } = useTranslation()

    const { user } = useContext(AuthContext)

    const [is_disabled, setDisabled] = useState(true)

    // ** Hook
    const { control, handleSubmit, formState: { errors }, reset, setError, setValue } = useForm(validate(validateSchema));

	// Loader
	const { isLoading, fetchData } = useLoader({});

    // State
    const [unit_option, setUnitOption] = useState(get_unit_list())
    const [position_option, setPositionOption] = useState([])
    const [selectedPositionIds, setPositionIds] = useState([])

    const [menusOption, setMenusOption] = useState([])
    const [menusIds, setMenusIds] = useState([])

    // Api
    const positionApi = useApi().hrms.position
    const unitApi = useApi().request.unit

    async function getPosition() {
        const { success, data } = await fetchData(positionApi.get())
        if(success) {
            setPositionOption(data)
        }
    }

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-decide-unit-update')) {
            setDisabled(false)
        }
    },[user])

    async function getDatas() {
        if(editId) {
            const { success, data } = await fetchData(unitApi.getOne(editId))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                if(data === null) return
                for(let key in data) {
                    if(data[key] !== null)
                        setValue(key, data[key])
                    else setValue(key, '')

                    if(key === 'position') {
                        var position_ids = []
                        data[key].map((position) => {
                            var selected = position_option.find((e) => e.id === position?.id)
                            if(selected) {
                                position_ids.push(selected)
                            }
                            setPositionIds(position_ids)
                        })
                    }

                    if (key === 'menus') {
                        var menu_ids = []
                        data[key].map((menu) => {
                            var selected = menusOption.find((e) => e.id === menu?.id)
                            if(selected) {
                                menu_ids.push(selected)
                            }
                            setMenusIds(menu_ids)
                        })
                    }
                }
            }
        }
    }

    useEffect(() => {
        getPosition()
        setMenusOption(get_complain_menus())
    }, [])

    useEffect(() => {
        getDatas()
    },[isOpen, position_option])

    async function onSubmit(cdata) {
        cdata['position'] = selectedPositionIds
        cdata = convertDefaultValue(cdata)
        cdata['menus'] = menusIds
        const { success, error } = await fetchData(unitApi.put(cdata, editId))
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
                isOpen={isOpen}
                toggle={handleModal}
                className="modal-dialog-centered modal-sm"
                onClosed={handleModal}
            >
{isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader
                    className="bg-transparent pb-0"
                    toggle={handleModal}
                >
                </ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className="text-center">
                        <h5>{t('Хүсэлт шийдвэрлэх нэгж засах')}</h5>
                    </div>
                    <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
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
                                            value={selectedPositionIds}
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
                                            value={menusIds}
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
                        <Col md={12} className="text-center mt-2">
                            <Button className='me-2' color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" outline type="reset" onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}

export default EditModal
