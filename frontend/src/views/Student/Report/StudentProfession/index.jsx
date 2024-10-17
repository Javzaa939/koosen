import { useCallback, useEffect, useState } from "react"
import { Card, CardBody, CardTitle } from "reactstrap"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import useApi from '@hooks/useApi';
import useLoader from "@hooks/useLoader"
import VerticalBarChartLoader from "@lms_components/VerticalBarChart";

/**
    @param {} props
*/
const StudentProfession = () => {

    const [datas, setDatas] = useState({})
    const { isLoading, Loader, fetchData } = useLoader({ initValue: true })

    const studentProfessionApi = useApi().student.report

    const getData = useCallback(
        async () => {
            const { success, data } = await fetchData(studentProfessionApi.getProfession()).catch(err => err)
            if (success) {
                setDatas(data)
            }
        }
    )

    useEffect(
        () => {
            getData()
        },
        []
    )

    if (isLoading)
    {
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
        <Card>
            <CardTitle tag="h5">
                Хөтөлбөрөөр
            </CardTitle>
            <CardBody>
                <div className='recharts-wrapper bar-chart' style={{ height: '350px' }}>
                    <ResponsiveContainer>
                        <BarChart height={100} data={datas?.data} barSize={14}>
                            <CartesianGrid strokeOpacity={0.3} />

                            <XAxis dataKey="name" />
                            <YAxis />

                            <Legend />
                            <Tooltip content={CustomTooltip} cursor={{fill: 'rgba(148, 148, 148, 0.1)'}}/>

                            <Bar dataKey='male' name='Эрэгтэй' fill="#4287f5" radius={[50,50,0,0]}/>
                            <Bar dataKey='female' name='Эмэгтэй' fill='#dc8ee6' radius={[50,50,0,0]}/>

                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardBody>
        </Card>
    )
}
export default StudentProfession
