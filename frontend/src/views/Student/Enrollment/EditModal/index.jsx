import React, { Fragment, useEffect, useState } from 'react'
import {
    Button,
    Col,
    Input,
    Label,
    Form,
    Modal,
    ModalBody,
    ModalHeader,
    Row,
    FormFeedback
} from 'reactstrap'

import Select from 'react-select'

import Flatpickr from 'react-flatpickr'
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { validate, ReactSelectStyles, formatDate } from "@utils"
import { Controller, useForm } from 'react-hook-form';
import { validateSchema } from './validateSchema';
import { useTranslation } from "react-i18next";

import useApi from '@hooks/useApi';

import useLoader from '@hooks/useLoader';
import classNames from 'classnames'

import Addmodal from '../../Group/Add'

function EditModal({ editModal, toggleEditModal, selectedRows, getDatas, profession }) {

    const { t } = useTranslation()
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

    const { control, handleSubmit, reset, setValue, setError, watch, formState: { errors } } = useForm(validate(validateSchema));

    const [groupDatas, setGroupDatas] = useState([])
    const [professionOption, setProfessionOption] = useState([])
    const [isGroupModal, setIsGroupModal] = useState(false)

    const groupApi = useApi().student.group
    const admissionApi = useApi().elselt.approve
    const professionApi = useApi().elselt.profession

    async function getGroupDatas(profession='') {
        if(profession) {
            const { success, data } = await fetchData(groupApi.getList('', '', profession, '', 1))
            if(success) {
                setGroupDatas(data)
            }
        }
    }

    // Хөтөлбөрийн жагсаалт авах
    async function getProfession() {
        const { success, data } = await fetchData(professionApi.getList())

        if (success) {
            setProfessionOption(data)
        }
    }

    useEffect(() => {
        getProfession()
    }, [])

    async function onSubmit(cdatas) {
        cdatas['admission_date'] = formatDate(cdatas?.admission_date)

        const { success } = await fetchData(admissionApi.post(cdatas))
        if (success) {
            reset()
            toggleEditModal()
            getDatas()
        }
    }

    return (
        <Modal
            isOpen={editModal}
            toggle={toggleEditModal}
            centered
        >
            {isLoading && Loader}
            <ModalHeader toggle={toggleEditModal}>
                Тэнцсэн элсэгчдийг оюутан болгох
            </ModalHeader>
            <ModalBody tag={Form} onSubmit={handleSubmit(onSubmit)}>
                <Row className='gy-1'>
                    <Col md={12}>
                        <Label className="form-label" for="profession">
                            {t('Хөтөлбөр')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="profession"
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <Select
                                        name="profession"
                                        id="profession"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classNames('react-select', { 'is-invalid': errors.profession })}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={professionOption || []}
                                        value={professionOption.find((c) => c.prof_id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.prof_id || '')
                                            getGroupDatas(val?.prof_id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.prof_id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        />
                        {errors.profession && <FormFeedback className='d-block'>{t(errors.profession.message)}</FormFeedback>}
                    </Col>
                    <Col md={12}>
                        <Label className="form-label" for="group">
                            {t('Анги')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="group"
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <Select
                                        name="group"
                                        id="group"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classNames('react-select', {'is-invalid': errors.group})}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={groupDatas || []}
                                        value={groupDatas.find((c) => c.id === value)}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        noOptionsMessage={() => {
                                            if(!watch('profession')) {
                                                return 'Хөтөлбөр сонгоно уу'
                                            }
                                            return (
                                                <Button color='primary' size='sm' onClick={() => setIsGroupModal(!isGroupModal)}>Анги нэмэх</Button>
                                            )
                                        }}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        />
                        {errors.group && <FormFeedback className='d-block'>{t(errors.group.message)}</FormFeedback>}
                    </Col>
                    <Col md={12}>
                        <Label className='form-label' for='admission_date'>
                            {t('Тушаалын огноо')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="admission_date"
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <Flatpickr
                                        id='admission_date'
                                        name='admission_date'
                                        placeholder='Огноо'
                                        className={classNames('form-control', {'is-invalid': errors.admission_date})}
                                        onChange={dates => {
                                            onChange(dates[0]);
                                        }}
                                        value={value}
                                        style={{height: "30px"}}
                                        options={{
                                            dateFormat: 'Y-m-d',
                                            utc: true,
                                            time_24hr: true,
                                        }}
                                    />
                                )
                            }}
                        />
                        {errors.admission_date && <FormFeedback className='d-block'>{t(errors.admission_date.message)}</FormFeedback>}
                    </Col>
                    <Col md={12}>
                        <Label className='form-label' for='admission_number'>
                            {t('Тушаалын дугаар')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="admission_number"
                            render={({ field }) => {
                                return (
                                    <Input
                                        {...field}
                                        placeholder={t('Дугаар')}
                                        id='admission_number'
                                        bsSize="sm"
                                        name='admission_number'
                                        invalid={errors?.admission_number && true}
                                    />
                                )
                            }}
                        />
                        {errors.admission_number && <FormFeedback className='d-block'>{t(errors.admission_number.message)}</FormFeedback>}
                    </Col>
                    <Col md={12} className='text-center'>
                        <Button
                            type='submit'
                            color='primary'
                            className='me-1'
                        >
                            Оюутан болгох
                        </Button>
                        <Button
                            outline
                            onClick={toggleEditModal}
                        >
                            Болих
                        </Button>
                    </Col>
                </Row>
            </ModalBody>
            {
                isGroupModal &&
                <Addmodal
                    open={isGroupModal}
                    handleModal={() => setIsGroupModal(!isGroupModal)}
                    refreshDatas={() => getGroupDatas(watch('profession'))}
                    profession={watch('profession')}
                />
            }
        </Modal>
    )
}

export default EditModal