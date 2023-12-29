import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardTitle, Col, Row } from 'reactstrap'

import { Book, BookOpen, Feather, User, Users } from 'react-feather'
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import './style.scss'
import { sampledata } from './sample'

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Legend,
} from "chart.js";

import { Doughnut, Line, Pie } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
    );

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";


function Dashboard() {

    const datas = sampledata
    const parentschoolApi = useApi().dashboard
	const { fetchData } = useLoader({})
	const [root, setRoot] = useState('')

    const [ info, setInfo ] = useState({
        salbar_data: []
    })

    async function getDatas() {
        const {success, data} = await fetchData(parentschoolApi.get())
        if(success) {
            setInfo(data)
        }
    }

    useEffect(() => {
        getDatas()
    },[])




    const eduData = {

        // утга нэмэх бол өнгө бас нэмээрэй
        labels: [
            "Бакалавр",
            "Магистр",
            "Доктор"
        ],
        datasets: [
            {
                data: [
                    info?.total_d,
                    info?.total_e,
                    info?.total_f
                ],
                backgroundColor: ["#d1dfed", "#f2e0cb", "#d8f0cc"],
                hoverBackgroundColor: ["#7cb7f2", "#f5b36c", "#90e065"],
                borderColor: ["#469df4", "#f4a046", "#48cf00"],
                borderWidth: 1,
            },
        ],
    };

    console.log(info,'REALLLL')


    const data_line = {
        labels: info?.salbar_data.map((name) => (name?.name)),
        datasets: [
            {
                label: 'Оюутны тоо',
                data: info?.salbar_data.map((data) => {return(data?.count)}),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Оюутны үзүүлэлт салбар сургуулиар',
            },
        },
    };

	const red = 0xffc2c2;
	const blue = 0x6794dc;
	const green = 0x7aff7a;

	const updatedData = info?.salbar_data.map((dataPoint, index) => {
		const nextIndex = index + 1;

		return {
			...dataPoint,
			fillSettings: {
				fill: am5.color(blue)
			},

			strokeSettings: {
                stroke:
                    am5.color(blue)
			},

			bulletSettings: {
				fill: am5.color(0x6794dc)
			},
		};
	});

	useEffect(
		() =>
		{
			class MyTheme extends am5.Theme {
				setupDefaultRules() {
					this.rule("Label").setAll({
						fontSize: 12,
						fill: am5.color("#777777")
					});
				}
			}

			const root = am5.Root.new("chartdiv");
			root._logo.dispose();

			root.setThemes([
				am5themes_Animated.new(root),
				MyTheme.new(root)
			]);


			let chart;

			chart = root.container.children.push(
                am5xy.XYChart.new(root, {
                    focusable: true,
                    panX: true,
                    panY: true,
                    wheelX: "panX",
                    wheelY: "zoomX",
                    layout: root.verticalLayout
                })
			);


            // хамгийн их утгыг олж түүн дээр 100г нэмнэ
            const number_array = info?.salbar_data.map(data => data?.count)

            // түүний дараа чартын дээд утгыг гаргана
            const max_number = Math.max(number_array) + 100
			let yAxis = chart.yAxes.push(
				am5xy.ValueAxis.new(root, {
					extraTooltipPrecision: 1,
					renderer: am5xy.AxisRendererY.new(root, {}),
					min: 0,
   				 	max: max_number,
				})
			);

			var xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });

			var xAxis = chart.xAxes.push(
				am5xy.CategoryAxis.new(root, {
					renderer: xRenderer,
					categoryField: "name"
				})
			  );

			xAxis.data.setAll(updatedData);

			// Tooltip
			var tooltip = am5.Tooltip.new(root, {
				getFillFromSprite: false,
				autoTextColor: false,
				labelText: " {name} : [bold]{valueY}[/]",
			  });

			tooltip.label.setAll({
				fill: am5.color('#FFFFFF'),
				oversizedBehavior: "wrap",
				maxWidth: 100
			});

			tooltip.get("background").setAll({
				fill: am5.color('#144e97'),
			});

			// Create series
			var series1 = chart.series.push(
				am5xy.SmoothedXYLineSeries.new(root, {
					name: "Оюутны үзүүлэлт",
					xAxis: xAxis,
					yAxis: yAxis,
					valueYField: "count",
					categoryXField: "name",
					tooltip: tooltip,
                    tensionX: 0.7,
				})
            );




			series1.bullets.push(function() {
				return am5.Bullet.new(root, {
					sprite: am5.Circle.new(root, {
						radius: 0,
						templateField: "bulletSettings",
					})
				});
			});

//////////////////////////////////////////////////////////////////////////
			// арилгахаар бол энэ хэсгийг комментлоорой :D
			series1.fills.template.setAll({
				visible: true,
				templateField: "fillSettings"
			});
			series1.fills.template.set("fillGradient", am5.LinearGradient.new(root, {
				stops: [{
				    opacity: 0.3
				}, {
				    opacity: 0
				}]
            }));
//////////////////////////////////////////////////////////////////////////

			series1.strokes.template.setAll({
				strokeWidth: 3,
				templateField: "strokeSettings",
			});



			series1.data.setAll(updatedData);

			// Add legend
			let legend = chart.children.push(am5.Legend.new(root, {
				layout: root.verticalLayout
			}));

			legend.data.setAll(chart.series.values);

			// Cursor
			var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
				behavior: "none"
			}));

			cursor.lineY.set("visible", false);

			// Export
			var exporting = am5plugins_exporting.Exporting.new(root, {
				menu: am5plugins_exporting.ExportingMenu.new(root, {
					container: document.getElementById("exportdiv")
				}),
				dataSource: updatedData
			});

			exporting.events.on("dataprocessed", function(ev) {
				for(var i = 0; i < ev.data.length; i++) {
					ev.data[i].sum = ev.data[i].value + ev.data[i].value2;
				}
			});

			exporting.get("menu").set("items", [
				{
					type: "image",
					format: "png",
					label: "Image"
				},
				{
					type: "separator"
				},
				{
					type: "format",
					format: "print",
					label: "Print"
				}
			]);

            series1.tensionX = 0.8;


			series1.appear(1000,100)
			chart.appear(1000, 100);
			return () => {
				setRoot(root)
				root.dispose()
			};

		},
		[info]
	)

