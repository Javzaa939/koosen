import React, { useEffect, useState, useContext } from 'react'

import {
    Row,
    Col,
    Label,
    Input,
    Modal,
    Card,
    Button,
    ModalBody,
    ModalHeader
} from 'reactstrap'

import { useTranslation } from 'react-i18next'

import DataTable from 'react-data-table-component'

import { X, Download, CheckSquare, XSquare } from 'react-feather'

import AuthContext from "@context/AuthContext"
import RequestContext from "@context/RequestContext"

import AddTable from '../Add/Table'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { convertDefaultValue } from '@utils'

function detailRows( datas ) {
    return (
        <>
            <h3 className='text-primary invoice-logo'>Дүнгийн дүйцүүлэлтийн дэлгэрэнгүй</h3>
            <hr className='invoice-spacing' />
            <Row className='invoice-spacing'>
                <Col className='pt-0 p-1'>
                    <h6 className='mb-1'>Оюутны мэдээлэл</h6>
                    <table className='w-100'>
                        <tbody>
                            <tr className='border-bottom'>
                                <td className='pe-1' style={{ width: '40%' }}>Овог:</td>
                                <td>
                                    <span className=''>{datas?.last_name}</span>
                                </td>
                            </tr>
                            <tr className='border-bottom'>
                                <td className='pe-1'>Нэр:</td>
                                <td>{datas?.first_name}</td>
                            </tr>
                            <tr className='border-bottom'>
                                <td className='pe-1'>Регистрийн дугаар:</td>
                                <td>{datas?.register_num}</td>
                            </tr>
                            <tr className='border-bottom'>
                                <td className='pe-1'>Утасны дугаар:</td>
                                <td>{datas?.phone}</td>
                            </tr>
                            <tr className='border-bottom'>
                                <td className='pe-1'>Боловсролын зэрэг:</td>
                                <td>{datas?.degree_name}</td>
                            </tr>
                            <tr className='border-bottom'>
                                <td className='pe-1'>Мэргэжил:</td>
                                <td>{datas?.profession_name}</td>
                            </tr>
                            {
                                datas?.file_name &&
                                    <tr className='border-bottom'>
                                        <td className='pe-1'>Хавсралт файл:</td>
                                        <td>
                                            {
                                                <a
                                                    href={datas?.file}
                                                    className="me-2 text-primary text-decoration-underline"
                                                    target={"_blank"}
                                                >
                                                    {datas?.file_name}
                                                </a>
                                            }
                                        </td>
                                    </tr>
                            }
                            <tr>
                                <td className='pe-1'>Тайлбар:</td>
                                <td>{datas?.cause}</td>
                            </tr>
                        </tbody>
                    </table>
                </Col>
            </Row>
        </>
    )
}

function solveReply(datas) {
    const { t } = useTranslation()

    const columns = [
        {
            name: `№`,
            selector: (row, index) => index + 1,
            minWidth: "50px",
            maxWidth: "50px",
        },
        {
            header: 'shiidverleh_negj',
            name: `${t('Шийдвэрлэх нэгж')}`,
            selector: row => (
                <span>{row.unit_name}</span>
            ),
            minWidth: "250px",
            maxWidth: "250px",
        },
        {
            name: `${t('Хүсэлт огноо')}`,
            selector: row => row.date,
            minWidth: "180px",
            maxWidth: "180px",
        },
        {
            name: `${t('Шийдвэр')}`,
            selector: row => {
                return (
                    row.unit
                    ?
                        row.is_confirm
                        ?
                            <CheckSquare width={"15px"} color='green'/>
                        :
                            <XSquare width={"15px"} color='red'/>
                    :
                        <></>
                )
            },
            minWidth: "100px",
            maxWidth: "100px",
        },
        {
            name: `${t('Тайлбар')}`,
            selector: row => (
                <span className=''>{row?.message}</span>
            ),
            minWidth: "400px",
            maxWidth: "400px",
            wrap: true
        },
    ]

    return (
        <Col md={12} sm={12} className='my-2'>
            <hr/>
            <h6 className="form-label">
                {t('Өргөдөлд хариу илгээсэн бүртгэл')}
            </h6>
            <div className='react-dataTable react-dataTable-selectable-rows'>
                <DataTable
                    noHeader
                    className='react-dataTable'
                    noDataComponent={(
                        <div className="my-2"></div>
                    )}
                    columns={columns}
                    pagination={false}
                    data={datas}
                    fixedHeader
                    fixedHeaderScrollHeight='62vh'
                />
            </div>
        </Col>
    )
}

