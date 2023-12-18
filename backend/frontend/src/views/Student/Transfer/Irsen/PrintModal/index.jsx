// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
	Form,
	Modal,
	Input,
	Label,
	Button,
	ModalBody,
	ModalHeader,
	FormFeedback,
} from "reactstrap";

import { t } from 'i18next';

import SchoolContext from "@context/SchoolContext"

import { validate } from "@utils"

import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

import useApi from '@hooks/useApi';

import useLoader from '@hooks/useLoader';

export const validateSchema = Yup.object().shape({
	statement: Yup.string()
        .trim()
        .required('Хоосон байна.'),
    statement_date: Yup.string()
        .trim()
        .required('Хоосон байна.'),
});

const PrintModal = ({ open, handleModal, refreshDatas, datas }) => {

    // ** Hook
    const { control, handleSubmit, formState: { errors } } = useForm(validate(validateSchema));

    const navigate = useNavigate();

    const { school } = useContext(SchoolContext)

    const studentmovementApi = useApi().student.arrived
    const { Loader, isLoading, fetchData } = useLoader({})

    async function onSubmit(cdata) {
        let printDatas = {
            dates: cdata,
            datas: datas,
        }

        var ids = datas.map((c) => c.id)

        cdata['ids'] = ids

        const { success } =  await fetchData(studentmovementApi.put(cdata, ids[0]))

        if (success) {
            navigate('/student/shift/print', { state: printDatas });
        }
	}

	return (
        <Fragment>
            <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-sm" onClosed={handleModal}>
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal} ></ModalHeader>
                <ModalBody className="px-sm-3 pt-30 pb-3">
                    <div className='text-center'>
                        <h4>{t('Оюутны шилжилт хөдөлгөөн ')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="statement">
                                {t('Тушаалын дугаар')}
                            </Label>
                            <Controller
                            defaultValue=''
                            control={control}
                            id="statement"
                            name="statement"
                            render={({ field }) => (
                                <Input
                                    id ="statement"
                                    bsSize="sm"
                                    placeholder={t('Тушаалын дугаар оруулна уу...')}
                                    {...field}
                                    type="text"
                                    invalid={errors.statement && true}
                                />
                            )}
                        />
                        {errors.statement && <FormFeedback className='d-block'>{t(errors.statement.message)}</FormFeedback>}
                        </Col>
                        <Col md={12}>
                            <Label className="form-label" for="statement_date">
                                {t('Тушаалын огноо')}
                            </Label>
                            <Controller
                                defaultValue=''
                                name='statement_date'
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        bsSize='sm'
                                        id='statement_date'
                                        placeholder='Сонгох'
                                        type="date"
                                        invalid={errors.statement_date && true}
                                    />
                                )}
                            />
                            {errors.statement_date && <FormFeedback className='d-block'>{t(errors.statement_date.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit">
                                {t('Хэвлэх')}
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
export default PrintModal;

