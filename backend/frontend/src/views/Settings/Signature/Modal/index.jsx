
import React, { Fragment, useEffect, useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { Trash2, Edit, Menu } from "react-feather"
import { ReactSortable } from 'react-sortablejs'

import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    Row,
    Col,
    Form,
    Label,
    Input,
    FormFeedback,
    Spinner,
    ListGroupItem,
} from 'reactstrap';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import useModal from '@hooks/useModal'

import { convertDefaultValue, validate } from "@utils"
import { t } from "i18next";

import { validateSchema } from '../validateSchema';


export default function UpdateModal({ open, handleModal, edit })
{
    const { isLoading, fetchData } = useLoader({})
    const { showWarning } = useModal()
    const [ listArr, setListArr ] = useState([])

    // Api
	const signatureApi = useApi().settings.signature

    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

    async function onSubmit(formData)
    {
        formData['dedication_type'] = edit.id
        const { success, data } = await fetchData(signatureApi.post(formData))
		if(success)
        {
			handleModal()
		}
    }

    async function getDatas()
    {
        const { success, data } = await fetchData(signatureApi.getTable(edit.id))
        if (success)
        {
            setListArr(data)
        }
    }

    useEffect(
        () =>
        {
            if (edit)
            {
                getDatas()
            }
        },
        [edit]
    )

    async function changeOrder(order)
    {
        let from_id = listArr[order.oldIndex].id
        let to_id = listArr[order.newIndex].id

        let data = { from_id, to_id }

        const { success } = await fetchData(signatureApi.changeorder(data, edit.id))
        if (success)
        {
            getDatas()
        }
    }

    async function handleDelete(id)
    {
        const { success } = await fetchData(signatureApi.delete(id))
        if (success)
        {
            getDatas()
        }
    }

    return (
        <Fragment>
            <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-lg" >
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal} ></ModalHeader>
                <ModalBody className="px-sm-3 pt-30 pb-3">
                    <div className='text-center'>
                        <h4>
                            Тодорхойлолт харагдах нэр, албан тушаал
                        </h4>
                    </div>
                    <Row tag={Form} className="gy-1 mt-1 mb-2" onSubmit={handleSubmit(onSubmit)}>
                        <Col md={12}>
                            <Label className="form-label" for="position_name">
                                {t('Албан тушаал')}
                            </Label>
                            <Controller
                                defaultValue=''
                                control={control}
                                id="position_name"
                                name="position_name"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type='text'
                                        name='position_name'
                                        id='position_name'
                                        placeholder={t('Албан тушаал')}
                                        bsSize='sm'
                                        invalid={errors.position_name && true}
                                    />
                                )}
                            />
                            {errors.position_name && <FormFeedback className='d-block'>{t(errors.position_name.message)}</FormFeedback>}
                        </Col>
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
                                        {...field}
                                        type='text'
                                        name='name'
                                        id='name'
                                        placeholder={t('Нэр')}
                                        bsSize='sm'
                                        invalid={errors.name && true}
                                    />
                                )}
                            />
                            {errors.name && <FormFeedback className='d-block'>{t(errors.name.message)}</FormFeedback>}
                        </Col>
                        <Col md={12} className="text-center mt-2">
                            <Button className="me-2" color="primary" type="submit">
                                {t('Хадгалах')}
                            </Button>
                            <Button color="secondary" type="reset" outline onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                        {
                            listArr?.length != 0
                            ?
                                <ReactSortable
                                    tag='ul'
                                    className='list-group'
                                    list={listArr}
                                    setList={setListArr}
                                    onSort={changeOrder}
                                >
                                {
                                    listArr.map((val, idx) => {
                                        return (
                                            <ListGroupItem className='draggable' key={idx} value={val.id} >
                                                <div className='d-flex align-items-center justify-content-between'>
                                                    <div className="d-flex align-items-center">
                                                        <div>
                                                            <Menu size={16} className="me-2" />
                                                        </div>
                                                        <div>
                                                            <h5 className='mt-0'>{val?.name}</h5>
                                                            {val?.position_name}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <a role="button"
                                                            onClick={() => showWarning({
                                                                header: {
                                                                    title: t(`Устгах үйлдэл`),
                                                                },
                                                                question: t(`Та энэхүү тохиргоог устгахдаа итгэлтэй байна уу?`),
                                                                onClick: () => handleDelete(val?.id),
                                                                btnText: t('Устгах'),
                                                            })}
                                                            className="ms-1"
                                                        >
                                                            <Trash2 color="red" width={"18px"} />
                                                        </a>
                                                    </div>
                                                </div>
                                            </ListGroupItem>
                                        )
                                    })
                                }
                                </ReactSortable>
                            :
                                <p className="text-center">Өгөгдөл байхгүй байна.</p>
                        }
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}
