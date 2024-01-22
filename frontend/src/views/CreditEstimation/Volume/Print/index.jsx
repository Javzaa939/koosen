
import React, { useMemo, useState } from "react"

import { Row } from 'reactstrap'
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

// ** Styles
import '@styles/base/pages/app-invoice-print.scss'

import './style.css'

export default function Print()
{
    const { t } = useTranslation()

    // State
    const [ datas, setDatas ] = useState([])

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})

    // Api
    const creditVolumeApi = useApi().credit.volume

    const location = useLocation();
    const printDatas = location.state

    async function getDatas(dep_id='', year='', teacherId='', )
    {
        const { success, data } = await fetchData(creditVolumeApi.printGet(dep_id, year, teacherId))
        if (success)
        {
            setDatas(data)
        }
    }

    const header = useMemo(
        () => {
            if (!printDatas)
            {
                return <p>Уучлаарай утга олдсонгүй.</p>
            }
            else
            {
                getDatas(printDatas.departmentId, printDatas.year, printDatas.teacherId)
                return (
                    <>
                        <span className="fw-bolder" style={{fontSize: '10px', marginLeft: '10px' }} >БАТЛАВ. СУРГАЛТЫН АЛБАНЫ ДАРГА ............................................................. </span>

                        <div className="text-center fw-bolder" style={{fontSize: '10px' }}>
                            <p className="m-0 text-uppercase">{printDatas?.subSchool}</p>
                        </div>
                        <div className="text-center fw-bolder px-3 m-0" style={{fontSize: '10px' }}>
                            <p className="m-0 text-uppercase">{printDatas?.department} {`${printDatas?.department && '-ИЙН'}`} ҮНДСЭН БАГШ НАРЫН {printDatas?.year} ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН ЦАГИЙН АЧААЛАЛ</p>
                        </div>
                    </>
                )
            }
        },
        [printDatas]
    )

    const footer = useMemo(
        () => {
            if (printDatas)
            {
                return (
                    <div className="ms-3 mt-2">
                        <p className="fw-bolder" style={{fontSize: '8px', marginLeft: '10px', margin: '0px' }} >Хянасан: Хөтөлбөр хариуцсан Хөтөлбөртэн ............................................ </p>
                        <p className="fw-bolder" style={{fontSize: '8px', marginLeft: '10px', margin: '0px' }} >Хянасан: Бүрэлдэхүүн сургуулийн захирал ............................................ </p>
                        <p className="fw-bolder" style={{fontSize: '8px', marginLeft: '10px', margin: '0px' }} >Боловсруулсан: Тэнхимийн ахлагч ............................................ </p>
                    </div>
                )
            }
            else
            {
                <></>
            }
        },
        [printDatas]
    )

    const body = useMemo(
        () =>
        {
            if (datas.length !== 0)
            {
                return (
                    datas.map((val, idx) =>
                    {
                        let season1_lesson_datas = []
                        let season2_lesson_datas = []

                        let count = 0

                        let s1_kr = 0
                        let s1_exec_kr = 0
                        let s1_time = 0
                        let s1_lekts = 0
                        let s1_sem = 0
                        let s1_lab = 0
                        let s1_pra = 0
                        let s1_bd = 0

                        let s2_kr = 0
                        let s2_exec_kr = 0
                        let s2_time = 0
                        let s2_lekts = 0
                        let s2_sem = 0
                        let s2_lab = 0
                        let s2_pra = 0
                        let s2_bd = 0

                        let seasons_1 = val.seasons.filter(e => e.season_code === 1)[0].data
                        let seasons_2 = val.seasons.filter(e => e.season_code === 2)[0].data

                        let teacher_id = val.id

                        for (let season1_data of seasons_1)
                        {
                            let data = season1_data
                            let lesson_level_values

                            /** Давхцаж байгааг шалгана */
                            let check = season1_lesson_datas.filter((val) => {
                                return (val.lesson_level == season1_data.lesson_level && (val.group_name?.includes(season1_data.group_name) || season1_data.group_name.includes(val.group_name)) && val.lesson.code == season1_data.lesson.code)
                            })

                            if (!Object.keys(data).includes('lesson_level_values'))
                            {
                                lesson_level_values = { 'lesson_level_values' : [
                                    {
                                        'id': season1_data.type,
                                        'credit': season1_data.credit
                                    }]
                                }
                                data = Object.assign(data, lesson_level_values)
                            }if (check.length == 0)
                            {
                                season1_lesson_datas.push(data)
                            }
                            else
                            {
                                let lesson_level_data = check[0].lesson_level_values
                                lesson_level_data.push({
                                    'id': data.type,
                                    'credit': data.credit
                                })
                            }
                        }

                        for (let season2_data of seasons_2)
                        {
                            let data = season2_data
                            let lesson_level_values

                            /** Давхцаж байгааг шалгана */
                            let check = season2_lesson_datas.filter((val) => {
                                return (val.lesson_level == season2_data.lesson_level && (val.group_name.includes(season2_data.group_name) || season2_data.group_name.includes(val.group_name)) && val.lesson.code == season2_data.lesson.code)
                            })

                            if (!Object.keys(data).includes('lesson_level_values'))
                            {
                                lesson_level_values = { 'lesson_level_values' : [
                                    {
                                        'id': season2_data.type,
                                        'credit': season2_data.credit
                                    }]
                                }
                                data = Object.assign(data, lesson_level_values)
                            }if (check.length == 0)
                            {
                                season2_lesson_datas.push(data)
                            }
                            else
                            {
                                let lesson_level_data = check[0].lesson_level_values
                                lesson_level_data.push({
                                    'id': data.type,
                                    'credit': data.credit
                                })
                            }
                        }

                        let max_season = season1_lesson_datas.length > season2_lesson_datas.length ? season1_lesson_datas.length : season2_lesson_datas.length

                        return (
                            <div key={idx} className="p-0" id="breakInside" >
                                <div className={`d-flex px-0 mt-1 border`} style={{ width: '100%', fontSize: '8px', backgroundColor: '#D9D9D9' }} >
                                    <div className="border-end fw-bolder d-flex justify-content-evenly" style={{ width: '95%' }} >
                                        <span>Багшийн овог нэр: {`${val?.last_name[0]}.${val?.first_name}`}</span>
                                        <span>Зэрэглэл: </span>
                                        <span>Боловсролын зэрэг: </span>
                                        <span>Гүйцэтгэх норм: </span>
                                    </div>
                                    <div className="text-center fw-bolder" style={{ width: '5%' }} >
                                        Дүн
                                    </div>
                                </div>
                                <div className={`d-flex px-0 border border-top-0`} style={{ width: '100%', fontSize: '8px', backgroundColor: '#D9D9D9' }} >
                                    <div className="border-end fw-bolder d-flex justify-content-evenly" style={{ width: '47.5%' }} >
                                        <span>1-р улирал</span>
                                    </div>
                                    <div className="border-end fw-bolder d-flex justify-content-evenly" style={{ width: '47.5%' }} >
                                        <span>2-р улирал</span>
                                    </div>
                                    <div className="text-center fw-bolder" style={{ width: '5%' }} >
                                        Нийт
                                    </div>
                                </div>
                                <div className={`d-flex px-0 border border-top-0 fw-bolder`} style={{ width: '100%', fontSize: '8px', height: '50px' }} >
                                    <div className="border-end fw-bolder d-flex" style={{ width: '47.5%' }} >
                                        <div className="border-end h-100 position-relative" style={{ width: '4%', height: '10px' }} >
                                            <span className="position-absolute bottom-0 w-100 text-center">Д/д</span>
                                        </div>
                                        <div className="border-end h-100 position-relative" style={{ width: '10%' }} >
                                            <span className="position-absolute bottom-0 w-100 text-center" >Индекс</span>
                                        </div>
                                        <div className="border-end h-100 position-relative" style={{ width: '33%' }} >
                                            <span className="position-absolute bottom-0 w-100 text-center" >Хичээлийн нэр</span>
                                        </div>
                                        <div className="border-end h-100 text-break lh-1" style={{ width: '4.5%', paddingBottom: '1px' }} >
                                            <span style={{ writingMode: 'vertical-rl', transform: 'scale(-1)' }} >Хичээлийн</span>
                                        </div>
                                        <div className="border-end h-100 text-break lh-1" style={{ width: '4.5%', paddingBottom: '1px' }} >
                                            <span style={{ writingMode: 'vertical-rl', transform: 'scale(-1)' }} >Гүйцэтгэлийн кр</span>
                                        </div>
                                        <div className="border-end h-100 position-relative" style={{ width: '4.5%'}} >
                                            <span className="position-absolute bottom-0" style={{ writingMode: 'vertical-rl', transform: 'scale(-1)' }} >Цаг</span>
                                        </div>
                                        <div className="border-end h-100 position-relative" style={{ width: '2.5%'}} >
                                            <span className="position-absolute bottom-0" style={{ writingMode: 'vertical-rl', transform: 'scale(-1)' }} >ЕСХ</span>
                                        </div>
                                        <div className="border-end h-100 position-relative" style={{ width: '2.5%'}} >
                                            <span className="position-absolute bottom-0" style={{ writingMode: 'vertical-rl', transform: 'scale(-1)' }} >МСХ</span>
                                        </div>
                                        <div className="border-end h-100 position-relative" style={{ width: '2.5%'}} >
                                            <span className="position-absolute bottom-0" style={{ writingMode: 'vertical-rl', transform: 'scale(-1)' }} >МХ</span>
                                        </div>
                                        <div style={{ width: '20%'}} >
                                            <div className="w-100 d-inline-block text-center border-end border-bottom" style={{ maxHeight: '11.59px' }} >
                                                Цаг
                                            </div>
                                            <div className="d-inline-block border-end position-relative" style={{ height: '38.41px', width: '20%' }} >
                                                <span className="position-absolute bottom-0 text-center w-100">лк</span>
                                            </div>
                                            <div className="d-inline-block border-end position-relative" style={{ height: '38.41px', width: '20%' }} >
                                                <span className="position-absolute bottom-0 text-center w-100">сем</span>
                                            </div>
                                            <div className="d-inline-block border-end position-relative" style={{ height: '38.41px', width: '20%' }} >
                                                <span className="position-absolute bottom-0 text-center w-100">лаб</span>
                                            </div>
                                            <div className="d-inline-block border-end position-relative" style={{ height: '38.41px', width: '20%' }} >
                                                <span className="position-absolute bottom-0 text-center w-100">пра</span>
                                            </div>
                                            <div className="d-inline-block border-end position-relative" style={{ height: '38.41px', width: '20%' }} >
                                                <span className="position-absolute bottom-0 text-center w-100">бд</span>
                                            </div>
                                        </div>
                                        <div className="h-100 position-relative" style={{ width: '12%'}}>
                                            <span className="position-absolute bottom-0 text-center w-100">Орох анги</span>
                                        </div>
                                    </div>
                                    <div className="border-end fw-bolder d-flex" style={{ width: '47.5%' }} >
                                        <div className="border-end h-100 position-relative" style={{ width: '4%', height: '10px' }} >
                                            <span className="position-absolute bottom-0 w-100 text-center">Д/д</span>
                                        </div>
                                        <div className="border-end h-100 position-relative" style={{ width: '10%' }} >
                                            <span className="position-absolute bottom-0 w-100 text-center" >Индекс</span>
                                        </div>
                                        <div className="border-end h-100 position-relative" style={{ width: '33%' }} >
                                            <span className="position-absolute bottom-0 w-100 text-center" >Хичээлийн нэр</span>
                                        </div>
                                        <div className="border-end h-100 text-break lh-1" style={{ width: '4.5%', paddingBottom: '1px' }} >
                                            <span style={{ writingMode: 'vertical-rl', transform: 'scale(-1)' }} >Хичээлийн</span>
                                        </div>
                                        <div className="border-end h-100 text-break lh-1" style={{ width: '4.5%', paddingBottom: '1px' }} >
                                            <span style={{ writingMode: 'vertical-rl', transform: 'scale(-1)' }} >Гүйцэтгэлийн кр</span>
                                        </div>
                                        <div className="border-end h-100 position-relative" style={{ width: '4.5%'}} >
                                            <span className="position-absolute bottom-0" style={{ writingMode: 'vertical-rl', transform: 'scale(-1)' }} >Цаг</span>
                                        </div>
                                        <div className="border-end h-100 position-relative" style={{ width: '2.5%'}} >
                                            <span className="position-absolute bottom-0" style={{ writingMode: 'vertical-rl', transform: 'scale(-1)' }} >ЕСХ</span>
                                        </div>
                                        <div className="border-end h-100 position-relative" style={{ width: '2.5%'}} >
                                            <span className="position-absolute bottom-0" style={{ writingMode: 'vertical-rl', transform: 'scale(-1)' }} >МСХ</span>
                                        </div>
                                        <div className="border-end h-100 position-relative" style={{ width: '2.5%'}} >
                                            <span className="position-absolute bottom-0" style={{ writingMode: 'vertical-rl', transform: 'scale(-1)' }} >МХ</span>
                                        </div>
                                        <div style={{ width: '20%'}} >
                                            <div className="w-100 d-inline-block text-center border-end border-bottom" style={{ maxHeight: '11.59px' }} >
                                                Цаг
                                            </div>
                                            <div className="d-inline-block border-end position-relative" style={{ height: '38.41px', width: '20%' }} >
                                                <span className="position-absolute bottom-0 text-center w-100">лк</span>
                                            </div>
                                            <div className="d-inline-block border-end position-relative" style={{ height: '38.41px', width: '20%' }} >
                                                <span className="position-absolute bottom-0 text-center w-100">сем</span>
                                            </div>
                                            <div className="d-inline-block border-end position-relative" style={{ height: '38.41px', width: '20%' }} >
                                                <span className="position-absolute bottom-0 text-center w-100">лаб</span>
                                            </div>
                                            <div className="d-inline-block border-end position-relative" style={{ height: '38.41px', width: '20%' }} >
                                                <span className="position-absolute bottom-0 text-center w-100">пра</span>
                                            </div>
                                            <div className="d-inline-block border-end position-relative" style={{ height: '38.41px', width: '20%' }} >
                                                <span className="position-absolute bottom-0 text-center w-100">бд</span>
                                            </div>
                                        </div>
                                        <div className="h-100 position-relative" style={{ width: '12%'}}>
                                            <span className="position-absolute bottom-0 text-center w-100">Орох анги</span>
                                        </div>
                                    </div>

                                    <div className="fw-bolder" style={{ width: '5%' }} >
                                        <div className="w-50 d-inline-block text-center border-end border-bottom" style={{ maxHeight: '11.59px' }} >
                                            Цаг
                                        </div>
                                        <div className="w-50 d-inline-block text-center border-bottom" style={{ maxHeight: '11.59px' }} >
                                            Кр
                                        </div>
                                        <div className="w-50 d-inline-block border-end position-relative" style={{ height: '38.41px' }} >
                                            <span className="position-absolute start-50 top-50 translate-middle" id={`alltime${teacher_id}`} ></span>
                                        </div>
                                        <div className="w-50 d-inline-block position-relative" style={{ height: '38.41px' }} >
                                            <span className="position-absolute start-50 top-50 translate-middle" id={`allkredit${teacher_id}`} >{}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border border-top-0 p-0 position-relative" style={{ fontSize: '8px' }} >
                                    <div className="d-flex" style={{ width: '95%' }} >

                                        <table className="w-100 m-0 table table-bordered text-center" >
                                            <tbody>
                                                {
                                                    [...Array(max_season)].map((val, idx) =>
                                                    {
                                                        count++

                                                        let kr_exec_s1 = (season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 2) ? season1_lesson_datas[idx]?.exec_kr : 0) + (season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 3) ? season1_lesson_datas[idx]?.exec_kr : 0) + (season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 1) ? season1_lesson_datas[idx]?.exec_kr : 0) + (season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 5) ? season1_lesson_datas[idx]?.exec_kr : 0) + (season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 6) ? season1_lesson_datas[idx]?.exec_kr : 0)
                                                        let kr_time_s1 = (season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 2) ? season1_lesson_datas[idx]?.credit : 0) + (season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 3) ? season1_lesson_datas[idx]?.credit : 0) + (season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 1) ? season1_lesson_datas[idx]?.credit : 0) + (season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 5) ? season1_lesson_datas[idx]?.credit : 0) + (season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 6) ? season1_lesson_datas[idx]?.credit : 0)

                                                        s1_kr += season1_lesson_datas[idx]?.lesson?.kredit || 0
                                                        s1_exec_kr += kr_exec_s1

                                                        s1_time += season1_lesson_datas[idx]?.credit || 0
                                                        s1_lekts += season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 2) && season1_lesson_datas[idx]?.credit || 0
                                                        s1_sem += season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 3) && season1_lesson_datas[idx]?.credit || 0
                                                        s1_lab += season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 1) && season1_lesson_datas[idx]?.credit || 0
                                                        s1_pra += season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 5) && season1_lesson_datas[idx]?.credit || 0
                                                        s1_bd += season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 6) && season1_lesson_datas[idx]?.credit || 0

                                                        let kr_exec_s2 = (season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 2) ? season2_lesson_datas[idx]?.exec_kr : 0) + (season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 3) ? season2_lesson_datas[idx]?.exec_kr : 0) + (season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 1) ? season2_lesson_datas[idx]?.exec_kr : 0) + (season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 5) ? season2_lesson_datas[idx]?.exec_kr : 0) + (season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 6) ? season2_lesson_datas[idx]?.exec_kr : 0)
                                                        let kr_time_s2 = (season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 2) ? season2_lesson_datas[idx]?.credit : 0) + (season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 3) ? season2_lesson_datas[idx]?.credit : 0) + (season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 1) ? season2_lesson_datas[idx]?.credit : 0) + (season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 5) ? season2_lesson_datas[idx]?.credit : 0) + (season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 6) ? season2_lesson_datas[idx]?.credit : 0)

                                                        s2_kr += season2_lesson_datas[idx]?.lesson?.kredit || 0
                                                        s2_exec_kr += kr_exec_s2

                                                        s2_time += season2_lesson_datas[idx]?.credit || 0
                                                        s2_lekts += season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 2) && season2_lesson_datas[idx]?.credit || 0
                                                        s2_sem += season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 3) && season2_lesson_datas[idx]?.credit || 0
                                                        s2_lab += season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 1) && season2_lesson_datas[idx]?.credit || 0
                                                        s2_pra += season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 5) && season2_lesson_datas[idx]?.credit || 0
                                                        s2_bd += season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 6) && season2_lesson_datas[idx]?.credit || 0

                                                        if (idx == max_season - 1)
                                                        {
                                                            if (document.getElementById(`alltime${teacher_id}`) && document.getElementById(`allkredit${teacher_id}`))
                                                            {
                                                                document.getElementById(`alltime${teacher_id}`).innerText = s1_lekts + s1_sem + s1_lab + s1_pra + s1_bd + s2_lekts + s2_sem + s2_lab + s2_pra + s2_bd
                                                                document.getElementById(`allkredit${teacher_id}`).innerText = (s1_exec_kr + s2_exec_kr).toFixed(1)
                                                            }
                                                        }

                                                        return (
                                                            <tr key={idx}>

                                                                <td className="p-0  border-start-0" style={{ width: '2%' }} >{season1_lesson_datas[idx]?.lesson && count}</td>
                                                                <td className="p-0" style={{ width: '5%' }} >{season1_lesson_datas[idx]?.lesson?.code}</td>
                                                                <td className="p-0" style={{ width: '16.5%' }} >{season1_lesson_datas[idx]?.lesson?.name}</td>
                                                                <td className="p-0" style={{ width: '2.25%' }} >{season1_lesson_datas[idx]?.lesson?.kredit}</td>
                                                                <td className="p-0" style={{ width: '2.25%' }} >{kr_exec_s1 || ''}</td>
                                                                <td className="p-0" style={{ width: '2.25%' }} >{kr_time_s1 || ''}</td>
                                                                <td className="p-0" style={{ width: '1.25%' }} >{season1_lesson_datas[idx]?.lesson_level === 1 && '*'}</td>
                                                                <td className="p-0" style={{ width: '1.25%' }} >{season1_lesson_datas[idx]?.lesson_level === 2 && '*'}</td>
                                                                <td className="p-0" style={{ width: '1.25%' }} >{season1_lesson_datas[idx]?.lesson_level === 3 && '*'}</td>
                                                                <td className="p-0" style={{ width: '2%' }} >{season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 2) && season1_lesson_datas[idx]?.credit}</td>
                                                                <td className="p-0" style={{ width: '2%' }} >{season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 3) && season1_lesson_datas[idx]?.credit}</td>
                                                                <td className="p-0" style={{ width: '2%' }} >{season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 1) && season1_lesson_datas[idx]?.credit}</td>
                                                                <td className="p-0" style={{ width: '2%' }} >{season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 5) && season1_lesson_datas[idx]?.credit}</td>
                                                                <td className="p-0" style={{ width: '2%' }} >{season1_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 6) && season1_lesson_datas[idx]?.credit}</td>
                                                                <td className="p-0 text-break" style={{ width: '6%' }} >{season1_lesson_datas[idx]?.group_name}</td>

                                                                <td className="p-0 border-start-0" style={{ width: '2%' }} >{season2_lesson_datas[idx]?.lesson && count}</td>
                                                                <td className="p-0" style={{ width: '5%' }} >{season2_lesson_datas[idx]?.lesson?.code}</td>
                                                                <td className="p-0" style={{ width: '16.5%' }} >{season2_lesson_datas[idx]?.lesson?.name}</td>
                                                                <td className="p-0" style={{ width: '2.25%' }} >{season2_lesson_datas[idx]?.lesson?.kredit}</td>
                                                                <td className="p-0" style={{ width: '2.25%' }} >{kr_exec_s2 || ''}</td>
                                                                <td className="p-0" style={{ width: '2.25%' }} >{kr_time_s2 || ''}</td>
                                                                <td className="p-0" style={{ width: '1.25%' }} >{season2_lesson_datas[idx]?.lesson_level === 1 && '*'}</td>
                                                                <td className="p-0" style={{ width: '1.25%' }} >{season2_lesson_datas[idx]?.lesson_level === 2 && '*'}</td>
                                                                <td className="p-0" style={{ width: '1.25%' }} >{season2_lesson_datas[idx]?.lesson_level === 3 && '*'}</td>
                                                                <td className="p-0" style={{ width: '2%' }} >{season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 2) && season2_lesson_datas[idx]?.credit}</td>
                                                                <td className="p-0" style={{ width: '2%' }} >{season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 3) && season2_lesson_datas[idx]?.credit}</td>
                                                                <td className="p-0" style={{ width: '2%' }} >{season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 1) && season2_lesson_datas[idx]?.credit}</td>
                                                                <td className="p-0" style={{ width: '2%' }} >{season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 5) && season2_lesson_datas[idx]?.credit}</td>
                                                                <td className="p-0" style={{ width: '2%' }} >{season2_lesson_datas[idx]?.lesson_level_values?.find(e => e.id == 6) && season2_lesson_datas[idx]?.credit}</td>
                                                                <td className="p-0 text-break" style={{ width: '6%' }} >{season2_lesson_datas[idx]?.group_name}</td>

                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </tbody>
                                        </table>

                                    </div>

                                    <div className="fw-bolder text-center position-absolute top-0 end-0 h-100" style={{ width: '5%' }} >
                                        <span className="w-100 position-absolute top-50 start-50 translate-middle" >Зөрүү</span>
                                    </div>

                                </div>

                                <div className={`px-0 border border-top-0 w-100 d-flex fw-bolder bg-success`} style={{ fontSize: '8px' }} >
                                    <div className="border-end d-flex text-center" style={{ width: '95%' }} >

                                        <div className="border-end" style={{ width: '7%' }} >
                                            Бүгд
                                        </div>
                                        <div className="border-end" style={{ width: '16.5%' }} >
                                        </div>
                                        <div className="border-end" style={{ width: '2.25%' }} >
                                            {s1_kr}
                                        </div>
                                        <div className="border-end" style={{ width: '2.25%' }} >
                                            {s1_exec_kr.toFixed(1)}
                                        </div>
                                        <div className="border-end" style={{ width: '2.25%' }} >
                                            {s1_lekts + s1_sem + s1_lab + s1_pra + s1_bd}
                                        </div>
                                        <div className="border-end" style={{ width: '1.25%' }} >
                                        </div>
                                        <div className="border-end" style={{ width: '1.25%' }} >
                                        </div>
                                        <div className="border-end" style={{ width: '1.25%' }} >
                                        </div>
                                        <div className="border-end" style={{ width: '2%' }} >
                                            {s1_lekts}
                                        </div>
                                        <div className="border-end" style={{ width: '2%' }} >
                                            {s1_sem}
                                        </div>
                                        <div className="border-end" style={{ width: '2%' }} >
                                            {s1_lab}
                                        </div>
                                        <div className="border-end" style={{ width: '2%' }} >
                                            {s1_pra}
                                        </div>
                                        <div className="border-end" style={{ width: '2%' }} >
                                            {s1_bd}
                                        </div>
                                        <div className="border-end" style={{ width: '6%' }} >
                                        </div>

                                        <div className="border-end" style={{ width: '7%' }} >
                                            Бүгд
                                        </div>
                                        <div className="border-end" style={{ width: '16.5%' }} >
                                        </div>
                                        <div className="border-end" style={{ width: '2.25%' }} >
                                            {s2_kr}
                                        </div>
                                        <div className="border-end" style={{ width: '2.25%' }} >
                                            {s2_exec_kr.toFixed(1)}
                                        </div>
                                        <div className="border-end" style={{ width: '2.25%' }} >
                                            {s2_lekts + s2_sem + s2_lab + s2_pra + s2_bd}
                                        </div>
                                        <div className="border-end" style={{ width: '1.25%' }} >
                                        </div>
                                        <div className="border-end" style={{ width: '1.25%' }} >
                                        </div>
                                        <div className="border-end" style={{ width: '1.25%' }} >
                                        </div>
                                        <div className="border-end" style={{ width: '2%' }} >
                                            {s2_lekts}
                                        </div>
                                        <div className="border-end" style={{ width: '2%' }} >
                                            {s2_sem}
                                        </div>
                                        <div className="border-end" style={{ width: '2%' }} >
                                            {s2_lab}
                                        </div>
                                        <div className="border-end" style={{ width: '2%' }} >
                                            {s2_pra}
                                        </div>
                                        <div className="border-end" style={{ width: '2%' }} >
                                            {s2_bd}
                                        </div>
                                        <div style={{ width: '6%' }} >
                                        </div>

                                    </div>
                                    <div className="d-flex" style={{ width: '5%' }} >
                                        <div className="w-50 text-center border-end">
                                            0
                                        </div>
                                        <div className="w-50 text-center">
                                            0
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )
                    })
                )
            }

        },
        [datas]
    )

    return (
        <div className='invoice-print landscape overflow-hidden'>

            {isLoading && Loader}

            {header}

            <Row className='px-2 mt-1'>
                {body}
            </Row>

            {footer}

        </div>
    )
}
