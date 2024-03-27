import React, { Fragment, useContext, useEffect, useState } from "react";
import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";
import { Button, Spinner } from "reactstrap";
import { FileText } from 'react-feather'

import { utils, writeFile } from 'xlsx-js-style';
import './style.scss'
import ActiveYearContext from "@context/ActiveYearContext"

import { sampledata } from "./sample";

function ADB14(){

    const infoApi = useApi().status.db14
    const { cyear_name } = useContext(ActiveYearContext)

	// // Loader
	const { Loader, isLoading, fetchData } = useLoader({isSmall: true});
    const [localLoaderDB14, setLocalLoaderDB14] = useState(true)

    const [datas, setDatas] = useState([])

    async function getDatas() {
        const {success, data} = await fetchData(infoApi.get())
        if(success) {
            setDatas(data)
            setLocalLoaderDB14(false)
        }
    }

    useEffect(() => {
        getDatas()
    },[])

    function convert() {

        const header = Array.from({length: 13},(_, hidx) => {
            return(
                {
                    'Үзүүлэлт': 'А',
                    'МД': 'Б',
                    'Нийт ажиллагчид': 1,
                        'Эрэгтэй': 2,
                        'Эмэгтэй': 3,
                    'Захирал': 4,
                        'Эрэгтэй0': 5,
                        'Эмэгтэй0': 6,
                    'Дэд захирал': 7,
                        'Эрэгтэй1': 8,
                        'Эмэгтэй1': 9,
                    'Салбар сургуулийн захирал, дэд захирал': 10,
                        'Эрэгтэй2': 11,
                        'Эмэгтэй2': 12,
                    'Бүрэлдэхүүн сургуулийн захирал, дэд захирал': 13,
                        'Эрэгтэй3': 14,
                        'Эмэгтэй3': 15,
                    'Сургалтын албаны дарга': 16,
                        'Эрэгтэй4': 17,
                        'Эмэгтэй4': 18,
                    'Үндсэн багш': 19,
                        'Эрэгтэй5': 20,
                        'Эмэгтэй5': 21,
                }
            )
        })

        const mainData = datas.map((data, idx) => {
            return(
                {
                    'Үзүүлэлт': (data.data_list[0].all == 'blank' && data.data_list[0].men == 'blank' && data.data_list[0].women == 'blank') || idx == 0 ? data?.type : '       ' + data?.type,
                    'МД': idx + 1,
                    'Нийт ажиллагчид': data.data_list[0].all == 'blank' ? '' : data.data_list[0].all,
                        'Эрэгтэй': data.data_list[0].men == 'blank' ? '' : data.data_list[0].men,
                        'Эмэгтэй': data.data_list[0].women == 'blank' ? '' : data.data_list[0].women,
                    'Захирал': data.data_list[1].all,
                        'Эрэгтэй0': data.data_list[1].men,
                        'Эмэгтэй0': data.data_list[1].women,
                    'Дэд захирал': data.data_list[2].all,
                        'Эрэгтэй1': data.data_list[2].men,
                        'Эмэгтэй1': data.data_list[2].women,
                    'Салбар сургуулийн захирал, дэд захирал': data.data_list[3].all,
                        'Эрэгтэй2': data.data_list[3].men,
                        'Эмэгтэй2': data.data_list[3].women,
                    'Бүрэлдэхүүн сургуулийн захирал, дэд захирал': data.data_list[4].all,
                        'Эрэгтэй3': data.data_list[4].men,
                        'Эмэгтэй3': data.data_list[4].women,
                    'Сургалтын албаны дарга': data.data_list[5].all,
                        'Эрэгтэй4': data.data_list[5].men,
                        'Эмэгтэй4': data.data_list[5].women,
                    'Үндсэн багш': data.data_list[6].all,
                        'Эрэгтэй5': data.data_list[6].men,
                        'Эмэгтэй5': data.data_list[6].women,
                }
            )
        })

        const footer = Array.from({length: 15},(_, hidx) => {
            return(
                {
                    'Үзүүлэлт': '',
                    'МД': '',
                    'Нийт ажиллагчид': '',
                        'Эрэгтэй': '',
                        'Эмэгтэй': '',
                    'Захирал': '',
                        'Эрэгтэй0': '',
                        'Эмэгтэй0': '',
                    'Дэд захирал': '',
                        'Эрэгтэй1': '',
                        'Эмэгтэй1': '',
                    'Салбар сургуулийн захирал, дэд захирал': '',
                        'Эрэгтэй2': '',
                        'Эмэгтэй2': '',
                    'Бүрэлдэхүүн сургуулийн захирал, дэд захирал': '',
                        'Эрэгтэй3': '',
                        'Эмэгтэй3': '',
                    'Сургалтын албаны дарга': '',
                        'Эрэгтэй4': '',
                        'Эмэгтэй4': '',
                    'Үндсэн багш': '',
                        'Эрэгтэй5': '',
                        'Эмэгтэй5': ''
                }
            )
        })


        const combo = [...header, ...mainData, ...footer]

        const worksheet = utils.json_to_sheet(combo);

        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "A-DB-14-Report")
        const staticCells = [
            'Үзүүлэлт',
            'МД',
            'Нийт ажилчид',
                'Эрэгтэй',
                'Эмэгтэй',
            'Захирал',
                'Эрэгтэй',
                'Эмэгтэй',
            'Дэд захирал',
                'Эрэгтэй',
                'Эмэгтэй',
            'Салбар сургуулийн захирал, дэд захирал',
                'Эрэгтэй',
                'Эмэгтэй',
            'Бүрэлдэхүүн сургуулийн захирал, дэд захирал',
                'Эрэгтэй',
                'Эмэгтэй',
            'Сургалтын албаны дарга',
                'Эрэгтэй',
                'Эмэгтэй',
            'Үндсэн багш',
                'Эрэгтэй',
                'Эмэгтэй',
            ];

            utils.sheet_add_aoa(worksheet, [staticCells], { origin: "A11" });
            utils.sheet_add_aoa(worksheet, [staticCells], { origin: "A12" });
            utils.sheet_add_aoa(worksheet, [staticCells], { origin: "A13" });

            // styles

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

            const startRow = 0;
            const endRow = 9;
            const startCol = 0;
            const endCol = 23;

            for (let row = startRow; row <= endRow; row++) {
                for (let col = startCol; col <= endCol; col++) {
                const cellAddress = utils.encode_cell({ r: row, c: col });

                    if (!worksheet[cellAddress]) {
                        worksheet[cellAddress] = {};
                    }

                worksheet[cellAddress].s = row === endRow ? bottomBorder : textCellStyle
                worksheet[cellAddress].v = (row === 0 && col === 0) ?
                        'Үндэсний статистикийн хорооны даргын 20. . . оны . . . сарын . . .  -ны өдрийн . . . дугаар тушаалаар батлав.'
                    : (row === 2 && col === 0 ) ? cyear_name ? 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН  БАЙГУУЛЛАГЫН УДИРДАХ АЖИЛТАН, ҮНДСЭН БАГШИЙН' + ' '+  cyear_name.replace('-', '/') + ' ' + ' ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ'
                            : ' ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН  БАЙГУУЛЛАГЫН УДИРДАХ АЖИЛТАН, ҮНДСЭН БАГШИЙН 20... / 20... ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ'
                        : ''
                }
            }

            const styleRow = endRow + 1;
            const sendRow = styleRow + datas.length + 3;
            const styleCol = 0;
            const sendCol = 23;

            for (let row = styleRow; row <= sendRow; row++) {
                for (let col = styleCol; col <= sendCol; col++) {
                    const cellNum = utils.encode_cell({ r: row, c: col });

                    if (!worksheet[cellNum]) {
                        worksheet[cellNum] = {};
                    }

                    worksheet[cellNum].s =
                        ((row === styleRow || row === styleRow + 1 || row === styleRow + 2) && col !== 0 && col !== 1)
                            ? rotatedTextStyle : numberCellStyle;
                }
            }1

            const fRow = sendRow + 1;
            const fendRow = sendRow + 16;
            const fCol = 0;
            const fendCol = 23;

            for (let row = fRow; row <= fendRow; row++) {
                for (let col = fCol; col <= fendCol; col++) {
                const cellNum = utils.encode_cell({ r: row, c: col });

                    if (!worksheet[cellNum]) {
                        worksheet[cellNum] = {};
                    }

                    worksheet[cellNum].s = row === fRow ? footerBorder : textCellStyle
                                worksheet[cellNum].v = (row === fRow && col === 0) ?
                                        'Балансын шалгалт:' :
                                         (row === fRow && col === 2) ? 'Багана: 1=(2+3), 4=(5+6), 7=(8+9), 10=(11+12), 13=(14+15), 16=(17+18), 19=(20+21);' :
                                         (row === fRow + 1 && col === 2) ? 'Мөр: 1=(18÷24)=(26÷36), 2=(3÷7), 8=(9÷12), 13=(14÷16), 17=(18÷24), 25=(26÷36), 37=(38+39), 40=(41÷44);'
                                            : (row === fRow + 4 && col === 1 ) ? 'Баталгаажуулсан:'
                                            : (row === fRow + 7 && col === 1 ) ? 'Хянасан:'
                                            : (row === fRow + 10 && col === 1 ) ? 'Мэдээ гаргасан:'
                                                : (row === fRow + 4 && col === 5 ) ? '.............................'
                                                : (row === fRow + 7 && col === 5 ) ? '.............................'
                                                : (row === fRow + 10 && col === 5 ) ? '.............................'
                                                    : (row === fRow + 5 && col === 5 ) ? '/Албан тушаал/'
                                                    : (row === fRow + 8 && col === 5 ) ? '/Албан тушаал/'
                                                    : (row === fRow + 11 && col === 5 ) ? '/Албан тушаал/'
                                                        : (row === fRow + 4 && col === 9 ) ? '.............................'
                                                        : (row === fRow + 7 && col === 9 ) ? '.............................'
                                                        : (row === fRow + 10 && col === 9 ) ? '.............................'
                                                            : (row === fRow + 5 && col === 9 ) ? '/Нэр/'
                                                            : (row === fRow + 8 && col === 9 ) ? '/Нэр/'
                                                            : (row === fRow + 11 && col === 9 ) ? '/Нэр/'
                                                                : (row === fRow + 4 && col === 13 ) ? '.............................'
                                                                : (row === fRow + 7 && col === 13 ) ? '.............................'
                                                                : (row === fRow + 10 && col === 13 ) ? '.............................'
                                                                    : (row === fRow + 5 && col === 13 ) ? '/Гарын үсэг/'
                                                                    : (row === fRow + 8 && col === 13 ) ? '/Гарын үсэг/'
                                                                    : (row === fRow + 11 && col === 13 ) ? '/Гарын үсэг/'
                                            : (row === fRow + 14 && col === 6 ) ? '20 ….. оны ….. сарын ….. өдөр'
                                                : ''
                                        }
                                    }

            /**
             * Sheet-ийн мөр болон баганы хэмжээг нэгд нэгэнгүй зааж өгдөг учир тус бүрт
             * хүснэгт хэзээ эхлэж хэзээ дуусахаас хамаарч тодорхой урттай
             * давталтыг гүйлгэв
             */
            const phaseTwoCells = Array.from({length: 20}, (_) => {return({wch: 4})})

            worksheet["!cols"] = [
                { wch: 20 },
                { wch: 2 },
                { wch: 5 },
                ...phaseTwoCells
            ];

            const phaseOneRow = Array.from({length: 3}, (_) => {return({hpx: 10})})
            const tableRow = Array.from({length: mainData.length + 1}, (_, cidx) => {return({hpx: (cidx === 37 || cidx === 40) ? 26 : 13})})

                worksheet["!rows"] = [
                    { hpx: 40 },
                    { hpx: 13 },
                    { hpx: 40 },
                    { hpx: 13 },
                    ...phaseOneRow,
                    { hpx: 13 },
                    { hpx: 13 },
                    { hpx: 16 },
                    { hpx: 16 },
                    { hpx: 16 },
                    { hpx: 100 },
                    ...tableRow
                ];

                /** CELL MERGE */
                worksheet['!merges'] = [

                    {
                        s: { r: 0, c: 0 },
                        e: { r: 0, c: 3 }
                    },
                    {
                        s: { r: 2, c: 0 },
                        e: { r: 2, c: 22 }
                    },
                    {
                        s: { r: styleRow, c: 0 },
                        e: { r: styleRow + 2, c: 0 }
                    },
                    {
                        s: { r: styleRow, c: 1 },
                        e: { r: styleRow + 2, c: 1 }
                    },
                    {
                        s: { r: styleRow, c: 2 },
                        e: { r: styleRow + 2, c: 2 }
                    },

                    // er em
                    {
                        s: { r: styleRow + 1, c: 3 },
                        e: { r: styleRow + 2, c: 3 }
                    },
                    {
                        s: { r: styleRow + 1, c: 4 },
                        e: { r: styleRow + 2, c: 4 }
                    },

                    {
                        s: { r: styleRow + 1, c: 5 },
                        e: { r: styleRow + 2, c: 5 }
                    },
                    {
                        s: { r: styleRow + 1, c: 8 },
                        e: { r: styleRow + 2, c: 8 }
                    },
                    {
                        s: { r: styleRow + 1, c: 11 },
                        e: { r: styleRow + 2, c: 11 }
                    },
                    {
                        s: { r: styleRow + 1, c: 14 },
                        e: { r: styleRow + 2, c: 14 }
                    },
                    {
                        s: { r: styleRow + 1, c: 17 },
                        e: { r: styleRow + 2, c: 17 }
                    },
                    {
                        s: { r: styleRow + 1, c: 20 },
                        e: { r: styleRow + 2, c: 20 }
                    },

                    // long merge
                    {
                        s: { r: styleRow, c: 3 },
                        e: { r: styleRow, c: 22 }
                    },


                    // footer merge

                    {
                        s: { r: fRow, c: 2 },
                        e: { r: fRow, c: 22 }
                    },
                    {
                        s: { r: fRow + 1, c: 2 },
                        e: { r: fRow + 1, c: 22 }
                    },

                    {
                        s: { r: fRow, c: 2 },
                        e: { r: fRow, c: 15 }
                    },

                    // ttttt
                    {
                        s: { r: fRow + 4, c: 1 },
                        e: { r: fRow + 4, c: 4 }
                    },
                    {
                        s: { r: fRow + 7, c: 1 },
                        e: { r: fRow + 7, c: 4 }
                    },
                    {
                        s: { r: fRow + 10, c: 1 },
                        e: { r: fRow + 10, c: 4 }
                    },

                    // tseguud
                    {
                        s: { r: fRow + 4, c: 5 },
                        e: { r: fRow + 4, c: 8 }
                    },
                    {
                        s: { r: fRow + 7, c: 5 },
                        e: { r: fRow + 7, c: 8 }
                    },
                    {
                        s: { r: fRow + 10, c: 5 },
                        e: { r: fRow + 10, c: 8 }
                    },

                    {
                        s: { r: fRow + 4, c: 9 },
                        e: { r: fRow + 4, c: 12 }
                    },
                    {
                        s: { r: fRow + 7, c: 9 },
                        e: { r: fRow + 7, c: 12 }
                    },
                    {
                        s: { r: fRow + 10, c: 9 },
                        e: { r: fRow + 10, c: 12 }
                    },

                    {
                        s: { r: fRow + 4, c: 13 },
                        e: { r: fRow + 4, c: 16 }
                    },
                    {
                        s: { r: fRow + 7, c: 13 },
                        e: { r: fRow + 7, c: 16 }
                    },
                    {
                        s: { r: fRow + 10, c: 13 },
                        e: { r: fRow + 10, c: 16 }
                    },

                    // gariin vseg
                    {
                        s: { r: fRow + 5, c: 13 },
                        e: { r: fRow + 5, c: 16 }
                    },
                    {
                        s: { r: fRow + 8, c: 13 },
                        e: { r: fRow + 8, c: 16 }
                    },
                    {
                        s: { r: fRow + 11, c: 13 },
                        e: { r: fRow + 11, c: 16 }
                    },

                    // ner
                    {
                        s: { r: fRow + 5, c: 9 },
                        e: { r: fRow + 5, c: 12 }
                    },
                    {
                        s: { r: fRow + 8, c: 9 },
                        e: { r: fRow + 8, c: 12 }
                    },
                    {
                        s: { r: fRow + 11, c: 9 },
                        e: { r: fRow + 11, c: 12 }
                    },

                    // alban tushaal
                    {
                        s: { r: fRow + 5, c: 5 },
                        e: { r: fRow + 5, c: 8 }
                    },
                    {
                        s: { r: fRow + 8, c: 5 },
                        e: { r: fRow + 8, c: 8 }
                    },
                    {
                        s: { r: fRow + 11, c: 5 },
                        e: { r: fRow + 11, c: 8 }
                    },

                    // hamgiin doorhi on sar
                    {
                        s: { r: fRow + 14, c: 6 },
                        e: { r: fRow + 14, c: 10 }
                    },
                ]

            worksheet['D11'] = {v:'',s:nullCell1}

                worksheet['G12'] = {s: nullCell1, v: "" }
                worksheet['H12'] = {s: nullCell2, v: "" }

                worksheet['J12'] = {s: nullCell1, v: "" }
                worksheet['K12'] = {s: nullCell2, v: "" }

                worksheet['M12'] = {s: nullCell1, v: "" }
                worksheet['N12'] = {s: nullCell2, v: "" }

                worksheet['P12'] = {s: nullCell1, v: "" }
                worksheet['Q12'] = {s: nullCell2, v: "" }

                worksheet['S12'] = {s: nullCell1, v: "" }
                worksheet['T12'] = {s: nullCell2, v: "" }

                worksheet['V12'] = {s: nullCell1, v: "" }
                worksheet['W12'] = {s: nullCell2, v: "" }

            writeFile(workbook, "A-DB-14.xlsx", { compression: true });

    }

    return(
        <div className="overflow-auto" style={{ minHeight: 200 }}>
            {/* <Button color="primary" className="mb-2 p-75" disabled={false} onClick={() => {convert()}}> */}
            <Button color="primary" className="mb-2 p-75" disabled={isLoading} onClick={() => {convert()}}>
                <FileText size={18} /> Excel татах
            </Button>
            {(isLoading || localLoaderDB14) ?
                Loader
                :
            <table>
                <thead>
                    <tr>
                        <th rowSpan={3}>Үзүүлэлт</th>
                        <th rowSpan={3} className="th-rotate-border">Нийт ажиллагчид</th>
                            <th colSpan={20} style={{ borderLeft: 0, height: 15 }}></th>
                    </tr>
                    <tr>
                        <th rowSpan={2} className="th-rotate">Эрэгтэй</th>
                        <th rowSpan={2} className="th-rotate">Эмэгтэй</th>
                        <th rowSpan={2} className="th-rotate-border">Захирал</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Дэд захирал</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Салбар сургуулийн захирал, дэд захирал</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Бүрэлдэхүүн сургуулийн захирал, дэд захирал</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Сургалтын албаны дарга</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Үндсэн багш</th>
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
                        <th className="th-rotate">Эрэгтэй</th>
                        <th className="th-rotate">Эмэгтэй</th>
                        <th className="th-rotate">Эрэгтэй</th>
                        <th className="th-rotate">Эмэгтэй</th>

                    </tr>
                </thead>
                <tbody>
                    {
                        datas.map((data, idx) => {
                            return(
                                <tr key={idx}>
                                    <th className={`${(data.data_list[0].all == 'blank' && data.data_list[0].men == 'blank' && data.data_list[0].women == 'blank') || idx == 0 ? '' : 'ps-2'}`}>{data?.type}</th>
                                    {data.data_list.map((val, vidx) => (
                                        <Fragment key={vidx}>
                                            <td>
                                                {val?.all == 'blank' ? '' : val?.all}
                                            </td>
                                            <td>
                                                {val?.men == 'blank' ? '' : val?.men}
                                            </td>
                                            <td>
                                                {val?.women == 'blank' ? '' : val?.women}
                                            </td>
                                        </Fragment>
                                    ))}
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
            }
            </div>
    )
}

export default ADB14