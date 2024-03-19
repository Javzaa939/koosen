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

import { datas } from './sampledata';
import './style.scss'

function Dashboard() {
    const { skin } = useSkin()
    const { t } = useTranslation()

	const elseltApi = useApi().elselt
	const dashApi = useApi().elselt.dashboard
	const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false});

    const [chosenElselt, setChosenElselt] = useState('all')

    const [dataz, setDatas] = useState({})
    const [aimagData, setAimagData] = useState([])
    const [professions, setProffesions] = useState([])

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

            var seriesData = datas.map(function(item) {
                return {
                    'hc-key': item.aimag_name, // Assuming 'aimag_name' corresponds to the country code
                    value: item.total
                };
            });

            setAimagData(seriesData)
        }
	}
    useEffect(() => {
        getDatas()
    }, [chosenElselt]
    )

    useEffect(() => {
        getElselts();
    }, [])

    const demColor = '#4956e6'
    const repColor = '#51a4fc'
    const libColor = '#f788df'

    async function chartz(){
        var seriesData = dataz?.haryalal?.map(function(item) {
            console.log(item)
            return {
                'hc-key': item.name,
                'value': item.total
            };
        });
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
            series: [{
                mapData,
                data: seriesData,
                name: 'Mongolia',
                borderColor: '#e0e0e0',
                joinBy: 'hc-key',
                keys: ['id', 'demVotes', 'repVotes', 'libVotes'],
                states: {
                    hover: {
                        color: '#BADA55' // Color when hovering over a data point
                    }
                },
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                },
                mapNavigation: {
                    enabled: true,
                    buttonOptions: {
                        verticalAlign: 'bottom'
                    }
                },
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
    }, [dataz])

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
                                {dataz?.all_student}
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
                                {dataz?.bachelor}
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
                                {dataz?.master}
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
                                {dataz?.doctor}
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
                                {dataz?.male}
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
                                {dataz?.female}
                            </div>
                        </div>
                        <div className='card_icon female_icon'>
                            <FaUser size={24}/>
                        </div>
                    </Col>
                </Row>
                <div className='my-2'>
                    <div id='map_chart'></div>
                </div>
            </div>
        </Card>
    )
}

export default Dashboard
