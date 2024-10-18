import { useCallback, useEffect, useState } from "react"

import { Card, CardBody, CardSubtitle, CardTitle, Col, Row } from "reactstrap";

import { Bar, ChartProps } from 'react-chartjs-2';

import useApi from '@hooks/useApi';
import useLoader from "@hooks/useLoader"
import useUpdateEffect from "@hooks/useUpdateEffect";
import VerticalBarChartLoader from "@lms_components/VerticalBarChart";

import { moneyFormat } from "@utils"

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

import ChartDataLabels from 'chartjs-plugin-datalabels';
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import { Check, CheckCircle, Sunrise, Sunset, Users } from 'react-feather'

import { t } from 'i18next'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels,
);

const COLORS = [
    'rgb(236, 29, 37)',
    'rgba(153, 102, 255)',
    'rgba(255, 206, 86)',
    'rgba(75, 192, 192)',
    'rgba(54, 162, 235)',
    'rgba(255, 159, 64)',
    'rgb(0, 85, 166)',
    'rgba(255, 99, 132)',
    'rgba(201, 203, 207)',
    'rgba(25, 99, 71)',
    'rgba(0, 200, 0)',
    'rgba(255, 105, 80)',
]

const Group = () => {

    const [data, setData] = useState({})
    const [totals, setTotals] = useState({})

    const chartData = data.data ?? []

    const { isLoading, Loader, fetchData } = useLoader({ initValue: true })

    const studentReportApi = useApi().student.report

    const getData = useCallback(
        async () => {
            const {success, data} = await fetchData(studentReportApi.getGroup()).catch(err => err)

            if (success) {
                const initDatas = data
                setData(data)

                // Aggregate counts
                const aggregatedCounts = {};

                for (const category in initDatas?.data) {
                    initDatas?.data[category].forEach(entry => {
                        const { name, count } = entry;
                        if (aggregatedCounts[name]) {
                            aggregatedCounts[name] += count;
                        } else {
                            aggregatedCounts[name] = count;
                        }
                    });
                }
                setTotals(aggregatedCounts)
            }
        }
    )

    useEffect(() => {
        getData()
    }, [])

    if (isLoading) {
        return <Card>
            <CardBody>
                <VerticalBarChartLoader />
            </CardBody>
        </Card>
    }

    /** @type {ChartProps} */
    const opts = {
        height: "300px",
        width: "100%",
        data: {
            labels: data?.ylabel?.map((item) => {
                return item[1]
            }),
            ...data.label && data.label?.length
                ? (
                    {
                        datasets: data.label?.map(
                            (label, idx) =>
                            {
                                const key = label.key
                                const name = label.name
                                return {
                                    label: name,
                                    data: chartData[key].map(
                                        (item, idx) =>
                                        {
                                            return item.count
                                        }
                                    ),
                                    backgroundColor: COLORS[idx],
                                }
                            }
                        )
                    }
                )
                : {}
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 500 },
            scales: {
                x: {},
                y: {
                    grace: 10
                },
            },
            plugins: {
                datalabels: {
                    align: "end",
                    backgroundColor: COLORS[6],
                    color: "#fff",
                    offset: 12,
                    borderRadius: 4,
                    padding: 6
                },
            }
        },
    }

    const total = data.label?.reduce((total, label) => {
        const key = label.key
        const subTotal = chartData[key].reduce((subTotal, current) => {
            subTotal += current.count
            return subTotal
        }, 0)
        total += subTotal
        return total
    }, 0)

    return (
        <Row>
            <Col md={9} xs={12}>
                <Card>
                    <CardTitle tag="h5">
                        {t('Анги бүлгийн тоо')}
                    </CardTitle>
                    <CardSubtitle
                        className="mb-2 text-muted"
                        tag="h6"
                    >
                        Нийт: {moneyFormat(total)}
                    </CardSubtitle>
                    <CardBody>
                        <Bar {...opts} />
                    </CardBody>
                </Card>
            </Col>
            <Col md={3} xs={12}>
                <StatsHorizontal
                    color='info'
                    className="py-1 shadow-sm bg-white rounded border"
                    statTitle={t('Нийт')}
                    icon={<Users size={20} />}
                    renderStats={<h3 className='fw-bolder text-info mb-75'>{moneyFormat(totals["Өдөр"])}</h3>}
                />
                <StatsHorizontal
                    color='success'
                    className="py-1 shadow-sm bg-white rounded border"
                    statTitle={t('Өдрийн анги')}
                    icon={<Sunrise size={20} />}
                    renderStats={<h3 className='fw-bolder text-success mb-75'>{moneyFormat(totals["Өдөр"])}</h3>}
                />
            </Col>
        </Row>
    )
}
export default Group
