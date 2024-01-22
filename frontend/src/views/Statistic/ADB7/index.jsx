import React, { Fragment, useContext, useEffect, useState } from "react";
import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";
import { Button, Spinner } from "reactstrap";
import { FileText } from 'react-feather'

import { utils, writeFile } from 'xlsx-js-style';
import './style.scss'
import ActiveYearContext from "@context/ActiveYearContext"

import { sampledata } from "./sample";

function ADB7(){

    const infoApi = useApi().status.db4
    const { cyear_name } = useContext(ActiveYearContext)

	// // Loader
	const { Loader, isLoading, fetchData } = useLoader({isSmall: true});
    const [localLoaderDB3, setLocalLoaderDB3] = useState(false)

    const [datas, setDatas] = useState([])

    async function getDatas() {
        const {success, data} = await fetchData(infoApi.get())
        if(success) {
            setDatas(data)
            setLocalLoaderDB3(false)
        }
    }

    useEffect(() => {
        getDatas()
    },[])

    // const datas = sampledata

    function convert() {

            const header = Array.from({length: 12},(_, hidx) => {
                return(
                    {
                        'Нас': '',
                        'МД': '',
                        'Нийт суралцагчид': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Дипломын боловсрол': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Бакалаврын боловсрол': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Магистрын боловсрол': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Докторын боловсрол': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Хөгжлийн бэрхшээлтэй суралцагчид': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Нас': '',
                        'МД': '',
                        'Харааны': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Сонсголын': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Ярианы': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Хөдөлгөөний': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Сэтгэцийн': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Хавсарсан': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Бусад': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                    })})

            // const flattenedArray = datas.flatMap(item => [
            //     item,
            //     ...item.aimag.map(ditem => ({ ...ditem })),
            // ]);

            const mainData = datas.map((data, idx) => {
                    return(
                    {
                        'Нас': data?.age,
                        'МД': idx + 1,
                        'Нийт суралцагчид': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Дипломын боловсрол': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Бакалаврын боловсрол': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Магистрын боловсрол': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Докторын боловсрол': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Хөгжлийн бэрхшээлтэй суралцагчид': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Нас': data?.age,
                        'МД': idx + 1,
                        'Харааны': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Сонсголын': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Ярианы': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Хөдөлгөөний': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Сэтгэцийн': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Хавсарсан': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                        'Бусад': '',
                            'Эрэгтэй': '',
                            'Эмэгтэй': '',
                    }
                    )})

            const combo = [...header, ...mainData]

            const worksheet = utils.json_to_sheet(combo);

            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, "A-DB-5-Report")
            const staticCells = [
                'Өмчийн хэлбэр',
                ' ',
                'МД',
                'Нийт суралцагчид',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'Дипломын боловсрол',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'Бакалаврын боловсрол',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'Магистрын боловсрол',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'Докторын боловсрол',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'Хөгжлийн бэрхшээлтэй суралцагчид',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'Нас',
                'МД',
                'Харааны',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'Сонсголын',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'Ярианы',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'Хөдөлгөөний',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'Сэтгэцийн',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'Хавсарсан',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'Бусад',
                    'Эрэгтэй',
                    'Эмэгтэй',
                ];

            utils.sheet_add_aoa(worksheet, [staticCells], { origin: "A10" });

                    writeFile(workbook, "A-DB-5.xlsx", { compression: true });
        }

    return(
        <div className="overflow-auto" style={{ minHeight: 200 }}>
            {/* <Button color="primary" className="mb-2 p-75" disabled={false} onClick={() => {convert()}}> */}
            <Button color="primary" className="mb-2 p-75" disabled={isLoading} onClick={() => {convert()}}>
                <FileText size={18} /> Excel татах
            </Button>
            <table>
                <thead>
                    <tr>
                        <th rowSpan={3}>Ерөнхий чиглэл</th>
                        <th rowSpan={3} className="th-rotate-border">Төрөлжсөн чиглэл</th>
                        <th rowSpan={3} className="th-rotate-border">Нарийвчилсан чиглэл </th>
                        <th rowSpan={3} className="th-rotate-border">Нийт суралцагчид</th>
                            <th colSpan={20} style={{ borderLeft: 0, height: 15 }}></th>
                    </tr>
                    <tr>
                        <th rowSpan={2} className="th-rotate">Эрэгтэй</th>
                        <th rowSpan={2} className="th-rotate">Эмэгтэй</th>
                        <th rowSpan={2} className="th-rotate-border">Дипломын боловсрол</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Бакалаврын боловсрол</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Магистрын боловсрол</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Докторын боловсрол</th>
                    </tr>
                    <tr>
                        <th className="th-rotate">Эрэгтэй</th>
                        <th className="th-rotate">Эмэгтэй</th>
                        <th className="th-rotate">Эрэгтэй</th>
                        <th className="th-rotate">Эмэгтэй</th>
                        <th className="th-rotate">Эрэгтэй</th>
                        <th className="th-rotate">Эмэгтэй</th>
                        <th className="th-rotate">Эрэгтэй</th>
                        <th className="th-rotate">Эмэгтэй</th>

                    </tr>
                </thead>
                {/* <tbody>
                    {datas.map((data, idx) => {
                        return(

                        <Fragment>
                            <tr>
                                <th>
                                    {data?.name}
                                </th>
                            </tr>
                            {data?.aimag.map((aimag, aidx) => (
                                <tr>
                                    <td className="ps-2">
                                        {aimag?.name}
                                    </td>
                                </tr>
                            ))}
                        </Fragment>
                        )
                    })}

                </tbody> */}
            </table>
            </div>
    )
}

export default ADB7