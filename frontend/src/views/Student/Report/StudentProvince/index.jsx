import React from 'react'
import { useState, useEffect } from 'react'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { useSkin } from "@hooks/useSkin"

import Highcharts from 'highcharts';

import { Card, CardBody } from 'reactstrap';

import VerticalBarChartLoader from "@lms_components/VerticalBarChart";

require('highcharts/indicators/indicators')(Highcharts)
require('highcharts/indicators/pivot-points')(Highcharts)
require('highcharts/indicators/macd')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)
require('highcharts/modules/map')(Highcharts)

import './style.scss'
import mapData from './mongolz.json'
import { t } from 'i18next';

function StudentProvince() {
    const { skin } = useSkin()

	const {
        isLoading,
        fetchData
    } = useLoader({isFullScreen: false});

    const [aimagz, setAimagz] = useState([])

    const studentProvinceApi = useApi().student.report

	async function getDatas() {
        const {success, data} = await fetchData(studentProvinceApi.getProvince())

        if(success) {

            var serdata = data?.haryalal.map((data) => {
                return(
                    [data?.name || '', data?.total, data?.male_student_total, data?.female_student_total ]
                )
            })

            setAimagz(serdata)
        }
	}

    useEffect(() => {
        getDatas()
    }, [])

    const demColor = '#4956e6'
    const repColor = '#51a4fc'
    const admColor = "#ff0066"

    async function chartz(){
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
                text: t('Харьяалалаар'),
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
                keys: ['id', 'demVotes', 'maleStudent', 'femaleStudent'],
                tooltip: {
                    headerFormat: '',
                    pointFormatter()
                    {
                        const hoverVotes = this.hoverVotes;
                        return '<b style="font-size: 13px;">' + this.id + '</b><br/>' +
                            [
                                ['Нийт', this.demVotes, demColor],
                                ['Эрэгтэй', this.maleStudent, repColor],
                                ['Эмэгтэй', this.femaleStudent, admColor],
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
                },
                dataLabels: {
                    enabled: true,
                    format: '{point.demVotes}'
                },
            }]
        });

    }

    useEffect(() => {
        chartz();
    }, [aimagz])

    if (isLoading) {
        return (
            <Card>
                <CardBody>
                    <VerticalBarChartLoader />
                </CardBody>
            </Card>
        )
    }

    return (
        <Card>
            <CardBody className='shadow-sm p-1 mb-5 bg-white rounded'>
                <div id='map_chart'></div>
            </CardBody>
        </Card>
    )
}

export default StudentProvince
