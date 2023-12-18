import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';
import './style.scss'

export default function ScoreSeason() {
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})


    const location = useLocation()
    const studentId = location?.state?.student
    const datas = location?.state?.data
    const year = location?.state?.year
    const season = location?.state?.season
    const def = location?.state?.def
    const studentInfo = datas?.all_total[0].student_info


    function imageLoaded()
    {
        !isLoading &&
        Object.keys(datas).length > 0 && setTimeout(() => window.print(), 1000)
    }

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

    const lessons = datas?.scoreregister[0]?.lesson_info
    const total_data = datas?.all_total[0].all_total

    return (
        <div className='p-2'>
            <div className='d-flex justify-content-center'>
                <div>
                    <div className='d-flex flex-column justify-content-evenly align-items-center w-100' style={{ fontSize: '12px' }} >
                        {/* <img className="fallback-logo" width={100} height={100} src={`${process.env.REACT_APP_MUIS_HR_MEDIA_URL}${def?.school?.logo_url}`} alt="logo" onLoad={imageLoaded} /> */}
                        {/* <img className="fallback-logo" width={100} height={100} src={`http://hr.mnun.edu.mn/media/orgs/logo/MNU-Logo_1.png`} alt="logo" onLoad={() => {imageLoaded()}} /> */}
                        <img className="fallback-logo" width={100} height={100} src={`http://hr.mnun.edu.mn/media/orgs/logo/MNU-Logo_1.png`} alt="logo"/>
                        <div className="d-flex flex-column text-center fw-bolder">
                            <span className='mt-1'>
                                Дотоод Хэргийн Их Сургууль
                            </span>
                            <span style={{ marginTop: '6px' }}>MONGOLIAN NATIONAL UNIVERSITY</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className='border-bottom my-1'>
            </div>
            <div className='d-flex justify-content-center'>
                <div>
                    <div>
                        <div className="text-center mt-1">
                            {def?.school?.address} {def?.school?.phone_number && `Утас: ${def?.school?.phone_number}`} {def?.school?.home_phone && `Факс: ${def?.school?.home_phone}`}
                            <div>{def?.school?.email && `E-mail: ${def?.school?.email}`}</div>
                        </div>
                        <div className="text-center fst-italic">
                            _______________________________№_______________________________
                        </div>

                        <div className="text-center mt-2 fw-bolder fs-3 mb-2">
                            Дүнгийн тодорхойлолт
                        </div>
                        <div className='d-flex mb-2'>
                            <div style={{ width: 100 }}>
                                <div>Оюутны код</div>
                                <div>Овог нэр</div>
                                <div>Мэргэжил</div>
                                <div>Элссэн он</div>
                                <div>Зэрэг</div>
                            </div>
                            <div>
                                <div>{studentInfo?.code}</div>
                                <div>{studentInfo?.full_name}</div>
                                <div>{studentInfo?.proffession}</div>
                                <div>{studentInfo?.join_year}</div>
                                <div>{studentInfo?.degree_name}</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Хичээлийн код</th>
                                    <th>Хичээлийн нэр</th>
                                    <th>Кредит</th>
                                    <th>Багшийн үнэлгээ</th>
                                    <th>Шалгалт</th>
                                    <th>Нийт</th>
                                    <th>Үнэлгээ</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className=''>
                                    <td className='border-0'></td>
                                    <td className='border-0'></td>
                                    <td className='border-0'></td>
                                    <td className='border-0'></td>
                                    <td className='border-0'></td>
                                    <td className='border-0 text-end' colSpan={3} style={{ fontStyle: 'italic' }}>{year} оны {season === 1 ? "намар" : "хавар" }</td>
                                </tr>
                                {lessons.map((lesson, lidx) => (
                                    <tr key={`lesson${lidx}`}>
                                        <td>
                                            {lidx + 1}
                                        </td>
                                        <td>
                                            {lesson?.lesson_code}
                                        </td>
                                        <td>
                                            {lesson?.lesson_name}
                                        </td>
                                        <td className='text-center'>
                                            {lesson?.lesson_kr}
                                        </td>
                                        <td>
                                            {lesson.status_num === 8 ? '' : lesson?.teach_score}
                                        </td>
                                        <td>
                                            {lesson.status_num === 8 ? '' :lesson?.exam_score}
                                        </td>
                                        <td>
                                            {lesson?.total_scores}
                                        </td>
                                        <td className='text-center'>
                                            {lesson?.assessment}
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td className='text-center' colSpan={3}>
                                        Нийт хичээл: {datas?.lesson_count[0]?.less_count}
                                    </td>
                                    <td>
                                        {total_data?.total_kr}
                                    </td>
                                    <td colSpan={2}>
                                    </td>
                                    <td>
                                        {total_data?.total_onoo}
                                    </td>
                                    <td>
                                        {total_data?.total_gpa}
                                    </td>

                                </tr>
                                <tr>
                                    <td className='text-center' colSpan={4} style={{ fontStyle: 'italic' }}>
                                        Нийт кредит: {total_data?.total_kr} Дундаж дүн: {total_data?.total_onoo} Голч: {total_data?.total_gpa}
                                    </td>
                                    <td className='text-center' colSpan={4} style={{ fontStyle: 'italic' }}>
                                        {`[${datas.asses_count.map((ass,aidx) => (ass?.assessment__assesment + ": " + ass?.asses_count))}]`}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
