import React, { useContext, useState, useEffect } from 'react';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from "@context/AuthContext"

import { useTranslation } from 'react-i18next';

import { get_day } from '@utils';

import { Table, CardBody, Spinner } from 'reactstrap'

import './style.scss'

const TableComponent = () => {

    var range_date = {
        start: '',
        end: ''
    }

    const { t } = useTranslation()
    const { user: userDetail } = useContext(AuthContext)

    const { isLoading, fetchData } = useLoader({ })

    const [datas, setDatas] = useState([])
    const [days, setDays] = useState(get_day())
    const [rangeDate, setRangeDate] = useState(range_date)

    // Api
    const scheduleApi = useApi().student.schedule

    function getDayName(day) {
        const day_names = days.find(value => value.id === day)
        return day_names?.name
    }

    async function getDatas() {
        const student_id = userDetail?.student?.id
        if(student_id) {
            const { success, data } = await fetchData(scheduleApi.get(student_id))
            if(success) {
                setDatas(data)
            }
        }
    }

    useEffect(() => {
        getDatas()
    },[])

    function romanize (num) {
        if (isNaN(num))
            return NaN;
        var digits = String(+num).split(""),
            key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
                   "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
                   "","I","II","III","IV","V","VI","VII","VIII","IX"],
            roman = "",
            i = 3;
        while (i--)
            roman = (key[+digits.pop() + (i * 10)] || "") + roman;
        return Array(+digits.join("") + 1).join("M") + roman;
    }


    return (
        <CardBody className='mt-1'>
            {
                isLoading &&
                <div className='suspense-loader'>
                    <Spinner size='bg'/>
                    <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                </div>
            }
            {/* <Table bordered responsive className='table'>
                <thead>
                    <tr>
                        <th>Гараг</th>
                        <th>Цаг</th>
                        <th>Хичээл</th>
                        <th>Хичээллэх төрөл</th>
                        <th>Хичээллэх анги</th>
                        <th>Хичээлийн код</th>
                        <th>Багш</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        datas && datas.length > 0 &&
                        datas.map((data, idx) => {
                            return (
                                <tr key={idx}>
                                    <td>{getDayName(data?.day)}</td>
                                    <td>{data?.time}</td>
                                    <td>{data?.lesson?.name}</td>
                                    <td>{data?.type}</td>
                                    <td>{data?.room?.code}</td>
                                    <td>{data?.lesson?.code}</td>
                                    <td>{data?.teacher?.full_name}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table> */}
            <Table bordered responsive className='table'>
                <thead>
                    <tr className='schedule_header'>
                        <td></td>
                        <td>Даваа</td>
                        <td>Мягмар</td>
                        <td>Лхагва</td>
                        <td>Пүрэв</td>
                        <td>Баасан</td>
                        <td>Бямба</td>
                        <td>Ням</td>
                    </tr>
                </thead>
                <tbody>
                    {
                        Array.from({length: 8},(_, idx) => {
                            return(
                                <tr key={idx}>
                                    <td className='text-center' style={{ width: '24px' }}>{romanize(idx + 1)}</td>
                                    {
                                        Array.from({length: 7}, (_, vidx) => {

                                            function valuefinder() {

                                                var cvalue = datas.find(val => (val.day === vidx + 1 && val.time === idx + 1)) || ''

                                                // var fvalue = cvalue && cvalue.length > 0 ? cvalue[0] : {}

                                                return cvalue || ''
                                            }

                                            return(
                                                <td className='p-50' key={vidx} style={{ width: 100, height: 50 }}>
                                                    {valuefinder() &&
                                                        <div className='custom_lesson_card rounded-3 test_bg' style={{ height: 'fit-content', padding: '0.2rem' }}>
                                                            <div className='text-end mb-25' style={{ textAlign:'end' }}>
                                                                <div className={`${valuefinder()?.type == 'Семинар' ? 'bg-light-danger' : valuefinder()?.type == 'Лекц' ? 'bg-light-primary' : 'bg-light-success'} d-inline-block rounded-5 border_lekts`} style={{ paddingLeft: '0.2rem', paddingRight: '0.2rem', fontSize: 10, display: 'inline-block', borderRadius: '5rem' }}>
                                                                    {valuefinder()?.type}
                                                                </div>
                                                            </div>
                                                            <div style={{ fontWeight: 800 }}>
                                                                {valuefinder()?.lesson?.name}
                                                            </div>
                                                            <div style={{ fontSize: 10 }}>
                                                                {valuefinder()?.teacher?.full_name}
                                                            </div>
                                                        </div>
                                                    }
                                                </td>
                                            )
                                        })
                                    }
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table>
        </CardBody>
    );
};

export default TableComponent;