export default function SolvedModal({ open, handleModal, solveId, professionId, sdatas, isDetail, refreshDatas, unitId }) {

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)
    const { roleMenus } = useContext(RequestContext)

    const [ datas, setDatas ] = useState([])
    const [answerDatas, setAnswerDatas] = useState([])

    const [ allowIds, setAlowIds] = useState([])
    const [ acceptRadio, setAcceptRadio ] = useState(true)
    const [ declineRadio, setDeclineRadio ] = useState(false)
    const [ isAllow, setAllow] = useState(false)
    const [ message, setMessage] = useState('')

    const [lessonOption, setLessonOption] = useState([])

    console.log(sdatas)

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={() => {handleModal()}} />
    )

    const { isLoading, fetchData } = useLoader({})

    // API
    const correspondApi = useApi().request.correspond
    const planApi = useApi().study.plan
    const groupApi = useApi().student.group

    async function getCLessons() {
        const { success, data } = await fetchData(correspondApi.getLessonData(solveId))
        if(success)
        {
            setDatas(data)
        }
    }

    async function getGroupLessons() {
        const { success, data } = await groupApi.getLesson(sdatas?.now_group?.id)
        if (success) {
            setLessonOption(data)
        }
    }

    /** Дүйцүүлэх хичээлийн жагсаалт */
    // async function getLesson() {
    //     const { success, data } = await fetchData(planApi.getPlanFromProfession(professionId))
    //     if(success) {
    //         setLessonOption(data)
    //     }
    // }

    /** Дүйцүүлэх хүсэлтийн хариу  */
    async function getRequestAnswer() {
        const { success, data } = await fetchData(correspondApi.getAnswer(solveId))
        if(success) {
            setAnswerDatas(data)
        }
    }

    // Хүсэлт шийдвэрдэх
    async function onSubmit() {
        let date = new Date().toJSON().slice(0, 10);
        var datas = {
            'request': solveId,
            'position': user?.position_id,
            'is_confirm': acceptRadio,
            'c_lesson_ids': allowIds,
            'message': message,
            'date': date,
            'unit': unitId
        }

        datas = convertDefaultValue(datas)

        const { success } = await fetchData(correspondApi.postAnswer(datas, 'complaint3'))
        if(success) {
            handleModal()
            refreshDatas()
        }
    }

    useEffect(() => {
        getCLessons()
        // getLesson()
    }, [solveId, professionId])


    useEffect(
        () =>
        {
            if (sdatas?.now_group) {
                getGroupLessons()
            }
        },
        [sdatas]
    )

    useEffect(
        () =>
        {
            if(solveId) {
                getRequestAnswer()
            }

            var menus = roleMenus.find((c) => c.name === 'Хөтөлбөрийн багийн ахлагч')

            if (Object.keys(menus).length > 0 && menus?.is_solve && unitId === menus?.id) {
                setAllow(true)
            }
        },
        [solveId]
    )

    console.log(lessonOption)

    return (
        <Modal
            isOpen={open}
            toggle={handleModal}
            className={ `modal-dialog-centered modal-lg`}
            contentClassName="pt-0"
            scrollable={true}
            style={{maxWidth: '1000px', width: '100%'}}
        >
            <ModalHeader
                className="mb-1"
                toggle={handleModal}
                close={CloseBtn}
                tag="div"
            >
                <h5 className="modal-title">{t(isDetail ? '' : 'Дүнгийн дүйцүүлэлт хийх хүсэлт шийдвэрлэх')}</h5>
            </ModalHeader>
            <ModalBody className='pt-0 p-2'>
                {isDetail
                ?
                    detailRows(sdatas)
                :
                    sdatas?.file_name &&
                    <Row>
                        <Col md={6} sm={12}>
                            <Row tag="dl" className="mb-0">
                                <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                    Хавсралт файл:
                                </Col>
                                <Col tag="dd" sm="8" className="mb-1 ms-0">
                                    {sdatas?.file_name}
                                    <a href={sdatas?.file} className='ms-1'>
                                        <Download type="button" color='#1a75ff' width={'15px'}/>
                                    </a>
                                </Col>
                            </Row>
                        </Col>
                        <Col md={6} sm={12}>
                            <Row tag="dl" className="mb-0">
                                <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                    Тайлбар:
                                </Col>
                                <Col tag="dd" sm="8" className="mb-1">
                                    {sdatas?.cause}
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                }
                <Col md={12} sm={12} className='mt-1'>
                    <h6 htmlFor="c_lessons">{t('Дүйцүүлсэн хичээлүүд')}</h6>
                    <AddTable datas={datas} setDatas={setDatas} lessonOption={lessonOption} isSolved={true} isDetail={isDetail} setIds={setAlowIds} allowIds={allowIds} isAllow={isAllow} oldLessonOption={[]}/>
                </Col>
                {!isDetail &&
                    <Row className='mt-1' >
                        <Col md={6} sm={12}>
                            <Input
                                id="accept"
                                name='is_confirm'
                                bsSize="md"
                                type="radio"
                                defaultChecked={acceptRadio}
                                onClick={() => { setAcceptRadio(true); setDeclineRadio(false) }}
                            />
                            <Label className="form-label ms-1" for="accept">
                                {t('Зөвшөөрөх')}
                            </Label>
                        </Col>
                        <Col md={6} sm={12}>
                            <Input
                                id="decline"
                                name='is_confirm'
                                bsSize="md"
                                type="radio"
                                defaultChecked={declineRadio}
                                onClick={() => { setAcceptRadio(false); setDeclineRadio(true) }}
                            />
                            <Label className="form-label ms-1" for="decline">
                                    {t('Татгалзах')}
                            </Label>
                        </Col>
                        <Col md={12} sm={12} className='mt-1'>
                            <Label className="form-label" for="message">
                                {t('Шийдвэрийн тайлбар')}
                            </Label>
                            <Input
                                id="message"
                                bsSize="sm"
                                placeholder={t('Шийдвэрийн тайлбар')}
                                type="textarea"
                                rows={'4'}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </Col>
                        <Col md={12} className="mt-2">
                            <Button className="me-2" color="primary" type="submit" onClick={() => onSubmit()}>
                                {t('Зөвшөөрөх')}
                            </Button>
                            <Button color="secondary" type="reset" outline  onClick={handleModal}>
                                {t('Буцах')}
                            </Button>
                        </Col>
                    </Row>
                }
                {isDetail &&
                    solveReply(answerDatas)
                }
            </ModalBody>
        </Modal>
    )
}
