import React, { useEffect, Fragment, useState, useContext } from 'react'

import { Activity, AlertCircle, Check, Clock, ExternalLink, FileText, X } from 'react-feather'

import {
    Card,
    CardHeader,
    CardTitle,
    Spinner,
    Badge,
    Table,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Alert
} from 'reactstrap'


import { useTranslation } from 'react-i18next'
import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import AuthContext from "@context/AuthContext"
import { Popover } from '@mui/material';

import './style.scss'
import useModal from '@src/utility/hooks/useModal'
import ActiveYearContext from '@src/utility/context/ActiveYearContext'

const StudyPlan = () => {

    const studentPlanApi = useApi().userStudent.student.learningplan
    const getLessonApi = useApi().student.lessondetail

    const { t } = useTranslation()

    const { userDetail } = useContext(AuthContext)
    const { cyear_name } = useContext(ActiveYearContext)

    const {
        isLoading,
        isLoading: lessonLoading,
        fetchData,
        fetchData: lessonFetch
    } = useLoader({})

    const { showWarning } = useModal()

    const [mainData, setMainData] = useState([])
    const [datas, setDatas] = useState([])
    const [lessonid, setLessonid] = useState(null)
    const [lessonDetailExtraData, setLessonDetailExtraData] = useState(null)
    const [lesson, setLesson] = useState({})

    const join_year = userDetail?.student?.group?.join_year
    let splitted_year = join_year?.split('-')
    let year1 = parseInt(splitted_year?.[0]);
    let year2 = parseInt(splitted_year?.[1]);

    async function getLesson() {
        const { success, data } = await lessonFetch(getLessonApi.get(lessonid))
        if (success) {
            setLesson(data)
        }
    }

    // оюутны санал болгох сургалтын төлөвлөгөө
    async function getDatas() {
        const student_id = userDetail?.student?.id
        const { success, data } = await fetchData(studentPlanApi.get(student_id))
        if (success) {
            setMainData(data)
            const season1 = data.filter(value => value.season === 1)
            const season2 = data.filter(value => value.season === 2)
            const season3 = data.filter(value => value.season === 3)
            const season4 = data.filter(value => value.season === 4)
            const season5 = data.filter(value => value.season === 5)
            const season6 = data.filter(value => value.season === 6)
            const season7 = data.filter(value => value.season === 7)
            const season8 = data.filter(value => value.season === 8)

            const kurs1 = [season1, season2]
            const kurs2 = [season3, season4]
            const kurs3 = [season5, season6]
            const kurs4 = [season7, season8]
            setDatas([
                kurs1,
                kurs2,
                kurs3,
                kurs4,
            ])
        }
    }

    useEffect(() => {
        getDatas();
    }, [])

    const getBadge = (status, is_taken) => {
        if (status == 1) {
            return (
                <Badge color="light-success" pill>
                    <Check />
                </Badge>
            )
        } else if (status == 2) {
            return (
                <Badge color="light-danger" pill>
                    <X />
                </Badge>
            )
        } else if (status == 4) {
            return (
                <Badge color="light-warning" pill>
                    <AlertCircle />
                </Badge>
            )
        } else if (status == 5) {
            return (
                <Badge color="light-info" pill>
                    <AlertCircle />
                </Badge>
            )
        } else {
            return (
                <Badge color="light-primary" pill>
                    <Activity />
                </Badge>
            )
        }
    }

    const BASIC = 1
    const PROF_BASIC = 2
    const PROFESSION = 3

    function calculateKreditSum(data) {
        let sum = 0;
        for (const item of data) {
            if (item.lesson && item.lesson.kredit) {
                sum += item.lesson.kredit;
            }
        }
        return sum;
    }


    // popover config
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event, id, data) => {
        setAnchorEl(event.currentTarget);
        setLessonid(id)
        setLessonDetailExtraData(data)
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    // Modal config
    const [lessonModal, setLessonModal] = useState(false);

    const togglelessondetail = () => {
        setLessonModal(!lessonModal);
        if (lessonModal) {
            setLessonDetailExtraData(null);
            setLessonid(null)
        }
    }

    async function retake(year, season) {
        const { success } = await fetchData(studentPlanApi.retake({lesson_id: lessonid, data: {year: year, season: season}}))

        if (success) {
            togglelessondetail()
            getDatas()
        }
    }

    return (
        <Fragment>
            <Card>
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle><Clock color="grey" className='me-1' />{t('Хичээлийн төлөвлөгөө')}</CardTitle>
                </CardHeader>
                <Alert className='p-1' color='primary'>
                    <span>Энэ жагсаалтаас унасан хичээлээ өвөл зуны сургалтад үзэх боломжтой болно.</span>
                    <br/>
                    <span>Унасан хичээл дээрээ дарж мэдээлэл цэс дээр дараад Дахин үзэх товч дээр дарж хүсэлт илгээх боломжтой.</span>
                </Alert>
                <div className='m-2 mb-0'>
                    <Badge className='m-50' color='light-success'> <Check className='me-25' />{t('Үзсэн хичээл')}</Badge>
                    <Badge className='m-50' color='light-danger'> <X className='me-25' />{t('Үзээгүй')}</Badge>
                    <Badge className='m-50' color='light-primary'> <Activity className='me-25' />{t('Үзэж байгаа')}</Badge>
                    <Badge className='m-50' color='light-warning'> <AlertCircle className='me-25' />{t('Унасан')}</Badge>
                    <Badge className='m-50' color='light-info'> <AlertCircle className='me-25' />{t('Үзэхээр төлөвлөсөн')}</Badge>
                </div>

                {isLoading ? <div className='d-flex justify-content-center align-items-center' style={{ height: 300 }}><Spinner /></div>
                    :
                    <Table className='m-2' size='sm' bordered responsive>
                        <thead>
                            <tr>
                                <th></th>
                                <th>{t('Улирал')}</th>
                                <th>{t('Хичээл')}</th>
                            </tr>
                        </thead>
                        <tbody className='plantabledark'>
                            {datas.map((data, midx) => {

                                let result = (year1 + midx) + '-' + (year2 + midx);

                                // Нийт кредит тооцох функц
                                const kreditSum0 = calculateKreditSum(data[0]);
                                const kreditSum1 = calculateKreditSum(data[1]);
                                const yearKredit = kreditSum0 + kreditSum1

                                return (
                                    <Fragment key={`master${midx}`}>
                                        <tr>
                                            <th rowSpan={3} className='rotate'><div>{t('Хичээлийн жил')} {result}</div></th>
                                        </tr>
                                        <tr className='p-0'>
                                            <td className='p-0' width={150}>
                                                <div className='m-1'>
                                                    <div className='font-weight-bold'>
                                                        <b>{t('НАМРЫН УЛИРАЛ')}</b>
                                                    </div>
                                                    <div style={{ fontSize: 12 }}>
                                                        {t('Кредит')}: {kreditSum0}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='d-flex'>
                                                {data[0].length > 0 &&

                                                    data[0].map((data, index) => {
                                                        return (
                                                            <div key={midx + 'text' + index} className={`m-1 pb-1 rounded-4
                                                                ${data.last_retake_year_season && cyear_name === result ? 'cardmastergreen' :
                                                                    data.lesson_level === BASIC ? 'cardmasterdarkerblue' :
                                                                        data.lesson_level === PROF_BASIC ? 'cardmasterblue' :
                                                                            data.lesson_level === PROFESSION ? 'cardmasterorange' :
                                                                                'cardmasterdark'
                                                                }
                                                        `} style={{ fontSize: 12 }}>

                                                                <div className='d-flex justify-content-end my-50 me-50'> {getBadge(data?.status)} </div>
                                                                <div className='cardbody mb-1 rounded-4 px-1 p-1' aria-describedby={data.id} variant="contained" onClick={(event) => handleClick(event, data?.lesson?.id, {
                                                                    total_score: data?.status === 4 ? data?.total_score : null,
                                                                    status: data?.status,
                                                                    retake_year_season: data?.last_retake_year_season,
                                                                    year: result,
                                                                    season: 'Намар',
                                                                })} style={{ height: 160, width: 150 }}>
                                                                    <div className='d-flex justify-content-between align-items-center'>
                                                                        <div>{data?.lesson?.code}</div> <Badge className='p-25 pb-50' color='primary'>{data?.lesson?.kredit}{t('кр')}</Badge>
                                                                    </div>
                                                                    <div>
                                                                        {data?.lesson?.name}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div>
                                                    <b>{t('Хаврын улирал')}</b>
                                                </div>
                                                <div style={{ fontSize: 12 }}>
                                                    {t('Кредит')}: {kreditSum1}
                                                </div>
                                            </td>
                                            <td className='d-flex'>

                                                {data[1].length > 0 &&

                                                    data[1].map((data, index) => {
                                                        return (
                                                            <div key={midx + 'text' + index} className={`m-1 pb-1 rounded-4
                                                                ${data.last_retake_year_season && cyear_name === result ? 'cardmastergreen' :
                                                                    data.lesson_level === BASIC ? 'cardmasterdarkerblue' :
                                                                        data.lesson_level === PROF_BASIC ? 'cardmasterblue' :
                                                                            data.lesson_level === PROFESSION ? 'cardmasterorange' :
                                                                                'cardmasterdark'
                                                                }
                                                    `} style={{ fontSize: 12 }}>
                                                                <div className='d-flex justify-content-end my-50 me-50'> {getBadge(data?.status)} </div>
                                                                <div className='cardbody mb-1 rounded-4 px-1 p-1' aria-describedby={data.id} variant="contained" onClick={(event) => handleClick(event, data?.lesson?.id, {
                                                                    total_score: data?.status === 4 ? data?.total_score : null,
                                                                    status: data?.status,
                                                                    retake_year_season: data?.last_retake_year_season,
                                                                    year: result,
                                                                    season: 'Хавар',
                                                                })} style={{ height: 160, width: 150 }}>
                                                                    <div className='d-flex justify-content-between align-items-center'>
                                                                        <div>{data?.lesson?.code}</div> <Badge className='p-25 pb-50' color='primary'>{data?.lesson?.kredit}{t('кр')}</Badge>
                                                                    </div>
                                                                    <div>
                                                                        {data?.lesson?.name}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={6}>
                                                <div className='d-flex'>
                                                    <div className='mx-1'>
                                                        {t('Жилийн кредит')}: {yearKredit}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </Fragment>
                                )
                            })}

                            {/* Popover and Modal */}

                            <Popover
                                id={id}
                                open={open}
                                anchorEl={anchorEl}
                                onClose={handleClose}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                            >
                                <div className='rounded-4'>
                                    <div className='p-50 cursor-pointer hoverglass' onClick={() => { togglelessondetail(), handleClose(), getLesson() }} style={{ fontSize: 13 }}> <FileText style={{ width: 16 }} /> {t('Мэдээлэл')}</div>
                                    {/* <div className='p-1 cursor-pointer hoverglass' onClick={() => {alertTest()}}><GitBranch/>Уялдаа</div> */}
                                </div>
                            </Popover>

                            <Modal
                                isOpen={lessonModal}
                                toggle={togglelessondetail}
                                style={{ maxWidth: '900px', width: '100%', display: 'flex', alignItems: 'start' }}
                            >
                                {lessonLoading ?
                                    <ModalBody className='d-flex justify-content-center align-items-center p-5 m-5'><Spinner /></ModalBody>
                                    :
                                    <>
                                        <ModalHeader toggle={togglelessondetail}>{t('Хичээлийн дэлгэрэнгүй')}</ModalHeader>
                                        <ModalBody>
                                            <div>
                                                <div className='d-flex justify-content-between mb-2'>
                                                    <div className='p-1 rounded-3 border shadow me-50'>
                                                        <div className="d-flex justify-content-start" style={{ fontSize: 12, fontWeight: 700 }}>{t('Тэнхим')}</div>
                                                        <div>{lesson?.department?.name}</div>
                                                    </div>
                                                    <div className='p-1 rounded-3 border shadow ms-50'>
                                                        <div className="d-flex justify-content-end" style={{ fontSize: 12, fontWeight: 700 }}>{t('Салбар сургууль')}</div>
                                                        <div><a href={lesson?.school?.web} target='_blank'><ExternalLink style={{ width: 16 }} className='me-50' /></a>{lesson?.school?.name}</div>
                                                    </div>
                                                </div>
                                                <div className='m-2 border p-2 shadow'>
                                                    <div className='d-flex flex-wrap justify-content-center'>
                                                        <div className='p-1 w-100 d-flex justify-content-center align-items-center flex-column' style={{ minWidth: 150 }}>
                                                            <b>{t('Хичээлийн нэр')}:</b> <div>{lesson?.name}</div>
                                                        </div>
                                                        {lesson?.name_eng &&
                                                            <div className='p-1 w-100 d-flex justify-content-center align-items-center flex-column' style={{ minWidth: 150 }}>
                                                                <b>Lesson name/English/:</b> <div>{lesson?.name_eng}</div>
                                                            </div>
                                                        }
                                                        <div className='p-1' style={{ minWidth: 150 }}>
                                                            {
                                                               lessonDetailExtraData?.status == 5
                                                               &&
                                                                <b className='text-info'>Үзэхээр төлөвлсөн</b>
                                                            }

                                                        </div>

                                                        <div className='p-1' style={{ minWidth: 150 }}>

                                                            <b>{t('Кредит')}:</b> {lesson?.kredit}
                                                        </div>
                                                        <div className='p-1' style={{ minWidth: 150 }}>

                                                            <b>{t('Код')}:</b> {lesson?.code}
                                                        </div>
                                                        {
                                                            lessonDetailExtraData?.total_score &&
                                                            <div className='p-1' style={{ minWidth: 150 }}>

                                                                <b>{t('Нийт оноо')}:</b> {lessonDetailExtraData?.total_score}
                                                            </div>
                                                        }
                                                    </div>
                                                    <div>
                                                        {lesson?.skill &&
                                                            <div className='p-1'>
                                                                <b className='me-50'>{t('Эзэмших ур чадвар')}:</b>
                                                                {lesson?.skill}
                                                            </div>
                                                        }
                                                        {lesson?.knowledge &&
                                                            <div className='p-1'>
                                                                <b className='me-50'> {t('Мэдлэг')}:</b>
                                                                {lesson?.knowledge}
                                                            </div>
                                                        }

                                                    </div>
                                                </div>
                                            </div>
                                        </ModalBody>
                                        <ModalFooter>
                                            {lessonDetailExtraData?.status === 4 &&
                                                <Button color="primary" onClick={
                                                    () => showWarning({
                                                        header: {
                                                            title: t('Дахин үзэх'),
                                                        },
                                                        question: t(`Та энэ хичээлийг дахин үзэхдээ итгэлтэй байна уу?`),
                                                        onClick: () => retake(lessonDetailExtraData?.year, lessonDetailExtraData?.season),
                                                        btnText: t('Тийм'),
                                                    })
                                                }
                                                    disabled={lessonDetailExtraData?.retake_year_season ? true : false}
                                                >
                                                    {t('Дахин үзэх')}
                                                </Button>
                                            }
                                            <Button color="secondary" onClick={togglelessondetail}>
                                                {t('Хаах')}
                                            </Button>
                                        </ModalFooter>
                                    </>
                                }

                            </Modal>
                        </tbody>
                    </Table>
                }
            </Card>
        </Fragment>
    )
}

export default StudyPlan


