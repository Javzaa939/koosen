
import React, { useEffect, Fragment, useState, useRef } from 'react';

import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, UncontrolledTooltip, CardBody } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import DataTable from 'react-data-table-component'
import { Edit2, X, AlertCircle, ChevronsLeft } from 'react-feather';
import Flatpickr from 'react-flatpickr'
import { Mongolian } from "flatpickr/dist/l10n/mn.js"

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { getColumns } from '@views/Student/Attachment/Student/helpers/index.jsx'

// ** Styles Imports
import '@styles/react/libs/flatpickr/flatpickr.scss'
import './style.css'
import { useParams } from 'react-router-dom';

export default function AttachmentStudent()
{

    // State
    const [ datas, setDatas ] = useState([])
    const [ calculatedDatas, setCalculatedDatas ] = useState([])
    const [ editDatatable, setEditDatatable ] = useState(false)
    const [ printValue, setPrintValue ] = useState("")
    const [ picker, setPicker ] = useState(new Date())

    const [ checkedTableRowCount, setCheckedTableRowCount ] = useState([])
    const [ errorMessage, setErrorMessage ] = useState('')

    // Ref
    const checkedValues = useRef([]);

    // Translate
    const { t } = useTranslation()

    const navigate = useNavigate()
    const location = useLocation()
    const studentId = location.state

    // Loader
	const { isLoading, fetchData, Loader } = useLoader({ isFullScreen: true })

    // Api
    const studentApi = useApi().student

    /** Бүх датаг нэгэн зэрэг авах */
    async function getAllData()
    {
        await Promise.all([
            fetchData(studentApi.scoreRegister(studentId)),
            fetchData(studentApi.calculateGpaDimploma(studentId)),
        ]).then((values) => {
            setDatas(values[0]?.data),
            setCalculatedDatas(values[1].data)
        })
    }


    useEffect(
        () =>
        {
            if (!studentId)
            {
                navigate('/404error')
            }
            else
            {
                getAllData()
            }
        },
        [studentId]
    )

    function changeTableRowValues(value)
    {
        let defaultSum = datas?.calculated_length

        let sum = 0

        let customValue = value
        for (let idx in value)
        {
            sum += value[idx]

            if (sum == defaultSum)
            {
                for (let idxK = parseInt(idx) + 1; idxK < value.length; idxK++)
                {
                    document.getElementById(`table${idxK + 1}`).value = 0
                    customValue[idxK] = 0
                }
                break
            }
        }

        if (defaultSum == sum)
        {
            setErrorMessage('')
        }
        else
        {
            setErrorMessage('Нийт мөрийн тоо алдаатай байна!')
        }
        setCheckedTableRowCount(customValue)
    }

    async function toThink()
    {
        await Promise.all([
            fetchData(studentApi.calculateGpaDimplomaAdd(studentId, checkedValues.current)),
        ]).then((values) => {
            setCalculatedDatas(values[0].data)
        })

        await Promise.all([
            fetchData(studentApi.scoreRegister(studentId)),
        ]).then((values) => {
            setDatas(values[0]?.data)
        })
    }

    function checkScore(id)
    {
        id = parseInt(id)

        if (checkedValues.current.some(val => val == id))
        {
            checkedValues.current.splice(checkedValues.current.indexOf(id), 1)
        }
        else
        {
            checkedValues.current.push(id)
        }

        if (checkedValues.current.length == datas?.score_register?.length)
        {
            document.getElementById(`allChecked`).checked = true
        }
        else
        {
            document.getElementById(`allChecked`).checked = false
        }
    }

    function allCheck(e)
    {
        let allInputs = document.querySelectorAll('input[name=lesson]')

        checkedValues.current = []

        if (e.target.checked)
        {
            for (let allInput of allInputs)
            {
                allInput.checked = true
                checkedValues.current.push(parseInt(allInput.value))
            }
        }
        else
        {
            for (let allInput of allInputs)
            {
                allInput.checked = false
            }
        }
    }

    function checkScoreTrueFirst(id)
    {
        id = parseInt(id)
        checkedValues.current.push(id)

        if (document.getElementById(`${id}lesson`))
        {
            document.getElementById(`${id}lesson`).checked = true
        }

        if (checkedValues.current.length == datas?.score_register?.length)
        {
            document.getElementById(`allChecked`).checked = true
        }
    }

    useEffect(
        () =>
        {
            checkedValues.current = []
            for (let calculatedData of calculatedDatas)
            {
                checkScoreTrueFirst(calculatedData)
            }
        },
        [calculatedDatas]
    )

    function handlePrint(e)
    {
        setPrintValue(e.target.value)
    }

    function calculatePrintTableValue(allLength, tableMax, tableCount)
    {
        let tableRowData = []

        if (tableCount * 13 < allLength)
        {
            let residual = allLength % tableCount
            let notResidualValue = allLength - residual

            for (let i = 1; i <= tableCount; i++)
            {
                let data = (notResidualValue / tableCount)

                if (residual > 0)
                {
                    data++
                    residual--
                }

                tableRowData.push(data)

                document.getElementById(`table${i}`).value = data
            }
        }
        else
        {

            for (let i = 1; i <= tableCount; i++)
            {
                let data = tableMax

                if (allLength > 0 && allLength < tableMax)
                {
                    data = allLength
                }
                else if (allLength <= 0)
                {
                    allLength = 0
                    data = 0
                }

                allLength = allLength - tableMax

                tableRowData.push(data)

                document.getElementById(`table${i}`).value = data
            }
        }
        setCheckedTableRowCount(tableRowData)
    }

    useEffect(
        () =>
        {
            let allLength = datas?.calculated_length
            switch (printValue)
            {
                case 'mongolian':
                    var tableMax = 13
                    calculatePrintTableValue(allLength, tableMax, 6)
                    break;

                case 'english':
                    var tableMax = 13
                    calculatePrintTableValue(allLength, tableMax, 6)
                    break;

                case 'uigarjin':
                    var tableMax = 21
                    calculatePrintTableValue(allLength, tableMax, 4)
                    break;

                default:
                    break;
            }
        },
        [printValue, calculatedDatas]
    )

    /** 1 => 01 болгох Format */
    const zeroFill = n => {
        return ('0' + n).slice(-2);
    }

    function clickPrint(event)
    {
        event.preventDefault()

        let registration_num = `${picker.getFullYear()}.${zeroFill(picker.getMonth() + 1)}.${zeroFill(picker.getDate())}`

        let data = {
            lessons: datas?.score_register,
            tableRowCount: checkedTableRowCount,
            student: datas?.student,
            registration_num: registration_num,
        }

        localStorage.setItem('blankDatas', JSON.stringify(data))

        let button = document.getElementById('clickBtn')

        switch (printValue)
        {
            case 'mongolian':
                button.href = `/student/attachment/print-mongolia/`
                break;

            case 'english':
                button.href = `/student/attachment/print-english/`
                break;

            case 'uigarjin':
                button.href = `/student/attachment/print-national/`
                break;

            default:
                break;
        }

        button.click()
    }

    const handleNavigate = () => {
        navigate(`/student/attachment/`)
    }

    return (
        <Fragment>
            { isLoading && Loader }
            <Card>
                <div className="cursor-pointer hover-shadow m-1" onClick={() => handleNavigate()}>
                    <ChevronsLeft /> Буцах
                </div>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom align-items-center py-1">
                    <CardTitle tag="h4">{t('Хавсралт')}&nbsp;<small>(&nbsp;{datas?.student?.code} {datas?.student?.last_name} {datas?.student?.first_name}&nbsp;)</small></CardTitle>
                </CardHeader>
                <CardBody>
                    <p className='mt-1 ms-1'>Хэвлэх</p>
                    <Row>

                        <Col md={12}>
                            <Label className="form-label" for="print_mongolian">
                                <Input
                                    id="print_mongolian"
                                    value='mongolian'
                                    bsSize="md"
                                    type="radio"
                                    onChange={handlePrint}
                                    checked={printValue == 'mongolian'}
                                />
                                <span style={{ marginLeft: '6px' }}>{t('Монгол')}</span>
                            </Label>
                            <Label className="form-label ms-2" for="print_english">
                                <Input
                                    id="print_english"
                                    value='english'
                                    bsSize="md"
                                    type="radio"
                                    onChange={handlePrint}
                                    checked={printValue == 'english'}
                                />
                                    <span className='ms-1'>{t('Англи')}</span>
                            </Label>
                            <Label className="form-label ms-2" for="print_uigarjin">
                                <Input
                                    id="print_uigarjin"
                                    value='uigarjin'
                                    bsSize="md"
                                    type="radio"
                                    onChange={handlePrint}
                                    checked={printValue == 'uigarjin'}
                                />
                                    <span className='ms-1'>{t('Уйгаржин')}</span>
                            </Label>
                        </Col>
                    </Row>

                    <hr />

                    {
                        printValue
                        &&
                        <>
                            <p className='mt-1 ms-1 mb-0'>Хавсралтын хуудаснуудын хүснэгтийн мөрийн тоо</p>
                            <p>
                                <code className='text-dark' ><span className='fw-bolder'>{calculatedDatas.length}</span> хичээл сонгогдож хавсралтанд <span className='fw-bolder'>{datas?.calculated_length}</span> хичээл харагдана</code><AlertCircle id='alertCaluclated' className='' size={15} />
                                <UncontrolledTooltip placement='top' target={`alertCaluclated`} >Багц хичээл байвал хичээлүүд багцлагдаж бодогдоно.</UncontrolledTooltip>
                            </p>
                            <Row>
                                <Col md={3}>
                                    <Label className="form-label" for="table1">
                                        {t('1 дэх багана')}
                                    </Label>
                                    <Input
                                        type='text'
                                        name='table1'
                                        bsSize='sm'
                                        id='table1'
                                        onChange={(e) => {
                                            let data = checkedTableRowCount
                                            data[0] = e.target.value == '' ? 0 : parseInt(e.target.value)
                                            changeTableRowValues(data)
                                        }}
                                    />
                                </Col>
                                <Col md={3}>
                                    <Label className="form-label" for="table2">
                                        {t('2 дох багана')}
                                    </Label>
                                    <Input
                                        type='text'
                                        name='table2'
                                        bsSize='sm'
                                        id='table2'
                                        onChange={(e) => {
                                            let data = checkedTableRowCount
                                            data[1] = e.target.value == '' ? 0 : parseInt(e.target.value)
                                            changeTableRowValues(data)
                                        }}
                                    />
                                </Col>
                                <Col md={3}>
                                    <Label className="form-label" for="table3">
                                        {t('3 дах багана')}
                                    </Label>
                                    <Input
                                        type='text'
                                        name='table3'
                                        bsSize='sm'
                                        id='table3'
                                        onChange={(e) => {
                                            let data = checkedTableRowCount
                                            data[2] = e.target.value == '' ? 0 : parseInt(e.target.value)
                                            changeTableRowValues(data)
                                        }}
                                    />
                                </Col>
                                <Col md={3}>
                                    <Label className="form-label" for="table4">
                                        {t('4 дөх багана')}
                                    </Label>
                                    <Input
                                        type='text'
                                        name='table4'
                                        bsSize='sm'
                                        id='table4'
                                        onChange={(e) => {
                                            let data = checkedTableRowCount
                                            data[3] = e.target.value == '' ? 0 : parseInt(e.target.value)
                                            changeTableRowValues(data)
                                        }}
                                    />
                                </Col>
                                {
                                    (printValue == 'mongolian' || printValue == 'english')
                                    &&
                                    <>
                                        <Col md={3}>
                                            <Label className="form-label" for="table5">
                                                {t('5 дах багана')}
                                            </Label>
                                            <Input
                                                type='text'
                                                name='table5'
                                                bsSize='sm'
                                                id='table5'
                                                onChange={(e) => {
                                                    let data = checkedTableRowCount
                                                    data[4] = e.target.value == '' ? 0 : parseInt(e.target.value)
                                                    changeTableRowValues(data)
                                                }}
                                            />
                                        </Col>
                                        <Col md={3}>
                                            <Label className="form-label" for="table6">
                                                {t('6 дах багана')}
                                            </Label>
                                            <Input
                                                type='text'
                                                name='table6'
                                                bsSize='sm'
                                                id='table6'
                                                onChange={(e) => {
                                                    let data = checkedTableRowCount
                                                    data[5] = e.target.value == '' ? 0 : parseInt(e.target.value)
                                                    changeTableRowValues(data)
                                                }}
                                            />
                                        </Col>
                                    </>
                                }
                            </Row>
                            <p className='text-danger fs-6'>{errorMessage}</p>
                            <p className='mt-1 ms-1'>Олгосон огноо</p>
                            <Flatpickr
                                required
                                id='start'
                                name='start'
                                className='form-control'
                                value={picker}
                                onChange={date => setPicker(date[0])}
                                options={{
                                    locale: Mongolian,
                                    dateFormat: 'Y-m-d',
                                }}
                            />
                            <Button className={`mt-1 ${errorMessage && 'disabled'}`} onClick={clickPrint} >Хэвлэх</Button>
                            <Link className='d-none' to='/' id='clickBtn' target='_blank' >Хэвлэх</Link>
                            <hr />
                        </>
                    }

                    <p className='ms-1'>Дипломын голч бодуулах</p>
                    <Button onClick={toThink} >Бодуулах</Button>

                </CardBody>
            </Card>

            <Card>
                <div className="react-dataTable position-relative">
                    <Button
                        className='position-absolute top-0 start-0'
                        style={{ zIndex: '11', margin: '-33px 6px 0px 10px', padding: '8px 8px' }}
                        onClick={() => setEditDatatable(!editDatatable)}
                    >
                        {
                            editDatatable
                            ?
                                <X size={13} />
                            :
                                <Edit2 size={13} />
                        }
                    </Button>
                    <div className={`${!editDatatable && 'disableTable'}`} >
                        <DataTable
                            noHeader
                            className='react-dataTable'
                            noDataComponent={(
                                <div className="my-2">
                                    <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                </div>
                            )}
                            columns={getColumns(checkScore, allCheck)}
                            data={datas?.score_register}
                        />
                    </div>
                </div>
            </Card>

        </Fragment>
    )
}
