import { useCallback, useEffect, useState } from "react"
import { Card, CardBody, CardTitle, CardSubtitle, Carousel, CarouselCaption } from "reactstrap"

import { Bar, ChartProps } from 'react-chartjs-2';

import { moneyFormat } from "@utils"
import { GRAPHIC_LABEL } from "@utility/consts";

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

import useApi from '@hooks/useApi';
import useLoader from "@hooks/useLoader"
import VerticalBarChartLoader from "@lms_components/VerticalBarChart";
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

/**
    @param {} props
*/
const StudentCourse = (props) => {

    const [datas, setDatas] = useState({})
    const { isLoading, Loader, fetchData } = useLoader({ initValue: true })

    const studentGenderApi = useApi().student.report

    const getData = useCallback(
        async () => {
            const { success, data, error, errors } = await fetchData(studentGenderApi.getCourse()).catch(err => err)
            if (success) {
                setDatas(data)
            }
        }
    )

    useEffect(
        () => {
            getData()
        },
        []
    )

    const chartData = datas.data ?? []

    const toplabels = {
        id: "lebelTop",
        afterDatasetsDraw: (chart, args, pluginOptions) => {
            const { ctx, scales: { x, y } } = chart

            chart.data.datasets[0].data.forEach(
                (datapoint, index) =>
                {
                    const datasetArray = []

                    chart.data.datasets.forEach(
                        (dataset) =>
                        {
                            datasetArray.push(dataset.data[index])
                        }
                    )

                    function totalSum(total, values) {
                        return total + values
                    }

                    let sum = datasetArray.reduce(totalSum, 0)

                    ctx.font = "bold 13px sans-serif"
                    ctx.fillStyle = "blue"
                    ctx.textAlign = "center"
                    // ctx.fillText(sum, x.getPixelForValue(index), y.getPixelForValue(19))
                    if(sum > 0) ctx.fillText(sum, x.getPixelForValue(index), chart.getDatasetMeta(1).data[index].y - 10)
                }
            )
        }
    }

    /** @type {ChartProps} */
    const opts = {
        height: "300px",
        width: "100%",
        data: {
            labels: chartData.reduce(
                (prev, current) =>
                {
                    prev.push(current.level)
                    return prev
                },
                []
            ),
            datasets: [
                {
                    label: 'Эрэгтэй',
                    data: chartData.reduce(
                        (prev, current) =>
                        {
                            prev.push(current.male)
                            return prev
                        },
                        []
                    ),
                    backgroundColor: 'rgb(54, 162, 235)',
                },
                {
                    label: 'Эмэгтэй',
                    data: chartData.reduce(
                        (prev, current) =>
                        {
                            prev.push(current.female)
                            return prev
                        },
                        []
                    ),
                    backgroundColor: 'rgb(247, 136, 223)',
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 500 },
            scales: {
                x: {},
                y: {
                    grace: 12
                },
            },
            plugins: {
                datalabels: {
                    ...GRAPHIC_LABEL,
                    display: function (context) {
                        return context.dataset.data[context.dataIndex] !== 0
                    },
                },
            }
        },
        // plugins: [toplabels]
    }

    if (isLoading)
    {
        return <Card>
            <CardBody>
                <VerticalBarChartLoader />
            </CardBody>
        </Card>
    }

    return (
        <Card>
            <CardTitle tag="h5">
                {t('Курсээр')}
            </CardTitle>
            <CardBody>
                <Bar {...opts} />
            </CardBody>
        </Card>
    )
}
export default StudentCourse
