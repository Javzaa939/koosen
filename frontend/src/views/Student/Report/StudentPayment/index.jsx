import { useCallback, useEffect, useState } from "react"
import { Card, CardBody, CardTitle } from "reactstrap"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import useApi from '@hooks/useApi';
import useLoader from "@hooks/useLoader"
import VerticalBarChartLoader from "@lms_components/VerticalBarChart";

/**
    @param {} props
*/
export default function StudentPayment({ template }) {

    const [datas, setDatas] = useState({})
    const [slideTitle, setSlideTitle] = useState('')
    const { isLoading, Loader, fetchData } = useLoader({ initValue: true })
    const studentReportPaymentApi = useApi().student.report

    const getData = useCallback(
        async () => {
            const template_id = {
                school: 1,
                department: 2,
                profession: 3,
                group: 4
            }

            if (template_id[template]) {
                const { success, data } = await fetchData(studentReportPaymentApi.getPayment(template_id[template])).catch(err => err)

                if (success) {
                    setDatas(data)
                }
            }
        }
    )

    useEffect(
        () => {
            getData()

            switch (template) {
                case 'school':
                    setSlideTitle('Суралцагчийн тоо сургуулиар')

                    break
                case 'department':
                    setSlideTitle('салбараар')

                    break
                case 'profession':
                    setSlideTitle('мэргэжлээр')

                    break
                case 'group':
                    setSlideTitle('ангиараа')

                    break
                default:
                    setSlideTitle('')

                    break
            }
        },
        []
    )

    if (isLoading) {
        return <Card>
            <CardBody>
                <VerticalBarChartLoader />
            </CardBody>
        </Card>
    }

    const CustomTooltip = data => {
        if (data?.active && data?.payload && data?.payload.length > 0) {
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
                                Нийт : {data?.payload?.map(i => i.payload[i.dataKey]).reduce((accumulator, currentValue) => accumulator + currentValue)}
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
                                        {datas.labels_level2.find(item => item.key === i.dataKey).label} : {i.payload[i.dataKey]}
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
        <Card>
            <CardTitle tag="h5">
                {slideTitle}
            </CardTitle>
            <CardBody>
                <div className='recharts-wrapper bar-chart' style={{ height: '350px' }}>
                    <ResponsiveContainer>
                        <BarChart height={100} data={datas?.data} barSize={14}>
                            <CartesianGrid strokeOpacity={0.3} />

                            <XAxis dataKey="name" />
                            <YAxis />

                            <Legend />
                            <Tooltip content={CustomTooltip} cursor={{ fill: 'rgba(148, 148, 148, 0.1)' }} />

                            <Bar dataKey={datas.labels_level2[0].key} name={datas.labels_level2[0].label} fill="#4287f5" radius={[50, 50, 0, 0]} />
                            <Bar dataKey={datas.labels_level2[1].key} name={datas.labels_level2[1].label} fill='#dc8ee6' radius={[50, 50, 0, 0]} />

                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardBody>
        </Card>
    )
}
