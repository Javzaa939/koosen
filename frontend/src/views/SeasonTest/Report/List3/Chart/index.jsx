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

/**
    @param {} props
*/
const Chart = ({ test_id = "" }) => {

    const [gradeCounts, setGradeCounts] = useState({
        male: { A: 0, B: 0, C: 0, D: 0, F: 0 },
        female: { A: 0, B: 0, C: 0, D: 0, F: 0 },
    });

    const { isLoading, Loader, fetchData } = useLoader({ initValue: true })

    const studentReportApi = useApi().challenge.report

    const getData = useCallback(
        async () => {
            const { success, data } = await fetchData(studentReportApi.get(test_id)).catch(err => err)

            if (success) {
                setGradeCounts(data)
            }
        }
    )

    useEffect(() => {
        getData()
    }, [test_id])

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
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
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
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            tooltip: {
                enabled: true,
            },
        },
    };
    return (
        <Row>
            <Col md={12} xs={12}>
                <Card>
                    <CardTitle tag="h5">
                        {t('Тухайн шалгалтыг өгсөн оюутны тоо')}
                    </CardTitle>
                    <CardSubtitle
                        className="mb-2 text-muted"
                        tag="h6"
                    >
                    </CardSubtitle>
                    <CardBody>
                        <Bar data={chartData} options={chartOptions} />
                    </CardBody>
                </Card>
            </Col>
        </Row>
    )
}
export default Chart
