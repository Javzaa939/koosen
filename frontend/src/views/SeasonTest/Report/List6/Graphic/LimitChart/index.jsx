import { ChartProps, Scatter } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables, ChartDataLabels);

import { COLORS, HOR_LABEL } from "@utility/consts";

/**
    @param {} props
*/
const LimitChart = (props) => {

    const data = props.data ?? {}

    const chartData = data.data ?? []
    const line = data.line ?? []
    const r = data.r ?? []

    /** @type {ChartProps} */
    const opts = {
        height: "500px",
        width: "100%",
        data: {
            datasets: [
                {
                    label: "Багшийн оноо",
                    data: chartData.map(
                        (item, idx) =>
                        {
                            return {
                                x: item.teach_score,
                                y: item.exam_score,
                            }
                        }
                    ),
                    fill: false,
                    grouped: true,
                    backgroundColor: COLORS[1],
                    borderColor: COLORS[1],
                    skipNull: false, // null байгаа датаг харуулахгүй
                },
                {
                    type: "line",
                    label: "70, 30 онооны шулуун",
                    data: line,
                    fill: false,
                    grouped: true,
                    backgroundColor: COLORS[0],
                    borderColor: COLORS[0],
                    skipNull: false, // null байгаа датаг харуулахгүй
                    xAxisID: "x2",
                    yAxisID: "y2",
                    pointRadius: 0,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 500 },
            elements: {
                point: {
                    radius: 5,
                }
            },
            scales: {
                y: {
                    max: 35,
                    grace: 5,
                    beginAtZero: true,
                    title: {
                        text: "Улирлын шалгалтын 30 оноо",
                        display: true,
                        font: {
                            size: 15
                        }
                    }
                },
                x: {
                    title: {
                        text: "Багшийн 70 оноо",
                        display: true,
                        font: {
                            size: 15
                        }
                    }
                },
                x2: {
                    axis: "x",
                    grid: {
                        drawTicks: false,
                    },
                    ticks: {
                        display: false,
                    },
                    border: {
                        display: false,
                    },
                },
                y2: {
                    grace: 5,
                    max: 35,
                    beginAtZero: true,
                    axis: "y",
                    grid: {
                        drawTicks: false,
                        display: false,
                    },
                    border: {
                        display: false,
                    },
                    ticks: {
                        display: false,
                    },
                },
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
                    display: false,
                    align: "end",
                }
            }
        },
    }

    return (
        <Scatter {...opts} />
    )
}
export default LimitChart
