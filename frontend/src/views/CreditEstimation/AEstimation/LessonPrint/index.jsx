
import React, { useEffect, useState} from "react"
import { useLocation, useNavigate } from 'react-router-dom';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import '@styles/base/pages/app-invoice-print.scss'
import './style.css'


export default function LessonPrint()
{
    const navigate = useNavigate()
    const location = useLocation();
    const printDatas = location.state

    // Loader && Api's
    const { fetchData } = useLoader({})
    const creditSettingsApi = useApi().credit.settings

    const [ settingsData, setSettingsData ] = useState([])

    async function getDatas()
    {
        const {success, data} = await fetchData(creditSettingsApi.getAll(1))
        if(success)
        {
            setSettingsData(data)
        }
    }

    useEffect(
        () =>
        {
            if (Object.keys(printDatas).length != 0)
            {
                setTimeout(() => window.print(), 1000)
            }
        },
        [printDatas]
    )

    useEffect(
        () =>
        {
            getDatas()
        },
        []
    )

    useEffect(
        () =>
        {
            window.onafterprint = function()
            {
                navigate(-1)
            }
        },
        []
    )

    return (
        <div className='invoice-print landscape overflow-hidden'>
            <div className='px-2 mt-1'>
                <div className="text-center fw-bolder px-3 m-0" style={{fontSize: '9px' }}>
                    <p className="m-0 text-uppercase">{printDatas?.estimations?.length > 0 ? printDatas?.estimations[0]?.lesson_year : ''} ОНЫ ХИЧЭЭЛИЙН ЖИЛД БАГШ НАРЫН ГҮЙЦЭТГЭСЭН А ЦАГИЙН ТООЦООНЫ НЭГТГЭЛ </p>
                </div>

                <h6 className="mt-2" style={{fontSize: '10px' }}>----------------------------------- Ерөнхий мэдээлэл -----------------------------------</h6>
                <div className="p-0" style={{ width: '98%', fontSize: '8px' }} >
                    <div className="d-inline-block" style={{ width: '50%' }} >
                        <small><span className="fw-bolder">Бүрэлдэхүүн сургууль: </span>{printDatas?.teacher?.sub_org?.name}</small>
                    </div>
                    <div className="d-inline-block" style={{ width: '50%' }} >
                        <small><span className="fw-bolder">№: </span>{printDatas?.teacher?.code}</small>
                    </div>
                </div>
                <div className="p-0" style={{ width: '98%', fontSize: '8px' }} >
                    <div className="d-inline-block" style={{ width: '50%' }} >
                        <small><span className="fw-bolder">Багшийн овог нэр: </span>{printDatas?.teacher?.full_name}</small>
                    </div>
                    <div className="d-inline-block" style={{ width: '50%' }} >
                        <small><span className="fw-bolder">Багшийн зэрэглэл: </span>{printDatas?.teacher?.org_position}</small>
                    </div>
                </div>

                <table className="table-bordered position-relative float-end mt-1" style={{ width: '100%', fontSize: '6px' }} >
                    <thead>
                        <tr>
                            <th rowSpan={2} className="px-1">
                            Улирал
                            </th>
                            <th rowSpan={2} className="px-1">
                            Хичээлийн нэр
                            </th>
                            <th rowSpan={2} className="px-1">
                            Хичээл орсон анги
                            </th>
                            <th rowSpan={2} className="px-1">
                            Оюутны тоо
                            </th>
                            <th rowSpan={2} className="px-1">
                            Лекц цаг
                            </th>
                            <th rowSpan={2} className="px-1">
                            Сем цаг
                            </th>
                            <th rowSpan={2} className="px-1">
                            Нийт цаг
                            </th>
                            <th rowSpan={2} className="px-1">
                            Кр
                            </th>
                            <th colSpan={settingsData.length} className="px-1">
                            Танхим бус кредит
                            </th>
                        </tr>
                        <tr>
                            {
                                settingsData?.length > 0
                                ?
                                    settingsData.map((val, idx) =>
                                    {
                                        return (
                                            <th key={idx}>{val?.name}/{val?.ratio}/</th>
                                        )
                                    })
                                :
                                    null
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            printDatas?.estimations?.length > 0
                            ?
                                printDatas.estimations.filter((val) => val.lesson_season.season_code == 1).map((val, idx, array) =>
                                {
                                    return (
                                        <tr key={idx}>
                                            <td>{val?.lesson_season?.season_name}</td>
                                            <td>{val?.lesson?.name}</td>
                                            <td>{val?.group_names}</td>
                                            <td className="text-center">{val?.st_count}</td>
                                            <td className="text-center">{val?.lesson?.lecture_kr || 0}</td>
                                            <td className="text-center">{val?.lesson?.seminar_kr || 0}</td>
                                            <td className="text-center">{val?.lesson?.total_kr || 0}</td>
                                            <td className="text-center">{val?.exec_kr}</td>
                                            {
                                                settingsData?.length > 0
                                                ?
                                                    settingsData.map((sval, cidx) =>
                                                    {
                                                        var chamber = val?.not_chamber_data?.find((c) => c.time_estimate_settings?.id === sval?.id)
                                                        return (
                                                            <td className="text-center" key={cidx}>{chamber ? (chamber?.amount || 0) * chamber?.time_estimate_settings?.ratio : 0}</td>
                                                        )
                                                    })
                                                :
                                                    null
                                            }
                                        </tr>
                                    )
                                })
                            :
                                null
                        }
                        {
                            printDatas?.estimations?.length > 0
                            ?
                                printDatas.estimations.filter((val) => val.lesson_season.season_code == 2).map((val, idx, array) =>
                                {
                                    return (
                                        <tr key={idx}>
                                            <td>{val?.lesson_season?.season_name}</td>
                                            <td>{val?.lesson?.name}</td>
                                            <td>{val?.group_names}</td>
                                            <td className="text-center">{val?.st_count}</td>
                                            <td className="text-center">{val?.lesson?.lecture_kr || 0}</td>
                                            <td className="text-center">{val?.lesson?.seminar_kr || 0}</td>
                                            <td className="text-center">{val?.lesson?.total_kr || 0}</td>
                                            <td className="text-center">{val?.exec_kr}</td>
                                            {
                                                settingsData?.length > 0
                                                ?
                                                    settingsData.map((sval, cidx) =>
                                                    {
                                                        var chamber = val?.not_chamber_data?.find((c) => c.time_estimate_settings?.id === sval?.id)
                                                        return (
                                                            <td className="text-center" key={cidx}>{chamber ? (chamber?.amount || 0) * chamber?.time_estimate_settings?.ratio : 0}</td>
                                                        )
                                                    })
                                                :
                                                    null
                                            }
                                        </tr>
                                    )
                                })
                            :
                                null
                        }
                    </tbody>
                </table>

                <table className="table-bordered position-relative float-end mt-2" style={{ width: '60%', fontSize: '7px' }} >
                    <thead>
                        <tr>
                            <th rowSpan={2} className="px-1" style={{ width: '20%' }} >
                                Заах кредит
                            </th>
                            <th colSpan={2} className="px-1" style={{ width: '20%' }} >
                                Тэнхимийн нийт
                            </th>
                            <th rowSpan={2} className="px-1" style={{ width: '20%' }} >
                                Тэнхимийн бус нийт Кр
                            </th>
                            <th rowSpan={2} className="px-1" style={{ width: '20%' }} >
                                Нийт Кр
                            </th>
                            <th rowSpan={2} className="px-1" style={{ width: '20%' }} >
                                Зөрүү
                            </th>
                        </tr>
                        <tr>
                            <th className="px-1">Цаг</th>
                            <th className="px-1">Кредит</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ height: '50px' }}>
                            <td className="text-center">{(printDatas?.teacher_norm || 0)}</td>
                            <td className="text-center">{(printDatas?.spring_kredit || 0) + (printDatas?.autumn_kredit || 0)}</td>
                            <td className="text-center">{(printDatas?.exec_kr || 0)}</td>
                            <td className="text-center">{(printDatas?.not_chamber_exec_kr || 0)}</td>
                            <td className="text-center">{(printDatas?.not_chamber_exec_kr || 0) + (printDatas?.exec_kr || 0)}</td>
                            <td className="text-center">{((printDatas?.not_chamber_exec_kr || 0) + (printDatas?.exec_kr || 0)) - (printDatas?.teacher_norm || 0)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
