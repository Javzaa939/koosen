import React, { useState } from 'react'
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
import { validate } from "@utils"
import { useForm } from 'react-hook-form';
import { validateSchema } from './validateSchema';
import { useTranslation } from "react-i18next";
import moment from 'moment';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import Help from '@src/components/Help'
import { Mongolian } from "flatpickr/dist/l10n/mn.js"

import './style.scss'

function TushaalModal({ tushaalModal, tushaalModalHandler, selectedRows, getDatas }) {

    const datas = selectedRows
    const { t } = useTranslation()
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true, bg: 2})

    const { handleSubmit, reset, setError, formState: { errors } } = useForm(validate(validateSchema));

        /**
            * Сонгогдсон оюутнуудаас тушаалын огноог түүж авж хэрэглэгчид сонгох боломж олгоно.
            * Хэрэв сонгогдсон оюутнуудын тушаалын огноо ижил байвал автоматаар Input-ийн утга
            * дээр оруулж ирнэ.
        */
        const date_relayer = datas.map(data => data.statement_date ? data.statement_date : null);
        const date_value = [...new Set(date_relayer)].filter(val => val !== null);

    const [admissionDate, setAdmissionDate] = useState(date_value.length === 1 ? date_value[0] : '');

        /**
            * Сонгогдсон оюутнуудаас тушаалын дугаарыг түүж авж хэрэглэгчид сонгох боломж олгоно.
            * Хэрэв сонгогдсон оюутнуудын тушаалын дугаар ижил байвал автоматаар Input-ийн утга
            * дээр оруулж ирнэ.
        */
		const number_relayer = datas.map(data => data.statement ? data.statement : null)
		const number_value = [...new Set(number_relayer)].filter(val => val !== null);

        const number_counts = {};
        number_relayer.forEach(function (x) { number_counts[x] = (number_counts[x] || 0) + 1; });

    const [admissionNumber, setAdmissionNumber] = useState(number_value.length === 1 ? number_value[0] : '')

    const leaveApi = useApi().student.leave

    async function onSubmit(cdata) {
        let datax = []

        for (let i = 0; i < datas.length; i++){
            datax.push(datas[i]?.id)
        }

        /**
         * Хэрэв Input ээр оролдоогүй бол хоосон юм явуулахгүй
         */
        let all_data = {
            "student_ids": datax,
            ...(admissionDate ? { "statement_date": moment(admissionDate).format('YYYY-MM-DD') } : {}),
            ...(admissionNumber ? { "statement": admissionNumber } : {})
        };

        const { success } = await fetchData(leaveApi.putMany(all_data))
        if (success) {
            reset()
            tushaalModalHandler()
            getDatas()
        }
    }

    return (
        <Modal
            isOpen={tushaalModal}
            toggle={tushaalModalHandler}
            centered
        >
            {isLoading && Loader}
            <ModalHeader toggle={tushaalModalHandler}>
                Тушаалын огноо болон дугаар засах
            </ModalHeader>
            <ModalBody tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                <Row className='p-1'>
                    <Col lg={6} xs={12} className='p-50'>
                        <Label className='form-label' for='statement_date'>
                            {t('Тушаалын огноо')}
                        </Label>
                            <Flatpickr
                                id='statement_date'
                                name='statement_date'
                                placeholder='Огноо'
                                className='form-control'
                                onChange={dates => {
                                    setAdmissionDate(dates[0] || '');
                                }}
                                value={admissionDate}
                                style={{height: "30px"}}
                                options={{
                                    dateFormat: 'Y-m-d',
                                    utc: true,
                                    locale: Mongolian,
                                    time_24hr: true,
                                }}
                            />
                        {errors.statement_date && <FormFeedback className='d-block'>{t(errors.statement_date.message)}</FormFeedback>}
                        {
                            date_value.length > 1 &&
                                <div className='mt-1'>
                                    <div className='mb-50 d-flex'>
                                        <div>
                                            Сонгогдсон оюутнуудын тушаалын огноонууд
                                        </div>
                                        <div>
                                            <Help text='Та доорхи огноон дээр дарснаар бүх оюутны тушаалын огноог нэгтгэх боломжтой.'/>
                                        </div>
                                    </div>
                                    {date_value.map((data, idx) => {
                                        return(
                                            <div className='p-50 ps-1 date_list text-decoration-underline' role='button' key={idx} onClick={() => {setAdmissionDate(data)}}>{data}</div>
                                        )
                                    })}
                                </div>
                        }
                    </Col>
                    <Col lg={6} xs={12} className='p-50'>
                        <Label className='form-label' for='statement'>
                            {t('Тушаалын дугаар')}
                        </Label>
                        <Input
                            placeholder={t('Дугаар')}
                            id='statement'
                            bsSize="sm"
                            name='statement'
                            value={admissionNumber}
                            className='p-25 ps-50'
                            onChange={(e) => setAdmissionNumber(e.target.value)}
                        />
                        {
                            number_value.length > 1 &&
                                <div className='mt-1'>
                                    <div className='mb-50 d-flex'>
                                        <div>
                                            Сонгогдсон оюутнуудын тушаалын дугаарууд
                                        </div>
                                        <div>
                                            <Help text='Та доорхи дугаар дээр дарснаар бүх оюутны тушаалын дугаарыг нэгтгэх боломжтой.'/>
                                        </div>
                                    </div>
                                    {number_value.map((data, idx) => {
                                        return(
                                            <div className='p-50 ps-1 date_list text-decoration-underline' role='button' key={idx} onClick={() => {setAdmissionNumber(data)}}>{data}</div>
                                        )
                                    })}
                                </div>
                        }
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

export default TushaalModal