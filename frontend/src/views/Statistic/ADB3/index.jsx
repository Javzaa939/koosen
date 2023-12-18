import React, { Fragment, useContext, useEffect, useState } from "react";
import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";
import { Button, Spinner } from "reactstrap";
import { FileText } from 'react-feather'

import { utils, writeFile } from 'xlsx-js-style';
import './style.scss'
import ActiveYearContext from "@context/ActiveYearContext"

import { sampledata } from "./sample";

function ADB3(){

    const infoApi = useApi().status.db3
    const { cyear_name } = useContext(ActiveYearContext)

	// // Loader
	const { Loader, isLoading, fetchData } = useLoader({isSmall: true});
    const [localLoaderDB3, setLocalLoaderDB3] = useState(true)

    const [datas, setDatas] = useState([])

    async function getDatas() {
        const {success, data} = await fetchData(infoApi.get())
        if(success) {
            setDatas(data.slice(0, -1))
            setLocalLoaderDB3(false)
        }
    }

    useEffect(() => {
        getDatas()
    },[])

    // const datas = sampledata.slice(0, -1)

    function convert() {

        const header = Array.from({length: 10},(_, hidx) => {
            return(
                {
                    'Өмчийн хэлбэр': hidx === 10 ? '' : 'А',
                    'МД': hidx === 10 ? '' : 'Б',
                    'Нийт суралцагчид': hidx === 10 ? "" : 1,
                        'Эрэгтэй1': hidx === 10 ? '' : 2,
                        'Эмэгтэй1': hidx === 10 ? '' : 3,
                    'Хөгжлийн бэрхшээлтэй суралцагчид': hidx === 10 ? '' : 4,
                        'Эрэгтэй2': hidx === 10 ? '' : 5,
                        'Эмэгтэй2': hidx === 10 ? '' : 6,
                    'Харааны': hidx === 10 ? '' : 7,
                        'Эрэгтэй3': hidx === 10 ? '' : 8,
                        'Эмэгтэй3': hidx === 10 ? '' : 9,
                    'Сонсголын': hidx === 10 ? '' : 10,
                        'Эрэгтэй4': hidx === 10 ? '' : 11,
                        'Эмэгтэй4': hidx === 10 ? '' : 12,
                    'Ярианы': hidx === 10 ? '' : 13,
                        'Эрэгтэй5': hidx === 10 ? '' : 14,
                        'Эмэгтэй5': hidx === 10 ? '' : 15,
                    'Хөдөлгөөний': hidx === 10 ? '' : 16,
                        'Эрэгтэй6': hidx === 10 ? '' : 17,
                        'Эмэгтэй6': hidx === 10 ? '' : 18,
                    'Сэтгэцийн': hidx === 10 ? '' : 19,
                        'Эрэгтэй7': hidx === 10 ? '' : 20,
                        'Эмэгтэй7': hidx === 10 ? '' : 21,
                    'Хавсарсан': hidx === 10 ? '' : 22,
                        'Эрэгтэй8': hidx === 10 ? '' : 23,
                        'Эмэгтэй8': hidx === 10 ? '' : 24,
                    'Бусад': hidx === 10 ? '' : 25,
                        'Эрэгтэй9': hidx === 10 ? '' : 26,
                        'Эмэгтэй9': hidx === 10 ? '' : 27,
                    'Төгсөх ангид суралцагчид': hidx === 10 ? '' : 28,
                        'Эрэгтэй10': hidx === 10 ? '' : 29,
                        'Эмэгтэй10': hidx === 10 ? '' : 30,
                }
            )
        })

        const flattenedArray = datas.flatMap(item => [
            ...item.data.map(ditem => ({ ...ditem, property: item?.property_type })),
        ]);


        const mainData = flattenedArray.map((data, idx) => {
                return(
                    {
                        'Өмчийн хэлбэр': data?.degree_code === 'All'  ? data?.property : "     " + data?.degree_name,
                        'МД': idx + 1,
                        'Нийт суралцагчид': data?.degree_obj[0].all,
                            'Эрэгтэй1': data?.degree_obj[0].men,
                            'Эмэгтэй1': data?.degree_obj[0].women,
                        'Хөгжлийн бэрхшээлтэй суралцагчид': data?.degree_obj[1].dis_student[0].all,
                            'Эрэгтэй2': data?.degree_obj[1].dis_student[0].men,
                            'Эмэгтэй2': data?.degree_obj[1].dis_student[0].women,
                        'Харааны': data?.degree_obj[1].dis_student[1]?.all,
                            'Эрэгтэй3': data?.degree_obj[1].dis_student[1]?.men,
                            'Эмэгтэй3': data?.degree_obj[1].dis_student[1]?.women,
                        'Сонсголын': data?.degree_obj[1].dis_student[2]?.all,
                            'Эрэгтэй4': data?.degree_obj[1].dis_student[2]?.men,
                            'Эмэгтэй4': data?.degree_obj[1].dis_student[2]?.women,
                        'Ярианы': data?.degree_obj[1].dis_student[3]?.women,
                            'Эрэгтэй5': data?.degree_obj[1]?.dis_student[3]?.men,
                            'Эмэгтэй5':data?.degree_obj[1]?.dis_student[3]?.women,
                        'Хөдөлгөөний': data?.degree_obj[1]?.dis_student[4]?.all,
                            'Эрэгтэй6': data?.degree_obj[1].dis_student[4]?.men,
                            'Эмэгтэй6': data?.degree_obj[1].dis_student[4]?.women,
                        'Сэтгэцийн': data?.degree_obj[1].dis_student[5]?.all,
                            'Эрэгтэй7': data?.degree_obj[1].dis_student[5]?.men,
                            'Эмэгтэй7': data?.degree_obj[1].dis_student[5]?.women,
                        'Хавсарсан': data?.degree_obj[1].dis_student[6]?.all,
                            'Эрэгтэй8': data?.degree_obj[1].dis_student[6]?.men,
                            'Эмэгтэй8': data?.degree_obj[1].dis_student[6]?.women,
                        'Бусад': data?.degree_obj[1].dis_student[7]?.all,
                            'Эрэгтэй9': data?.degree_obj[1].dis_student[7]?.men,
                            'Эмэгтэй9': data?.degree_obj[1].dis_student[7].women,
                        'Төгсөх ангид суралцагчид': data?.degree_obj[2]?.all,
                            'Эрэгтэй10': data?.degree_obj[2]?.men,
                            'Эмэгтэй10': data?.degree_obj[2]?.women,
                    }
        )})

        const footer = Array.from({length: 10},(_, hidx) => {
            return(
                {
                    'Өмчийн хэлбэр': '',
                    'МД': '',
                    'Нийт суралцагчид': '',
                        'Эрэгтэй1': '',
                        'Эмэгтэй1': '',
                    'Хөгжлийн бэрхшээлтэй суралцагчид': '',
                        'Эрэгтэй2': '',
                        'Эмэгтэй2': '',
                    'Харааны': '',
                        'Эрэгтэй3': '',
                        'Эмэгтэй3': '',
                    'Сонсголын': '',
                        'Эрэгтэй4': '',
                        'Эмэгтэй4': '',
                    'Ярианы': '',
                        'Эрэгтэй5': '',
                        'Эмэгтэй5': '',
                    'Хөдөлгөөний': '',
                        'Эрэгтэй6': '',
                        'Эмэгтэй6': '',
                    'Сэтгэцийн': '',
                        'Эрэгтэй7': '',
                        'Эмэгтэй7': '',
                    'Хавсарсан': '',
                        'Эрэгтэй8': '',
                        'Эмэгтэй8': '',
                    'Бусад': '',
                        'Эрэгтэй9': '',
                        'Эмэгтэй9': '',
                    'Төгсөх ангид суралцагчид': '',
                        'Эрэгтэй10': '',
                        'Эмэгтэй10': '',
                }
            )
        })
            const combo = [...header, ...mainData, ...footer]

            const worksheet = utils.json_to_sheet(combo);

            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, "A-DB-2-Report");

            const staticCells = [
                'Өмчийн хэлбэр',
                'МД',
                'Нийт суралцагчид',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'Хөгжлийн бэрхшээлтэй суралцагчид',
                    'Эрэгтэй',
                    'Эмэгтэй',
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
                'Төгсөх ангид суралцагчид',
                    'Эрэгтэй',
                    'Эмэгтэй'
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
    const endRow = 6;
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
            : (row === 2 && col === 2 ) ? cyear_name ? 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН БАЙГУУЛЛАГАД СУРАЛЦАГЧДЫН' + ' '+  cyear_name.replace('-', '/') + ' ' + 'ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, хөгжлийн бэрхшээлийн хэлбэрээр'
                    : 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН БАЙГУУЛЛАГАД СУРАЛЦАГЧДЫН 20... / 20... ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, хөгжлийн бэрхшээлийн хэлбэрээр'
                : ''
        }
    }

    const styleRow = 7;
    const sendRow = 35;
    const styleCol = 0;
    const sendCol = 32;

    for (let row = styleRow; row <= sendRow; row++) {
        for (let col = styleCol; col <= sendCol; col++) {
            const cellNum = utils.encode_cell({ r: row, c: col });

            if (!worksheet[cellNum]) {
                worksheet[cellNum] = {};
            }

            worksheet[cellNum].s =
                (row === 7 && col !== 0 && col !== 1)
                    ? rotatedTextStyle
                    : (col === 0 && (row === 11 || row === 16 || row === 21 || row === 26 || row === 31)) ? numberCellBoldStyle : numberCellStyle;
        }
    }

    const fRow = 36;
    const fendRow = 57;
    const fCol = 0;
    const fendCol = 32;


    for (let row = fRow; row <= fendRow; row++) {
        for (let col = fCol; col <= fendCol; col++) {
        const cellNum = utils.encode_cell({ r: row, c: col });

            if (!worksheet[cellNum]) {
                worksheet[cellNum] = {};
            }

            worksheet[cellNum].s = (row === 36) ? footerBorder : textCellStyle
            worksheet[cellNum].v = (row === 36 && col === 0) ?
            'Балансын шалгалт:'
                : (row === 40 && col === 2 ) ? 'Баталгаажуулсан:'
                : (row === 42 && col === 2 ) ? 'Хянасан:'
                : (row === 44 && col === 2 ) ? 'Мэдээ гаргасан:'
                    : (row === 40 && col === 6 ) ? '.............................'
                    : (row === 42 && col === 6 ) ? '.............................'
                    : (row === 44 && col === 6 ) ? '.............................'
                        : (row === 41 && col === 6 ) ? '/Албан тушаал/'
                        : (row === 43 && col === 6 ) ? '/Албан тушаал/'
                        : (row === 45 && col === 6 ) ? '/Албан тушаал/'
                            : (row === 40 && col === 12 ) ? '.............................'
                            : (row === 42 && col === 12 ) ? '.............................'
                            : (row === 44 && col === 12 ) ? '.............................'
                                : (row === 41 && col === 12 ) ? '/Нэр/'
                                : (row === 43 && col === 12 ) ? '/Нэр/'
                                : (row === 45 && col === 12 ) ? '/Нэр/'
                                    : (row === 40 && col === 18 ) ? '.............................'
                                    : (row === 42 && col === 18 ) ? '.............................'
                                    : (row === 44 && col === 18 ) ? '.............................'
                                        : (row === 41 && col === 18 ) ? '/Гарын үсэг/'
                                        : (row === 43 && col === 18 ) ? '/Гарын үсэг/'
                                        : (row === 45 && col === 18 ) ? '/Гарын үсэг/'
                : (row === 61 && col === 6 ) ? '20 ….. оны ….. сарын ….. өдөр'
                    : ''
        }
    }


    const phaseOneCol = Array.from({length: 4}, (_) => {return( { wch: 5 } )})
    const phaseTwoCol = Array.from({length: 26}, (_) => {return( { wch: 3 } )})

    worksheet["!cols"] = [ { wch: 20 }, { wch: 3 }, ...phaseOneCol, ...phaseTwoCol ];


    worksheet["!rows"] = [
        { hpx: 40 },
        { hpx: 10 },
        { hpx: 40 },
        { hpx: 10 },
        { hpx: 30 },
        { hpx: 20 },
        { hpx: 20 },

        // Хүснэгтийн эхний мөр
        { hpx: 30 },
        { hpx: 30 },
        { hpx: 50 },
    ];


    const colOneMerge = Array.from({length: 33}, (_, idx) => {
        return(
            {
                s: { r: idx + 8, c: 0 },
                e: { r: idx + 8, c: 1 }
            }
        )})

    worksheet['!merges'] = [

        // header text
        {
            s: { r: 0, c: 0 },
            e: { r: 0, c: 4 }
        },
        {
            s: { r: 2, c: 2 },
            e: { r: 2, c: 28 }
        },

        // Өмчийн хэлбэр
        {
            s: { r: 7, c: 0 },
            e: { r: 9, c: 0 }
        },
        // МД
        {
            s: { r: 7, c: 1 },
            e: { r: 9, c: 1 }
        },
        // Нийт суралцагчид
        {
            s: { r: 7, c: 2 },
            e: { r: 9, c: 2 }
        },
            // Эрэгтэй
            {
                s: { r: 8, c: 3 },
                e: { r: 9, c: 3 }
            },
            // Эмэгтэй
            {
                s: { r: 8, c: 4 },
                e: { r: 9, c: 4 }
            },

            // table subheader
            {
                s: { r: 7, c: 6 },
                e: { r: 7, c: 28 }
            },
    // Хөгжлийн бэрхшээлтэй суралцагчид
        {
            s: { r: 7, c: 5 },
            e: { r: 9, c: 5 }
        },
            // Эрэгтэй
            {
                s: { r: 8, c: 6 },
                e: { r: 9, c: 6 }
            },
            // Эмэгтэй
            {
                s: { r: 8, c: 7 },
                e: { r: 9, c: 7 }
            },
        // Харааны
            {
                s: { r: 8, c: 8 },
                e: { r: 9, c: 8 }
            },
                // Эрэгтэй
                {
                    s: { r: 9, c: 9 },
                    e: { r: 9, c: 9 }
                },
                // Эмэгтэй
                {
                    s: { r: 9, c: 10 },
                    e: { r: 9, c: 10 }
                },

        // Сонсголын
        {
            s: { r: 8, c: 11 },
            e: { r: 9, c: 11 }
        },
            // Эрэгтэй
            {
                s: { r: 9, c: 12 },
                e: { r: 9, c: 12 }
            },
            // Эмэгтэй
            {
                s: { r: 9, c: 13 },
                e: { r: 9, c: 13 }
            },


        // Ярианы
        {
            s: { r: 8, c: 14 },
            e: { r: 9, c: 14 }
        },
            // Эрэгтэй
            {
                s: { r: 9, c: 15 },
                e: { r: 9, c: 15 }
            },
            // Эмэгтэй
            {
                s: { r: 9, c: 16 },
                e: { r: 9, c: 16 }
            },


        // Хөдөлгөөний
        {
            s: { r: 8, c: 17 },
            e: { r: 9, c: 17 }
        },
            // Эрэгтэй
            {
                s: { r: 9, c: 18 },
                e: { r: 9, c: 18 }
            },
            // Эмэгтэй
            {
                s: { r: 9, c: 19 },
                e: { r: 9, c: 19 }
            },


        // Сэтгэцийн
        {
            s: { r: 8, c: 20 },
            e: { r: 9, c: 20 }
        },
            // Эрэгтэй
            {
                s: { r: 9, c: 21 },
                e: { r: 9, c: 21 }
            },
            // Эмэгтэй
            {
                s: { r: 9, c: 22 },
                e: { r: 9, c: 22 }
            },


        // Хавсарсан
        {
            s: { r: 8, c: 23 },
            e: { r: 9, c: 23 }
        },
            // Эрэгтэй
            {
                s: { r: 9, c: 24 },
                e: { r: 9, c: 24 }
            },
            // Эмэгтэй
            {
                s: { r: 9, c: 25 },
                e: { r: 9, c: 25 }
            },
        // Бусад

        {
            s: { r: 8, c: 26 },
            e: { r: 9, c: 26 }
        },
            // Эрэгтэй
            {
                s: { r: 9, c: 27 },
                e: { r: 9, c: 27 }
            },
            // Эмэгтэй
            {
                s: { r: 9, c: 28 },
                e: { r: 9, c: 28 }
            },
        // Төгсөх ангид суралцагчид

        {
            s: { r: 7, c: 29 },
            e: { r: 9, c: 29 }
        },
            // Эрэгтэй
            {
                s: { r: 8, c: 30 },
                e: { r: 9, c: 30 }
            },
            // Эмэгтэй
            {
                s: { r: 8, c: 31 },
                e: { r: 9, c: 31 }
            },

        // footer merge
        {
            s: { r: 40, c: 2 },
            e: { r: 40, c: 4 }
        },

        {
            s: { r: 42, c: 2 },
            e: { r: 42, c: 4 }
        },

        {
            s: { r: 44, c: 2 },
            e: { r: 44, c: 4 }
        },

            // ehnii bagana
            {
                s: { r: 40, c: 6 },
                e: { r: 40, c: 11 }
            },

            {
                s: { r: 42, c: 6 },
                e: { r: 42, c: 11 }
            },

            {
                s: { r: 44, c: 6 },
                e: { r: 44, c: 11 }
            },
            //
            {
                s: { r: 41, c: 6 },
                e: { r: 41, c: 11 }
            },

            {
                s: { r: 43, c: 6 },
                e: { r: 43, c: 11 }
            },

            {
                s: { r: 45, c: 6 },
                e: { r: 45, c: 11 }
            },
        //2 dahi bagana
        {
            s: { r: 40, c: 12 },
            e: { r: 40, c: 17 }
        },

        {
            s: { r: 42, c: 12 },
            e: { r: 42, c: 17 }
        },

        {
            s: { r: 44, c: 12 },
            e: { r: 44, c: 17 }
        },
        //
        {
            s: { r: 41, c: 12 },
            e: { r: 41, c: 17 }
        },

        {
            s: { r: 43, c: 12 },
            e: { r: 43, c: 17 }
        },

        {
            s: { r: 45, c: 12 },
            e: { r: 45, c: 17 }
        },
        //3 dahi bagana
            {
                s: { r: 40, c: 18 },
                e: { r: 40, c: 23 }
            },

            {
                s: { r: 42, c: 18 },
                e: { r: 42, c: 23 }
            },

            {
                s: { r: 44, c: 18 },
                e: { r: 44, c: 23 }
            },

            // gariin useg
            {
                s: { r: 41, c: 18 },
                e: { r: 41, c: 23 }
            },

            {
                s: { r: 43, c: 18 },
                e: { r: 43, c: 23 }
            },

            {
                s: { r: 45, c: 18 },
                e: { r: 45, c: 23 }
            },


        // bagana mur tomiyo
        {
            s: { r: 36, c: 1 },
            e: { r: 36, c: 30 }
        },

        {
            s: { r: 37, c: 1 },
            e: { r: 37, c: 15 }
        },
        // ...colOneMerge
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

    worksheet['C8'].s = rotatedBorderFix
    worksheet['F8'].s = rotatedBorderFix

        worksheet['D8'] = {s: nullCell1, v: "" }
        worksheet['E8'] = {s: nullCell2, v: "" }
        worksheet['D9'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
        worksheet['E9'] = {s: rotatedTextStyle, v: "Эмэгтэй" }
        worksheet['G8'] = {s: nullCell1, v: "Хөгжлийн бэрхшээлийн хэлбэр" }

        worksheet['G9'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
        worksheet['H9'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

        worksheet['I9'] = {s: rotatedBorderFix, v: "Харааны" }

            worksheet['J9'] = {s: nullCell1, v: "" }
            worksheet['K9'] = {s: nullCell2, v: "" }
            worksheet['J10'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['K10'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

        worksheet['L9'] = {s: rotatedBorderFix, v: "Сонсголын" }
            worksheet['M9'] = {s: nullCell1, v: "" }
            worksheet['N9'] = {s: nullCell2, v: "" }
            worksheet['M10'] = {s: rotatedBorderFix, v: "Эрэгтэй" }
            worksheet['N10'] = {s: rotatedBorderFix, v: "Эмэгтэй" }

        worksheet['O9'] = {s: rotatedBorderFix, v: "Ярианы" }
            worksheet['P9'] = {s: nullCell1, v: "" }
            worksheet['Q9'] = {s: nullCell2, v: "" }
            worksheet['P10'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['Q10'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

        worksheet['R9'] = {s: rotatedBorderFix, v: "Хөдөлгөөний" }
            worksheet['S9'] = {s: nullCell1, v: "" }
            worksheet['T9'] = {s: nullCell2, v: "" }
            worksheet['S10'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['T10'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

        worksheet['U9'] = {s: rotatedBorderFix, v: "Сэтгэцийн" }
            worksheet['V9'] = {s: nullCell1, v: "" }
            worksheet['W9'] = {s: nullCell2, v: "" }
            worksheet['V10'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['W10'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

        worksheet['X9'] = {s: rotatedBorderFix, v: "Хавсарсан" }
            worksheet['Y9'] = {s: nullCell1, v: "" }
            worksheet['Z9'] = {s: nullCell2, v: "" }
            worksheet['Y10'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['Z10'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

        worksheet['AA9'] = {s: rotatedBorderFix, v: "Бусад" }
            worksheet['AB9'] = {s: nullCell1, v: "" }
            worksheet['AC9'] = {s: nullCell2, v: "" }
            worksheet['AB10'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['AC10'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

        worksheet['AD8'].s = rotatedBorderFix
            worksheet['AE8'] = {s: nullCell1, v: "" }
            worksheet['AF8'] = {s: nullCell2, v: "" }
            worksheet['AE9'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['AF9'] = {s: rotatedTextStyle, v: "Эмэгтэй" }
        worksheet['B37'].v = 'Багана: 1=(2+3), 4=(5+6)=(7+10+13+16+19+22+25), 7=(8+9), 10=(11+12), 13=(14+15), 16=(17+18), 19=(20+21), 22=(23+24), 25=(26+27), 28=(29+30);'
        worksheet['B38'].v = 'Мөр: 1=(2÷5)=(6+11+16+21), 6=(7÷10), 11=(12÷15), 16=(17÷20), 21=(22÷25);'

        worksheet['C3'] = {
            v:
                cyear_name ? 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН БАЙГУУЛЛАГАД СУРАЛЦАГЧДЫН' + ' '+  cyear_name.replace('-', '/') + ' ' + 'ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, хөгжлийн бэрхшээлийн хэлбэрээр'
                : 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН БАЙГУУЛЛАГАД СУРАЛЦАГЧДЫН 20... / 20... ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, хөгжлийн бэрхшээлийн хэлбэрээр',
            s: headerStyle
        }

        writeFile(workbook, "A-DB-3.xlsx", { compression: true });

    }

    return(
        <div className="overflow-auto" style={{ minHeight: 200 }}>
            {/* <Button color="primary" className="mb-2 p-75" disabled={false} onClick={() => {convert()}}> */}
            <Button color="primary" className="mb-2 p-75" disabled={isLoading} onClick={() => {convert()}}>
                <FileText size={18} /> Excel татах
            </Button>
            {(isLoading || localLoaderDB3) ?
                Loader
                :
            <table>
                <thead>
                    <tr>
                        <th rowSpan={3}>Өмчийн хэлбэр</th>
                        <th rowSpan={3} className="th-rotate-border">Нийт суралцагчид</th>
                            <th colSpan={2} style={{ borderLeft: 0 }}></th>
                        <th rowSpan={3} className="th-rotate-border">Хөгжлийн бэрхшээлтэй суралцагчид</th>
                        <th colSpan={23} className="text-center" style={{ borderLeft: 0 }}>Хөгжлийн бэрхшээлийн хэлбэр</th>
                        <th rowSpan={3} className="th-rotate-border">Төгсөх ангид суралцагчид</th>
                    </tr>
                    <tr>
                        <th rowSpan={2} className="th-rotate">Эрэгтэй</th>
                        <th rowSpan={2} className="th-rotate">Эмэгтэй</th>
                        <th rowSpan={2} className="th-rotate">Эрэгтэй</th>
                        <th rowSpan={2} className="th-rotate">Эмэгтэй</th>
                        <th rowSpan={2} className="th-rotate-border">Харааны</th>
                            <th colSpan={2} style={{ borderLeft: 0 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Сонсголын</th>
                            <th colSpan={2} style={{ borderLeft: 0 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Ярианы</th>
                            <th colSpan={2} style={{ borderLeft: 0 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Хөдөлгөөний</th>
                            <th colSpan={2} style={{ borderLeft: 0 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Сэтгэцийн</th>
                            <th colSpan={2} style={{ borderLeft: 0 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Хавсарсан</th>
                            <th colSpan={2} style={{ borderLeft: 0 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Бусад</th>
                            <th colSpan={2} style={{ borderLeft: 0 }}></th>
                        <th rowSpan={2} className="th-rotate">Эрэгтэй</th>
                        <th rowSpan={2} className="th-rotate">Эмэгтэй</th>
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
                        <th className="th-rotate">Эрэгтэй</th>
                        <th className="th-rotate">Эмэгтэй</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        datas.map((data, idx) => (
                            <Fragment key={`mainData${idx}`}>
                                {data.data.map((deg, didx) =>(

                                    <tr key={`data${idx}-${didx}`}>
                                        <td className={`${didx === 0 ? 'subheaderbold' : "ps-2"}`} style={{ minWidth: 150 }}>
                                            {didx === 0 ? data?.property_type : deg.degree_name}
                                        </td>

                                        {deg.degree_obj.map((rundata, ridx) => (
                                            <Fragment key={`rundata${ridx}`}>
                                                {
                                                    !rundata.dis_student &&
                                                    <>
                                                        <td>
                                                            {rundata.all}
                                                        </td>
                                                        <td>
                                                            {rundata.men}
                                                        </td>
                                                        <td>
                                                            {rundata.women}
                                                        </td>
                                                    </>
                                                }
                                                {rundata.dis_student && rundata.dis_student.map((disab, vidx) => (
                                                    <Fragment key={`dis_student${vidx}`}>
                                                        <td>{disab?.all}</td>
                                                        <td>{disab?.men}</td>
                                                        <td>{disab?.women}</td>
                                                    </Fragment>
                                                ))}
                                            </Fragment>
                                        ))}
                                    </tr>
                                ))}
                            </Fragment>
                    ))}
                </tbody>
            </table>
            }
            </div>
    )
}

export default ADB3