console.log(updatedData,'upppppp')


    return (
        <Card>
            <CardTitle>
                <h3 className='p-1 pb-0'>
                    Хянах самбар
                </h3>
            </CardTitle>
            <div className='p-1 pt-0'>
                <Row>
                    <Col className='p-1'>
                        <div className='dashcard' style={{ backgroundColor: '#fc70ea12' }}>
                            <div>
                                <div className='text-nowrap'>
                                    Нийт оюутнууд
                                </div>
                                <div className='numberstyle'>
                                    {info?.total_students}
                                </div>
                            </div>
                            <div className='p-1' style={{ color: '#fc70ea'}}>
                                <User/>
                            </div>
                        </div>
                    </Col>
                    <Col className='p-1'>
                        <div className='dashcard' style={{ backgroundColor: '#fe4d4d1a'}}>
                            <div>
                                <div>
                                    Нийт багш нар
                                </div>
                                <div className='numberstyle'>
                                    {info?.total_workers}
                                </div>
                            </div>
                            <div className='p-1' style={{ color: '#ea4949' }}>
                                <Users/>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row>
                <Col className='p-1'>
                        <div className='dashcard' style={{ backgroundColor: '#469df412'}}>
                            <div>
                                <div>
                                    Бакалавр
                                </div>
                                <div className='numberstyle'>
                                    {info?.total_d}
                                </div>
                            </div>
                            <div className='p-1' style={{ color: '#469df4' }}>
                                <Feather/>
                            </div>
                        </div>
                    </Col>
                    <Col className='p-1'>
                        <div className='dashcard' style={{ backgroundColor: '#f4a04612'}}>
                            <div>
                                <div>
                                    Магистр
                                </div>
                                <div className='numberstyle'>
                                    {info?.total_e}
                                </div>
                            </div>
                            <div className='p-1' style={{ color: '#f4a046'}}>
                                <Book/>
                            </div>
                        </div>
                    </Col>
                    <Col className='p-1'>
                        <div className='dashcard' style={{ backgroundColor: '#00ff2a1a'}}>
                            <div>
                                <div>
                                    Доктор
                                </div>
                                <div className='numberstyle'>
                                    {info?.total_f}
                                </div>
                            </div>
                            <div className='p-1' style={{ color: '#48cf00'}}>
                                <BookOpen/>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
            <div className='p-1'>
                test
                <button onClick={() => {getDatas();}}>GET</button>
            </div>
            {/* <Pie data={eduData} /> */}
                {/* <div className='p-1'>
                <Line options={options} data={data_line} />;
            </div> */}

			<div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
				<div id="exportdiv" style={{ backgroundColor: "white"}}>
			</div>
        </Card>
    )
}

export default Dashboard