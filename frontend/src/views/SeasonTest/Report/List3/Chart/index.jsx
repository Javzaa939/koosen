import { useCallback, useEffect, useState } from "react"

import { Card, CardBody, CardSubtitle, CardTitle, Col, Row } from "reactstrap";

import { Bar } from 'react-chartjs-2';

import useApi from '@hooks/useApi';
import useLoader from "@hooks/useLoader"
import VerticalBarChartLoader from "@lms_components/VerticalBarChart";

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
]

/**
    @param {} props
*/
const Chart = ({ test_id = "", department, group }) => {

    const [gradeCounts, setGradeCounts] = useState({
        male: { A: 0, B: 0, C: 0, D: 0, F: 0 },
        female: { A: 0, B: 0, C: 0, D: 0, F: 0 },
    });

    const { isLoading, Loader, fetchData } = useLoader({ initValue: true })

    const studentReportApi = useApi().challenge.report

    const getData = useCallback(
        async () => {
            const { success, data } = await fetchData(studentReportApi.get(test_id, department, group)).catch(err => err)
            if (success) {
                setGradeCounts(data)
            }
        }
    )

    useEffect(() => {
        if (test_id) {
            getData()
        }
    }, [test_id, department, group])

    if (isLoading) {
        return <Card>
            <CardBody>
                <VerticalBarChartLoader />
            </CardBody>
        </Card>
    }

    const chartData = {
        labels: ['A', 'B', 'C', 'D', 'F'],
        datasets: [
            {
                label: 'Эрэгтэй сурагчид',
                data: [
                    gradeCounts.male.A,
                    gradeCounts.male.B,
                    gradeCounts.male.C,
                    gradeCounts.male.D,
                    gradeCounts.male.F,
                ],
                backgroundColor: 'rgba(153, 102, 255)',
            },
            {
                label: 'Эмэгтэй сурагчид',
                data: [
                    gradeCounts.female.A,
                    gradeCounts.female.B,
                    gradeCounts.female.C,
                    gradeCounts.female.D,
                    gradeCounts.female.F,
                ],
                backgroundColor: 'rgba(255, 206, 86)',
            },
        ],
    };

    /** @type {ChartProps} */
    const opts = {
        height: "300px",
        width: "100%",
        data: {
            ...chartData
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

    return (
        <Row>
            <Col md={12} xs={12}>
                <Card>
                    <CardTitle tag="h6">
                        {t('Тухайн шалгалтыг өгсөн оюутны тоо үсгэн үнэлгээгээр')}
                    </CardTitle>
                        <CardSubtitle
                            className="mb-2 text-muted"
                            tag="h6"
                        >
                        </CardSubtitle>
                    <CardBody>
                        <Bar {...opts} />
                    </CardBody>
                </Card>
            </Col>
        </Row>
    )
}
export default Chart
