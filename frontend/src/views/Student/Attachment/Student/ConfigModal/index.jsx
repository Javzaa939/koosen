import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';

import {
    Modal,
    ModalBody,
    ModalHeader,
    Row,
    Col,
    Label,
    Input,
    Button,
    UncontrolledTooltip,

} from 'reactstrap'

import { AlertCircle } from 'react-feather';
import { formatDate } from '@src/utility/Utils';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import Flatpickr from 'react-flatpickr'
import { Mongolian } from "flatpickr/dist/l10n/mn.js"
import '@styles/react/libs/flatpickr/flatpickr.scss'

export default function ConfigModal({ openModal, handleModal, datas, calculatedDatas, }) {
    const { t } = useTranslation()
    const [ printValue, setPrintValue ] = useState("")
    const [ isCenter, setIsCenter ] = useState(false)
    const [ configRowcount, setConfigRowCount ] = useState([])
    const [ errorMessage, setErrorMessage ] = useState('')
    const [ picker, setPicker ] = useState(new Date())

    // Api
    const studentApi = useApi().student
    // Loader
	const { isLoading, fetchData, Loader } = useLoader({ isFullScreen: true })

    /** Мөрийн тохиргоо хадгалах */
    async function getConfig() {
        const { success, data } = await fetchData(studentApi.getConfig(datas?.student?.group?.id, printValue))
        // const { success, data } = await fetchData(studentApi.getConfig(datas?.student?.group?.profession?.id, printValue))
        if (success) {
            if (data?.give_date) {
                var give_date = new Date(data?.give_date);
                setPicker(give_date)
            }

            if (data?.is_center) {
                setIsCenter(data?.is_center)
            }
            if (data?.is_lastname && document.getElementById(`isLastNameOvog`)) {
                document.getElementById(`isLastNameOvog`).checked = true
            }

            /* Мөрийн датаг set хийх*/
            if(data?.row_count?.length > 0) {
                for (let i = 0; i <= 5; i++)
                {
                    let cdata = data?.row_count[i] ? data?.row_count[i] : 0
                    if (document.getElementById(`table${i+1}`)) {
                        document.getElementById(`table${i+1}`).value = cdata
                    }
                }
            }
            setConfigRowCount(data?.row_count ? data?.row_count : [])
        }
    }

    /** Хүснэгтийн датаны мөрийг өөрчлөх үед*/
    function changeTableRowValues(value)
    {
        let defaultSum = datas?.calculated_length  + 3
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

        setConfigRowCount(customValue)
    }

     /** Дипломын хавсралтын тохиргоо хадгалах*/
     async function handleConfig() {
        var cdata = {
            'type': printValue,
            'group': datas?.student?.group?.id,
            'row_count': JSON.stringify(configRowcount),
            'give_date': formatDate(picker),
            'is_lastname': document.getElementById('isLastNameOvog') ? document.getElementById('isLastNameOvog')?.checked : false,
            'is_center': isCenter,

        }
        const { success } = await fetchData(studentApi.postConfig(cdata))
        if (success) {
            handleModal()
        }
    }

    function handlePrint(e)
    {
        setPrintValue(e.target.value)
    }

    useEffect(
        () =>
        {
            if (printValue) {
                getConfig()
            }
        },
        [printValue]
    )

    return (
        <Modal
            isOpen={openModal}
            size='lg'
            toggle={handleModal}
            centered
            backdrop='static'
        >
            <ModalHeader>{`Та "${datas?.student?.group?.profession?.name}" хөтөлбөрийн ${printValue === 'mongolian' ? 'Монгол' : printValue === 'english' ? 'Англи' : 'Уйгаржин'} хавсралтын тохиргоо`}</ModalHeader>
            <ModalBody>
                <Row>
                <p className='mt-1 mb-0'>Хавсралтын хуудаснуудын хүснэгтийн мөрийн тоо</p>
                <p>
                    <code className='text-dark' ><span className='fw-bolder'>{calculatedDatas.length}</span> хичээл сонгогдож хавсралтанд <span className='fw-bolder'>{datas?.calculated_length}</span> хичээл харагдана</code><AlertCircle id='alertCaluclated' className='' size={15} />
                    <UncontrolledTooltip placement='top' target={`alertCaluclated`} >Багц хичээл байвал хичээлүүд багцлагдаж бодогдоно.</UncontrolledTooltip>
                </p>
                {
                    datas?.calculated_length
                    ?
                        <p><code className='text-dark'><span className='fw-bolder'>{datas?.calculated_length}</span> хичээл дээр нэмэх нь 3 гарчиг нийт <span className='fw-bolder'>({datas?.calculated_length + 3}) мөр</span></code></p>
                    :
                        null
                }
                </Row>
                <Row>
                    <Col md={12}>
                        <Label className="form-label" for="print_mongolian1">
                            <Input
                                id="print_mongolian1"
                                value='mongolian'
                                bsSize="md"
                                type="radio"
                                onChange={handlePrint}
                                checked={printValue == 'mongolian'}
                            />
                            <span style={{ marginLeft: '6px' }}>{t('Монгол')}</span>
                        </Label>
                        <Label className="form-label ms-2" for="print_english1">
                            <Input
                                id="print_english1"
                                value='english'
                                bsSize="md"
                                type="radio"
                                onChange={handlePrint}
                                checked={printValue == 'english'}
                            />
                                <span className='ms-1'>{t('Англи')}</span>
                        </Label>
                        <Label className="form-label ms-2" for="print_uigarjin1">
                            <Input
                                id="print_uigarjin1"
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
                {
                    printValue
                    &&
                    <>
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
                                        let data = configRowcount
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
                                        let data = configRowcount
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
                                        let data = configRowcount
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
                                        let data = configRowcount
                                        data[3] = e.target.value == '' ? 0 : parseInt(e.target.value)
                                        changeTableRowValues(data)
                                    }}
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
                                            onChange={(e) => {
                                                let data = configRowcount
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
                                                let data = configRowcount
                                                data[5] = e.target.value == '' ? 0 : parseInt(e.target.value)
                                                changeTableRowValues(data)
                                            }}
                                        />
                                    </Col>
                                </>
                                :
                                    <Col md={3} className='mt-1'>
                                        <Input
                                            type='checkbox'
                                            name='isCenter'
                                            id='isCenter'
                                            checked={isCenter}
                                            onChange={(e) => setIsCenter(e.target.checked)}
                                        />
                                        <Label className="form-label ms-50" for="isCenter">
                                            {t('Уйгаржин голлуулах эсэх')}
                                        </Label>
                                    </Col>
                            }
                            <Col md={3} className='mt-1'>
                                <Input
                                    type='checkbox'
                                    name='isLastNameOvog'
                                    id='isLastNameOvog'
                                    defaultChecked={true}
                                />
                                <Label className="form-label ms-50" for="isLastNameOvog">
                                    {t('Овог харуулах')}
                                </Label>
                            </Col>
                        </Row>
                        <p className='text-danger fs-6'>{errorMessage}</p>
                        <p className='mt-1'>Олгосон огноо</p>
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
                    </>
                }
                <div className='d-flex justify-content-between m-25'>
                    <Button type='submit' color='primary' size='md' disabled={(printValue && !errorMessage) ? false : true} onClick={() => handleConfig()}>Хадгалах</Button>
                    <Button type='reset' color='secondary' size='md' onClick={handleModal}>Буцах</Button>
                </div>
            </ModalBody>
        </Modal>
    )
}
