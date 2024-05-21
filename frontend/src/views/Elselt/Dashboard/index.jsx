import React from 'react'
import { useState, useEffect } from 'react'

import useApi from '@hooks/useApi';

import {  ReactSelectStyles } from '@utils'
import useLoader from '@hooks/useLoader';
import {
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Card,
    Col,
    Row
} from 'reactstrap';
import Select from 'react-select'

import { useTranslation } from 'react-i18next'
import Highcharts from 'highcharts';

require('highcharts/indicators/indicators')(Highcharts)
require('highcharts/indicators/pivot-points')(Highcharts)
require('highcharts/indicators/macd')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)
require('highcharts/modules/map')(Highcharts)

import { FaBook, FaGlobe, FaGraduationCap, FaUser, FaUsers } from "react-icons/fa6";

import { useSkin } from "@hooks/useSkin"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import './style.scss'
import mapData from './mongolz.json'
import { downloadGeneralReport } from './downloadGeneralReport';
import excelDownload from '@src/utility/excelDownload';

function Dashboard() {
    const { skin } = useSkin()

	const elseltApi = useApi().elselt
	const dashApi = useApi().elselt.dashboard

	const { isLoading, fetchData } = useLoader({});
	const {
        Loader,
        isLoading: mainDataLoading,
        fetchData: fetchMainData
    } = useLoader({isFullScreen: false});
    const { t } = useTranslation()

    const [chosenElselt, setChosenElselt] = useState('all')

    const [datas, setDatas] = useState({})
    const [professions, setProffesions] = useState([])
    const [aimagz, setAimagz] = useState([])
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggle = () => setDropdownOpen((prevState) => !prevState);

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
        const {success, data} = await fetchMainData(dashApi.get(chosenElselt))
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
    }, [])

    useEffect(() => {
        getDatas()
    }, [chosenElselt])

    const demColor = '#4956e6'
    const repColor = '#51a4fc'
    const libColor = '#f788df'

    async function chartz(){

        // const mapData = await fetch(
        //     `${process.env.PUBLIC_URL}/assets/data/chart/mongolia.json`
        // ).then(response => response.json());

        // console.log(mapData,'mapdata')

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

    const CustomTooltip = data => {
        if (data.active && data.payload) {
            return (
                <div className='recharts_custom_tooltip shadow p-2 rounded-3'>
                    <p className='fw-bold mb-0'>{data.label}</p>
                    <hr />
                    <div className='active'>
                        <div className='d-flex align-items-center'>
                            <span
                                className='bullet bullet-sm bullet-bordered me-50'
                                style={{
                                    backgroundColor: 'black'
                                }}
                            ></span>
                            <span className='text-capitalize me-75'>
                                Нийт : {data.payload.map(i => i.payload[i.dataKey]).reduce((accumulator, currentValue) => accumulator + currentValue)}
                            </span>
                        </div>
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

    async function generalReportHandler() {
        const {success, data} = await fetchData(dashApi.excel())
        if(success) {
            downloadGeneralReport(data)
        }
    }

    return (
        <Card className='p-2' style={{ minHeight: '70dvh' }}>
            <div>
                <div className='d-flex justify-content-end gap-1'>

                    <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                        <DropdownToggle caret color='gradient-primary'>Тайлан татах</DropdownToggle>
                        <DropdownMenu>
                            {/* <DropdownItem header>Ерөнхий</DropdownItem> */}
                                <DropdownItem className='w-100' onClick={() => generalReportHandler()}>Ерөнхий тайлан татах</DropdownItem>
                            {/* <DropdownItem divider /> */}
                            {/* <DropdownItem header>Дэлгэрэнгүй</DropdownItem> */}
                                {/* <DropdownItem className='w-100' disabled>Дэлгэрэнгүй тайлан татах</DropdownItem> */}
                        </DropdownMenu>
                    </Dropdown>
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
                    // mainDataLoading && Loader
                }
                <>
                    <div className='my-1 shadow p-1 rounded-3'>
                        <div id='map_chart'></div>
                    </div>
                    <div>
                        <div className='shadow p-1 rounded-3 mt-1 mb-2'>
                            <div className='d-flex justify-content-center mb-2 mt-50' style={{ fontWeight: 900, fontSize: 16 }}>
                                Элсэгчдийн мэдээлэл мэргэжил, хүйсээр
                            </div>
                            <div className='recharts-wrapper bar-chart' style={{ height: '500px' }}>
                                <ResponsiveContainer>
                                    <BarChart height={300} data={datas?.profs} barSize={25}>
                                        <CartesianGrid strokeOpacity={0.3} />

                                        <XAxis dataKey="prof_name" />
                                        <YAxis />

                                        <Legend />
                                        <Tooltip content={CustomTooltip} cursor={{fill: 'rgba(148, 148, 148, 0.1)'}}/>

                                        <Bar dataKey='male' name='Эрэгтэй' fill="#4287f5" radius={[50,50,0,0]}/>
                                        <Bar dataKey='female' name='Эмэгтэй' fill='#dc8ee6' radius={[50,50,0,0]}/>

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
