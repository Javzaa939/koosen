import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { ChevronsLeft, Download, User } from 'react-feather';
import { Badge, Col, Row } from 'reactstrap';

import { LuGoal } from "react-icons/lu";

import './style.scss'

function Details() {

    const param = useParams()
    const id = param?.student
	const elseltApi = useApi().elselt.admissionuserdata

	const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true, bg: 2, initValue: true});

    const [datas, setDatas] = useState()

	/* Жагсаалтын дата авах функц */
	async function getDatas() {

        const {success, data} = await fetchData(elseltApi.getOne(id))
        if(success) {
            setDatas(data)
        }
	}

    useEffect(() => {
        getDatas()
    }, [])

    function ftext(val) {

        if(val) {
            var text = val.split(`/`)[val.split('/').length - 1]

            var vdata = `${text?.substring(0, 27)}...${text?.substring(text?.length - 4)}`

            if(text.length > 30) {
                return vdata
            } else {
                return text
            }
        } else {
            return ''
        }

    }


    return (
        <div style={{ minHeight: '80dvh' }}>
            <div className='d-flex align-items-center' role='button' onClick={() => {window.close()}}>
                <ChevronsLeft size={18}/> Буцах
            </div>
            {isLoading ?
                Loader
                :
                <>
                    <Row>
                        <Col>
                            <div className='border shadow p-1 m-1 rounded-3'>
                                <div className=''>
                                    <div className='p-50'>
                                        <span className='text_prefixer'>Горилж буй мэргэжил:</span> {datas?.profession}
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className='border shadow p-1 m-1 rounded-3'>
                                <div className='d-flex justify-content-between'>
                                    <div className='d-flex align-items-end'>
                                        <User className='me-50'/>
                                        <span style={{ fontSize: 16 }}>
                                            Хувийн мэдээлэл
                                        </span>
                                    </div>
                                    <Badge
                                        className='d-flex align-items-center badge-glow p-0'
                                        pill
                                        color={`${datas?.state == 1 ? 'primary' : datas?.state == 2 ? 'success' : datas?.state == 3 ? 'danger' : 'primary'
                                        }`}
                                    >
                                        <span className='mx-75 mt-25'>
                                            {datas?.state_name}
                                        </span>
                                    </Badge>
                                </div>
                                <div className='mt-2'>
                                    <div className='p-50'>
                                        <span className='text_prefixer'>Овог: </span>{datas?.user?.last_name}
                                    </div>
                                    <div className='p-50'>
                                        <span className='text_prefixer'>Нэр: </span>{datas?.user?.first_name}
                                    </div>
                                    <div className='p-50'>
                                        <span className='text_prefixer'>Регистрийн дугаар</span>: {datas?.user?.register}
                                    </div>
                                    <div className='p-50'>
                                        <span className='text_prefixer'>Утасны дугаар</span>: {datas?.user?.mobile}
                                    </div>
                                    <div className='p-50'>
                                        <span className='text_prefixer'>Яаралтай холбогдох:</span> {datas?.user?.parent_mobile}
                                    </div>
                                    <div className='p-50'>
                                        <span className='text_prefixer'>Имейл:</span> {datas?.user?.email}
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col>
                            <div className='border shadow p-1 m-1 rounded-3'>
                                <div className='d-flex justify-content-between'>
                                    <div className='d-flex align-items-end'>
                                        <User className='me-50'/>
                                        <span style={{ fontSize: 16 }}>
                                            Мэдээлэл
                                        </span>
                                    </div>
                                </div>
                                <div className='mt-2'>
                                    <div className='p-50'>
                                        <span className='text_prefixer'>Төгссөн сургууль:</span> {datas?.userinfo?.graduate_school}
                                    </div>
                                    <div className='p-50'>
                                        <span className='text_prefixer'>Мэргэжил:</span> {datas?.userinfo?.graduate_profession}
                                    </div>
                                    <div className='p-50 d-flex align-items-center'>
                                        <span className='text_prefixer me-50'>Е-Монголиа дипломын хуулбар:</span>
                                        <span className='text-primary d-flex align-items-center' role='button' onClick={() => {window.open(`${process.env.REACT_APP_SERVER_URL}${datas?.userinfo?.emongolia_diplom_pdf}`)}}>
                                            {ftext(datas?.userinfo?.emongolia_diplom_pdf)} <Download className='ms-25' size={14}/>
                                        </span>
                                    </div>
                                    <div className='p-50'>
                                        <span className='text_prefixer'>Албан тушаал:</span> {datas?.userinfo?.position_name}
                                    </div>
                                    <div className='p-50'>
                                        <span className='text_prefixer'>Ажиллаж байгаа байгууллагын нэр:</span> {datas?.userinfo?.work_organization}
                                    </div>
                                    <div className='p-50'>
                                        <span className='text_prefixer'>Хэлтэс:</span> {datas?.userinfo?.work_heltes}
                                    </div>
                                    <div className='p-50'>
                                        <span className='text_prefixer'>Цол:</span> {datas?.userinfo?.tsol_name}
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </>
            }
        </div>
    )
}

export default Details
