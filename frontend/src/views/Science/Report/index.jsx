
import { useState, useEffect } from "react"
import {
    Card,
    CardTitle,
    CardHeader,
    CardSubtitle,
    Badge,
    CardBody,
    Input
} from 'reactstrap'
import { Bar } from 'react-chartjs-2'
import { ArrowDown, ArrowUp } from "react-feather"

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import 'chart.js/auto'


export default function ScienceReport()
{
    // Loader && Api's
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true })
    const scienceApi = useApi().science

    // States
    const [ year, setYear ] = useState(new Date().getFullYear())
    const [ data, setData ] = useState({})

    async function scienceGetReport()
    {
        const { success, data } = await fetchData(scienceApi.report.get(year))
        if(success)
        {
            setData(data)
        }
    }

    useEffect(
        () =>
        {
            scienceGetReport()
        },
        [year]
    )

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500 },
        scales: {
            x: {
                grid: {
                    color: 'rgba(200, 200, 200, 0.2)',
                    borderColor: 'rgba(200, 200, 200, 0.2)'
                },
                ticks: { color: '#b4b7bd' }
            },
            y: {
                min: 0,
                max: Math.max(data.user_paper_count, data.user_note_count, data.user_project_count, data.user_invent_count, data.user_quot_count, data.graduation_work_count, data.user_patent_count) || 10,
                grid: {
                    color: 'rgba(200, 200, 200, 0.2)',
                    borderColor: 'rgba(200, 200, 200, 0.2)'
                },
                ticks: {
                    stepSize: 10,
                    color: '#b4b7bd'
                }
            }
        },
        plugins: {
          legend: { display: false }
        }
    }

    const chartData = {
        labels: [
            'Өгүүлэл',
            'Илтгэл',
            'Төсөл хөтөлбөр',
            'Бүтээл',
            'Эшлэл',
            'Оюутан удирдсан байдал',
            'Оюуны өмчийн байдал'
        ],
        datasets: [
            {
                maxBarThickness: 15,
                backgroundColor: '#28dac6',
                borderColor: 'transparent',
                borderRadius: { topRight: 15, topLeft: 15 },
                data: [data.user_paper_count, data.user_note_count, data.user_project_count, data.user_invent_count, data.user_quot_count, data.graduation_work_count, data.user_patent_count]
            }
        ]
    }

    return (
        <Card className="mt-2">
            {isLoading && Loader}
            <CardHeader className='d-flex flex-sm-row flex-column justify-content-md-between align-items-start justify-content-start border-bottom'>
                <div>
                    <CardTitle className='mb-75' tag='h4'>
                        Эрдэм шинжилгээний тайлан ({year} он)
                    </CardTitle>
                    <CardSubtitle className='text-muted'>Эрдэм шинжилгээний төрлүүдийн жилд нэмэгдсэн тоо</CardSubtitle>
                </div>
                <div className='d-flex align-items-center mt-sm-0 mt-1'>
                    <Input
                        type='number'
                        id='input-small-horizontal'
                        bsSize='sm'
                        placeholder='Хайх он'
                        onKeyDown={(e) => (["e", "E", "+", "-", "."].includes(e.key)) && e.preventDefault()}
                        onChange={(e) => (e.target.value.length == 4) && setYear(e.target.value)}
                    />
                    <h5 className='fw-bolder mb-0 mx-1'>Нийт({data?.all_count})</h5>
                    <Badge color='light-secondary'>
                        {
                            data && data?.is_grew_up
                            ?
                                <>
                                    Өмнөх оноос: <ArrowUp size={13} className='text-success' />
                                </>
                            :
                                <>
                                    Өмнөх оноос: <ArrowDown size={13} className='text-danger' />
                                </>
                        }
                        <span className='align-middle ms-25'>{data?.difference}</span>
                    </Badge>
                </div>
            </CardHeader>
            <CardBody className="mx-0 mt-1">
                <Bar data={chartData} options={options} height={400} />
            </CardBody>
        </Card>
    )
}
