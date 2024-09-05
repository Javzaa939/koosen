
import React from 'react'
import { ThemeColors } from '@src/utility/context/ThemeColors';
import { useContext } from 'react';
import Chart from 'react-apexcharts';
import {
	Card,
	CardBody,
	CardHeader,
	CardText,
	CardTitle
} from 'reactstrap';
import moment from "moment";

function Stats() {
    const { colors } = useContext(ThemeColors)
	const trackBgColor = '#e9ecef'

	const statesArr = [
		{

			title: 'Шалгалт',
			value: <div>Hello</div>,
			chart: {
				type: 'radialBar',
				series: [54.4],
				height: 30,
				width: 30,
				options: {
					grid: {
						show: false,
						padding: {
							left: -15,
							right: -15,
							top: -12,
							bottom: -15
						}
					},
					colors: [colors.primary.main],
					plotOptions: {
						radialBar: {
							hollow: {
								size: '22%'
							},
							track: {
								background: trackBgColor
							},
							dataLabels: {
								showOn: 'always',
								name: {
									show: false
								},
								value: {
									show: false
								}
							}
						}
					},
					stroke: {
						lineCap: 'round'
					}
				}
			}
		},
		{

			title: 'Гэрийн даалгавар',
			value: '6.1%',
			chart: {
				type: 'radialBar',
				series: [6.1],
				height: 30,
				width: 30,
				options: {
					grid: {
						show: false,
						padding: {
							left: -15,
							right: -15,
							top: -12,
							bottom: -15
						}
					},
					colors: [colors.warning.main],
					plotOptions: {
						radialBar: {
							hollow: {
								size: '22%'
							},
							track: {
								background: trackBgColor
							},
							dataLabels: {
								showOn: 'always',
								name: {
									show: false
								},
								value: {
									show: false
								}
							}
						}
					},
					stroke: {
						lineCap: 'round'
					}
				}
			}
		},
		{

			title: 'Хичээлийн материал',
			value: '14.6%',
			chart: {
				type: 'radialBar',
				series: [14.6],
				height: 30,
				width: 30,
				options: {
					grid: {
						show: false,
						padding: {
							left: -15,
							right: -15,
							top: -12,
							bottom: -15
						}
					},
					colors: [colors.secondary.main],
					plotOptions: {
						radialBar: {
							hollow: {
								size: '22%'
							},
							track: {
								background: trackBgColor
							},
							dataLabels: {
								showOn: 'always',
								name: {
									show: false
								},
								value: {
									show: false
								}
							}
						}
					},
					stroke: {
						lineCap: 'round'
					}
				}
			}
		},

	]

	const renderStates = () => {
		return statesArr.map(state => {
			return (
				<div key={state.title} className='browser-states'>
					<div className='d-flex'>
						<h6 className='align-self-center mb-0'>{state.title}</h6>
					</div>
					<div className='d-flex align-items-center'>
						<div className='fw-bold text-body-heading me-1'>{state.value}</div>
						<Chart
							options={state.chart.options}
							series={state.chart.series}
							type={state.chart.type}
							height={state.chart.height}
							width={state.chart.width}
						/>
					</div>
				</div>
			)
		})
	}

  return (
        <div>
            <Card className='card-browser-states'>
                <CardHeader>
                    <div>
                        <CardTitle tag='h4'>{item.week_number}-р 7 хоног</CardTitle>
                        <CardText className='font-small-2'>{moment(item.end_date).format("YYYY-MM-DD HH:mm")}</CardText>
                    </div>
                </CardHeader>
                <CardBody>{renderStates()}</CardBody>
            </Card>
        </div>
    )
    }

export default Stats

