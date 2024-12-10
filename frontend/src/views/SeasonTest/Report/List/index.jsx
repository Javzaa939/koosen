// ** React Imports
import { Fragment, memo, useEffect, useState } from 'react'

import {
    Card
} from 'reactstrap'

import { useTranslation } from 'react-i18next'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'

const List = () => {
    const { t } = useTranslation()

    const [datas, setDatas] = useState([])

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    const { isLoading, Loader, fetchData: allFetch } = useLoader({ isFullScreen: true })

    // Api
    const challengeApi = useApi().challenge

    useEffect(() => {
        getDatas()
    }, [sortField, currentPage])

    async function getDatas() {
        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        const { success, data } = await allFetch(challengeApi.getReport(1))

        if (success) {console.log(data)
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    const CustomTooltip = data => {
        if (data.active && data.payload) {

            return (
                <div className='recharts_custom_tooltip shadow p-2 rounded-3'>
                    <p className='fw-bold mb-0'>{data.label}</p>
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
                                {t('Нийт')} : {data.payload['question_reliability']}%
                            </span>
                        </div>
                        {data.payload.map(i => {

                            return (
                                <div className='d-flex align-items-center' key={i.dataKey}>
                                    <span
                                        className='bullet bullet-sm bullet-bordered me-50'
                                        style={{
                                            backgroundColor: i?.fill ? i.fill : '#fff'
                                        }}
                                    ></span>
                                    <span className='text-capitalize me-75'>
                                        {/* TODO: add percent displaying of question reliability value */}
                                        {t('Асуулт')} : {i.payload[i.dataKey]} ({}%)
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )
        }

        return null
    }

    return (
        <div className='px-1'>
            <div className='d-flex justify-content-center' style={{ fontWeight: 900, fontSize: 16 }}>
                {t('Найдвартай байдал')}
            </div>
            {isLoading && Loader}
            <div className='recharts-wrapper pie-chart' style={{ height: '600px' }}>
                <ResponsiveContainer>
                    <PieChart width={400} height={400}>
                        <Pie
                        data={datas?.questions_reliabilities}
                        dataKey='questions_count'
                        nameKey='questions_reliability_name'
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        fill="#8884d8"
                        label>
                            <Cell fill='#4287f5' />
                            <Cell fill='#dc8ee6' />
                            <Cell fill='#b76a29' />
                            <Cell fill='#73b53d' />
                            <Cell fill='#d14949' />
                        </Pie>
                        <Tooltip content={CustomTooltip} cursor={{ fill: 'rgba(148, 148, 148, 0.1)' }} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default memo(List);
