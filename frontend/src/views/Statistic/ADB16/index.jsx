import React, { Fragment, useContext, useEffect, useState } from "react";
import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";
import { Button, Spinner } from "reactstrap";
import { FileText } from 'react-feather'

import { utils, writeFile } from 'xlsx-js-style';
import './style.scss'
import ActiveYearContext from "@context/ActiveYearContext"

import { sampledata } from "./sample";

function ADB16(){

    const infoApi = useApi().status.db16
    const { cyear_name } = useContext(ActiveYearContext)

	// // Loader
	const { Loader, isLoading, fetchData } = useLoader({isSmall: true});
    const [localLoaderDB16, setLocalLoaderDB16] = useState(false)

    const [datas, setDatas] = useState(
        {
            length_dict: {}
        }
    )

    async function getDatas() {
        const {success, data} = await fetchData(infoApi.get())
        if(success) {
            setDatas(data)
            setLocalLoaderDB16(false)
        }
    }

    useEffect(() => {
        getDatas()
    },[])

    function groupdata() {
        let data = []
        var keys = Object.keys(datas?.length_dict)
        keys.map((obj, id) => {
            data.push(datas.all_list.filter((value) => value.gen_name === obj))
        })
        return data
    }


    // const datas = sampledata


    function convert() {
        const blank = [
            ...groupdata(),
            []
        ]

        const header = Array.from({length: 10},(_, hidx) => {
            return(
                {
                    'Ерөнхий чиглэл': 'А',
                    'Төрөлжсөн чиглэл': '',
                    ' ': '',
                    'Нарийвчилсан чиглэл ': '',
                    'МД': 'Б',
                    'Нийт суралцагчид': 1,
                        'Эрэгтэй': 2,
                        'Эмэгтэй': 3,
                    'Дипломын боловсрол': 4,
                        'Эрэгтэй2': 5,
                        'Эмэгтэй2': 6,
                    'Бакалаврын боловсрол': 7,
                        'Эрэгтэй3': 8,
                        'Эмэгтэй3': 9,
                    'Магистрын боловсрол': 10,
                        'Эрэгтэй4': 11,
                        'Эмэгтэй4': 12,
                    'Докторын боловсрол': 13,
                        'Эрэгтэй5': 14,
                        'Эмэгтэй5': 15,
                })})

        const flattenedArray = groupdata().flatMap(item => [
            ...item.map((ditem, didx) => ({ ...ditem })),
        ]);

        const mainData = flattenedArray.map((data, cidx) => {
            return(
                {
                    'Ерөнхий чиглэл': data?.gen_name,
                    'Төрөлжсөн чиглэл': data?.pro_name,
                    ' ': '',
                    'Нарийвчилсан чиглэл ': data?.pro_name_more,
                    'МД': cidx + 1,
                    'Нийт суралцагчид': data?.degree_list[0]?.all,
                        'Эрэгтэй': data?.degree_list[0]?.men,
                        'Эмэгтэй': data?.degree_list[0]?.women,
                    'Дипломын боловсрол': data?.degree_list[1]?.all,
                        'Эрэгтэй2': data?.degree_list[1]?.men,
                        'Эмэгтэй2': data?.degree_list[1]?.women,
                    'Бакалаврын боловсрол': data?.degree_list[2]?.all,
                        'Эрэгтэй3': data?.degree_list[2]?.men,
                        'Эмэгтэй3': data?.degree_list[2]?.women,
                    'Магистрын боловсрол': data?.degree_list[3]?.all,
                        'Эрэгтэй4': data?.degree_list[3]?.men,
                        'Эмэгтэй4': data?.degree_list[3]?.men,
                    'Докторын боловсрол': data?.degree_list[4]?.all,
                        'Эрэгтэй5': data?.degree_list[4]?.men,
                        'Эмэгтэй5': data?.degree_list[4]?.men,
                }
            )}
        )

        const footer = Array.from({length: 15},(_, hidx) => {
            return(
                {
                    'Ерөнхий чиглэл': '',
                    'Төрөлжсөн чиглэл': '',
                    ' ': '',
                    'Нарийвчилсан чиглэл ': '',
                    'МД': '',
                    'Нийт суралцагчид': '',
                        'Эрэгтэй': '',
                        'Эмэгтэй': '',
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
                })})


        const combo = [
            ...header,
            ...mainData,
            ...footer
        ]

        const worksheet = utils.json_to_sheet(combo);

        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "A-DB-16-Report")

        const staticCells = [
            'Ерөнхий чиглэл',
            'Төрөлжсөн чиглэл',
            ' ',
            'Нарийвчилсан чиглэл ',
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

        utils.sheet_add_aoa(worksheet, [staticCells], { origin: "A8" });

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

        const headerStyle = {
            font: {
                bold: true
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
        const endRow = 6;
        const startCol = 0;
        const endCol = 19;

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
            const cellAddress = utils.encode_cell({ r: row, c: col });

                if (!worksheet[cellAddress]) {
                    worksheet[cellAddress] = {};
                }

            worksheet[cellAddress].s = row === 6 ? bottomBorder : textCellStyle
            worksheet[cellAddress].v = (row === 1 && col === 0) ?
                    'Үндэсний статистикийн хорооны даргын 20. . . оны . . . сарын . . .  -ны өдрийн . . . дугаар тушаалаар батлав.'
                : (row === 3 && col === 0 ) ? cyear_name ? 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН  БАЙГУУЛЛАГАД ТӨГСӨГЧДИЙН' + ' '+  cyear_name.replace('-', '/') + ' ' + 'ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, мэргэжлийн чиглэлээр'
                        : 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН БАЙГУУЛЛАГЫН ТӨГСӨГЧДИЙН 20... /20... ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, мэргэжлийн чиглэлээр '
                    : ''
            }
        }

        const styleRow = endRow + 1;
        const sendRow = endRow + mainData.length + 4;
        const styleCol = 0;
        const sendCol = 19;

        for (let row = styleRow; row <= sendRow; row++) {
            for (let col = styleCol; col <= sendCol; col++) {
            const cellNum = utils.encode_cell({ r: row, c: col });

                if (!worksheet[cellNum]) {
                    worksheet[cellNum] = {};
                }

                worksheet[cellNum].s =
                    (row === styleRow && col !== 0 && col !== 1 && col !== 2 && col !== 3 && col !== 4)
                        ? rotatedTextStyle
                                : numberCellStyle;
            }
        }

        const fRow = sendRow + 1;
        const fendRow = sendRow + 15;
        const fCol = 0;
        const fendCol = 19;

        for (let row = fRow; row <= fendRow; row++) {
            for (let col = fCol; col <= fendCol; col++) {
            const cellNum = utils.encode_cell({ r: row, c: col });

                if (!worksheet[cellNum]) {
                    worksheet[cellNum] = {};
                }

                worksheet[cellNum].s = row === fRow ? footerBorder : textCellStyle
                            worksheet[cellNum].v = (row === fRow && col === 0) ?
                                    'Балансын шалгалт:' :
                                     (row === fRow && col === 1) ? 'Багана: 1=(2+3)=(4+7+10+13), 4=(5+6), 7=(8+9), 10=(11+12), 13=(14+15); '
                                        : (row === fRow + 4 && col === 3 ) ? 'Баталгаажуулсан:'
                                        : (row === fRow + 7 && col === 3 ) ? 'Хянасан:'
                                        : (row === fRow + 10 && col === 3 ) ? 'Мэдээ гаргасан:'
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


        const phaseTwoCells = Array.from({length: 16}, (_) => {return({wch: 4})})

        worksheet["!cols"] = [
            { wch: 20 },
            { wch: 20 },
            { wch: 2 },
            { wch: 20 },
            ...phaseTwoCells
        ];

        const phaseOneRow = Array.from({length: 3}, (_) => {return({hpx: 10})})
        const tableRow = Array.from({length: mainData.length + 1}, (_) => {return({hpx: 30})})

            worksheet["!rows"] = [
                { hpx: 10 },
                { hpx: 40 },
                { hpx: 10 },
                { hpx: 40 },
                ...phaseOneRow,
                { hpx: 30 },
                { hpx: 20 },
                { hpx: 100 },
                ...tableRow
            ];

        const tableBodyMerge = groupdata().map((data, idx) => {

            const number_relayer_1 = Array.from({length: idx },(_, nidx) => {
                return(
                        blank[nidx].length
                    )
                }
            )

            const number_relayer_2 = Array.from({length: idx },(_, nidx) => {
                return(
                        blank[nidx + 1].length
                    )
                }
            )

            const sum_1 = number_relayer_1.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            const sum_2 = number_relayer_2.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

            return(
                {
                    s: { r: idx === 0 ? null : styleRow + 4 + sum_1, c: idx === 0 ? null : 0 },
                    e: { r: idx === 0 ? null : styleRow + 4 + sum_2, c: idx === 0 ? null : 0 }
                }
            )
        })

        const rowsMerge = flattenedArray.map((data, cidx) => {
            return(
                {
                    s: { r: styleRow + 4 + cidx, c:
                        // хэрэв багана 1 2 3 ижил утгатай байвал гурвааланг нь merge хийнэ
                        (data?.gen_name === data?.pro_name && data?.gen_name === data?.pro_name_more) ? 0 :
                            // багана 2 багана 3тай ижил утгатай байвал 2оос 3луу merge хийнэ
                            // (data?.pro_name === data?.pro_name_more) ? 1 :
                                1 },
                    e:  { r: styleRow + 4 + cidx, c:
                        (data?.gen_name === data?.pro_name && data?.gen_name === data?.pro_name_more) ? 3 :
                            (data?.pro_name === data?.pro_name_more) ? 2 : 3
                        }
                }
            )
        })

        const tableHeaderMerge = [

            ...tableBodyMerge,
            ...rowsMerge,

            // hvsnegtiin ehniii 5 bagana
            {
                s: { r: styleRow, c: 0 },
                e: { r: styleRow + 2, c: 0 }
            },

            // blank cell
            {
                s: { r: styleRow + 3, c: 0 },
                e: { r: styleRow + 3, c: 3 }
            },
            {
                s: { r: styleRow, c: 1 },
                e: { r: styleRow + 2, c: 2 }
            },
            {
                s: { r: styleRow, c: 3 },
                e: { r: styleRow + 2, c: 3 }
            },
            {
                s: { r: styleRow, c: 4 },
                e: { r: styleRow + 2, c: 4 }
            },
            {
                s: { r: styleRow, c: 5 },
                e: { r: styleRow + 2, c: 5 }
            },

            // ehnii er em
            {
                s: { r: styleRow + 1, c: 6 },
                e: { r: styleRow + 2, c: 6 }
            },
            {
                s: { r: styleRow + 1, c: 7 },
                e: { r: styleRow + 2, c: 7 }
            },

            // tet
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
                s: { r: styleRow, c: 6 },
                e: { r: styleRow, c: 19 }
            },
        ]

        worksheet['!merges'] = [

                ...tableHeaderMerge,
                ...tableBodyMerge,
                // Аймаг, нийслэл, дүүрэг
                {
                    s: { r: 1, c: 0 },
                    e: { r: 1, c: 3 }
                },
                {
                    s: { r: 3, c: 0 },
                    e: { r: 3, c: 19 }
                },

                // hvsnegtiin doorhi tomiyo
                {
                    s: { r: fRow, c: 1 },
                    e: { r: fRow, c: 9 }
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

        worksheet['F8'].s = rotatedBorderFix
        worksheet['G8'] = {s: nullCell2, v: ''}

        // эхний эр эм
        worksheet['G9'] = {s: rotatedTextStyle, v: 'Эрэгтэй'}
        worksheet['H9'] = {s: rotatedTextStyle, v: 'Эмэгтэй'}

        // Дипломын боловсрол
        worksheet['J9'] = {s: nullCell1, v: ''}
        worksheet['K9'] = {s: nullCell2, v: ''}

        worksheet['I9'] = {s: rotatedBorderFix, v: 'Дипломын боловсрол'}
        worksheet['J10'] = {s: rotatedTextStyle, v: 'Эрэгтэй'}
        worksheet['K10'] = {s: rotatedTextStyle, v: 'Эмэгтэй'}

        // Бакалаврын боловсрол
        worksheet['M9'] = {s: nullCell1, v: ''}
        worksheet['N9'] = {s: nullCell2, v: ''}

        worksheet['L9'] = {s: rotatedBorderFix, v: 'Бакалаврын боловсрол'}
        worksheet['M10'] = {s: rotatedTextStyle, v: 'Эрэгтэй'}
        worksheet['N10'] = {s: rotatedTextStyle, v: 'Эмэгтэй'}

        // Магистрын боловсрол
        worksheet['P9'] = {s: nullCell1, v: ''}
        worksheet['Q9'] = {s: nullCell2, v: ''}

        worksheet['O9'] = {s: rotatedBorderFix, v: 'Магистрын боловсрол'}
        worksheet['P10'] = {s: rotatedTextStyle, v: 'Эрэгтэй'}
        worksheet['Q10'] = {s: rotatedTextStyle, v: 'Эмэгтэй'}

        // Докторын боловсрол
        worksheet['S9'] = {s: nullCell1, v: ''}
        worksheet['T9'] = {s: nullCell2, v: ''}

        worksheet['R9'] = {s: rotatedBorderFix, v: 'Докторын боловсрол'}
        worksheet['S10'] = {s: rotatedTextStyle, v: 'Эрэгтэй'}
        worksheet['T10'] = {s: rotatedTextStyle, v: 'Эмэгтэй'}

        writeFile(workbook, "A-DB-16.xlsx", { compression: true });

}
    return(
        <div className="overflow-auto" style={{ minHeight: 200 }}>
            {/* <Button color="primary" className="mb-2 p-75" disabled={false} onClick={() => {convert()}}> */}
            <Button color="primary" className="mb-2 p-75" disabled={isLoading} onClick={() => {convert()}}>
                <FileText size={18} /> Excel татах
            </Button>
            {(isLoading || localLoaderDB16) ?
                Loader
                :
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
                <tbody>
                    {
                        groupdata().map((vdata, cidx) => {
                            return(
                                <Fragment key={cidx}>
                                    {vdata.map((data, idx) => {
                                        return(
                                            <tr key={idx}>
                                                <th
                                                    className={`${
                                                        idx === 0 ? '' : 'd-none'
                                                    }`}
                                                    colSpan={`${datas.all_list[idx]['pro_name'] === data?.gen_name ? 3 : 1}`}
                                                    rowSpan={vdata.length}
                                                    style={{ maxWidth: '120px' }}
                                                >
                                                    {data?.gen_name}
                                                </th>
                                                <th
                                                    className={`${data?.gen_name === data?.pro_name ? 'd-none' : ''}`}
                                                    colSpan={`${data?.pro_name === data?.pro_name_more ? 2 : 1 }`}
                                                    style={{ maxWidth: '120px' }}
                                                >
                                                    {data?.pro_name}
                                                </th>
                                                <td
                                                    className={`${data?.pro_name === data?.pro_name_more ? 'd-none' : ''}`}
                                                    style={{ maxWidth: '120px' }}
                                                >
                                                    {data?.pro_name_more}
                                                </td>
                                                {data?.degree_list.map((deg, didx) => {
                                                    return(
                                                        <Fragment key={didx}>
                                                            <td>
                                                                {deg?.all}
                                                            </td>
                                                            <td>
                                                                {deg?.men}
                                                            </td>
                                                            <td>
                                                                {deg?.women}
                                                            </td>
                                                        </Fragment>
                                                    )
                                                })}
                                            </tr>
                                        )
                                    })}
                                </Fragment>
                            )
                        })
                    }
                </tbody>
            </table>
            }
            </div>
    )
}

export default ADB16