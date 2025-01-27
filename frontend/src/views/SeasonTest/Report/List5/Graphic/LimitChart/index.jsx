import {  Bar, ChartProps} from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables, ChartDataLabels);

import { COLORS, HOR_LABEL, TEACHER_IDX } from "@utility/consts";


/**
    @param {} props
*/
const LimitChart = (props) => {

    const data = props.data ?? {}

    const chartData = data.data ?? []
    const names = data?.names ?? []

    /** @type {ChartProps} */
    const opts = {
        height: "500px",
        width: "100%",
        data: {
            labels: names.map(
                (name, idx) =>
                {
                    return name
                }
            ),
            datasets: chartData?.map(
                (item, idx) =>
                {
                    const data = item.data

                    return {
                        label: item['name'],
                        data: names.map(
                            (name, idx) =>
                            {
                                const foundIndex = data.findIndex(e => e.name === name)
                                if (foundIndex !== -1)
                                {
                                    const found = data[foundIndex]
                                    return found.percent
                                }
                                else {
                                    return 0
                                }
                            }
                        ),
                        fill: false,
                        grouped: true,
                        backgroundColor: COLORS[idx === TEACHER_IDX ? 1 : idx === 1 ? 5 : 7],
                        borderColor: COLORS[idx === TEACHER_IDX ? 1 : idx === 1 ? 5 : 7],
                        skipNull: false, // null байгаа датаг харуулахгүй
                        type: "line",
                    }
                }
            ),
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 500 },
            tension: 0.3,
            elements: {
                point: {
                    radius: 0,
                }
            },
            scales: {
                y: {
                    grace: 10,
                    beginAtZero: true,
                    title: {
                        text: "А-F дүнгийн эзлэх хувь",
                        display: true,
                        font: {
                            size: 15
                        }
                    }
                },
                x: {
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 25,
                        boxWidth: 10,
                    }
                },
                datalabels: {
                    ...HOR_LABEL,
                    display: true,
                    backgroundColor: (ctx) =>
                    {
                        return ctx.datasetIndex === TEACHER_IDX ? ctx.dataset.backgroundColor : HOR_LABEL.backgroundColor
                    },
                    align: "end",
                }
            }
        },
    }

    return (
        <Bar {...opts} />
    )
}
export default LimitChart
