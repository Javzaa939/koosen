
import React, { Fragment, useState, useEffect } from 'react'
import { AlertTriangle } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import {
    Modal,
    Row,
    Col,
    ModalHeader,
    ModalBody,
    Input,
    Label,
    Badge,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from 'reactstrap'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import ReactCountryFlag from 'react-country-flag'

export default function SumModal(props)
{
    // Translate
    const { t } = useTranslation()

    const navigate = useNavigate()

    const { isLoading, Loader, fetchData } = useLoader({})
    const studentDefinitionApi = useApi().student.definition

    const [ radio, setRadio ] = useState(false)
    const [ years, setYears ] = useState([])
    const [ season, setSeason ] = useState([])
    const [ haveDun, setHaveDun ] = useState(false)

    const { isOpen, handleModal, datas } = props

    useEffect(
        () =>
        {
            getYear()
        },
        []
    )

    async function getYear()
    {
        const { success, data } = await fetchData(studentDefinitionApi.getYear(datas))
        if (success)
        {
            setYears(data.year)
            setSeason(data.season)
            setHaveDun(data.have_dun)
        }
    }

    function handleSearch()
    {
        let all_year
        let filterDatas

        if (radio)
        {
            all_year = false
            const year_value = document.getElementById('year')
            const season_code = document.getElementById('seasonchoose')
            filterDatas = {
                'all_year': all_year,
                'year_value': year_value.value,
                'season_code': season_code.value,
                'student_id': datas,
            }
        }
        else
        {
            all_year = true
            filterDatas = {
                'all_year': all_year,
                'student_id': datas,
            }
        }

        navigate('/student/sum/', { state: filterDatas })
    }

    function handleSearchEn()
    {
        let all_year
        let filterDatas

        if (radio)
        {
            all_year = false
            const year_value = document.getElementById('year')
            const season_code = document.getElementById('seasonchoose')
            filterDatas = {
                'all_year': all_year,
                'year_value': year_value.value,
                'season_code': season_code.value,
                'student_id': datas,
            }
        }
        else
        {
            all_year = true
            filterDatas = {
                'all_year': all_year,
                'student_id': datas,
            }
        }

        navigate('/student/sum/en/', { state: filterDatas })
    }

    return (
        <Fragment>
            <Modal size='lg' isOpen={isOpen} toggle={handleModal} className="modal-dialog-centered" onClosed={handleModal} >
                <ModalHeader className='' toggle={handleModal} >Голч дүн</ModalHeader>
                <ModalBody>
                {
                    haveDun
                    &&
                    <>
                        <Row>
                            <Col md={12} >
                                <Input
                                    id='total_time'
                                    className="dataTable-check mb-50 me-50"
                                    type="radio"
                                    bsSize="sm-5"
                                    onChange={(e) => setRadio(!e.target.checked)}
                                    checked={!radio}
                                />
                                <Label className="me-1 checkbox-wrapper " for="total_time">
                                    {t('Нийт суралцсан хугацаа')}
                                </Label>
                                <Input
                                    id='season'
                                    className="dataTable-check mb-50 me-50"
                                    type="radio"
                                    bsSize="sm-5"
                                    onChange={(e) => setRadio(e.target.checked)}
                                    checked={radio}
                                />
                                <Label className="me-1 checkbox-wrapper " for="season">
                                    {t('Зөвхөн тухайн улирал')}
                                </Label>
                            </Col>
                        </Row>

                        <Row className='mt-2 justify-content-start'>
                            {
                                radio
                                ?
                                <>
                                    <Col md={4} >
                                        <Input
                                            name='year'
                                            id='year'
                                            className='dataTable-select me-1 mb-50'
                                            type='select'
                                            bsSize='sm'
                                            style={{ height: "30px",}}
                                        >
                                            {
                                                years.map((page, idx) => (
                                                <option
                                                    key={idx}
                                                    value={page}
                                                >
                                                    {page}
                                                </option>
                                            ))}
                                        </Input>
                                    </Col>
                                    <Col md={4} >
                                        <Input
                                            name='seasonchoose'
                                            id='seasonchoose'
                                            className='dataTable-select me-1 mb-50'
                                            type='select'
                                            bsSize='sm'
                                            style={{ height: "30px",}}
                                        >
                                            {
                                                season.map((page, idx) => (
                                                <option
                                                    key={idx}
                                                    value={page.season_code}
                                                >
                                                    {page.season_name}
                                                </option>
                                            ))}
                                        </Input>
                                    </Col>
                                </>
                                :
                                <></>
                            }
                            <Col md={4}>
                                <UncontrolledDropdown className='dropdown-language nav-item d-inline-block' >
                                    <DropdownToggle
                                        caret
                                        size='sm'
                                        className='ms-50 mb-50'
                                        color='primary'
                                    >
                                        Хайх
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem style={{width: '100%'}} onClick={handleSearch}>
                                            Монгол
                                            <ReactCountryFlag
                                                svg
                                                className='country-flag flag-icon mx-50'
                                                countryCode='mn'
                                            />
                                        </DropdownItem>
                                        <DropdownItem style={{width: '100%'}} onClick={handleSearchEn}>
                                            English
                                            <ReactCountryFlag
                                                svg
                                                className='country-flag flag-icon mx-50'
                                                countryCode='us'
                                            />
                                        </DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                            </Col>
                        </Row>
                    </>
                }

                {
                    isLoading
                    ?
                        Loader
                    :
                        !haveDun
                        &&
                        // <p className='p-5 fs-4 fw-bolder' >Уучлаарай илэрц олдсонгүй.</p>
                        <div className='p-1 fw-bolder'>
                            <Badge color={`light-warning`} pill className="d-inline-block pe-1 align-items-center">
                                <div className='text-wrap d-flex align-items-center' style={{ fontSize: 11}}>
                                    <AlertTriangle className='m-1' style={{ width: 15, height: 15 }}  />
                                    Уучлаарай илэрц олдсонгүй
                                </div>
                            </Badge>
                        </div>
                }
                </ModalBody>
            </Modal>
        </Fragment>
    )
}
