import { useCallback, useEffect, useState } from "react"

import { Card, CardBody, CardSubtitle, CardTitle } from "reactstrap";

import { Bar, ChartProps } from 'react-chartjs-2';

import useApi from '@hooks/useApi';
import useLoader from "@hooks/useLoader"
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
import { t } from "i18next";

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
]

/**
    @param {} props
*/
const StudentSchool = () => {

    const [data, setData] = useState({})

    const chartData = data.data ?? []

    const { isLoading, Loader, fetchData } = useLoader({ initValue: true })

    const studentSchoolApi = useApi().student.report

    const getData = useCallback(
        async () => {
            const {success, data} = await fetchData(studentSchoolApi.getSchool()).catch(err => err)
            if (success) {
                setData(data)
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
                return item
            }),
            ...data.label && data.label?.length
                ? (
                    {
                        datasets: data.label?.map(
                            (label, idx) =>
                            {
                                const key = label.key
                                const name = label.name

                                const check = chartData[key]?.find((val) => val.count > 0)
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
            },
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
        <Card>
            <CardTitle tag="h5">
                {t('Сургуулиар')}
            </CardTitle>
            <CardSubtitle
                className="mb-2 text-muted"
                tag="h6"
            >
                Нийт: {moneyFormat(total)} хүсэлт(бүх төлөвөөр)
            </CardSubtitle>
            <CardBody>
                <Bar {...opts} />
            </CardBody>
        </Card>
    )
}
export default StudentSchool
