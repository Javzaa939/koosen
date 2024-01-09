import React, { Fragment, useContext, useEffect, useState } from "react";
import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";
import { Button, Spinner } from "reactstrap";
import { FileText } from 'react-feather'

import { utils, writeFile } from 'xlsx-js-style';
import './style.scss'
import ActiveYearContext from "@context/ActiveYearContext"

import { sampledata } from "./sample";

function ADB6(){

    const infoApi = useApi().status.db6
    const { cyear_name } = useContext(ActiveYearContext)

	// // Loader
	const { Loader, isLoading, fetchData } = useLoader({isSmall: true});
    const [localLoaderDB6, setLocalLoaderDB6] = useState(true)


    // const datas = sampledata

    const [datas, setDatas] = useState([])

    async function getDatas() {
        const {success, data} = await fetchData(infoApi.get())
        if(success) {
            setDatas(data)
            setLocalLoaderDB6(false)
        }
    }

    useEffect(() => {
        getDatas()
    },[])

        function convert() {
            const header = Array.from({length: 13},(_, hidx) => {
                return(
                    {
                        'Нас': 'А',
                        ' ': '',
                        '  ': '',
                        '    ': '',
                        'МД': 'Б',
                        'Нийт суралцагчид': 1,
                        'Нийт суралцагчид2': '',
                        'Эрэгтэй0': 2,
                            'Эрэгтэй1': '',
                        'Эмэгтэй0': 3,
                            'Эмэгтэй1': '',
                        'I дамжаа': 4,
                            'Эрэгтэй2': 5,
                            'Эмэгтэй2': 6,
                        'II дамжаа': 7,
                            'Эрэгтэй3': 8,
                            'Эмэгтэй3': 9,
                        'III дамжаа': 10,
                            'Эрэгтэй4': 11,
                            'Эмэгтэй4': 12,
                        'IV дамжаа': 13,
                            'Эрэгтэй5': 14,
                            'Эмэгтэй5': 15,
                        'V дамжаа': 16,
                            'Эрэгтэй6': 17,
                            'Эмэгтэй6': 18,
                        'VI дамжаа': 19,
                            'Эрэгтэй7': 20,
                            'Эмэгтэй7': 21,
                    })})


                    const flattenedArray = datas.flatMap(item => [
                        { type: 'parent', data: item.data.type_study_name_0, children_name: item?.name },
                        { type: 'child', data: item.data.type_study_name_1, children_name: item?.name },
                        { type: 'child', data: item.data.type_study_name_2, children_name: item?.name },
                        { type: 'child', data: item.data.type_study_name_3, children_name: item?.name },
                    ]);


            const mainData = flattenedArray.map((info, idx) => {
                const data = info.data
                    return(
                    {
                        'Нас': info.type === 'parent' ? info?.children_name : '    ' + data?.name,
                        ' ': '',
                        '  ': '',
                        '    ': '',
                        'МД': idx + 1,
                        'Нийт суралцагчид': data?.data?.all_level_name_0,
                        'Нийт суралцагчид2': '',
                        'Эрэгтэй0': data?.data?.men_level_name_0,
                            'Эрэгтэй1': '',
                        'Эмэгтэй0': data?.data?.women_level_name_0,
                            'Эмэгтэй1': '',
                        'I дамжаа': data?.data?.women_level_name_1,
                            'Эрэгтэй2': data?.data?.women_level_name_1,
                            'Эмэгтэй2': data?.data?.women_level_name_1,
                        'II дамжаа': data?.data?.women_level_name_2,
                            'Эрэгтэй3': data?.data?.women_level_name_2,
                            'Эмэгтэй3': data?.data?.women_level_name_2,
                        'III дамжаа': data?.data?.women_level_name_3,
                            'Эрэгтэй4': data?.data?.women_level_name_3,
                            'Эмэгтэй4': data?.data?.women_level_name_3,
                        'IV дамжаа': data?.data?.women_level_name_4,
                            'Эрэгтэй5': data?.data?.women_level_name_4,
                            'Эмэгтэй5': data?.data?.women_level_name_4,
                        'V дамжаа': data?.data?.women_level_name_5,
                            'Эрэгтэй6': data?.data?.women_level_name_5,
                            'Эмэгтэй6': data?.data?.women_level_name_5,
                        'VI дамжаа': data?.data?.women_level_name_6,
                            'Эрэгтэй7': data?.data?.women_level_name_6,
                            'Эмэгтэй7': data?.data?.women_level_name_6,
                    }
                )
            })

            const footer = Array.from({length: 15},(_, hidx) => {
                return(
                    {
                        'Нас': 'А',
                        ' ': '',
                        '  ': '',
                        '    ': '',
                        'МД': '',
                        'Нийт суралцагчид': '',
                        'Нийт суралцагчид2': '',
                        'Эрэгтэй0': '',
                            'Эрэгтэй1': '',
                        'Эмэгтэй0': '',
                            'Эмэгтэй1': '',
                        'I дамжаа': '',
                            'Эрэгтэй2': '',
                            'Эмэгтэй2': '',
                        'II дамжаа': '',
                            'Эрэгтэй3': '',
                            'Эмэгтэй3': '',
                        'III дамжаа': '',
                            'Эрэгтэй4': '',
                            'Эмэгтэй4': '',
                        'IV дамжаа': '',
                            'Эрэгтэй5': '',
                            'Эмэгтэй5': '',
                        'V дамжаа': '',
                            'Эрэгтэй6': '',
                            'Эмэгтэй6': '',
                        'VI дамжаа': '',
                            'Эрэгтэй7': '',
                            'Эмэгтэй7': '',
                    })})


            const combo = [...header, ...mainData, ...footer]

            const worksheet = utils.json_to_sheet(combo);

            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, "A-DB-6-Report")
            const staticCells = [

                'Нас',
                ' ',
                '  ',
                '    ',
                'МД',
                'Нийт суралцагчид',
                'Нийт суралцагчид',
                    'Эрэгтэй',
                    'Эрэгтэй',

                    'Эмэгтэй',
                    'Эмэгтэй',
                'I дамжаа',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'II дамжаа',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'III дамжаа',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'IV дамжаа',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'V дамжаа',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'VI дамжаа',
                    'Эрэгтэй',
                    'Эмэгтэй',

            ];

            utils.sheet_add_aoa(worksheet, [staticCells], { origin: "A11" });


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
                    left: { style: "thin", color: { rgb: "ffffff" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                },
                alignment: {
                    horizontal: 'center',
                    vertical: 'center',
                    wrapText: true
                },
                font:{
                    sz:10
                }
            };
                    // Толгой хэсэгт стайл болон Текст өгж буй хэсэг

                    const startRow = 0;
                    const endRow = 9;
                    const startCol = 0;
                    const endCol = 28;

                    for (let row = startRow; row <= endRow; row++) {
                        for (let col = startCol; col <= endCol; col++) {
                        const cellAddress = utils.encode_cell({ r: row, c: col });

                            if (!worksheet[cellAddress]) {
                                worksheet[cellAddress] = {};
                            }

                        worksheet[cellAddress].s = row === 8 ? bottomBorder : textCellStyle
                        worksheet[cellAddress].v = (row === 0 && col === 0) ?
                                'Үндэсний статистикийн хорооны даргын 20. . . оны . . . сарын . . .  -ны өдрийн . . . дугаар тушаалаар батлав.'
                            : (row === 2 && col === 0 ) ? cyear_name ? 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН БАЙГУУЛЛАГАД СУРАЛЦАГЧДЫН' + ' '+  cyear_name.replace('-', '/') + ' ' + 'ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, насны ангиллаар'
                                    : ' ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН БАЙГУУЛЛАГАД СУРАЛЦАГЧДЫН 20... / 20... ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, насны ангиллаар'
                                : ''
                        }
                    }

                    const styleRow = 10;
                    const sendRow = 33;
                    const styleCol = 0;
                    const sendCol = 28;

                    for (let row = styleRow; row <= sendRow; row++) {
                        for (let col = styleCol; col <= sendCol; col++) {
                            const cellNum = utils.encode_cell({ r: row, c: col });

                            if (!worksheet[cellNum]) {
                                worksheet[cellNum] = {};
                            }

                            worksheet[cellNum].s =
                                (row === 10 && col !== 0 && col !== 4)
                                    ? rotatedTextStyle : numberCellStyle;
                                    // ? rotatedTextStyle : (col === 0 || col === 20) ? defaultTextStyle : numberCellStyle;
                        }
                    }




                    const fRow = sendRow + 1;
                    const fendRow = sendRow + 15;
                    const fCol = 0;
                    const fendCol = 28;


                    for (let row = fRow; row <= fendRow; row++) {
                        for (let col = fCol; col <= fendCol; col++) {
                        const cellNum = utils.encode_cell({ r: row, c: col });

                            if (!worksheet[cellNum]) {
                                worksheet[cellNum] = {};
                            }

                            worksheet[cellNum].s = (row === 34) ? footerBorder : textCellStyle
                            worksheet[cellNum].v = (row === 34 && col === 0) ?
                            'Балансын шалгалт:'
                                : (row === 38 && col === 7 ) ? 'Баталгаажуулсан:'
                                : (row === 40 && col === 7 ) ? 'Хянасан:'
                                : (row === 42 && col === 7 ) ? 'Мэдээ гаргасан:'
                                    : (row === 38 && col === 12 ) ? '.............................'
                                    : (row === 40 && col === 12 ) ? '.............................'
                                    : (row === 42 && col === 12 ) ? '.............................'
                                        : (row === 39 && col === 12 ) ? '/Албан тушаал/'
                                        : (row === 41 && col === 12 ) ? '/Албан тушаал/'
                                        : (row === 43 && col === 12 ) ? '/Албан тушаал/'
                                            : (row === 38 && col === 16 ) ? '.............................'
                                            : (row === 40 && col === 16 ) ? '.............................'
                                            : (row === 42 && col === 16 ) ? '.............................'
                                                : (row === 39 && col === 16 ) ? '/Нэр/'
                                                : (row === 41 && col === 16 ) ? '/Нэр/'
                                                : (row === 43 && col === 16 ) ? '/Нэр/'
                                                    : (row === 38 && col === 20 ) ? '.............................'
                                                    : (row === 40 && col === 20 ) ? '.............................'
                                                    : (row === 42 && col === 20 ) ? '.............................'
                                                        : (row === 39 && col === 20 ) ? '/Гарын үсэг/'
                                                        : (row === 41 && col === 20 ) ? '/Гарын үсэг/'
                                                        : (row === 43 && col === 20 ) ? '/Гарын үсэг/'
                                : (row === 53 && col === 6 ) ? '20 ….. оны ….. сарын ….. өдөр'
                                    : ''
                        }
                    }




                    const indicesToCheck = [ 4, 5, 6, 7, 8, 9, 10];
                    const phaseOneCol = Array.from({ length: 29 }, (_,idx) => {
                        return(
                            { wch: indicesToCheck.includes(idx) ? 2 : 4 }
                        )})

                    worksheet["!cols"] = [ ...phaseOneCol ];

                    const phaseTwoRow = Array.from({ length: 6 }, (_) => {return( { hpx: 10 } )})

                    worksheet["!rows"] = [
                        { hpx: 40 },
                        { hpx: 10 },
                        { hpx: 40 },
                        { hpx: 10 },
                        ...phaseTwoRow,
                        // Хүснэгтийн эхний мөр
                        { hpx: 20 },
                        { hpx: 20 },
                        { hpx: 70 },
                    ];


                    const phaseOneMerge = Array.from({length: 21}, (_, midx) => {
                        return(
                        {
                            s: { r: midx + 13, c: 0 },
                            e: { r: midx + 13, c: 3 }
                        }
                    )})

                    const phaseTwoMerge = Array.from({length: 21}, (_, midx) => {
                        return(
                        {
                            s: { r: midx + 13, c: 5 },
                            e: { r: midx + 13, c: 6 }
                        }
                    )})

                    const phaseThreeMerge = Array.from({length: 21}, (_, midx) => {
                        return(
                        {
                            s: { r: midx + 13, c: 7 },
                            e: { r: midx + 13, c: 8 }
                        }
                    )})

                    const phaseFourMerge = Array.from({length: 21}, (_, midx) => {
                        return(
                        {
                            s: { r: midx + 13, c: 9 },
                            e: { r: midx + 13, c: 10 }
                        }
                    )})

                    worksheet['!merges'] = [

                        //header merge
                        {
                            s: { r: 0, c: 0 },
                            e: { r: 0, c: 10 }
                        },
                        {
                            s: { r: 2, c: 0 },
                            e: { r: 2, c: 28 }
                        },
                    //header merge
                        {
                            s: { r: 10, c: 0 },
                            e: { r: 12, c: 3 }
                        },
                        {
                            s: { r: 10, c: 4 },
                            e: { r: 12, c: 4 }
                        },
                        {
                            s: { r: 10, c: 5 },
                            e: { r: 12, c: 6 }
                        },
                        {
                            s: { r: 11, c: 7 },
                            e: { r: 12, c: 8 }
                        },
                        {
                            s: { r: 11, c: 9 },
                            e: { r: 12, c: 10 }
                        },
                        {
                            s: { r: 10, c: 7 },
                            e: { r: 10, c: 28 }
                        },

                    // first col merge
                        ...phaseOneMerge,
                        ...phaseTwoMerge,
                        ...phaseThreeMerge,
                        ...phaseFourMerge,

                        // table subheader
                        {
                            s: { r: 11, c: 11 },
                            e: { r: 12, c: 11 }
                        },
                        {
                            s: { r: 11, c: 14 },
                            e: { r: 12, c: 14 }
                        },
                        {
                            s: { r: 11, c: 17 },
                            e: { r: 12, c: 17 }
                        },
                        {
                            s: { r: 11, c: 20 },
                            e: { r: 12, c: 20 }
                        },
                        {
                            s: { r: 11, c: 23 },
                            e: { r: 12, c: 23 }
                        },
                        {
                            s: { r: 11, c: 26 },
                            e: { r: 12, c: 26 }
                        },


                            // footer merge
                            {
                                s: { r: 34, c: 0 },
                                e: { r: 34, c: 5 }
                            },
                            {
                                s: { r: 34, c: 6 },
                                e: { r: 34, c: 28 }
                            },
                            {
                                s: { r: 35, c: 6 },
                                e: { r: 35, c: 28 }
                            },

                            {
                                s: { r: 38, c: 7 },
                                e: { r: 38, c: 11 }
                            },
                            {
                                s: { r: 40, c: 7 },
                                e: { r: 40, c: 11 }
                            },
                            {
                                s: { r: 42, c: 7 },
                                e: { r: 42, c: 11 }
                            },
                                /// tsegnuud
                                {
                                    s: { r: 38, c: 12 },
                                    e: { r: 38, c: 15 }
                                },
                                {
                                    s: { r: 40, c: 12 },
                                    e: { r: 40, c: 15 }
                                },
                                {
                                    s: { r: 42, c: 12 },
                                    e: { r: 42, c: 15 }
                                },
                                {
                                    s: { r: 38, c: 16 },
                                    e: { r: 38, c: 19 }
                                },
                                {
                                    s: { r: 40, c: 16 },
                                    e: { r: 40, c: 19 }
                                },
                                {
                                    s: { r: 42, c: 16 },
                                    e: { r: 42, c: 19 }
                                },
                                {
                                    s: { r: 38, c: 20 },
                                    e: { r: 38, c: 23 }
                                },
                                {
                                    s: { r: 40, c: 20 },
                                    e: { r: 40, c: 23 }
                                },
                                {
                                    s: { r: 42, c: 20 },
                                    e: { r: 42, c: 23 }
                                },
                            // even rows
                                {
                                    s: { r: 39, c: 12 },
                                    e: { r: 39, c: 15 }
                                },
                                {
                                    s: { r: 41, c: 12 },
                                    e: { r: 41, c: 15 }
                                },
                                {
                                    s: { r: 43, c: 12 },
                                    e: { r: 43, c: 15 }
                                },
                                {
                                    s: { r: 39, c: 16 },
                                    e: { r: 39, c: 19 }
                                },
                                {
                                    s: { r: 41, c: 16 },
                                    e: { r: 41, c: 19 }
                                },
                                {
                                    s: { r: 43, c: 16 },
                                    e: { r: 43, c: 19 }
                                },
                                {
                                    s: { r: 39, c: 20 },
                                    e: { r: 39, c: 23 }
                                },
                                {
                                    s: { r: 41, c: 20 },
                                    e: { r: 41, c: 23 }
                                },
                                {
                                    s: { r: 43, c: 20 },
                                    e: { r: 43, c: 23 }
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

                    worksheet['F11'].s = rotatedBorderFix

                    worksheet['H11'] = {s: defaultTextStyle, v: "Дамжаа" }

                    worksheet['H12'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
                    worksheet['J12'] = {s: rotatedTextStyle, v: "Эмэгтэй" }


                    worksheet['L12'] = {v:'I дамжаа', s: rotatedBorderFix}

                        worksheet['M12'] = {s: nullCell1, v: "" }
                        worksheet['N12'] = {s: nullCell2, v: "" }
                        worksheet['M13'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
                        worksheet['N13'] = {s: rotatedTextStyle, v: "Эмэгтэй" }


                    worksheet['O12'] = {v:'II дамжаа', s: rotatedBorderFix}

                        worksheet['P12'] = {s: nullCell1, v: "" }
                        worksheet['Q12'] = {s: nullCell2, v: "" }
                        worksheet['P13'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
                        worksheet['Q13'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

                    worksheet['R12'] = {v:'III дамжаа', s: rotatedBorderFix}

                        worksheet['S12'] = {s: nullCell1, v: "" }
                        worksheet['T12'] = {s: nullCell2, v: "" }
                        worksheet['S13'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
                        worksheet['T13'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

                    worksheet['U12'] = {v:'III дамжаа', s: rotatedBorderFix}

                        worksheet['V12'] = {s: nullCell1, v: "" }
                        worksheet['W12'] = {s: nullCell2, v: "" }
                        worksheet['V13'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
                        worksheet['W13'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

                    worksheet['X12'] = {v:'IV дамжаа', s: rotatedBorderFix}

                        worksheet['Y12'] = {s: nullCell1, v: "" }
                        worksheet['Z12'] = {s: nullCell2, v: "" }
                        worksheet['Y13'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
                        worksheet['Z13'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

                    worksheet['AA12'] = {v:'III дамжаа', s: rotatedBorderFix}

                        worksheet['AB12'] = {s: nullCell1, v: "" }
                        worksheet['AC12'] = {s: nullCell2, v: "" }
                        worksheet['AB13'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
                        worksheet['AC13'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

                    worksheet['G35'].v = 'Багана: 1=(2+3)=(4+7+10+13+16+19), 4=(5+6), 7=(8+9), 10=(11+12), 13=(14+15), 16=(17+18), 19=(20+21);'
                    worksheet['G36'].v = 'Мөр: 1=(2+3+4)=(5+9+13+17), 5=(6÷8), 9=(10÷12), 13=(14÷16), 17=(18÷20);'


                    writeFile(workbook, "A-DB-6.xlsx", { compression: true });
            }






        return(
        <div className="overflow-auto" style={{ minHeight: 200 }}>
            <Button color="primary" className="mb-2 p-75" disabled={false} onClick={() => {convert()}}>
            {/* <Button color="primary" className="mb-2 p-75" disabled={isLoading} onClick={() => {convert()}}> */}
                <FileText size={18} /> Excel татах
            </Button>
            {(isLoading || localLoaderDB6) ?
                Loader
                :
            <table>
                <thead>
                    <tr>
                        <th rowSpan={3} style={{ minWidth: 150 }}>Үзүүлэлт</th>
                        <th rowSpan={3} className="th-rotate-border">Нийт суралцагчид</th>
                            <th colSpan={20} className="text-center" style={{ borderLeft: 0, height: 15 }}>Дамжаа</th>
                    </tr>
                    <tr>
                        <th rowSpan={2} className="th-rotate">Эрэгтэй</th>
                        <th rowSpan={2} className="th-rotate">Эмэгтэй</th>
                        <th rowSpan={2} className="th-rotate-border" style={{ minHeight: 100 }}>I дамжаа</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={2} className="th-rotate-border">II дамжаа</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={2} className="th-rotate-border">III дамжаа</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={2} className="th-rotate-border">IV дамжаа</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={2} className="th-rotate-border">V дамжаа</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={2} className="th-rotate-border">VI дамжаа</th>
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
                    {datas.map((data, idx) => (
                        <Fragment key={`idx${idx}`}>
                            <tr>
                                <th>
                                    {data?.name}
                                </th>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.all_level_name_0}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.men_level_name_0}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.women_level_name_0}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.all_level_name_1}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.men_level_name_1}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.women_level_name_1}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.all_level_name_2}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.men_level_name_2}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.women_level_name_2}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.all_level_name_3}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.men_level_name_3}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.women_level_name_3}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.all_level_name_4}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.men_level_name_4}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.women_level_name_4}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.all_level_name_5}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.men_level_name_5}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.women_level_name_5}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.all_level_name_6}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.men_level_name_6}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_0?.data?.women_level_name_6}
                                </td>
                            </tr>
                            <tr>
                                <th className="ps-2">
                                    {data?.data?.type_study_name_1?.name}
                                </th>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.all_level_name_0}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.men_level_name_0}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.women_level_name_0}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.all_level_name_1}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.men_level_name_1}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.women_level_name_1}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.all_level_name_2}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.men_level_name_2}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.women_level_name_2}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.all_level_name_3}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.men_level_name_3}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.women_level_name_3}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.all_level_name_4}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.men_level_name_4}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.women_level_name_4}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.all_level_name_5}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.men_level_name_5}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.women_level_name_5}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.all_level_name_6}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.men_level_name_6}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_1?.data?.women_level_name_6}
                                </td>
                            </tr>
                            <tr>
                                <th className="ps-2">
                                    {data?.data?.type_study_name_2?.name}
                                </th>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.all_level_name_0}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.men_level_name_0}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.women_level_name_0}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.all_level_name_1}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.men_level_name_1}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.women_level_name_1}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.all_level_name_2}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.men_level_name_2}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.women_level_name_2}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.all_level_name_3}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.men_level_name_3}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.women_level_name_3}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.all_level_name_4}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.men_level_name_4}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.women_level_name_4}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.all_level_name_5}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.men_level_name_5}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.women_level_name_5}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.all_level_name_6}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.men_level_name_6}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_2?.data?.women_level_name_6}
                                </td>
                            </tr>
                            <tr>
                                <th className="ps-2">
                                    {data?.data?.type_study_name_3?.name}
                                </th>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.all_level_name_0}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.men_level_name_0}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.women_level_name_0}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.all_level_name_1}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.men_level_name_1}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.women_level_name_1}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.all_level_name_2}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.men_level_name_2}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.women_level_name_2}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.all_level_name_3}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.men_level_name_3}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.women_level_name_3}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.all_level_name_4}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.men_level_name_4}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.women_level_name_4}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.all_level_name_5}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.men_level_name_5}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.women_level_name_5}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.all_level_name_6}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.men_level_name_6}
                                </td>
                                <td>
                                    {data?.data?.type_study_name_3?.data?.women_level_name_6}
                                </td>
                            </tr>

                        </Fragment>
                    ))}
                </tbody>
            </table>
            }
            </div>
    )
}

export default ADB6