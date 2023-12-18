import React, { useContext, useEffect, useState } from "react";
import { Badge, Button, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from "reactstrap";
import { useTranslation } from 'react-i18next'
import './style.scss'
import { AlertTriangle, Check, Eye, Printer } from "react-feather";
import ActiveYearContext from "@context/ActiveYearContext"
import { useNavigate } from 'react-router-dom';
import { ReactSelectStyleWidth } from "@utils"
import Select from 'react-select'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'

function ScoreModal({ isOpen, handleModal, studentId }) {

    const navigate = useNavigate()
    const { t } = useTranslation()
    const { cseason_id, cyear_name } = useContext(ActiveYearContext)

    const [ data, setDatas ] = useState()
    const [ radio, setRadio ] = useState(false)
    const [ chosenYear, setYear ] = useState('')
    const [ chosenSeason, setSeason ] = useState('')
    const [ haveDun, setHaveDun ] = useState(false)
    const [ def, setDef ] = useState({})
    const [relayer, setRelayer] = useState(false)

    const { isLoading, Loader, fetchData } = useLoader({isSmall: true, initValue: true})
    const { isLoading: isDataLoading,fetchData: fetchMainData } = useLoader({isSmall: true, initValue: true})
    const scoreApi = useApi().score.print

    const studentApi = useApi().student
    const AMOUNT_DETAILS_TYPE = 'def3'

    async function getDef(){

    const { success, data } = await fetchData(studentApi.getDefinitionStudent(AMOUNT_DETAILS_TYPE, studentId));
        if (success) {
            setDef(data)
            setRelayer(true)
        }
    }

    async function getDatas()
    {
        const { success, data } = await fetchMainData(scoreApi.get(studentId, chosenYear, chosenSeason))
        // const { success, data } = await fetchData(scoreApi.get(3289, chosenYear, chosenSeason))
        if (success)
        {
            setDatas(data)
        }
    }

    useEffect(() => {getDatas()},[chosenSeason, chosenYear])
    useEffect(() => {getDef()},[])

    const yearlist = [
        {
            v: cyear_name,
        },
        {
            v:'2022-2023',
        },
        {
            v:'2021-2022',
        },
        {
            v:'2020-2021',
        },
        {
            v:'2019-2020',
        },
        {
            v:'2018-2019',
        }
    ]

    const seasonlist = [
        {
            value: 1,
            label: 'Намар'
        },
        {
            value: 2,
            label: 'Хавар'
        }
    ]

    return(
        <Modal size='lg' isOpen={isOpen} toggle={handleModal} className="modal-dialog-centered" onClosed={handleModal}>
            <ModalHeader toggle={handleModal}>
                Дүнгийн дэлгэрэнгүй
            </ModalHeader>
            <ModalBody style={{ minHeight: 150 }}>
                <div className="m-0">
                    <div className="d-flex flex-wrap">
                        <div className={`m-50 p-50 rounded-3 text-nowrap ${!radio && 'chosen-one'}`}>
                            <Input
                                id='total_time'
                                className="dataTable-check mb-50 me-50"
                                type="radio"
                                disabled={isLoading || isDataLoading}
                                bsSize="sm-5"
                                onChange={(e) => {
                                    setRadio(!e.target.checked);
                                    setYear('');
                                    setSeason('')
                                }}
                                checked={!radio}
                            />
                            <Label className="me-1 checkbox-wrapper " for="total_time">
                                {t('Нийт суралцсан хугацаа')}
                            </Label>
                        </div>
                        <div className={`m-50 p-50 rounded-3 text-nowrap ${radio && 'chosen-one'}`}>

                            <Input
                                id='season'
                                className="dataTable-check mb-50 me-50"
                                disabled={isLoading || isDataLoading}
                                type="radio"
                                bsSize="sm-5"
                                onChange={(e) => {
                                    setRadio(e.target.checked);
                                    setYear('2022-2023');
                                    setSeason(1)
                                }}
                                checked={radio}
                            />
                            <Label className="me-1 checkbox-wrapper " for="season">
                                {t('Зөвхөн тухайн улирал')}
                            </Label>
                        </div>
                    </div>
                    {radio ?
                        <Row className="d-flex flex-wrap">
                            <Col md={12} lg={6} xl={6}>
                                <Select
                                    classNamePrefix='select'
                                    className={`react-select me-1 mb-50`}
                                    isLoading={isLoading}
                                    // defaultValue={yearlist[1]}
                                    defaultValue={yearlist.filter(option => option.v === cyear_name )}
                                    // value={yearlist.filter(option => option.v === cyear_name )}
                                    placeholder={t(`-- Сонгоно уу --`)}
                                    options={yearlist || []}
                                    noOptionsMessage={() => 'Хоосон байна'}
                                    onChange={(val) => {setYear(val.v)}}
                                    styles={ReactSelectStyleWidth}
                                    getOptionValue={(option) => option.v}
                                    getOptionLabel={(option) => option.v}
                                />
                            </Col>
                            <Col md={12} lg={6} xl={6}>
                                <Select
                                    classNamePrefix='select'
                                    className={`react-select me-1 mb-50`}
                                    defaultValue={seasonlist.filter(option => option.value === cseason_id )}
                                    isLoading={isLoading}
                                    placeholder={t(`-- Сонгоно уу --`)}
                                    options={seasonlist || []}
                                    noOptionsMessage={() => 'Хоосон байна'}
                                    onChange={(val) => {setSeason(val.value)}}
                                    styles={ReactSelectStyleWidth}
                                    getOptionValue={(option) => option.value}
                                    getOptionLabel={(option) => option.label}
                                />
                            </Col>
                        </Row>
                        :
                        <div style={{ height: 37}}></div>
                    }

                </div>
                <div className="d-flex justify-content-between">
                    { isDataLoading || isLoading || data?.scoreregister.length > 0 ?
                            <div></div>
                        :
                            <div>
                                <Badge color={`light-warning`} className="badge-glow text-wrap mt-1" style={{ width: '260px', transition: '0.3s' }}>
                                    {isLoading ?
                                        ''
                                    :
                                        <>
                                            <AlertTriangle/> Тухайн {radio ? 'улиралд' :  "оюутанд"} дүн байхгүй байна
                                        </>
                                    }
                                </Badge>
                            </div>
                    }
                    {/* <Button color="primary" className="ps-1 me-1" onClick={() => {console.log('test')})}>
                        <Eye size={18} className="m-0 me-25"/>
                        Харах
                    </Button> */}
                    <Button color="primary" style={{ minHeight: 35 }} disabled={ isDataLoading || isLoading || !data?.scoreregister.length > 0} className="ps-1 d-flex align-items-center" onClick={() => {
                        radio ?
                            navigate('/student/amount-details', { state: {studentId: studentId, data: data, year: chosenYear, season: chosenSeason, def: def} })

                            // navigate('/student/student-season-print', { state: {student: studentId, data: data, year: chosenYear, season: chosenSeason, def: def} })
                        :
                            navigate('/student/amount-details', { state: {studentId: studentId, data: data, year: chosenYear, season: chosenSeason, def: def} })}
                    }>
                        {isLoading || isDataLoading ?

                            <Spinner className="m-0 me-25" style={{ height: 12, width: 12 }}/>
                            :
                            <Printer size={14} className="m-0 me-25"/>

                        }
                        Хэвлэх
                    </Button>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default ScoreModal