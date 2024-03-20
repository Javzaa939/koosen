import React from 'react'
import { Fragment, useState, useEffect } from 'react'

import useApi from '@hooks/useApi';

import { getPagination, ReactSelectStyles, generateLessonYear } from '@utils'
import useLoader from '@hooks/useLoader';
import { Card, Col, Row } from 'reactstrap';
import Select from 'react-select'

import { useTranslation } from 'react-i18next'
import Highcharts from 'highcharts';

import HighchartsReact from 'highcharts-react-official'
require('highcharts/indicators/indicators')(Highcharts)
require('highcharts/indicators/pivot-points')(Highcharts)
require('highcharts/indicators/macd')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)
require('highcharts/modules/map')(Highcharts)

import { FaBook, FaGlobe, FaGraduationCap, FaUser, FaUsers } from "react-icons/fa6";

import { useSkin } from "@hooks/useSkin"

import { dataz } from './sampledata';
import './style.scss'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, linearGradient } from 'recharts';


function Dashboard() {
    const { skin } = useSkin()

	const elseltApi = useApi().elselt
	const dashApi = useApi().elselt.dashboard
	const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false});
    const { t } = useTranslation()

    const [chosenElselt, setChosenElselt] = useState('all')

    const [datas, setDatas] = useState([])
    const [professions, setProffesions] = useState([])
    const [aimagz, setAimagz] = useState([])

	/* Жагсаалтын дата авах функц */
	async function getElselts() {
        const {success, data} = await fetchData(elseltApi.getAll())
        if(success) {
            setProffesions([
                {
                    name: 'Нийт элсэгчдийн мэдээлэл',
                    id:'all'
                },...data])
        } else {
            setProffesions([
                {
                    name: 'Нийт элсэгчдийн мэдээлэл',
                    id:'all'
                }]
            )
        }
	}

	async function getDatas() {
        const {success, data} = await fetchData(dashApi.get(chosenElselt))
        if(success) {
            setDatas(data)

            var serdata = data?.haryalal.map((data) => {
                return(
                    [data?.name || '', data?.total, data?.male, data?.female ]
                )
            })

            setAimagz(serdata)
        }
	}

    useEffect(() => {
        getElselts();
        getDatas()
    }, [])


    useEffect(() => {
        getDatas()
    }, [chosenElselt])

    const demColor = '#4956e6'
    const repColor = '#51a4fc'
    const libColor = '#f788df'

    async function chartz(){

        const mapData = await fetch(
            `${process.env.PUBLIC_URL}/assets/data/chart/mongolia.json`
        ).then(response => response.json());


        Highcharts.mapChart('map_chart', {
            colorAxis: {
                dataClasses: [],
            },
            mapNavigation: {
                enabled: true
            },
            chart:{
                backgroundColor: 'rgba(0,0,0,0)',
            },
            lang: {
                viewFullscreen: 'Дэлгэц дүүрэн харах',
                exitFullscreen: 'Дэлгэц дүүргэлтийг хаах',
                printChart: 'График хэвлэх',
                downloadPNG: 'PNG зураг татах',
                downloadJPEG: 'JPEG зураг татах',
                downloadPDF: 'PDF баримт бичиг татах',
                downloadSVG: 'SVG vector зураг татах',
                contextButtonTitle: 'Графикийн контекст цэс'
            },
            title: {
                style: { color: `${skin == 'dark' ? '#cccccc' : '#545454'}`, fontWeight: 600 },
                text: 'Элсэгчдийн харьяалал',
            },
            dataLabels: {
                enabled: true,
                format: '{point.name}'
            },
            states: {
                hover: {
                    color: '#BADA55' // Color when hovering over a data point
                }
            },
            series: [{
                mapData,
                data: aimagz,
                name: 'Mongolia',
                borderColor: '#e0e0e0',
                joinBy: ['name', 'id'],
                keys: ['id', 'demVotes', 'repVotes', 'libVotes'],
                tooltip: {
                    headerFormat: '',
                    pointFormatter()
                    {
                        const hoverVotes = this.hoverVotes;
                        return '<b style="font-size: 13px;">' + this.id + '</b><br/>' +
                            [
                                ['Нийт элсэгчид', this.demVotes, demColor],
                                ['Эрэгтэй', this.repVotes, repColor],
                                ['Эмэгтэй', this.libVotes, libColor],
                            ]
                                .map(line => '<span style="color:' + line[2] +
                                    '; font-size: 19px;">\u25CF</span> ' +
                                    (line[0] === hoverVotes ? '<b>' : '') +
                                    line[0] + ': ' +
                                    Highcharts.numberFormat(line[1], 0) +
                                    (line[0] === hoverVotes ? '</b>' : '') +
                                    '<br/>')
                                .join('')
                    }
                }
            }]
        });

    }

    useEffect(() => {
        chartz();
    }, [aimagz])

    function customizedTick(props) {
        const { x, y, index, payload, width } = props;
        if (index % 3 === 1) {
            return (
                <g>
                    <line x1={x - 1.5 * width} y1={y} x2={x - 1.5 * width} y2={y + 10} />
                    <text x={x} y={y} textAnchor="middle" dominantBaseline="hanging">
                        {payload.value}
                    </text>
                </g>
            );
        }
        return null;
    }

    const CustomTooltip = data => {
        if (data.active && data.payload) {
            return (
                <div className='recharts_custom_tooltip shadow p-2 rounded-3'>
                    <p className='fw-bold mb-0'>{data.label}</p>
                    <hr />
                    <div className='active'>
                        {data.payload.map(i => {
                            return (
                                <div className='d-flex align-items-center' key={i.dataKey}>
                                <span
                                    className='bullet bullet-sm bullet-bordered me-50'
                                    style={{
                                        backgroundColor: i?.fill ? i.fill : '#fff'
                                    }}
                                ></span>
                                <span className='text-capitalize me-75'>
                                    {i.dataKey == 'male' ? 'Эрэгтэй' : 'Эмэгтэй'} : {i.payload[i.dataKey]}
                                </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <Card className='p-2' style={{ minHeight: '70dvh' }}>
            <div>
                <div className='d-flex justify-content-end'>
                    <Col lg={3} md={6} sm={12}>
                        <Select
                            name="type"
                            id="type"
                            classNamePrefix='select'
                            isClearable
                            className='react-select'
                            isLoading={isLoading}
                            placeholder={t(`-- Сонгоно уу --`)}
                            options={professions || []}
                            value={professions.find((c) => c?.id === chosenElselt) || ''}
                            // value={elselts.find((c) => c?.id === chosenElselt)}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {setChosenElselt(val?.id || '')}}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                </div>
                <Row className='d-flex'>
                    <Col className='dash_card'>
                        <div>
                            <div>
                                Нийт элсэгчид
                            </div>
                            <div className='dash_card_number'>
                                {datas?.all_student}
                            </div>
                        </div>
                        <div className='card_icon simple_icon'>
                            <FaUsers size={24}/>
                        </div>
                    </Col>
                    <Col className='dash_card'>
                        <div>
                            <div>
                                Бакалавр
                            </div>
                            <div className='dash_card_number'>
                                {datas?.bachelor}
                            </div>
                        </div>
                        <div className='card_icon simple_icon'>
                            <FaGraduationCap size={24}/>
                        </div>
                    </Col>
                    <Col className='dash_card'>
                        <div>
                            <div>
                                Магистр
                            </div>
                            <div className='dash_card_number'>
                                {datas?.master}
                            </div>
                        </div>
                        <div className='card_icon simple_icon'>
                            <FaBook size={24}/>
                        </div>
                    </Col>
                    <Col className='dash_card'>
                        <div>
                            <div>
                                Доктор
                            </div>
                            <div className='dash_card_number'>
                                {datas?.doctor}
                            </div>
                        </div>
                        <div className='card_icon simple_icon'>
                            <FaGlobe size={24}/>
                        </div>
                    </Col>
                </Row>
                <Row className='d-flex'>
                    <Col className='dash_card'>
                        <div>
                            <div>
                                Эрэгтэй
                            </div>
                            <div className='dash_card_number'>
                                {datas?.male}
                            </div>
                        </div>
                        <div className='card_icon male_icon'>
                            <FaUser size={24}/>
                        </div>
                    </Col>
                    <Col className='dash_card'>
                        <div>
                            <div>
                                Эмэгтэй
                            </div>
                            <div className='dash_card_number'>
                                {datas?.female}
                            </div>
                        </div>
                        <div className='card_icon female_icon'>
                            <FaUser size={24}/>
                        </div>
                    </Col>
                </Row>
                {
                    isLoading && Loader
                }
                <>
                    <div className='my-2 shadow p-1 rounded-3'>
                        <div id='map_chart'></div>
                    </div>
                    <div>
                        <div className='shadow p-1 rounded-3 mt-5 mb-2'>
                            <div className='d-flex justify-content-center mb-2 mt-50' style={{ fontWeight: 900, fontSize: 16 }}>
                                Элсэгчдийн мэдээлэл мэргэжил, хүйсээр
                            </div>
                            <div className='recharts-wrapper bar-chart' style={{ height: '500px' }}>
                                <ResponsiveContainer>
                                    <BarChart height={300} data={datas?.profs} barSize={25}>
                                        <defs>
                                            <linearGradient id="colorMale" x1="0" y1="0" x2="0" y2="1">
                                                {/* <stop offset='10%' stopColor="#FFFFFF" stopOpacity={0.2} /> */}
                                                <stop offset='5%' stopColor="#003fa3" stopOpacity={0.9} />
                                                <stop offset='80%' stopColor="#4287f5" stopOpacity={0.8} />
                                                <stop offset='200%' stopColor={`${skin == 'dark' ? '#161d31' : '#fff'}`} stopOpacity={0.2} />
                                            </linearGradient>

                                            <linearGradient id="colorFemale" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset='5%' stopColor="#9923a8" stopOpacity={0.9} />
                                                <stop offset='80%' stopColor="#dc8ee6" stopOpacity={0.8} />
                                                <stop offset='200%' stopColor={`${skin == 'dark' ? '#161d31' : '#fff'}`} stopOpacity={0.2} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeOpacity={0.3} />

                                        <XAxis dataKey="prof_name" />
                                        <YAxis />

                                        <Tooltip content={CustomTooltip} cursor={{fill: 'rgba(148, 148, 148, 0.1)'}}/>

                                        <Bar dataKey='male' fill="url(#colorMale)" radius={[50,50,0,0]}/>
                                        <Bar dataKey='female' fill='url(#colorFemale)' radius={[50,50,0,0]}/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            </div>
        </Card>
    )
}

export default Dashboard
