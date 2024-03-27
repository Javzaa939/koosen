import React, { Fragment, useContext, useEffect, useState } from "react";
import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";
import { Button, Spinner } from "reactstrap";
import { FileText } from 'react-feather'

import { utils, writeFile } from 'xlsx-js-style';
import './style.scss'
import ActiveYearContext from "@context/ActiveYearContext"

import { sampledata } from "./sample";

// Төрлийн дугаар
const degreeAll = "Бүгд"
const degreeBakalavr = 'D'
const degreeMagistr = 'E'
const degreeDoctor = 'F'
const degreeDiplom = 'C'

function ADB17(){

    const infoApi = useApi().status.db17
    const { cyear_name } = useContext(ActiveYearContext)

	// // Loader
	const { Loader, isLoading, fetchData } = useLoader({isSmall: true});
    const [localLoaderDB17, setLocalLoaderDB17] = useState(false)

    const [datas, setDatas] = useState([])

    async function getDatas() {
        const {success, data} = await fetchData(infoApi.get())
        if(success) {
            setDatas(data)
            setLocalLoaderDB17(false)
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
                    'Байгууллагын ангилал': 'А',
                    ' ': '',
                    'МД': 'Б',
                    'Нийт суралцагчид': 1,
                        'Эрэгтэй': 2,
                        'Эмэгтэй': 3,
                    'Дипломын боловсрол': 4,
                        'Эрэгтэй1': 5,
                        'Эмэгтэй1': 6,
                    'Бакалаврын боловсрол': 7,
                        'Эрэгтэй2': 8,
                        'Эмэгтэй2': 9,
                    'Магистрын боловсрол': 10,
                        'Эрэгтэй3': 11,
                        'Эмэгтэй3': 12,
                    'Докторын боловсрол': 13,
                        'Эрэгтэй4': 14,
                        'Эмэгтэй4': 15,
                })})


        const mainData = datas.map((data, idx) => {
            return(
                    {
                        // {data?.age_list?.degree.filter((datz) => datz?.all_degree_id === degreeAll)[0]?.all_student}
                        'Байгууллагын ангилал': data?.institution === 'Бүгд' ? data?.property : '    ' + data?.institution,
                        ' ': '',
                        'МД': idx + 1,
                        'Нийт суралцагчид': data.col_list.filter((data) => data.degree_code === degreeAll)[0]?.all,
                            'Эрэгтэй': data.col_list.filter((data) => data.degree_code === degreeAll)[0]?.men,
                            'Эмэгтэй': data.col_list.filter((data) => data.degree_code === degreeAll)[0]?.women,
                        'Дипломын боловсрол': data.col_list.filter((data) => data.degree_code === degreeDiplom)[0]?.all,
                            'Эрэгтэй1': data.col_list.filter((data) => data.degree_code === degreeDiplom)[0]?.men,
                            'Эмэгтэй1': data.col_list.filter((data) => data.degree_code === degreeDiplom)[0]?.women,
                        'Бакалаврын боловсрол': data.col_list.filter((data) => data.degree_code === degreeBakalavr)[0]?.all,
                            'Эрэгтэй2': data.col_list.filter((data) => data.degree_code === degreeBakalavr)[0]?.men,
                            'Эмэгтэй2': data.col_list.filter((data) => data.degree_code === degreeBakalavr)[0]?.women,
                        'Магистрын боловсрол': data.col_list.filter((data) => data.degree_code === degreeMagistr)[0]?.all,
                            'Эрэгтэй3': data.col_list.filter((data) => data.degree_code === degreeMagistr)[0]?.men,
                            'Эмэгтэй3': data.col_list.filter((data) => data.degree_code === degreeMagistr)[0]?.women,
                        'Докторын боловсрол': data.col_list.filter((data) => data.degree_code === degreeDoctor)[0]?.all,
                            'Эрэгтэй4': data.col_list.filter((data) => data.degree_code === degreeDoctor)[0]?.men,
                            'Эмэгтэй4': data.col_list.filter((data) => data.degree_code === degreeDoctor)[0]?.women,
                    }
                )
            })


        const footer = Array.from({length: 15},(_, hidx) => {
            return(
                {
                    'Байгууллагын ангилал': '',
                    ' ': '',
                    'МД': '',
                    'Нийт суралцагчид': '',
                        'Эрэгтэй': '',
                        'Эмэгтэй': '',
                    'Дипломын боловсрол': '',
                        'Эрэгтэй1': '',
                        'Эмэгтэй1': '',
                    'Бакалаврын боловсрол': '',
                        'Эрэгтэй2': '',
                        'Эмэгтэй2': '',
                    'Магистрын боловсрол': '',
                        'Эрэгтэй3': '',
                        'Эмэгтэй3': '',
                    'Докторын боловсрол': '',
                        'Эрэгтэй4': '',
                        'Эмэгтэй4': '',
                })})


        const combo = [...header, ...mainData, ...footer]

        const worksheet = utils.json_to_sheet(combo);

        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "A-DB-17-Report")
        const staticCells = [
            'Байгууллагын ангилал',
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

            const defaultTextStyle = {
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                },
                alignment: {
                    // horizontal: 'center',
                    vertical: 'center',
                    wrapText: true
                },
                font:{
                    sz:10
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
            const endRow = 8;
            const startCol = 0;
            const endCol = 17;

            for (let row = startRow; row <= endRow; row++) {
                for (let col = startCol; col <= endCol; col++) {
                const cellAddress = utils.encode_cell({ r: row, c: col });

                    if (!worksheet[cellAddress]) {
                        worksheet[cellAddress] = {};
                    }

                worksheet[cellAddress].s = row === endRow ? bottomBorder : textCellStyle
                worksheet[cellAddress].v = (row === 0 && col === 0) ?
                        'Үндэсний статистикийн хорооны даргын 20. . . оны . . . сарын . . .  -ны өдрийн . . . дугаар тушаалаар батлав.'
                    : (row === 2 && col === 0 ) ? cyear_name ? 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН БАЙГУУЛЛАГЫН ТӨГСӨГЧДИЙН' + ' '+  cyear_name.replace('-', '/') + ' ' + 'ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, өмчийн хэлбэрээр'
                            : 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН БАЙГУУЛЛАГЫН ТӨГСӨГЧДИЙН 20... / 20... ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, өмчийн хэлбэрээр'
                        : ''
                }
            }

            const styleRow = endRow + 1;
            const sendRow = styleRow + datas.length + 3;
            const styleCol = 0;
            const sendCol = 17;

            for (let row = styleRow; row <= sendRow; row++) {
                for (let col = styleCol; col <= sendCol; col++) {
                    const cellNum = utils.encode_cell({ r: row, c: col });

                    if (!worksheet[cellNum]) {
                        worksheet[cellNum] = {};
                    }

                    worksheet[cellNum].s =
                        (row === styleRow && col !== 0 && col !== 2)
                            ? rotatedTextStyle : (col === 0 || col === 20) ? defaultTextStyle : numberCellStyle;
                }
            }1

            const fRow = sendRow + 1;
            const fendRow = sendRow + 16;
            const fCol = 0;
            const fendCol = 17;

            for (let row = fRow; row <= fendRow; row++) {
                for (let col = fCol; col <= fendCol; col++) {
                const cellNum = utils.encode_cell({ r: row, c: col });

                    if (!worksheet[cellNum]) {
                        worksheet[cellNum] = {};
                    }

                    worksheet[cellNum].s = row === fRow ? footerBorder : textCellStyle
                                worksheet[cellNum].v = (row === fRow && col === 0) ?
                                        'Балансын шалгалт:' :
                                         (row === fRow && col === 2) ? 'Багана: 1=(2+3)=(4+7+10+13), 4=(5+6), 7=(8+9), 10=(11+12), 13=(14+15);' :
                                         (row === fRow + 1 && col === 2) ? 'Мөр: 1=(2÷4)=(5+9+13+17), 5=(6÷8), 9=(10÷12), 13=(14÷16), 17=(18÷20);'
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



            const phaseTwoCells = Array.from({length: 16}, (_) => {return({wch: 4})})

            worksheet["!cols"] = [
                { wch: 20 },
                { wch: 2 },
                { wch: 5 },
                ...phaseTwoCells
            ];

            const phaseOneRow = Array.from({length: 3}, (_) => {return({hpx: 10})})
            const tableRow = Array.from({length: mainData.length + 1}, (_) => {return({hpx: 13})})

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
                    { hpx: 100 },
                    ...tableRow
                ];


                const firstColumnMerge = Array.from({length: datas.length + 1}, (_, idx) => {return(
                    {
                        s: { r: styleRow + idx + 3, c: 0 },
                        e: { r: styleRow + idx + 3, c: 1 }
                    }
                )})

                worksheet['!merges'] = [

                    ...firstColumnMerge,

                    {
                        s: { r: 0, c: 0 },
                        e: { r: 0, c: 3 }
                    },
                    {
                        s: { r: 2, c: 0 },
                        e: { r: 2, c: 17 }
                    },
                    {
                        s: { r: styleRow, c: 0 },
                        e: { r: styleRow + 2, c: 1 }
                    },
                    {
                        s: { r: styleRow, c: 2 },
                        e: { r: styleRow + 2, c: 2 }
                    },
                    {
                        s: { r: styleRow, c: 3 },
                        e: { r: styleRow + 2, c: 3 }
                    },


                    // er em
                    {
                        s: { r: styleRow + 1, c: 4 },
                        e: { r: styleRow + 2, c: 4 }
                    },
                    {
                        s: { r: styleRow + 1, c: 5 },
                        e: { r: styleRow + 2, c: 5 }
                    },

                    // bolovsroliin zereg merge
                    {
                        s: { r: styleRow + 1, c: 6 },
                        e: { r: styleRow + 2, c: 6 }
                    },
                    {
                        s: { r: styleRow + 1, c: 9 },
                        e: { r: styleRow + 2, c: 9 }
                    },
                    {
                        s: { r: styleRow + 1, c: 12 },
                        e: { r: styleRow + 2, c: 12 }
                    },
                    {
                        s: { r: styleRow + 1, c: 15 },
                        e: { r: styleRow + 2, c: 15 }
                    },

                    // long merge
                    {
                        s: { r: styleRow, c: 4 },
                        e: { r: styleRow, c: 17 }
                    },


                    // footer merge

                    {
                        s: { r: fRow, c: 2 },
                        e: { r: fRow, c: 15 }
                    },
                    {
                        s: { r: fRow + 1, c: 2 },
                        e: { r: fRow + 1, c: 15 }
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

            worksheet['E10'] = {v:'',s:nullCell1}

            worksheet['D10'].s = rotatedBorderFix

            // worksheet['E10'] = {s: nullCell1, v: "" }
            // worksheet['F10'] = {s: nullCell2, v: "" }
            worksheet['E11'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['F11'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

            worksheet['G11'] = {s: rotatedBorderFix, v: "Дипломын боловсрол" }
                worksheet['H11'] = {s: nullCell1, v: "" }
                worksheet['I11'] = {s: nullCell2, v: "" }
                worksheet['H12'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
                worksheet['I12'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

            worksheet['J11'] = {s: rotatedBorderFix, v: "Бакалаврын боловсрол" }
                worksheet['K11'] = {s: nullCell1, v: "" }
                worksheet['L11'] = {s: nullCell2, v: "" }
                worksheet['K12'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
                worksheet['L12'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

            worksheet['M11'] = {s: rotatedBorderFix, v: "Магистрын боловсрол" }
                worksheet['N11'] = {s: nullCell1, v: "" }
                worksheet['O11'] = {s: nullCell2, v: "" }
                worksheet['N12'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
                worksheet['O12'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

            worksheet['P11'] = {s: rotatedBorderFix, v: "Докторын боловсрол" }
                worksheet['Q11'] = {s: nullCell1, v: "" }
                worksheet['R11'] = {s: nullCell2, v: "" }
                worksheet['Q12'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
                worksheet['R12'] = {s: rotatedTextStyle, v: "Эмэгтэй" }


            writeFile(workbook, "A-DB-17.xlsx", { compression: true });

    }

    return(
        <div className="overflow-auto" style={{ minHeight: 200 }}>
            {/* <Button color="primary" className="mb-2 p-75" disabled={false} onClick={() => {convert()}}> */}
            <Button color="primary" className="mb-2 p-75" disabled={isLoading} onClick={() => {convert()}}>
                <FileText size={18} /> Excel татах
            </Button>
            {(isLoading || localLoaderDB17) ?
                Loader
                :
            <table>
                <thead>
                    <tr>
                        <th rowSpan={3}>Ерөнхий чиглэл</th>
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
                            <Fragment key={idx}>
                                <tr>
                                    <th className={`${data?.institution === 'Бүгд' ? '' : 'ps-2'}`}>
                                        {
                                            // data?.institution === 'Бүгд' ? data?.property : '   ' + data?.institution
                                            data?.institution === 'Бүгд' ? data?.property : data?.institution
                                        }
                                    </th>
                            {/* Нийт оюутны тоо */}
                                    <td>
                                        {data.col_list.filter((data) => data.degree_code === degreeAll)[0]?.all}
                                    </td>
                                    <td>
                                        {data.col_list.filter((data) => data.degree_code === degreeAll)[0]?.men}
                                    </td>
                                    <td>
                                        {data.col_list.filter((data) => data.degree_code === degreeAll)[0]?.women}
                                    </td>

                            {/* Дипломын боловсролд хамрагдах оюутны тоо */}
                                    <td>
                                        {data.col_list.filter((data) => data.degree_code === degreeDiplom)[0]?.all}
                                    </td>
                                    <td>
                                        {data.col_list.filter((data) => data.degree_code === degreeDiplom)[0]?.men}
                                    </td>
                                    <td>
                                        {data.col_list.filter((data) => data.degree_code === degreeDiplom)[0]?.women}
                                    </td>


                            {/* Бакалаврын боловсролд хамрагдах оюутны тоо */}
                                    <td>
                                        {data.col_list.filter((data) => data.degree_code === degreeBakalavr)[0]?.all}
                                    </td>
                                    <td>
                                        {data.col_list.filter((data) => data.degree_code === degreeBakalavr)[0]?.men}
                                    </td>
                                    <td>
                                        {data.col_list.filter((data) => data.degree_code === degreeBakalavr)[0]?.women}
                                    </td>


                            {/* Магистрын боловсролд хамрагдах оюутны тоо */}
                                    <td>
                                        {data.col_list.filter((data) => data.degree_code === degreeMagistr)[0]?.all}
                                    </td>
                                    <td>
                                        {data.col_list.filter((data) => data.degree_code === degreeMagistr)[0]?.men}
                                    </td>
                                    <td>
                                        {data.col_list.filter((data) => data.degree_code === degreeMagistr)[0]?.women}
                                    </td>


                            {/* Докторын боловсролд хамрагдах оюутны тоо */}
                                    <td>
                                        {data.col_list.filter((data) => data.degree_code === degreeDoctor)[0]?.all}
                                    </td>
                                    <td>
                                        {data.col_list.filter((data) => data.degree_code === degreeDoctor)[0]?.men}
                                    </td>
                                    <td>
                                        {data.col_list.filter((data) => data.degree_code === degreeDoctor)[0]?.women}
                                    </td>

                                </tr>
                                {/* {data?.aimag.map((aimag, aidx) => (
                                    <tr>
                                        <td className="ps-2">
                                            {aimag?.name}
                                        </td>
                                    </tr>
                                ))} */}
                            </Fragment>
                        )
                    })}

                </tbody>
            </table>
            }
            </div>
    )
}

export default ADB17