import React, { Fragment, useState, useEffect, useContext} from 'react'

import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
	Modal,
	Card,
	CardBody,
	ModalBody,
	ModalHeader,
} from "reactstrap";

import { t } from 'i18next';
import Select from 'react-select'
import classnames from 'classnames';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"
import ActiveYearContext from "@context/ActiveYearContext"
import { X } from 'react-feather'


// import { validateSchema } from './validateSchema';
import { convertDefaultValue, validate, ReactSelectStyles } from "@utils"

const DetailModal = ({ open, handleModal,editId, datas }) => {

     const closeBtn = (
        <X className='cursor-pointer' size={15} onClick={handleModal} />
    )

    const { fetchData , isLoading} = useLoader({})

    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm();

	return (
        <Fragment>
            <Modal isOpen={open} size={'lg'} toggle={handleModal} className="modal-dialog-centered modal-sm" onClosed={handleModal}>
                <ModalHeader
                    className='bg-transparent pb-0'
                    toggle={handleModal}
                    close={closeBtn}
                    tag="div"
                >
                </ModalHeader>
                <ModalBody className="">
                    <Card className='invoice-preview-card'>
                        <CardBody className='invoice-padding pb-0'>
                            <div className='d-flex justify-content-between flex-md-row flex-column invoice-spacing mt-0'>
                                <div>
                                    <div className='logo-wrapper'>
                                        <h3 className='text-primary invoice-logo'>Оюутны эрхийн дэлгэрэнгүй</h3>
                                    </div>
                                </div>
                            </div>
                        </CardBody>

                        <hr className='invoice-spacing' />

                        <CardBody className='invoice-padding pt-0'>
                            <Row className='invoice-spacing'>
                                <Col className='p-1'>
                                    <table className='w-100'>
                                        <tbody>
                                            <tr className='border-bottom'>
                                                <td className='pe-1 pb-1' style={{ minWidht: '150px' }}>Оюутны код:</td>
                                                <td className='pb-1'>
                                                    <span className='fw-bold'>{datas?.student?.code}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1 pb-1' style={{ minWidht: '150px' }}>Оюутны нэр:</td>
                                                <td className='pb-1'>
                                                    <span className='fw-bold'>{datas?.student?.full_name}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1 pb-1' style={{ minWidht: '150px' }}>Тайлбар:</td>
                                                <td className='pb-1'>
                                                    <span className='fw-bold'>{datas?.description}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1 pb-1' style={{ minWidht: '150px' }}>Эхлэх хугацаа:</td>
                                                <td className='pb-1'>
                                                    <span className='fw-bold'>{datas?.start_date}</span>
                                                </td>
                                            </tr>
                                            <tr className='border-bottom' >
                                                <td className='pe-1 pb-1' style={{ minWidht: '150px' }} >Дуусах хугацаа:</td>
                                                <td className='pb-1'>
                                                    <span className='fw-bold'>{datas?.finish_date}</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default DetailModal;
