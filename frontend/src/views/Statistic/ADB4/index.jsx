import React, { Fragment, useContext, useEffect, useState } from "react";
import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";
import { Button, Spinner } from "reactstrap";
import { FileText } from 'react-feather'

import { utils, writeFile } from 'xlsx-js-style';
import './style.scss'
import ActiveYearContext from "@context/ActiveYearContext"

import { sampledata } from "./sample";

function ADB4(){

    const infoApi = useApi().status.db4
    const { cyear_name } = useContext(ActiveYearContext)

	// // Loader
	const { Loader, isLoading, fetchData } = useLoader({isSmall: true});
    const [localLoaderDB4, setLocalLoaderDB4] = useState(true)

    const [datas, setDatas] = useState([])

    async function getDatas() {
        const {success, data} = await fetchData(infoApi.get())
        if(success) {
            setDatas(data?.datas)
            setLocalLoaderDB4(false)
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
                    'Өмчийн хэлбэр': 'A',
                    ' ': '',
                    'МД': 'Б',
                    'Нийт суралцагчид': '1',
                        'Эрэгтэй1': '2',
                        'Эмэгтэй1': '3',
                    'Дипломын боловсрол': '4',
                        'Эрэгтэй2': '5',
                        'Эмэгтэй2': '6',
                    'Бакалаврын боловсрол': '7',
                        'Эрэгтэй3': '8',
                        'Эмэгтэй3': '9',
                    'Магистрын боловсрол': '10',
                        'Эрэгтэй4': '11',
                        'Эмэгтэй4': '12',
                    'Докторын боловсрол': '13',
                        'Эрэгтэй5': '14',
                        'Эмэгтэй5': '15',
                }
            )
        })

        const flattenedArray = datas.flatMap(item => [
            item,
            ...item.aimag.map(ditem => ({ ...ditem })),
        ]);

        const mainData = flattenedArray.map((data, idx) => {
                return(
                    {
                        'Өмчийн хэлбэр': data.aimag ? data?.name : '     ' + data?.name,
                        ' ': '',
                        'МД': idx + 1,
                        'Нийт суралцагчид': data?.niit_suragchid,
                            'Эрэгтэй1': data?.niit_eregtei,
                            'Эмэгтэй1': data?.niit_emegtei,
                        'Дипломын боловсрол': data?.diplom_niit,
                            'Эрэгтэй2': data?.diplom_eregtei,
                            'Эмэгтэй2': data?.diplom_emegtei,
                        'Бакалаврын боловсрол': data?.bakalavr_niit,
                            'Эрэгтэй3': data?.bakalavr_er,
                            'Эмэгтэй3': data?.bakalavr_em,
                        'Магистрын боловсрол': data?.magistr_niit,
                            'Эрэгтэй4': data?.magistr_er,
                            'Эмэгтэй4': data?.magistr_em,
                        'Докторын боловсрол': data?.doktor_niit,
                            'Эрэгтэй5': data?.doktor_er,
                            'Эмэгтэй5': data?.doktor_em,
                    }
        )})

        const footer = Array.from({length: 13},(_, hidx) => {
            return(
                {
                    'Өмчийн хэлбэр': '',
                    ' ': '',
                    'МД': '',
                    'Нийт суралцагчид': '',
                        'Эрэгтэй1': '',
                        'Эмэгтэй1': '',
                    'Дипломын боловсрол': '',
                        'Эрэгтэй2': '',
                        'Эмэгтэй2': '',
                    'Бакалаврын боловсрол': '',
                        'Эрэгтэй3': '',
                        'Эмэгтэй3': '',
                    'Магистрын боловсрол': '',
                        'Эрэгтэй4': '',
                        'Эмэгтэй4': '',
                    'Докторын боловсрол': '',
                        'Эрэгтэй5': '',
                        'Эмэгтэй5': '',
                }
            )
        })
            const combo = [...header, ...mainData, ...footer]

            const worksheet = utils.json_to_sheet(combo);

            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, "A-DB-2-Report");

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
            ];

            utils.sheet_add_aoa(worksheet, [staticCells], { origin: "A10" });


            const textCellStyle = {
                border: {
                    top: { style: "thin", color: { rgb: "ffffff" } },
                    bottom: { style: "thin", color: { rgb: "ffffff" } },
                    left: { style: "thin", color: { rgb: "ffffff" } },
                    right: { style: "thin", color: { rgb: "ffffff" } }
                },
                font: {
                    sz: 10
                },
                alignment: {
                    wrapText: true
                },
            }

            const numberCellStyle = {
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                },
                alignment: {
                    horizontal: 'left',
                    vertical: 'center',
                    wrapText: true
                },
                font:{
                    sz:10
                }
            };

            const numberCellBoldStyle = {
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                },
                alignment: {
                    horizontal: 'left',
                    vertical: 'center',
                    wrapText: true
                },
                font:{
                    sz:10,
                    bold: true
                }
            };

            const rotatedTextStyle = {
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                },
                alignment: {
                    textRotation: 90,
                    horizontal: 'center',
                    vertical: 'bottom',
                    wrapText: true
                },
                font:{
                    sz:10
                }
            };

            const footerBorder = {
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "ffffff" } },
                    left: { style: "thin", color: { rgb: "ffffff" } },
                    right: { style: "thin", color: { rgb: "ffffff" } },
                    wrapText: true
                },
                font:{
                    sz: 10
                }

            };

            const bottomBorder = {
                border: {
                    top: { style: "thin", color: { rgb: "ffffff" } },
                    bottom: { style: "thin", color: { rgb: "0000000" } },
                    left: { style: "thin", color: { rgb: "ffffff" } },
                    right: { style: "thin", color: { rgb: "ffffff" } },
                    wrapText: true
                },
                font:{
                    sz: 10
                }
            };

            const headerStyle = {
                font: {
                    bold: true
                },
                alignment: {
                    horizontal: 'center',
                    vertical: 'bottom',
                    wrapText: true
                },
            };

            const rotatedBorderFix = {
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "ffffff" } }
                },
                alignment: {
                    textRotation: 90,
                    horizontal: 'center',
                    vertical: 'bottom',
                    wrapText: true
                },
                font:{
                    sz:10
                }
            };

    // Толгой хэсэгт стайл болон Текст өгж буй хэсэг
    const startRow = 0;
    const endRow = 8;
    const startCol = 0;
    const endCol = 32;

    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
        const cellAddress = utils.encode_cell({ r: row, c: col });

            if (!worksheet[cellAddress]) {
                worksheet[cellAddress] = {};
            }

        worksheet[cellAddress].s = row === 8 ? bottomBorder : textCellStyle
        worksheet[cellAddress].v = (row === 0 && col === 0) ?
                'Үндэсний статистикийн хорооны даргын 20. . . оны . . . сарын . . .  -ны өдрийн . . . дугаар тушаалаар батлав.'
            : (row === 2 && col === 0 ) ? cyear_name ? 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН БАЙГУУЛЛАГАД СУРАЛЦАГЧДЫН' + ' '+  cyear_name.replace('-', '/') + ' ' + 'ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, аймаг, нийслэл, дүүргээр'
                    : 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН БАЙГУУЛЛАГАД СУРАЛЦАГЧДЫН 20... / 20... ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, аймаг, нийслэл, дүүргээр'
                : ''
        }
    }

    const styleRow = 9;
    const sendRow = 48;
    const styleCol = 0;
    const sendCol = 20;

    for (let row = styleRow; row <= sendRow; row++) {
        for (let col = styleCol; col <= sendCol; col++) {
            const cellNum = utils.encode_cell({ r: row, c: col });

            if (!worksheet[cellNum]) {
                worksheet[cellNum] = {};
            }

            worksheet[cellNum].s =
                (row === 9 && col !== 0 && col !== 2)
                    ? rotatedTextStyle
                    : (col === 0 && (row === 13 || row === 14 || row === 24 || row === 30 || row === 37 || row === 45 )) ? numberCellBoldStyle : numberCellStyle;
        }
    }

    const fRow = 49;
    const fendRow = 63;
    const fCol = 0;
    const fendCol = 20;


    for (let row = fRow; row <= fendRow; row++) {
        for (let col = fCol; col <= fendCol; col++) {
        const cellNum = utils.encode_cell({ r: row, c: col });

            if (!worksheet[cellNum]) {
                worksheet[cellNum] = {};
            }

            worksheet[cellNum].s = (row === 49) ? footerBorder : textCellStyle
            worksheet[cellNum].v = (row === 49 && col === 0) ?
            'Балансын шалгалт:'
                : (row === 54 && col === 2 ) ? 'Баталгаажуулсан:'
                : (row === 56 && col === 2 ) ? 'Хянасан:'
                : (row === 58 && col === 2 ) ? 'Мэдээ гаргасан:'
                    : (row === 54 && col === 6 ) ? '.............................'
                    : (row === 56 && col === 6 ) ? '.............................'
                    : (row === 58 && col === 6 ) ? '.............................'
                        : (row === 55 && col === 6 ) ? '/Албан тушаал/'
                        : (row === 57 && col === 6 ) ? '/Албан тушаал/'
                        : (row === 59 && col === 6 ) ? '/Албан тушаал/'
                            : (row === 54 && col === 12 ) ? '.............................'
                            : (row === 56 && col === 12 ) ? '.............................'
                            : (row === 58 && col === 12 ) ? '.............................'
                                : (row === 55 && col === 12 ) ? '/Нэр/'
                                : (row === 57 && col === 12 ) ? '/Нэр/'
                                : (row === 59 && col === 12 ) ? '/Нэр/'
                                    : (row === 54 && col === 18 ) ? '.............................'
                                    : (row === 56 && col === 18 ) ? '.............................'
                                    : (row === 58 && col === 18 ) ? '.............................'
                                        : (row === 55 && col === 18 ) ? '/Гарын үсэг/'
                                        : (row === 57 && col === 18 ) ? '/Гарын үсэг/'
                                        : (row === 59 && col === 18 ) ? '/Гарын үсэг/'
                : (row === 63 && col === 6 ) ? '20 ….. оны ….. сарын ….. өдөр'
                    : ''
        }
    }


    const phaseOneCol = Array.from({length: 3}, (_) => {return( { wch: 5 } )})
    const phaseTwoCol = Array.from({length: 26}, (_) => {return( { wch: 4 } )})

    worksheet["!cols"] = [ { wch: 20 }, { wch: 3 },{ wch: 3 }, ...phaseOneCol, ...phaseTwoCol ];

    const phaseTwoRow = Array.from({length: 6}, (_) => {return( { hpx: 10 } )})

    worksheet["!rows"] = [
        { hpx: 40 },
        { hpx: 10 },
        { hpx: 40 },
        ...phaseTwoRow,
        // Хүснэгтийн эхний мөр
        { hpx: 20 },
        { hpx: 20 },
        { hpx: 70 },
    ];


    const firstColMerge = Array.from({length: 37}, (_, idx) => {return(
            {
                s: { r: idx + 12, c: 0 },
                e: { r: idx + 12, c: 1 }
            }
        )})


    worksheet['!merges'] = [

        // header text
        {
            s: { r: 0, c: 0 },
            e: { r: 0, c: 2 }
        },
        {
            s: { r: 2, c: 0 },
            e: { r: 2, c: 16 }
        },


                    // table header merge
                    {
                        s: { r: 9, c: 0 },
                        e: { r: 11, c: 1 }
                    },
                    {
                        s: { r: 9, c: 2 },
                        e: { r: 11, c: 2 }
                    },

                    // niit
                        {
                            s: { r: 9, c: 3 },
                            e: { r: 11, c: 3 }
                        },
                        {
                            s: { r: 10, c: 4 },
                            e: { r: 11, c: 4 }
                        },
                        {
                            s: { r: 10, c: 5 },
                            e: { r: 11, c: 5 }
                        },

                    // diplom
                        {
                            s: { r: 9, c: 6 },
                            e: { r: 11, c: 6 }
                        },
                        {
                            s: { r: 10, c: 7 },
                            e: { r: 11, c: 7 }
                        },
                        {
                            s: { r: 10, c: 8 },
                            e: { r: 11, c: 8 }
                        },

                    // bakalavr
                        {
                            s: { r: 9, c: 9 },
                            e: { r: 11, c: 9 }
                        },
                        {
                            s: { r: 10, c: 10 },
                            e: { r: 11, c: 10 }
                        },
                        {
                            s: { r: 10, c: 11 },
                            e: { r: 11, c: 11 }
                        },

                    // magistr
                        {
                            s: { r: 9, c: 12},
                            e: { r: 11, c: 12 }
                        },
                        {
                            s: { r: 10, c: 13 },
                            e: { r: 11, c: 13 }
                        },
                        {
                            s: { r: 10, c: 14 },
                            e: { r: 11, c: 14 }
                        },

                    // doktor
                        {
                            s: { r: 9, c: 15 },
                            e: { r: 11, c: 15 }
                        },
                        {
                            s: { r: 10, c: 16 },
                            e: { r: 11, c: 16 }
                        },
                        {
                            s: { r: 10, c: 17 },
                            e: { r: 11, c: 17 }
                        },

        ...firstColMerge,


            // footer merge
            {
                s: { r: 49, c: 2 },
                e: { r: 49, c: 17 }
            },
            {
                s: { r: 50, c: 2 },
                e: { r: 50, c: 17 }
            },


            // batalgajulsan
            {
                s: { r: 54, c: 2 },
                e: { r: 54, c: 5 }
            },
            {
                s: { r: 54, c: 6 },
                e: { r: 54, c: 10 }
            },
            {
                s: { r: 54, c: 12 },
                e: { r: 54, c: 15 }
            },
                // alban tushaal
                {
                    s: { r: 55, c: 6 },
                    e: { r: 55, c: 10 }
                },
                {
                    s: { r: 55, c: 12 },
                    e: { r: 55, c: 15 }
                },

            // hyanasan

            {
                s: { r: 56, c: 2 },
                e: { r: 56, c: 5 }
            },
            {
                s: { r: 56, c: 6 },
                e: { r: 56, c: 10 }
            },
            {
                s: { r: 56, c: 12 },
                e: { r: 56, c: 15 }
            },
                // alban tushaal
                {
                    s: { r: 57, c: 6 },
                    e: { r: 57, c: 10 }
                },
                {
                    s: { r: 57, c: 12 },
                    e: { r: 57, c: 15 }
                },
                {
                    s: { r: 59, c: 12 },
                    e: { r: 59, c: 15 }
                },
                {
                    s: { r: 59, c: 6 },
                    e: { r: 59, c: 10 }
                },

            // medee gargasan
            {
                s: { r: 58, c: 2 },
                e: { r: 58, c: 5 }
            },
            {
                s: { r: 58, c: 6 },
                e: { r: 58, c: 10 }
            },
            {
                s: { r: 58, c: 12 },
                e: { r: 58, c: 15 }
            },
    ]

        const nullCell1 = {
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "ffffff" } },
                right: { style: "thin", color: { rgb: "ffffff" } }
            },
            alignment: {
                vertical: 'center',
                horizontal: 'center'
            }
        }

        const nullCell2 = {
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "ffffff" } },
                right: { style: "thin", color: { rgb: "000000" } }}
        }


        worksheet['D10'].s = rotatedBorderFix

            worksheet['E10'] = {s: nullCell1, v: "" }
            worksheet['F10'] = {s: nullCell2, v: "" }
            worksheet['E11'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['F11'] = {s: rotatedTextStyle, v: "Эмэгтэй" }
            // worksheet['G8'] = {s: nullCell1, v: "Хөгжлийн бэрхшээлийн хэлбэр" }

        worksheet['G10'].s = rotatedBorderFix

            worksheet['H10'] = {s: nullCell1, v: "" }
            worksheet['I10'] = {s: nullCell2, v: "" }
            worksheet['H11'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['I11'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

        worksheet['J10'].s = rotatedBorderFix

            worksheet['K10'] = {s: nullCell1, v: "" }
            worksheet['L10'] = {s: nullCell2, v: "" }
            worksheet['K11'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['L11'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

        worksheet['M10'].s = rotatedBorderFix

            worksheet['N10'] = {s: nullCell1, v: "" }
            worksheet['O10'] = {s: nullCell2, v: "" }
            worksheet['N11'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['O11'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

        worksheet['P10'].s = rotatedBorderFix

            worksheet['Q10'] = {s: nullCell1, v: "" }
            worksheet['R10'] = {s: nullCell2, v: "" }
            worksheet['Q11'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['R11'] = {s: rotatedTextStyle, v: "Эмэгтэй" }


        worksheet['C50'].v = 'Багана: 1=(2+3)=(4+7+10+13), 4=(5+6), 7=(8+9), 10=(11+12), 13=(14+15);'
        worksheet['C51'].v = 'Мөр: 1=(2+8+15+23+27), 2=(3÷7), 8=(9÷14), 15=(16÷22), 23=(24÷26), 27=(28÷36);'

        writeFile(workbook, "A-DB-4.xlsx", { compression: true });

    }

    return(
        <div className="overflow-auto" style={{ minHeight: 200 }}>
            {/* <Button color="primary" className="mb-2 p-75" disabled={false} onClick={() => {convert()}}> */}
            <Button color="primary" className="mb-2 p-75" disabled={isLoading} onClick={() => {convert()}}>
                <FileText size={18} /> Excel татах
            </Button>
            {(isLoading || localLoaderDB4) ?
                Loader
                :
                    <table>
                        <thead>
                            <tr>
                                <th rowSpan={3}>Өмчийн хэлбэр</th>
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
                        <tbody>
                            {datas.map((data, idx) => {
                                return(

                                <Fragment>
                                    <tr>
                                        <th>
                                            {data?.name}
                                        </th>
                                        <td>
                                            {data?.niit_suragchid}
                                        </td>
                                        <td>
                                            {data?.niit_eregtei}
                                        </td>
                                        <td>
                                            {data?.niit_emegtei}
                                        </td>
                                        <td>
                                            {data?.diplom_niit}
                                        </td>
                                        <td>
                                            {data?.diplom_eregtei}
                                        </td>
                                        <td>
                                            {data?.diplom_emegtei}
                                        </td>
                                        <td>
                                            {data?.bakalavr_niit}
                                        </td>
                                        <td>
                                            {data?.bakalavr_er}
                                        </td>
                                        <td>
                                            {data?.bakalavr_em}
                                        </td>
                                        <td>
                                            {data?.magistr_niit}
                                        </td>
                                        <td>
                                            {data?.magistr_er}
                                        </td>
                                        <td>
                                            {data?.magistr_em}
                                        </td>
                                        <td>
                                            {data?.doktor_niit}
                                        </td>
                                        <td>
                                            {data?.doktor_er}
                                        </td>
                                        <td>
                                            {data?.doktor_em}
                                        </td>
                                    </tr>
                                    {data?.aimag.map((aimag, aidx) => (
                                        <tr>
                                            <td className="ps-2">
                                                {aimag?.name}
                                            </td>
                                            <td>
                                                {aimag?.niit_suragchid}
                                            </td>
                                            <td>
                                                {aimag?.niit_eregtei}
                                            </td>
                                            <td>
                                                {aimag?.niit_emegtei}
                                            </td>
                                            <td>
                                                {aimag?.diplom_niit}
                                            </td>
                                            <td>
                                                {aimag?.diplom_eregtei}
                                            </td>
                                            <td>
                                                {aimag?.diplom_emegtei}
                                            </td>
                                            <td>
                                                {aimag?.bakalavr_niit}
                                            </td>
                                            <td>
                                                {aimag?.bakalavr_er}
                                            </td>
                                            <td>
                                                {aimag?.bakalavr_em}
                                            </td>
                                            <td>
                                                {aimag?.magistr_niit}
                                            </td>
                                            <td>
                                                {aimag?.magistr_er}
                                            </td>
                                            <td>
                                                {aimag?.magistr_em}
                                            </td>
                                            <td>
                                                {aimag?.doktor_niit}
                                            </td>
                                            <td>
                                                {aimag?.doktor_er}
                                            </td>
                                            <td>
                                                {aimag?.doktor_em}
                                            </td>
                                        </tr>
                                    ))}
                                </Fragment>
                                )
                            })}

                        </tbody>
                    </table>
            }
            </div>
    )
}

export default ADB4
