// ** React Imports
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'

import { Col, Row } from 'reactstrap'
import ExamFilter from '../helpers/ExamFilter'
import './style.scss'

export default function ReportPieChart() {
    // states
    const [selectedExam, setSelectedExam] = useState('')
    const [datas, setDatas] = useState([])

    const { t } = useTranslation()
    const { isLoading, Loader, fetchData } = useLoader({ isFullScreen: true })
    const challengeApi = useApi().challenge

    async function getDatas() {
        const { success, data } = await fetchData(challengeApi.getReport({report_type: 'reliability', exam: selectedExam}))

        if (success) {
            setDatas(data)
        }
    }

    const CustomTooltip = data => {
        if (data.active && data.payload) {

            return (
                <div className='recharts_custom_tooltip shadow p-2 rounded-3'>
                    <p className='fw-bold mb-0'>{data.payload[0]['name']}</p>
                    <hr />
                    <div className='active'>
                        <div className='d-flex align-items-center'>
                            <span
                                className='bullet bullet-sm bullet-bordered me-50'
                                style={{
                                    backgroundColor: 'black'
                                }}
                            ></span>
                            <span className='text-capitalize me-75'>
                                {t('Нийт асуултын тоо')} : {data.payload[0]['value']}
                            </span>
                        </div>
                        {data.payload.map(i => i.payload['questions'].sort((a, b) => b.question_reliability - a.question_reliability).map((question, index) =>
                            <div key={index}>
                                <span
                                    className='bullet bullet-sm bullet-bordered me-50'
                                    style={{
                                        backgroundColor: i?.payload?.fill ? i.payload?.fill : '#000'
                                    }}
                                ></span>
                                <span key={index} className='text-capitalize me-75'>
                                    {Math.round(question.question_reliability)}% : {question.question_text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }

        return null
    }

    useEffect(() => {
        if (selectedExam) getDatas()
    }, [selectedExam])

    return (
        <div className='px-1'>
            <div className='d-flex justify-content-center' style={{ fontWeight: 900, fontSize: 16 }}>
                {t('Найдвартай байдал')}
            </div>
            {isLoading && Loader}
            <Row>
                <Col md={3} sm={10}>
                    <ExamFilter setSelected={setSelectedExam} />
                </Col>
            </Row>
            <div className='recharts-wrapper pie-chart' style={{ height: '400px' }}>
                <ResponsiveContainer>
                    <PieChart width={400}>
                        <Pie
                            data={datas?.length ? datas : []}
                            dataKey='questions_count'
                            nameKey='questions_reliability_name'
                            cx="50%"
                            cy="50%"
                            outerRadius={150}
                            fill="#8884d8"
                            label
                        >
                            <Cell fill='#4287f5' />
                            <Cell fill='#dc8ee6' />
                            <Cell fill='#b76a29' />
                            <Cell fill='#73b53d' />
                            <Cell fill='#d14949' />
                        </Pie>
                        <Tooltip content={CustomTooltip} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
