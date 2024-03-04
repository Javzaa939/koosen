import React, { Fragment, useState } from 'react'
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
import Flatpickr from 'react-flatpickr'
import '@styles/react/libs/flatpickr/flatpickr.scss'
import { validate, convertDefaultValue } from "@utils"
import { Controller, useForm } from 'react-hook-form';
import { validateSchema } from './validateSchema';
import { useTranslation } from "react-i18next";

import moment from 'moment';
import useApi from '@hooks/useApi';

import useLoader from '@hooks/useLoader';

function EditModal({ editModal, toggleEditModal, selectedRows, getDatas }) {

    const datas = selectedRows
    const { t } = useTranslation()
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

		const date_relayer = datas.map(data => data.admission_date ? data.admission_date : new Date)
		const date_value = date_relayer.filter((value, index) => value === value)[0]

    const [admissionDate, setAdmissionDate] = useState(date_value ? date_value : '')


		const number_relayer = datas.map(data => data.admission_date ? data.admission_date : 'test')
		const number_value = number_relayer.filter((value, index) => value === value)[0]

    const [admissionNumber, setAdmissionNumber] = useState(number_value ? number_value : '')

    const admissionApi = useApi().print.admission

    async function onSubmit(cdata) {
        let datax = []

        for (let i = 0; i < datas.length; i++){
            datax.push(datas[i]?.id)
        }
        let all_data = {
            "id": datax,
            "admission_date": moment(admissionDate).format('YYYY-MM-DD'),
            "admission_number": admissionNumber
        }

        const { success } = await fetchData(admissionApi.put(all_data))
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
            <ModalHeader toggle={toggleEditModal}>
                Тушаалын огноо болон дугаар засах
            </ModalHeader>
            <ModalBody tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                <Row className='p-1'>
                    <Col lg={6} xs={12} className='p-50'>
                        <Label className='form-label' for='admission_date'>
                            {t('Тушаалын огноо')}
                        </Label>
                            <Flatpickr
                                id='admission_date'
                                name='admission_date'
                                placeholder='Огноо'
                                className='form-control'
                                onChange={dates => {
                                    setAdmissionDate(dates[0]);
                                    }}
                                value={admissionDate}
                                style={{height: "30px"}}
                                options={{
                                    dateFormat: 'Y-m-d',
                                    utc: true,
                                    time_24hr: true,
                                    // locale: Mongolian
                                }}
                            />
                        {errors.admission_date && <FormFeedback className='d-block'>{t(errors.admission_date.message)}</FormFeedback>}
                    </Col>
                    <Col lg={6} xs={12} className='p-50'>
                        <Label className='form-label' for='admission_number'>
                            {t('Тушаалын дугаар')}
                        </Label>
							<Input
								placeholder={t('Дугаар')}
								id='admission_number'
								bsSize="sm"
								name='admission_number'
								value={admissionNumber}
								className='p-25'
								onChange={(e) => setAdmissionNumber(e.target.value)}
							/>
                    </Col>
                </Row>
                <div className='my-1'>
                    <Button
                        type='submit'
                        color='primary'
                    >
                        Хадгалах
                    </Button>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default EditModal