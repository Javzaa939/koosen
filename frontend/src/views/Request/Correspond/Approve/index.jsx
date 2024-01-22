import React, { useEffect, useState, useContext, useMemo } from 'react'

import {
    Row,
    Col,
    Label,
    Input,
    Modal,
    Button,
    ModalBody,
    ModalHeader
} from 'reactstrap'

import { X } from 'react-feather'
import { useTranslation } from 'react-i18next'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import Select from 'react-select'

import classnames from "classnames";

import { ReactSelectStyles } from "@utils"

export default function ApproveModal({ open, handleModal, approveId, datas, refreshDatas }) {
    const { t } = useTranslation()

    const [groupId, setGroupId] = useState('')
    const [s_code, setCode] = useState('')
    const [professionId, setProfessionId] = useState('')
    const [groupOption, setGroupOption] = useState([])

    const approveApi = useApi().request.correspond


    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={() => {handleModal()}} />
    )

    const { Loader, isLoading, fetchData } = useLoader({});

    const groupApi = useApi().student.group

    async function getGroup() {
        const { success, data } = await fetchData(groupApi.getAllList(professionId))
        if(success)
        {
            setGroupOption(data)
        }
    }

    const handleChange = (e) => {
        setCode(e.target.value)
    }

    async function handleSubmit() {
        var datas = {}
        datas['group'] = groupId
        datas['code'] = s_code
        const { success } = await fetchData(approveApi.postApprove(approveId, datas))
        if(success)
        {
            handleModal()
            refreshDatas()
        }
    }

    useEffect(
        () =>
        {
            if (Object.keys(datas).length > 0) {
                setProfessionId(datas?.profession)
            }
        },
        [datas]
    )

    useEffect(
        () =>
        {
            if (professionId) getGroup()
        },
        [professionId]
    )

    const detailRows = useMemo(() => {
        return (
            <Row className='p-2'>
                <Col md={6} sm={12}>
                    <Row tag="dl" className="mb-0">
                        <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                            Овог:
                        </Col>
                        <Col tag="dd" sm="8" className="mb-1">{datas?.last_name}</Col>
                        <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                            Нэр:
                        </Col>
                        <Col tag="dd" sm="8" className="mb-1">{datas?.first_name}</Col>
                        <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                            Боловсролын зэрэг:
                        </Col>
                        <Col tag="dd" sm="8" className="mb-1">{datas?.degree_name}</Col>
                    </Row>
                </Col>
                <Col md={6} sm={12}>
                    <Row tag="dl" className="mb-0">
                        <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                            Дүйцүүлэх хүсэлтийн төрөл:
                        </Col>
                        <Col tag="dd" sm="8" className="mb-1">{datas?.correspond_type_name}</Col>
                        <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                            Хөтөлбөр:
                        </Col>
                        <Col tag="dd" sm="8" className="mb-1">{datas?.profession_name}</Col>
                    </Row>
                </Col>
            </Row>
        )
    }, [datas])

    return (
        <Modal
            isOpen={open}
            toggle={handleModal}
            className={ `modal-dialog-centered modal-lg`}
            contentClassName="pt-0"
        >
            <ModalHeader
                className="mb-1"
                toggle={handleModal}
                close={CloseBtn}
                tag="div"
            >
                <h5 className="modal-title">{t('Дүнгийн дүйцүүлэлт хийх хүсэлт батлах')}</h5>
            </ModalHeader>
            <ModalBody >
                {detailRows}
                <Row>
                    {Object.keys(datas).length > 0 &&
                        datas?.correspond_type === 3
                        ?
                        <>
                            <Col md={6} sm={12}>
                                <Row tag="dl" className="mb-0">
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Сурч байсан анги:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1">{datas?.group_name}</Col>
                                </Row>
                            </Col>
                            <Col md={6} sm={12}>
                                <Row tag="dl" className="mb-0">
                                    <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                        Оюутны код:
                                    </Col>
                                    <Col tag="dd" sm="8" className="mb-1">{datas?.student_code}</Col>
                                </Row>
                            </Col>
                        </>
                        :
                            <>
                                <hr/>
                                <Col md={6} sm={12}>
                                    <Label for="student_group">{t('Суралцах анги')}</Label>
                                    <Select
                                        name="student_group"
                                        id="student_group"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select')}
                                        isLoading={isLoading}
                                        placeholder={t(`-- Сонгоно уу --`)}
                                        options={groupOption || []}
                                        value={groupOption.find((c) => c.id === groupId)}
                                        noOptionsMessage={() => t('Хоосон байна')}
                                        onChange={(val) => {
                                            setGroupId(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                </Col>
                                <Col md={6} sm={12}>
                                    <Label for="student_code">{t('Оюутны код')}</Label>
                                    <Input
                                        id="student_code"
                                        bsSize="sm"
                                        type="text"
                                        value={s_code}
                                        placeholder="Оюутны код"
                                        onChange={handleChange}
                                    />
                                </Col>
                            </>
                    }
                </Row>
                <Col md={12} className="mt-2">
                    <Button className="me-2" color="primary" type="submit" onClick={handleSubmit}>
                        {t('Хадгалах')}
                    </Button>
                    <Button color="secondary" type="reset" outline  onClick={handleModal}>
                        {t('Буцах')}
                    </Button>
                </Col>
            </ModalBody>
        </Modal>
    )
}
