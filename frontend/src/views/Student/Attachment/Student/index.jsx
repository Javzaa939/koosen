
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
import useModal from '@src/utility/hooks/useModal';
import { getColumns } from '@views/Student/Attachment/Student/helpers/index.jsx'
import ConfigModal from './ConfigModal';
// ** Styles Imports
import '@styles/react/libs/flatpickr/flatpickr.scss'
import './style.css'

export default function AttachmentStudent()
{

    // State
    const [ datas, setDatas ] = useState([])
    const [ calculatedDatas, setCalculatedDatas ] = useState([])
    const [ config, setConfig ] = useState({})
    const [ editDatatable, setEditDatatable ] = useState(false)
    const [ printValue, setPrintValue ] = useState("")
    const [ picker, setPicker ] = useState(new Date())
    const [ is_loading, setLoading ] = useState(true)
    const [ configModal, setConfigModal ] = useState(false)
    const [ isThink, setIsThink ] = useState(false)
    const { showWarning } = useModal()

    const [ checkedTableRowCount, setCheckedTableRowCount ] = useState([])

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
            fetchData(studentApi.calculateGpaDimploma(studentId))
        ]).then((values) => {
            if (values[0]?.success) {
                setLoading(false)
            }
            setDatas(values[0]?.data),
            setCalculatedDatas(values[1]?.data)
        })
    }

    /** Мөрийн тохиргоо хадгалах */
    async function getConfig() {
        const { success, data } = await fetchData(studentApi.getConfig(datas?.student?.group?.id, printValue))
        if (success) {
            setConfig(data)
            if (data?.give_date) {
                var give_date = new Date(data?.give_date);
                setPicker(give_date)
            }

            if (data?.is_center && document.getElementById(`isCenter`)) {
                document.getElementById(`isCenter`).checked = true
            }
            if (data?.is_lastname && document.getElementById(`isLastNameOvog`)) {
                document.getElementById(`isLastNameOvog`).checked = true
            }
            calculatePrintTableValue(data?.row_count ? data?.row_count : [])
            setCheckedTableRowCount(data?.row_count ? data?.row_count : [])
        }
    }

    useEffect(
        () =>
        {
            if (Object.keys(datas).length > 0 && printValue) {
                getConfig()
            }
        },
        [datas, printValue]
    )

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

    async function toThink()
    {
        await Promise.all([
            fetchData(studentApi.calculateGpaDimplomaAdd(studentId, checkedValues.current)),
        ]).then((values) => {
            setIsThink(true)
            setCalculatedDatas(values[0].data)
        })

        await Promise.all([
            fetchData(studentApi.scoreRegister(studentId)),
        ]).then((values) => {
            setDatas(values[0]?.data)
        })
    }

    // Дипломын хичээл хи нь check хийх
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

    // Дипломын хичээл бүгдийг нь check хийх
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

    function calculatePrintTableValue(row_count)
    {
        for (let i = 0; i <= 5; i++)
        {
            let data = row_count[i] ? row_count[i] : 0
            if (document.getElementById(`table${i+1}`)) {
                document.getElementById(`table${i+1}`).value = data
            }
        }
    }

    /** 1 => 01 болгох Format */
    const zeroFill = n => {
        return ('0' + n).slice(-2);
    }

    /** Хэвлэх товч дарах үед*/
    function clickPrint(event)
    {
        event.preventDefault()

        let registration_num = `${picker.getFullYear()}.${zeroFill(picker.getMonth() + 1)}.${zeroFill(picker.getDate())}`

        let data = {
            lessons: datas?.score_register,
            tableRowCount: checkedTableRowCount,
            student: datas?.student,
            registration_num: registration_num,
            isCenter: document.getElementById('isCenter') ? document.getElementById('isCenter').checked : null,
            isLastNameOvog: document.getElementById('isLastNameOvog') ? document.getElementById('isLastNameOvog').checked : null,
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

    /** Дипломын голч бодуулах тухайн хүүхдийн загварын дагуу ангиар нь хадгалах*/
    async function handleTemplateSubmit() {
        const { success } = await fetchData(studentApi.calculateGpaGroupGraduation(datas?.student?.id))
        if (success) {
        }
    }

    /*Тохиргоо хадгалах модал*/
    const handleConfigModal = () => {
        setConfigModal(!configModal)
    }

    /* Хавсралт бүгдийг хэвлэх */
    function printAll()
	{
        let data = {
            student: datas?.student,
        }

        localStorage.setItem('blankDatas', JSON.stringify(data))

        let button = document.getElementById('clickAll')

		button.href = `/student/attachment/print-all/`
        button.click()
	}

    return (
        <Fragment>
            { isLoading && Loader }
            <Card>
                <div className="cursor-pointer hover-shadow m-1 d-flex justify-content-between">
                    <div onClick={() => handleNavigate()}><ChevronsLeft /> Буцах</div>
                    <Button
                        color='primary'
                        size='sm'
                        onClick={printAll}
                    >
                        Бүгдийг хэвлэх
                    </Button>
                </div>
                <Link className='d-none' to='/' id='clickAll' target='_blank' style={{pointerEvents: Object.keys(config).length === 0 ? 'none' : ''}}>Хэвлэх</Link>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom align-items-center py-1">
                    <CardTitle tag="h4">{t('Хавсралт')}&nbsp;<small>(&nbsp;{datas?.student?.code} {datas?.student?.last_name} {datas?.student?.first_name}&nbsp;)</small></CardTitle>
                </CardHeader>
                <CardBody>
                    <div className='d-flex justify-content-between'>
                        <p className='mt-1'>Хэвлэх</p>
                        <Button
                            size='sm'
                            color='primary'
                            className='m-1'
                            onClick={handleConfigModal}
                        >
                            Тохиргоо хадгалах
                        </Button>
                    </div>
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
                            {
                                datas?.calculated_length
                                ?
                                    <p><code className='text-dark'><span className='fw-bolder'>{datas?.calculated_length}</span> хичээл дээр нэмэх нь 4 гарчиг нийт <span className='fw-bolder'>({datas?.calculated_length + 4}) мөр</span></code></p>
                                :
                                    null
                            }
                            <Row>
                                <Col md={3}>
                                    <Label className="form-label" for="table1">
                                        {t('1 дэх багана')}
                                    </Label>
                                    <Input
                                        type='text'
                                        name='table1'
                                        bsSize='sm'
                                        disabled={true}
                                        id='table1'
                                    />
                                </Col>
                                <Col md={3}>
                                    <Label className="form-label" for="table2">
                                        {t('2 дох багана')}
                                    </Label>
                                    <Input
                                        type='text'
                                        name='table2'
                                        disabled={true}
                                        bsSize='sm'
                                        id='table2'
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
                                        disabled={true}
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
                                        disabled={true}
                                        // onChange={(e) => {
                                        //     let data = checkedTableRowCount
                                        //     data[3] = e.target.value == '' ? 0 : parseInt(e.target.value)
                                        //     changeTableRowValues(data)
                                        // }}
                                    />
                                </Col>
                                {
                                    (printValue == 'mongolian' || printValue == 'english')
                                    ?
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
                                                disabled={true}
                                                // onChange={(e) => {
                                                //     let data = checkedTableRowCount
                                                //     data[4] = e.target.value == '' ? 0 : parseInt(e.target.value)
                                                //     changeTableRowValues(data)
                                                // }}
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
                                                disabled={true}
                                                // onChange={(e) => {
                                                //     let data = checkedTableRowCount
                                                //     data[5] = e.target.value == '' ? 0 : parseInt(e.target.value)
                                                //     changeTableRowValues(data)
                                                // }}
                                            />
                                        </Col>
                                    </>
                                    :
                                        <Col md={3} className='mt-1'>
                                            <Input
                                                type='checkbox'
                                                name='isCenter'
                                                id='isCenter'
                                                disabled={true}
                                            />
                                            <Label className="form-label ms-50" for="isCenter">
                                                {t('Голлуулах эсэх')}
                                            </Label>
                                        </Col>
                                }
                                <Col md={3} className='mt-1'>
                                    <Input
                                        type='checkbox'
                                        name='isLastNameOvog'
                                        id='isLastNameOvog'
                                        disabled={true}
                                        defaultChecked={true}
                                    />
                                    <Label className="form-label ms-50" for="isLastNameOvog">
                                        {t('Овог харуулах')}
                                    </Label>
                                </Col>
                            </Row>
                            <p className='mt-1 ms-1'>Олгосон огноо</p>
                            <Flatpickr
                                required
                                id='start'
                                disabled={true}
                                name='start'
                                className='form-control'
                                value={picker}
                                onChange={date => setPicker(date[0])}
                                options={{
                                    locale: Mongolian,
                                    dateFormat: 'Y-m-d',
                                }}
                            />
                            <Button className={`mt-1`} onClick={clickPrint}  disabled={Object.keys(config).length === 0 ? true : false}>Хэвлэх</Button>
                            <Link className='d-none' to='/' id='clickBtn' target='_blank' style={{pointerEvents: Object.keys(config).length === 0 ? 'none' : ''}}>Хэвлэх</Link>
                            <hr />
                        </>
                    }

                    <p className='ms-1'>Дипломын голч бодуулах</p>
                    <div className='d-flex justify-content-between'>
                        <Button onClick={toThink}>Бодуулах</Button>
                        <Button
                            disabled={!isThink}
                            onClick={() => showWarning({
                                header: {
                                    title: `${('Хавсралтын дүн бодуулах загвар хадгалах')}`,
                                },
                                question: `Та "${datas?.student?.group?.profession?.name}" хөтөлбөрийн "${datas?.student?.group?.name}"-н дипломын хавсралт дүн энэ хүснэгт дээр хадгалагдсан загвараар хадгалагдахыг анхаарна уу?`,
                                onClick: () => handleTemplateSubmit(),
                                btnText: 'Хадгалах',
                            })}
                            color={"primary"}
                         >
                            Загвар хадгалах
                        </Button>
                    </div>

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
            {
                configModal
                &&
                <ConfigModal openModal={configModal} handleModal={handleConfigModal} datas={datas} printValue={printValue} calculatedDatas={calculatedDatas} getConfig={getConfig} config={config}/>
            }
        </Fragment>
    )
}
