import React, { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom"
import {
    Card,
    Col,
    CardHeader,
    Spinner,
} from "reactstrap";

import { useParams } from 'react-router-dom';

import useApi from "@hooks/useApi"
import useLoader from "@hooks/useLoader"

import { Chart as
    ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from 'chart.js';

import { Doughnut, Pie, Bar } from 'react-chartjs-2';
import { ChevronsLeft } from "react-feather";
import ChartDataLabels from 'chartjs-plugin-datalabels';

import "../style.scss";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    ArcElement,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    ChartDataLabels,
);

const KIND_ONE_CHOICE = 1; // 'Нэг сонголт'
const KIND_MULTI_CHOICE = 2; // 'Олон сонголт'
const KIND_BOOLEAN = 3; // 'Тийм // Үгүй сонголт'
const KIND_RATING = 4; // 'Үнэлгээ'
const KIND_TEXT = 5; // 'Бичвэр'

const LABEL_COLOR = "#2661D4"
const GRAPHIC_LABEL = {
    align: "end",
    backgroundColor: LABEL_COLOR,
    color: "#fff",
    offset: 12,
    borderRadius: 4,
    padding: 3,
    display: function (context) {
        return context.dataset.data[context.dataIndex] !== 0
    },
}


function ResultDetail() {

    const { id } = useParams()

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})

    const [mainData, setMainData] = useState()

	const polleeApi = useApi().survey.pollee;

    const [localLoader, setLocalLoader] = useState(true)

    async function getDatas() {
		const { success, data } = await fetchData(polleeApi.get(id));
		if (success) {
			setMainData(data);
            setLocalLoader(false)
		}
	}

	useEffect(() => {
		getDatas();
	}, []
    );

    const navigate = useNavigate()

    // if (!mainData || !mainData.questions) {
    //     return (
    //         <Fragment>
    //             <Card className="cusheight d-flex justify-content-center align-items-center">
    //                 <Spinner
    //                     color="dark"
    //                     size=""
    //                 >
    //                         Түр хүлээнэ үү...
    //                 </Spinner>
    //             </Card>
    //         </Fragment>
    //     )
    // }

    const chartData = mainData?.questions?.questions.map((question) => {
    const counts = question?.pollees.map((item) => item.count);
    const names = question?.pollees.map((item) => item.name);

    return {
      labels: names,
      datasets: [
        {
          label: '',
          data: counts,
          backgroundColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };
  });

    const options = {
        plugins: {
            legend: {
                display: true
            },
            title: {
                display: false,
                text: 'Судалгааны үр дүн',
                },
            tooltip: {
                enabled: true,

            },
            datalabels: {
                ...GRAPHIC_LABEL,
                align: "center",
            }
        },
    };

    const optionsMulti = {
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false,
                text: 'Судалгааны үр дүн',
                },
            tooltip: {
                enabled: true,
            },
            datalabels: {
                ...GRAPHIC_LABEL,
                align: "center",
            }
        },
    };

    const optionsRating = {
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false,
                text: 'Судалгааны үр дүн',
                },
            tooltip: {
                enabled: true,
            },
            datalabels: {
                ...GRAPHIC_LABEL,
                align: "center",
            }
        },
    };

    const handleNavigate = () => {
        navigate(`/survey/results/`)
    }

    return (
        <Fragment>
            <Card className="">
                {isLoading || localLoader ? Loader
                :
                    mainData && mainData.questions &&

                    <>
                        <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                            <div className="cursor-pointer font_prefix" onClick={() => handleNavigate()}>
                                <ChevronsLeft /> Буцах
                            </div>
                        </CardHeader>
                        <div>
                            <div className="d-flex align-items-center mt-1 flex-column font_prefix">
                                Судалгааны нэр:<b>{mainData?.questions.title}</b>
                                <div className="surveytitle"></div>
                            </div>
                        <div className="cardlist">
                            {mainData?.questions?.questions.map((question, qIdx) => (
                                <Col md={4} sm={6} xs={12} key={qIdx} className=''>
                                    <div className="p-1 m-2">
                                        <h3>
                                            {qIdx + 1}. {question.question}{" "}
                                        </h3>
                                            {question.kind === KIND_ONE_CHOICE && (
                                            <div className="d-flex">
                                                <Doughnut options={options} data={chartData[qIdx]} /> </div>
                                            )}
                                            {question.kind === KIND_MULTI_CHOICE && (
                                                <div className="">
                                                    <Bar options={optionsMulti} data={chartData[qIdx]} />
                                                </div>
                                            )}
                                            {question.kind === KIND_BOOLEAN &&
                                                <div className="">
                                                    <Pie options={options} data={chartData[qIdx]} />
                                                </div>
                                            }
                                            {question.kind === KIND_RATING &&
                                                <Bar options={optionsRating}data={chartData[qIdx]} />
                                            }
                                            {question.kind === KIND_TEXT && (
                                                <div key={`text${qIdx}`} className="" >
                                                    {chartData[qIdx].labels.map((q, vidx) => (
                                                        <div className="m-1 p-1 border-bottom rounded-5  shadow-sm ps-2 " key={`textanswer${vidx}`}>{q}</div>
                                                    ))}
                                                </div>
                                            )}
                                    </div>
                                </Col>
                            ))}
                            </div>
                        </div>
                    </>
                }

            </Card>
        </Fragment>
  );
}

export default ResultDetail;



