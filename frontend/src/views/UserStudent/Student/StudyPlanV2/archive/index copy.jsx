import React, { useEffect, Fragment, useState, useContext } from 'react'

import { Clock } from 'react-feather'

import {
    Card,
    CardHeader,
    CardTitle,
    Spinner,
    Row,
    Col
} from 'reactstrap'

import CTable from "./Table"

import { useTranslation } from 'react-i18next'
import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import AuthContext from "@context/AuthContext"

const StudyPlan = () => {

    const { t } = useTranslation()

    const { user: userDetail } = useContext(AuthContext)

    const { isLoading, Loader, fetchData } = useLoader({})
    const [datas1, setSeason1] = useState([])
    const [datas2, setSeason2] = useState([])
    const [datas3, setSeason3] = useState([])
    const [datas4, setSeason4] = useState([])
    const [datas5, setSeason5] = useState([])
    const [datas6, setSeason6] = useState([])
    const [datas7, setSeason7] = useState([])
    const [datas8, setSeason8] = useState([])

    // API
    const studentPlanApi = useApi().student.learningplan

    // оюутны санал болгох сургалтын төлөвлөгөө
    async function getDatas() {
        const student_id = userDetail?.student?.id
        const { success, data } = await fetchData(studentPlanApi.get(student_id))
        if(success)
        {
            const season1 = data.filter(value => value.season === 1)
            setSeason1(season1)
            const season2 = data.filter(value => value.season === 2)
            setSeason2(season2)
            const season3 = data.filter(value => value.season === 3)
            setSeason3(season3)
            const season4 = data.filter(value => value.season === 4)
            setSeason4(season4)
            const season5 = data.filter(value => value.season === 5)
            setSeason5(season5)
            const season6 = data.filter(value => value.season === 6)
            setSeason6(season6)
            const season7 = data.filter(value => value.season === 7)
            setSeason7(season7)
            const season8 = data.filter(value => value.season === 8)
            setSeason8(season8)
        }

    }

    useEffect(() => {
        getDatas()
    }, [])

    return (
        <Fragment>
            <Card>
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle><Clock color="grey" className='me-1'/>{t('Санал болгох сургалтын төлөвлөгөө')}</CardTitle>
                </CardHeader>
                {
                    isLoading
                    ?
                        <div className="my-2 text-center" sm={12}>
                            <Spinner size='sm' />
                            <span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
                        </div>
                    :
                        <>
                            <Row className="m-1">
                                <Col md={6}>
                                    <CTable
                                        datas={datas1}
                                        title={'1A улирал'}
                                    />
                                </Col>
                                <Col md={6}>
                                    <CTable
                                        datas={datas2}
                                        title={'1B улирал'}
                                    />
                                </Col>
                            </Row>
                            <Row className="m-1">
                                <Col md={6}>
                                    <CTable
                                        datas={datas3}
                                        title={'2A улирал'}
                                    />
                                </Col>
                                <Col md={6}>
                                    <CTable
                                        datas={datas4}
                                        title={'2B улирал'}
                                    />
                                </Col>
                            </Row>
                            <Row className="m-1">
                                <Col md={6}>
                                    <CTable
                                        datas={datas5}
                                        title={'3A улирал'}
                                    />
                                </Col>
                                <Col md={6}>
                                    <CTable
                                        datas={datas6}
                                        title={'3B улирал'}
                                    />
                                </Col>
                            </Row>
                            <Row className="m-1">
                                <Col md={6}>
                                    <CTable
                                        datas={datas7}
                                        title={'4A улирал'}
                                    />
                                </Col>
                                <Col md={6}>
                                    <CTable
                                        datas={datas8}
                                        title={'4B улирал'}
                                    />
                                </Col>
                            </Row>
                        </>
                }
            </Card>
        </Fragment>
    )

}

export default StudyPlan
