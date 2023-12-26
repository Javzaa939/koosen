import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardTitle, Col, Row } from 'reactstrap'

import { Book, BookOpen, Feather, User, Users } from 'react-feather'
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import './style.scss'
import { sampledata } from './sample'

function Dashboard() {

    const datas = sampledata
    const parentschoolApi = useApi().dashboard
	const { fetchData } = useLoader({})

    const [ info, setInfo ] = useState({})

    async function getDatas() {
        const {success, data} = await fetchData(parentschoolApi.get())
        if(success) {
            setInfo(data)
        }
    }

    useEffect(() => {
        getDatas()
    },[])

    console.log(datas)
    console.log(info,'info')
    console.log(info,'info')
    console.log(info,'info')
    console.log(info,'info')
    return (
        <Card>
            <CardTitle>
                <h3 className='p-1 pb-0'>
                    Хянах самбар
                </h3>
            </CardTitle>
            <div className='p-1 pt-0'>
                <Row>
                    <Col className='p-1'>
                        <div className='dashcard' style={{ backgroundColor: '#fc70ea12' }}>
                            <div>
                                <div className='text-nowrap'>
                                    Нийт оюутнууд
                                </div>
                                <div className='numberstyle'>
                                    {datas?.total_students}
                                </div>
                            </div>
                            <div className='p-1' style={{ color: '#fc70ea'}}>
                                <User/>
                            </div>
                        </div>
                    </Col>
                    <Col className='p-1'>
                        <div className='dashcard' style={{ backgroundColor: '#469df412'}}>
                            <div>
                                <div>
                                    Бакалавр
                                </div>
                                <div className='numberstyle'>
                                    {datas?.bakalavr}
                                </div>
                            </div>
                            <div className='p-1' style={{ color: '#469df4' }}>
                                <Feather/>
                            </div>
                        </div>
                    </Col>
                    <Col className='p-1'>
                        <div className='dashcard' style={{ backgroundColor: '#f4a04612'}}>
                            <div>
                                <div>
                                    Магистр
                                </div>
                                <div className='numberstyle'>
                                    {datas?.magistr}
                                </div>
                            </div>
                            <div className='p-1' style={{ color: '#f4a046'}}>
                                <Book/>
                            </div>
                        </div>
                    </Col>
                    <Col className='p-1'>
                        <div className='dashcard' style={{ backgroundColor: '#00ff2a1a'}}>
                            <div>
                                <div>
                                    Доктор
                                </div>
                                <div className='numberstyle'>
                                    {datas?.doktor}
                                </div>
                            </div>
                            <div className='p-1' style={{ color: '#48cf00'}}>
                                <BookOpen/>
                            </div>
                        </div>
                    </Col>
                    <Col className='p-1'>
                        <div className='dashcard' style={{ backgroundColor: '#fe4d4d1a'}}>
                            <div>
                                <div>
                                    Нийт багш нар
                                </div>
                                <div className='numberstyle'>
                                    {datas?.total_workers}
                                </div>
                            </div>
                            <div className='p-1' style={{ color: '#ea4949' }}>
                                <Users/>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
            <div className='p-1'>
                test
                <button onClick={() => {getDatas();console.log(sampledata,'sample')}}>GET</button>
            </div>
        </Card>
    )
}

export default Dashboard