// ** React imports
import React, { Fragment, useState} from 'react'

import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import { t } from 'i18next'

import classnames from "classnames";

import { useForm} from "react-hook-form";

import {
    Row,
    Col,
	Form,
	Modal,
	Label,
	Button,
	ModalBody,
	ModalHeader,
    Spinner,
	FormFeedback,
} from "reactstrap";

import { validate, ReactSelectStyles, get_status } from '@utils'
import { validateSchema } from '../validateSchema'


const EditModal = ({ open, handleModal, refreshDatas, studentVizData}) => {
    let select = studentVizData.filter((select) => select.is_selected == true)
    let vizId = select.map((c)=> c.id)
    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm();

    var values = {
        status: '',
    }
    const [select_value, setSelectValue] = useState(values)

    const [status_option, setStatusOption] = useState(get_status())
	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});

    const studentApi = useApi().student.viz

	async function onSubmit(cdata) {
        let selected = studentVizData.filter((select) => select.is_selected == true)
        let studentId = selected.map((c) => c.student.id)
        cdata['id']=vizId
        cdata['student'] = studentId
        cdata['status'] = select_value.status
        const { success, data, error } = await fetchData(studentApi.put(cdata))
        if(success) {
            handleModal()
            refreshDatas()
            reset()

        } else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }
	}

	return (
        <Fragment>
            <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-lg" onClosed={handleModal}>
                {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('Гадаад оюутны визний бүртгэл засах')}</h4>
                    </div>
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col lg={12} sm={6} >
                            <Label className="form-label" for="status">
                                {t("Төлөв")}
                            </Label>
                            <Select
                                name="status"
                                id="status"
                                classNamePrefix='select'
                                isClearable
                                isLoading={isLoading}
                                placeholder={`-- Сонгоно уу --`}
                                options={status_option || []}
                                value={status_option.find((c) => c.id === select_value.status)}
                                noOptionsMessage={() => 'Хоосон байна'}
                                onChange={(val) => {
                                    if (val?.id) {
                                        setSelectValue(current => {
                                            return {
                                                ...current,
                                                status: val?.id
                                            }
                                        })
                                    } else {
                                        setSelectValue(current => {
                                            return {
                                                ...current,
                                                status: ''
                                            }
                                        })
                                    }
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => option.name}
                            />
                        </Col>

                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit">
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
export default EditModal;
