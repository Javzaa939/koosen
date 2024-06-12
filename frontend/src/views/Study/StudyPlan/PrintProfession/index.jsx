
import React, { Fragment, useEffect, useState, useContext } from "react"

import { Row } from 'reactstrap'
import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';
import SchoolContext from "@src/utility/context/SchoolContext";

// ** Styles
import './style.scss'
import { AlertCircle, ChevronsLeft } from "react-feather";
import TableShow from "./TableShow";

export default function PrintProfession({ }) {

    const { parentschoolName } = useContext(SchoolContext)

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true })

    const [zaaval_data, setZaavalData] = useState([]);
    const [songon_data, setSongonData] = useState([])
    const [dadlaga_data, setDadlagaData] = useState([])
    const [standart_bagts_option, setStandartBagtsOption] = useState([]);

    // Api
    const lessonStandartApi = useApi().study.lessonStandart;
    const planApi = useApi().study.plan

    const datas = sessionStorage.getItem("professionDefination") ? JSON.parse(sessionStorage.getItem("professionDefination")) : null;
    const mergejil_id = sessionStorage.getItem("professionDefinationID") ? JSON.parse(sessionStorage.getItem("professionDefinationID")) : null;
    const listArr = sessionStorage.getItem("signature_data") ? JSON.parse(sessionStorage.getItem("signature_data")) : null;

    async function getDatas(clesson_type = '') {

        if (datas && Object.keys(datas).length > 0) {
            const department = datas?.department?.id || ''
            const school = datas?.school || ''
            const profession = datas?.id || ''
            const lesson_level = '' //энийг битгий өөрчлөөрэй
            const { success, data } = await fetchData(planApi.getPlan(department, school, profession, '', ''))
            if (success) {
                var zaaval_data = []
                var songon_data = []
                var dadlaga_data = []
                if (data && data.length > 0) {
                    if (data && data.length > 0) {
                        if (clesson_type === 1) {
                            zaaval_data = data.filter(cdata => [1, 4].includes(cdata.lesson_type))
                            setZaavalData(zaaval_data)
                        }
                        else if (clesson_type === 2) {
                            songon_data = data.filter(cdata => [2, 5].includes(cdata.lesson_type))
                            setSongonData(songon_data)
                        }
                        else if (clesson_type === 3) {
                            dadlaga_data = data.filter(cdata => cdata.lesson_type == clesson_type)
                            setDadlagaData(dadlaga_data)
                        }
                        else {
                            zaaval_data = data.filter(cdata => [1, 4].includes(cdata.lesson_type))
                            songon_data = data.filter(cdata => [2, 5].includes(cdata.lesson_type))
                            dadlaga_data = data.filter(cdata => cdata.lesson_type == 3)
                            setZaavalData(zaaval_data)
                            setSongonData(songon_data)
                            setDadlagaData(dadlaga_data)
                        }
                    }
                }
            }
        }
    }

    useEffect(() => {
        getDatas()
    }, [])

    useEffect(
        () => {
            window.onafterprint = function () {
                window.close()
                sessionStorage.removeItem('professionDefination')
                sessionStorage.removeItem('professionDefinationID')
                sessionStorage.removeItem('signature_data')
            }
        },
        []
    )

    //Нийт хөлийн дүнгийн хувийг олж байна
    const percentage_general = datas?.volume_kr ? (datas.general_base / datas?.volume_kr) * 100 : 0;
    const percentage_base = datas?.volume_kr ? (datas.professional_base / datas?.volume_kr) * 100 : 0;
    const percentage_proffessional = datas?.volume_kr ? (datas.professional_lesson / datas?.volume_kr) * 100 : 0;

    useEffect(
        () => {
            if (standart_bagts_option && standart_bagts_option?.length != 0) {
                // setTimeout(() => window.print(), 1000)
            }
        },
        [standart_bagts_option]
    )

    async function getLessonBagtsStandart() {
        if (mergejil_id) {
            const { success, data } = await fetchData(lessonStandartApi.getOneProfessionList(mergejil_id));
            if (success) {
                setStandartBagtsOption(data);
            }
        }
    }

    useEffect(() => {
        getLessonBagtsStandart();
    }, [mergejil_id]);

    useEffect(
        () =>
        {
            document.title = `${datas?.name}-сургалтын-төлөвлөгөө`
        },
        []
    )

    return (
        <div className='fontchange ps-1'>
             <div className={`invoice-print `}>
            {
                standart_bagts_option
                    ?
                    <>
                        {isLoading && Loader}
                        <div className='d-flex flex-column justify-content-evenly align-items-center w-100 mt-1' style={{ fontSize: '12px' }} >
                            <div className="d-flex flex-column text-center fw-bolder">
                                <span className='mt-1'>
                                    {standart_bagts_option?.school?.name}
                                </span>
                                <span style={{ marginTop: '6px' }}>{datas?.school?.name_eng}</span>
                            </div>
                        </div>
                        <Row className="pb-2 ps-3 pe-2 pt-1" style={{ fontSize: '12px' }} >
                            <div style={{ borderBottom: '1px solid gray' }} />

                            <div className="text-center mt-2 fw-bolder fs-3">
                                {parentschoolName?.toUpperCase()}
                            </div>
                            <div className="text-center mt-1 fw-bolder fs-3">
                                СУРГАЛТЫН ТӨЛӨВЛӨГӨӨ
                            </div>

                            <div className="row">
                                <div className="col-6 fw-bolder mt-1 d-flex justify-content-between">
                                    Ерөнхий чиглэл: <span className="fw-normal text-end">Боловсрол</span>
                                </div>
                                <div className="col-6 fw-bolder mt-1 d-flex justify-content-between">
                                    Индекс: <span className="fw-normal text-end">{datas?.code}</span>
                                </div>
                            </div>
                            <div className="row" >
                                <div className="col-6 fw-bolder mt-1 d-flex justify-content-between">
                                    Төрөлжсөн чиглэл: <span className="fw-normal text-end">{datas?.dep_name}</span>
                                </div>
                                <div className="col-6 fw-bolder mt-1 d-flex justify-content-between">
                                    Суралцах хэлбэр: <span className="fw-normal text-end">Өдөр</span>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6 fw-bolder mt-1 d-flex justify-content-between">
                                    Нарийвчилсан чиглэл: <span className="fw-normal text-end">{datas?.name}</span>
                                </div>
                                <div className="col-6 fw-bolder mt-1 d-flex justify-content-between">
                                    Суралцах хугацаа: <span className="fw-normal text-end">{datas.duration} жил</span>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6 fw-bolder mt-1 d-flex justify-content-between">
                                    Хөтөлбөрийн нэр: <span className="fw-normal text-end">{datas?.name}</span>
                                </div>
                                <div className="col-6 fw-bolder mt-1 d-flex justify-content-between">
                                    Боловсролын зэрэг: <span className="fw-normal text-end">{datas?.degree?.degree_name}</span>
                                </div>
                            </div>

                            {/* Header */}

                            <table className={`fw-bolder mt-1 mb-2 border-0`} style={{ width: '98%', fontSize: '12px' }}>
                                <thead className="w-100">
                                    <tr>
                                        <td rowSpan={3} className="text-center border  border-dark" style={{ width: '3%' }}>№</td>
                                        <td rowSpan={3} className="text-center border-end border-bottom border-dark" style={{ width: '10%' }}>Хичээлийн индекс</td>
                                        <td rowSpan={3} className="text-center border-end border-bottom border-dark" style={{ width: '40%' }}>Хичээлийн нэр</td>
                                        <td rowSpan={3} className="text-center border-end border-bottom border-dark" style={{ width: '25%' }}>Багц цаг</td>
                                        <td rowSpan={3} className="text-center border-end border-dark" style={{ width: '18%' }}>Улирал</td>
                                    </tr>
                                </thead>
                                {
                                    datas?.degree?.degree_code === 'D' &&
                                    <>
                                        <tbody>
                                            <tr>
                                                <td colSpan={5} className="text-center border-end border-dark" style={{paddingRight:'0', width: '100%' }}>Ерөнхий суурь хичээл</td>
                                            </tr>
                                            <tr>
                                                <td colSpan={5} className="text-center border-end border-dark" style={{paddingRight:'300px', width: '100%' }}>А.1 Заавал судлах</td>
                                            </tr>
                                            <TableShow rows={zaaval_data?.filter((zaaval_data) => zaaval_data?.lesson_level === 1)} profession={mergejil_id} standart_bagts_option={standart_bagts_option}/>
                                            <tr>
                                                <td colSpan={5} className="text-center border-end border-dark" style={{paddingRight:'300px', width: '100%' }}>A.2 Сонгон судлах хичээл</td>
                                            </tr>
                                            <TableShow rows=
                                                {
                                                    songon_data?.filter((data) =>
                                                        data?.lesson_level === (datas?.degree?.degree_code === 'D' ? 1 : datas?.degree?.degree_code === 'E' ? 11 : 21)
                                                )}
                                                profession={mergejil_id}
                                                standart_bagts_option={standart_bagts_option}
                                            />
                                        </tbody>
                                    </>
                                }
                                {zaaval_data?.filter((data) => data?.lesson_level === (datas?.degree?.degree_code === 'D' ? 2 : datas?.degree?.degree_code === 'E' ? 11 : 21)
                                )?.length > 0 && (
                                        <tbody>
                                            <tr>
                                                <td colSpan={5} className="text-center border-end border-dark" style={{paddingRight:'0', width: '100%' }}>{datas?.degree?.degree_code === 'D' ? 2 : 1} {'. ' + 'Мэргэжлийн суурь'}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan={5} className="text-center border-end border-dark" style={{paddingRight:'300px', width: '100%' }}>{datas?.degree?.degree_code === 'D' ? '2.1. Заавал судлах хичээл' : '1.1. Судалгааны арга зүй'}</td>
                                            </tr>
                                            <TableShow
                                                rows=
                                                {
                                                    zaaval_data?.filter((data) =>
                                                        data?.lesson_level === (datas?.degree?.degree_code === 'D' ? 2 : datas?.degree?.degree_code === 'E' ? 11 : 21)
                                                    )
                                                }
                                                profession={mergejil_id}
                                                standart_bagts_option={standart_bagts_option}
                                            />
                                        </tbody>
                                    )}
                                {songon_data?.filter((data) => data?.lesson_level === (datas?.degree?.degree_code === 'D' ? 2 : datas?.degree?.degree_code === 'E' ? 11 : 21)
                                )?.length > 0 && (
                                        <tbody>
                                            <tr>
                                                <td colSpan={5} className="text-center border-end border-dark" style={{paddingRight:'300px', width: '100%' }}>{datas?.degree?.degree_code === 'D' ? '2.2. Сонгон судлах хичээл' : '1.2. Онолын суурь хичээл'}</td>
                                            </tr>
                                            <TableShow
                                                rows=
                                                {
                                                    songon_data?.filter((data) =>
                                                        data?.lesson_level === (datas?.degree?.degree_code === 'D' ? 2 : datas?.degree?.degree_code === 'E' ? 11 : 21)
                                                    )
                                                }
                                                profession={mergejil_id}
                                                standart_bagts_option={standart_bagts_option}
                                            />
                                        </tbody>
                                )}

                                {zaaval_data?.filter((data) => data?.lesson_level === (datas?.degree?.degree_code === 'D' ? 3 : datas?.degree?.degree_code === 'E' ? 12 : 22)) ?.length > 0 && (
                                    <tbody>
                                        <tr>
                                            <td colSpan={5} className="text-center border-end border-dark" style={{paddingRight:'0', width: '100%' }}>3.Мэргэжлийн хичээл</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={5} className="text-center border-end border-dark" style={{paddingRight:'300px', width: '100%' }}>В.1 Заавал судлах хичээл</td>
                                        </tr>
                                        <TableShow rows=
                                            {
                                                zaaval_data?.filter((data) =>
                                                    data?.lesson_level === (datas?.degree?.degree_code === 'D' ? 3 : datas?.degree?.degree_code === 'E' ? 12 : 22)
                                                )
                                            }
                                            profession={mergejil_id}
                                            standart_bagts_option={standart_bagts_option}
                                        />
                                    </tbody>
                                )}
                                {songon_data?.filter((data) => data?.lesson_level === (datas?.degree?.degree_code === 'D' ? 3 : datas?.degree?.degree_code === 'E' ? 12 : 22)) ?.length > 0 && (
                                <tbody>
                                    <tr>
                                        <td colSpan={5} className="text-center border-end border-dark" style={{paddingRight:'300px', width: '100%' }}>В.2 Сонгон судлах хичээл</td>
                                    </tr>
                                    <TableShow rows=
                                        {
                                            songon_data?.filter((data) =>
                                                data?.lesson_level === (datas?.degree?.degree_code === 'D' ? 3 : datas?.degree?.degree_code === 'E' ? 12 : 22)
                                        )}
                                        profession={mergejil_id}
                                        standart_bagts_option={standart_bagts_option}
                                    />
                                </tbody>
                                )}
                                {dadlaga_data?.filter((data) => data?.lesson_level === 3)?.length > 0 && (
                                    <tbody>
                                        <tr>
                                            <td colSpan={5} className="text-center border-end border-dark" style={{paddingRight:'300px', width: '100%' }}>В.3 Дадлага</td>
                                        </tr>
                                        <TableShow rows={dadlaga_data?.filter((data) => data?.lesson_level === 3)} profession={mergejil_id} standart_bagts_option={standart_bagts_option}/>
                                    </tbody>
                                )}


                                {zaaval_data?.filter((data) => data?.lesson_level === 5 ) ?.length > 0 && (
                                    <tbody>
                                        <tr>
                                            <td colSpan={5} className="text-center border-end border-dark" style={{paddingRight:'0', width: '100%' }}>4.Мэргэшүүлэх хичээл</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={5} className="text-center border-end border-dark" style={{paddingRight:'300px', width: '100%' }}>В.1 Заавал судлах хичээл</td>
                                        </tr>
                                        <TableShow rows=
                                            {
                                                zaaval_data?.filter((data) =>
                                                    data?.lesson_level === 5
                                                )
                                            }
                                            profession={mergejil_id}
                                            standart_bagts_option={standart_bagts_option}
                                        />
                                    </tbody>
                                )}
                                {songon_data?.filter((data) => data?.lesson_level === 5)?.length > 0 && (
                                <tbody>
                                    <tr>
                                        <td colSpan={5} className="text-center border-end border-dark" style={{paddingRight:'300px', width: '100%' }}>В.2 Сонгон судлах хичээл</td>
                                    </tr>
                                    <TableShow rows=
                                        {
                                            songon_data?.filter((data) =>
                                                data?.lesson_level === (datas?.degree?.degree_code === 'D' ? 3 : datas?.degree?.degree_code === 'E' ? 12 : 22)
                                        )}
                                        profession={mergejil_id}
                                        standart_bagts_option={standart_bagts_option}
                                    />
                                </tbody>
                                )}
                                {dadlaga_data?.filter((data) => data?.lesson_level === 5)?.length > 0 && (
                                    <tbody>
                                        <tr>
                                            <td colSpan={5} className="text-center border-end border-dark" style={{paddingRight:'300px', width: '100%' }}>В.3 Дадлага</td>
                                        </tr>
                                        <TableShow rows={dadlaga_data?.filter((data) => data?.lesson_level === 3)} profession={mergejil_id} standart_bagts_option={standart_bagts_option}/>
                                    </tbody>
                                )}

                                {zaaval_data?.filter((data) => data?.lesson_level === (datas?.degree?.degree_code === 'D' ? 4 : datas?.degree?.degree_code === 'E' ? 13 : 23))?.length > 0 && (
                                    <tbody>
                                        <tr>
                                            <td colSpan={5} className="text-center border-end border-dark" style={{paddingRight:'0', width: '100%' }}>
                                            {
                                                datas?.degree?.degree_code === 'D'
                                                    ?
                                                    '4. Диплом'
                                                    :
                                                    datas?.degree?.degree_code === 'E'
                                                        ?
                                                        '3. Эрдэм шинжилгээ, судалгааны ажил, мэргэжлийн шалгалт'
                                                        :
                                                        '3. Эрдэм шинжилгээ, судалгааны ажил'
                                            }
                                            </td>
                                        </tr>
                                        <TableShow rows=
                                        {
                                            zaaval_data?.filter((data) =>
                                                data?.lesson_level === (datas?.degree?.degree_code === 'D' ? 4 : datas?.degree?.degree_code === 'E' ? 13 : 23)
                                            )
                                        }
                                         profession={mergejil_id}
                                         standart_bagts_option={standart_bagts_option} />
                                    </tbody>
                                )}
                            </table>
                            <div className="page-break"></div>
                            <table className={`fw-bolder mt-0 border-0`} style={{ width: '98%', fontSize: '12px' }}>
                                <thead className="w-100">
                                    <tr>
                                        <td rowSpan={3} className="text-center border  border-dark" style={{ width: '3%' }}>№</td>
                                        <td rowSpan={3} className="text-center border-end border-bottom border-dark" style={{ width: '10%' }}>Хичээлийн индекс</td>
                                        <td rowSpan={3} className="text-center border-end border-bottom border-dark" style={{ width: '40%' }}>Багц цаг</td>
                                        <td rowSpan={3} className="text-center border-end border-bottom border-dark" style={{ width: '25%' }}>Хувь</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <td colSpan={1} className="text-center border  border-dark" style={{ width: '6%' }}>2</td>
                                    <td colSpan={1} className="text-left border-end border-bottom border-dark" style={{ width: '44%' }}>Дээд боловсролын ерөнхий суурь</td>
                                    <td colSpan={1} className="text-center border-end border-bottom border-dark" style={{ width: '25%' }}>{datas.general_base}</td>
                                    <td colSpan={1} className="text-center border-end border-bottom border-dark" style={{ width: '25%' }}>{percentage_general.toFixed(2)}%</td>
                                </tbody>
                                <tbody>
                                    <td colSpan={1} className="text-center border  border-dark" style={{ width: '6%' }}>3</td>
                                    <td colSpan={1} className="text-left border-end border-bottom border-dark" style={{ width: '44%' }}>Мэргэжлийн суурь хичээлүүд</td>
                                    <td colSpan={1} className="text-center border-end border-bottom border-dark" style={{ width: '25%' }}>{datas.professional_base}</td>
                                    <td colSpan={1} className="text-center border-end border-bottom border-dark" style={{ width: '25%' }}>{percentage_proffessional.toFixed(2)}%</td>
                                </tbody>
                                <tbody>
                                    <td colSpan={1} className="text-center border  border-dark" style={{ width: '6%' }}>4</td>
                                    <td colSpan={1} className="text-left border-end border-bottom border-dark" style={{ width: '44%' }}>Мэргэшлүүлэх хичээлүүд</td>
                                    <td colSpan={1} className="text-center border-end border-bottom border-dark" style={{ width: '25%' }}>{datas.professional_lesson}</td>
                                    <td colSpan={1} className="text-center border-end border-bottom border-dark" style={{ width: '25%' }}>{percentage_base.toFixed(2)}%</td>
                                </tbody>
                                <tbody>
                                    <td colSpan={1} className="text-center border  border-dark" style={{ width: '6%' }}></td>
                                    <td colSpan={1} className="text-center border-end border-bottom border-dark" style={{ width: '44%' }}>Нийт</td>
                                    <td colSpan={1} className="text-center border-end border-bottom border-dark" style={{ width: '25%' }}>{datas.volume_kr}</td>
                                    <td colSpan={1} className="text-center border-end border-bottom border-dark" style={{ width: '25%' }}>100%</td>
                                </tbody>
                            </table>

                            <div className="text-center mt-1 text-uppercase">
                                {
                                    listArr?.map((val, idx) => {
                                        return (
                                            <p key={idx} >
                                                {val?.position_name}: ........................................... /{val?.last_name}&#160;{val?.first_name}/
                                            </p>
                                        )
                                    })
                                }
                            </div>
                        </Row>
                    </>
                    :
                    <div className="m-2">
                        <div role="button" onClick={() => window.history.go(-1)}>
                            <ChevronsLeft /> Буцах
                        </div>
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50dvh' }}>
                            <div className="bg-light-info p-50 rounded-3" style={{ fontSize: 16 }}><AlertCircle /> Уучлаарай мэдээлэл олдсонгүй</div>
                        </div>
                    </div>
            }
            </div>
        </div>
    )
}

