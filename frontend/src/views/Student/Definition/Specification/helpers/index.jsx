
import React, { useState } from 'react';

import { Card, Row, Col, Button, Input, Label } from 'reactstrap'
import { useNavigate } from 'react-router-dom';

import Avatar from "@components/avatar"

import { t } from 'i18next';

import SumModal from './SumModal';
import ScoreModal from './ScoreModal';

export function getColumns (currentPage, rowsPerPage, total_count)
{
	const page_count = Math.ceil(total_count / rowsPerPage)

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count)
    {
        currentPage = 1
    }

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			header: 'code',
			name: t("Оюутны код"),
			selector: (row) => (row?.code),
            sortable: true,
			minWidth: "80px",
			center: true
		},
		{
			header: 'full_name',
			name: t("Овог Нэр"),
			selector: (row) => `${row?.first_name} ${row?.last_name}`,
            sortable: true,
			center: true
        },
		{
			header: 'register_num',
			name: t("Регистрийн дугаар"),
			selector: (row) => row?.register_num,
            sortable: true,
			center: true
        },
        {
			header: 'group',
			name: t("Анги"),
			selector: (row) => row?.group_name,
            sortable: true,
			center: true
        },
	]
    return columns
}

export function ExpandedComponent({ data })
{
    /** State */
    const [ sumModalOpen, setSumModalOpen ] = useState(false)
    const [ sumModalData, setSumModalData ] = useState({})

    const [ scoreModal, setScoreModal ] = useState(false)
    const [ scoreModalData, setScoreModalData ] = useState({})

    const navigate = useNavigate()

    async function handleRequestSum(studentId)
    {
		setSumModalOpen(!sumModalOpen)
		setSumModalData(studentId)
	}

    async function handleScoreModal(studentId)
    {
		setScoreModal(!scoreModal)
		setScoreModalData(studentId)
	}

    return (
        <Card className='mb-0 rounded-0 border-bottom'>
            <Row className='w-100' >
                <Col md={6} className='' >
                    <div className='d-flex'>
                        <div className='p-1'>
                            {
                                data.image
                                ?
                                    <Avatar
                                        img={data.image}
                                        size='xl'
                                        className='pe-none'
                                    />
                                :
                                    <Avatar
                                        initials
                                        color = {'light-success'}
                                        content = {data?.first_name || ''}
                                        contentStyles = {{
                                            borderRadius: 0,
                                        }}
                                        size='xl'
                                        className='pe-none'
                                    />
                            }
                        </div>
                        <div className='p-1'>
                            <h6>Нэр: {data?.first_name}</h6>
                            <h6>Код: {data?.code}</h6>
                            <h6>Регистрийн дугаар: {data?.register_num}</h6>
                            <h6>Анги: {data?.group_name}</h6>
                        </div>
                    </div>
                </Col>
                <Col md={6} className='p-0 mt-2 ps-1' >
                    <Button
                        size='sm'
                        className='ms-50 mb-50'
                        color='primary'
                        onClick={() => navigate('/student/learning-true', { state: data.id })}
                    >Тодорхойлолт</Button>
                    <Button
                        size='sm'
                        className='ms-50 mb-50'
                        color='primary'
                        onClick={() => handleRequestSum(data.id)}
                    >Голч дүн</Button>
                    <Button
                        size='sm'
                        className='ms-50 mb-50'
                        color='primary'
                        // onClick={() => navigate('/student/amount-details', { state: data.id })}
                        onClick={() => handleScoreModal(data.id)}
                    >Дүнгийн дэлгэрэнгүй</Button>
                    <Button
                        size='sm'
                        className='ms-50 mb-50'
                        color='primary'
                        onClick={() => navigate('/student/credit-calculation', { state: data.id })}
                    >Судлах кредитийн тооцоо дэд цэс үүсгэх</Button>
                </Col>
            </Row>
            { sumModalOpen && <SumModal isOpen={sumModalOpen} handleModal={handleRequestSum} datas={sumModalData} /> }
            { scoreModal && <ScoreModal isOpen={scoreModal} handleModal={handleScoreModal} studentId={scoreModalData} /> }
        </Card>
    )
}
