

import React, { useEffect, useState, useContext } from "react";
import { useParams, useLocation } from 'react-router-dom';
import './style.css'
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { Badge } from "reactstrap";
import { AlertTriangle } from "react-feather";
import SchoolContext from '@context/SchoolContext'

function ExamReport() {

    const { parentschoolName } = useContext(SchoolContext)
    const [ datas, setDatas ] = useState({})
    const { id } = useParams()
    const examApi = useApi().timetable.exam
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

    async function getResults() {
        const { success, data } = await fetchData(examApi.getOne(id))
        if(success) {
            setDatas(data)
        }
    }

    useEffect(
    () =>
    {
        getResults()
    },
    []
    )

    useEffect(
        () =>
        {

            window.onafterprint = function()
            {
                window.history.go(-1);
            }
        },
        []
    )

    function imageLoaded()
    {
        if (Object.keys(datas).length != 0)
        {
            setTimeout(() => window.print(), 1000)
        }
    }

    function convertPercentageToNumber(percentage) {
        percentage = Math.min(100, Math.max(0, percentage));
        const normalizedValue = percentage / 100;
        const result = normalizedValue * 30;
        if(percentage === 0){
            return ''
        } else {
            return result;
        }
    }


    function fdata(group){
        const filter = datas.student_list.filter(data => { if (data.group === group && data.status === 1) return data})
        return filter
    }

    return(
        <>
        {isLoading && Loader}
        {Object.keys(datas).length > 0 ?
            datas?.student_group_list.map((vdata, vidx ) => {
                return(
                    <div key={`groups${vidx}`} className={`d-flex align-items-center flex-column justify-content-start align-items-center mt-0 ${vidx + 1 === datas.student_group_list.length ? '' : 'page-break-always border-0'}`}>
                        <div className="w-100">
                            <div className='d-flex justify-content-between align-items-center w-100 mt-1' style={{ fontSize: '14px' }} >
                                    <div></div>
                                <div className="d-flex flex-column text-center fw-bolder">
                                    <span className='mt-1 fs-3 fw-bolder' style={{ color: '#000' }}>
                                        {parentschoolName} {/* Дотоод Хэргийн Их Сургууль */}
                                    </span>
                                    {/* <span style={{ marginTop: '6px' }}>{datas?.school?.name_eng.toUpperCase()}</span> */}
                                </div>
                                <img className="fallback-logo" width={50} height={50} src={logo} alt="logo" onLoad={vidx === 0 ? imageLoaded : null}  />
                            </div>
                            <div className="my-2">
                                <table className="w-100 examreport" style={{ fontSize: '13px' }}>
                                    <tbody className="w-100">
                                        <tr className="w-100">
                                            <td className="first-cell">
                                                Анги: {vdata.name}
                                            </td>
                                            <td>
                                                Жил: {datas?.lesson_year}
                                            </td>
                                            <td>
                                                Багш: {datas?.teacher?.full_name}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                Хичээл: {datas?.lesson?.code} {datas?.lesson?.name}
                                            </td>
                                            <td>
                                                Улирал: {datas?.lesson_season === 1 ? 'Намар' : 'Хавар'}
                                            </td>
                                            <td>
                                                Кредит: {datas?.lesson?.kredit}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="shalgaltiin-huudas m-1">
                            Шалгалтын хуудас
                        </div>
                        <div className="w-100">
                            <table className="w-100 examreport" style={{ fontSize: 12 }}>
                                <thead>
                                    <tr>
                                        <th>
                                            №
                                        </th>
                                        <th>
                                            Овог
                                        </th>
                                        <th>
                                            Нэр
                                        </th>
                                        <th>
                                            Код
                                        </th>
                                        <th>
                                            70 оноо
                                        </th>
                                        <th style={{ maxWidth: '100px' }}>
                                            Шалгалтын оноо
                                        </th>
                                        <th>
                                            Нийт
                                        </th>
                                        <th>
                                            Дүн
                                        </th>
                                        <th>
                                            Багш
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fdata(vdata.id).map((data, idx) => {
                                        // setHeadLesson(data?.)
                                        const firstName = data?.first_name.toLowerCase();
                                        const formattedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

                                        const lastName = data?.last_name.toLowerCase();
                                        const formattedLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);

                                        return(
                                            <tr key={`student${idx}`}>
                                                <td style={{ width: 0 }}>
                                                    {idx + 1}
                                                </td>
                                                <td className="wraptext" style={{fontSize: '11px'}}>
                                                    {formattedLastName}
                                                </td>
                                                <td className="wraptext" style={{fontSize: '11px'}}>
                                                    {formattedFirstName}
                                                </td>
                                                <td>
                                                    {data?.code}
                                                </td>
                                                <td>
                                                    {data?.teach_score}
                                                </td>
                                                <td>
                                                    {/* {convertPercentageToNumber(data?.exam)} */}
                                                </td>
                                                <td>
                                                    {/* {data?.exam === 0 || data?.teach_score === 0 ? '' : convertPercentageToNumber(data?.exam) + data?.teach_score} */}
                                                </td>
                                                <td>
                                                    {/* {data?.exam === 0 || data?.teach_score === 0 ? '' : data?.assesment} */}
                                                </td>
                                                <td className="wraptext-teacher" style={{fontSize: '11px'}}>
                                                    {data?.teacher_name}
                                                </td>
                                            </tr>
                                    )})}
                                </tbody>
                            </table>
                            <div className="d-flex justify-content-center mt-2" style={{ color: '#000', fontWeight: 600 }}>
                                Дүнгийн нэгтгэл хэвлэсэн ажилтан: ..................................
                            </div>
                        </div>
                    </div>

                )
            })
        :
            <div className="d-flex justify-content-center align-items-center" style={{ height: '300px'}}>
                <Badge className="d-flex align-items-center" style={{ fontSize: 16}} pill color="light-warning">
                    <AlertTriangle style={{ height: 20, width: 20}}/> Уучлаарай өгөгдөл олдсонгүй
                </Badge>
            </div>
        }
        </>
    )
}

export default ExamReport
