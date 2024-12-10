// ** React Imports
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import Select from 'react-select'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'

import './style.scss'
import { Col, Label, Row } from 'reactstrap'
import { ReactSelectStyles } from '@src/utility/Utils'

const List = () => {
    const { t } = useTranslation()
    const [datas, setDatas] = useState([])
    const { isLoading, Loader, fetchData: allFetch } = useLoader({ isFullScreen: true })
    const challengeApi = useApi().challenge

    async function getDatas() {
        const { success, data } = await allFetch(challengeApi.getReport(1))

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
        getDatas()
        getExams()
    }, [])

    // #region exam selection code
    const [examOption, setExamOption] = useState([])
    const [selectedExam, setSelectedExam] = useState('')

    async function getExams() {
        const { success, data } = await allFetch(challengeApi.get(1, 10000000, '', '', '', '', true))

        if (success) {
            setExamOption(data?.results)
        }
    }
    // #endregion

    return (
        <div className='px-1'>
            <div className='d-flex justify-content-center' style={{ fontWeight: 900, fontSize: 16 }}>
                {t('Найдвартай байдал')}
            </div>
            {isLoading && Loader}
            <Row>
                <Col md={3} sm={10}>
                    <Label className="form-label" for="exam">
                        {t('Шалгалт')}
                    </Label>
                    <Select
                        id="exam"
                        name="exam"
                        isClearable
                        classNamePrefix='select'
                        className='react-select'
                        placeholder={`-- Сонгоно уу --`}
                        options={examOption || []}
                        noOptionsMessage={() => 'Хоосон байна'}
                        onChange={(val) => {
                            setSelectedExam(val?.id || '')
                        }}
                        styles={ReactSelectStyles}
                        getOptionValue={(option) => option.id}
                        getOptionLabel={(option) => option.title}
                    />
                </Col>
            </Row>
            <div className='recharts-wrapper pie-chart' style={{ height: '400px' }}>
                <ResponsiveContainer>
                    <PieChart width={400}>
                        <Pie
                            data={datas?.length ? datas.find(item => item.exam_id === selectedExam)?.questions_reliabilities : []}
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

export default memo(List);
