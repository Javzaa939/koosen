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

function ADB10(){

    const infoApi = useApi().status.db10
    const { cyear_name } = useContext(ActiveYearContext)

	// // Loader
	const { Loader, isLoading, fetchData } = useLoader({isSmall: true});
    const [localLoaderDB10, setLocalLoaderDB10] = useState(false)

    const [datas, setDatas] = useState([])

    async function getDatas() {
        const {success, data} = await fetchData(infoApi.get())
        if(success) {
            setDatas(data)
            setLocalLoaderDB10(false)
        }
    }

    useEffect(() => {
        getDatas()
    },[])

    // const datas = sampledata

    function convert() {

        const header = Array.from({ length: 12 }, (_, hidx) => {return(
            {
                'Тив': 'А',
                'Улс': '',
                ' ': '',
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
                'Тив2': 'А',
                'Улс2': '',
                'МД2': 'Б',
                'Докторын боловсрол': 13,
                    'Эрэгтэй5': 14,
                    'Эмэгтэй5': 15,
                'Монгол Улсын Засгийн газрын тэтгэлэг': 16,
                'Дотоод, гадаадын аж ахуйн нэгж, байгууллага, сан, хүвь хүний нэрэмжит тэтгэлэг': 17,
                'Тухайн сургуулийн тэтгэлэг': 18,
                'Хувийн зардал': 19,
                'Бусад ': 20,
            }
        )})

        const flattenedArray = datas.flatMap(item => {
            return[
                ...item.map((value, index) => ({ ...value }))
            ]
        })

        const mainData = flattenedArray.map((data, idx) => {
            return(
                {
                    'Тив': data?.continent,
                    'Улс': data?.country_name,
                    ' ': '',
                    'МД': idx + 1,
                    'Нийт суралцагчид': data.degree[0]?.all,
                        'Эрэгтэй': data.degree[0]?.men,
                        'Эмэгтэй': data.degree[0]?.women,
                    'Дипломын боловсрол': data.degree[1]?.all,
                        'Эрэгтэй2': data.degree[1]?.men,
                        'Эмэгтэй2': data.degree[1]?.women,
                    'Бакалаврын боловсрол': data.degree[2]?.all,
                        'Эрэгтэй3': data.degree[2]?.men,
                        'Эмэгтэй3': data.degree[2]?.women,
                    'Магистрын боловсрол': data.degree[3]?.all,
                        'Эрэгтэй4': data.degree[3]?.men,
                        'Эмэгтэй4': data.degree[3]?.women,
                    'Тив2': data?.continent,
                    'Улс2': data?.country_name,
                    'МД2': idx + 1,
                    'Докторын боловсрол': data.degree[0]?.all,
                        'Эрэгтэй5': data.degree[0]?.all,
                        'Эмэгтэй5': data.degree[0]?.all,
                    'Монгол Улсын Засгийн газрын тэтгэлэг': data.study_type[0]?.student,
                    'Дотоод, гадаадын аж ахуйн нэгж, байгууллага, сан, хүвь хүний нэрэмжит тэтгэлэг': data.study_type[1]?.student,
                    'Тухайн сургуулийн тэтгэлэг': data.study_type[2]?.student,
                    'Хувийн зардал': data.study_type[3]?.student,
                    'Бусад ': 4,
                }
            )
        })

        const footer = Array.from({length: 15}, (_, vidx) => {
            return(
                {
                    'Тив': '',
                    'Улс': '',
                    ' ': '',
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
                    'Тив2': '',
                    'Улс2': '',
                    'МД2': '',
                    'Докторын боловсрол': '',
                        'Эрэгтэй5': '',
                        'Эмэгтэй5': '',
                    'Монгол Улсын Засгийн газрын тэтгэлэг': '',
                    'Дотоод, гадаадын аж ахуйн нэгж, байгууллага, сан, хүвь хүний нэрэмжит тэтгэлэг': '',
                    'Тухайн сургуулийн тэтгэлэг': '',
                    'Хувийн зардал': '',
                    'Бусад ': '',
                }
            )
        })

        const combo = [
            ...header,
            ...mainData,
            ...footer
        ]

        const worksheet = utils.json_to_sheet(combo)

        const workbook = utils.book_new();

        utils.book_append_sheet(workbook, worksheet, 'A-DB-10 Report')

        const staticCell = [
            'Тив',
            'Улс',
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
            'Тив',
            'Улс',
            'МД',
            'Докторын боловсрол',
                'Эрэгтэй',
                'Эмэгтэй',
            'Монгол Улсын Засгийн газрын тэтгэлэг',
            'Дотоод, гадаадын аж ахуйн нэгж, байгууллага, сан, хүвь хүний нэрэмжит тэтгэлэг',
            'Тухайн сургуулийн тэтгэлэг',
            'Хувийн зардал',
            'Бусад',
        ]

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
                bold: true,
                sz: 14,
                wrapText: true
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

        const textCenterBorderStyle = {
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
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


        utils.sheet_add_aoa(worksheet, [staticCell], { origin: 'A10'})

        // Толгой хэсэгт стайл болон Текст өгж буй хэсэг
        const startRow = 0;
        const endRow = 8;
        const startCol = 0;
        const endCol = 26;

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
            const cellAddress = utils.encode_cell({ r: row, c: col });

                if (!worksheet[cellAddress]) {
                    worksheet[cellAddress] = {};
                }

            worksheet[cellAddress].s = row === endRow ? bottomBorder : textCellStyle
            worksheet[cellAddress].v = (row === 1 && col === 0) ?
                    'Үндэсний статистикийн хорооны даргын 20. . . оны . . . сарын . . .  -ны өдрийн . . . дугаар тушаалаар батлав.'
                : (row === 3 && col === 0 ) ? cyear_name ? 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН  БАЙГУУЛЛАГАД  СУРАЛЦАЖ БУЙ ГАДААД ОЮУТНУУДЫН' + ' '+  cyear_name.replace('-', '/') + ' ' + 'ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, тив, улсаар'
                        : ' ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН  БАЙГУУЛЛАГАД  СУРАЛЦАЖ БУЙ ГАДААД ОЮУТНУУДЫН 20... / 20... ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, тив, улсаар'
                    : ''
            }
        }

        const styleRow = endRow + 1;
        const sendRow = endRow + mainData.length + 4;
        const styleCol = 0;
        const sendCol = 26;

        for (let row = styleRow; row <= sendRow; row++) {
            for (let col = styleCol; col <= sendCol; col++) {
            const cellNum = utils.encode_cell({ r: row, c: col });

                if (!worksheet[cellNum]) {
                    worksheet[cellNum] = {};
                }

                worksheet[cellNum].s =
                    (row === styleRow && col !== 0 && col !== 1 && col !== 2 && col !== 3 && col !== 16  && col !== 17 && col !== 18)
                        ? rotatedTextStyle
                                : numberCellStyle;
            }
        }

        const fRow = sendRow + 1;
        const fendRow = sendRow + 15;
        const fCol = 0;
        const fendCol = 26;

        for (let row = fRow; row <= fendRow; row++) {
            for (let col = fCol; col <= fendCol; col++) {
            const cellNum = utils.encode_cell({ r: row, c: col });

                if (!worksheet[cellNum]) {
                    worksheet[cellNum] = {};
                }

                worksheet[cellNum].s = row === fRow ? footerBorder : textCellStyle
                            worksheet[cellNum].v = (row === fRow && col === 0) ?
                                    'Балансын шалгалт:' :
                                     (row === fRow && col === 1) ? 'Багана: 1=(2+3)=(4+7+10+13)=(16:20), 4=(5+6), 7=(8+9), 10=(11+12), 13=(14+15);'
                                        : (row === fRow + 4 && col === 2 ) ? 'Баталгаажуулсан:'
                                        : (row === fRow + 7 && col === 2 ) ? 'Хянасан:'
                                        : (row === fRow + 10 && col === 2 ) ? 'Мэдээ гаргасан:'
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


        const phaseOneCells = Array.from({length: 12}, (_) => {return({wch: 4})})
        const phaseTwoCells = Array.from({length: 9}, (_) => {return({wch: 4})})

        worksheet["!cols"] = [
            { wch: 18 },
            { wch: 14 },
            { wch: 5 },
            { wch: 4 },
            ...phaseOneCells,
            { wch: 18 },
            { wch: 18 },
            ...phaseTwoCells
        ];

        const phaseOneRow = Array.from({length: 3}, (_) => {return({hpx: 10})})
        const tableRow = Array.from({length: mainData.length + 1}, (_) => {return({hpx: 20})})

            worksheet["!rows"] = [
                { hpx: 10 },
                { hpx: 40 },
                { hpx: 10 },
                { hpx: 60 },
                ...phaseOneRow,
                { hpx: 20 },
                { hpx: 20 },
                { hpx: 20 },
                { hpx: 20 },
                { hpx: 100 },
                ...tableRow
            ];

        const columnMerge = Array.from({length: mainData.length},(_,idx) => {
            return(
                {
                    s: { r: header.length + 1 + idx, c: 1 },
                    e: { r: header.length + 1 + idx, c: 2 }
                }
            )}
        )

        const blank = [
            ...datas,
            []
        ]

        const tableBodyMerge = datas.map((data, idx) => {

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

        worksheet['!merges'] = [
            ...columnMerge,
            ...tableBodyMerge,
            {
                s: { r: 1, c: 0 },
                e: { r: 1, c: 3 }
            },
            {
                s: { r: 3, c: 0 },
                e: { r: 3, c: 17 }
            },

            // hvsnegtiin ehniii 5 bagana
            {
                s: { r: styleRow, c: 0 },
                e: { r: styleRow + 2, c: 0 }
            },

            // A cell
            {
                s: { r: styleRow + 3, c: 0 },
                e: { r: styleRow + 3, c: 2 }
            },
            {
                s: { r: styleRow, c: 1 },
                e: { r: styleRow + 2, c: 2 }
            },

            // niit suraltsagchid
            {
                s: { r: styleRow, c: 3 },
                e: { r: styleRow + 2, c: 3 }
            },
            {
                s: { r: styleRow, c: 4 },
                e: { r: styleRow + 2, c: 4 }
            },
            {
                s: { r: styleRow + 1, c: 5 },
                e: { r: styleRow + 2, c: 5 }
            },
            {
                s: { r: styleRow + 1, c: 6 },
                e: { r: styleRow + 2, c: 6 }
            },

            // diplomiin bolovsrol
            {
                s: { r: styleRow + 1, c: 7 },
                e: { r: styleRow + 2, c: 7 }
            },
            {
                s: { r: styleRow + 1, c: 10 },
                e: { r: styleRow + 2, c: 10 }
            },
            {
                s: { r: styleRow + 1, c: 13 },
                e: { r: styleRow + 2, c: 13 }
            },


            // tiv uls MD
            {
                s: { r: styleRow, c: 16 },
                e: { r: styleRow + 2, c: 16 }
            },
            {
                s: { r: styleRow, c: 17 },
                e: { r: styleRow + 2, c: 17 }
            },
            {
                s: { r: styleRow, c: 18 },
                e: { r: styleRow + 2, c: 18 }
            },

            // doktoriin bolovsrol
            {
                s: { r: styleRow + 1, c: 19 },
                e: { r: styleRow + 2, c: 19 }
            },
            // {
            //     s: { r: styleRow, c: 20 },
            //     e: { r: styleRow + 2, c: 20 }
            // },
            // {
            //     s: { r: styleRow, c: 21 },
            //     e: { r: styleRow + 2, c: 21 }
            // },
            {
                s: { r: styleRow + 1, c: 22 },
                e: { r: styleRow + 2, c: 22 }
            },
            {
                s: { r: styleRow + 1, c: 23 },
                e: { r: styleRow + 2, c: 23 }
            },
            {
                s: { r: styleRow + 1, c: 24 },
                e: { r: styleRow + 2, c: 24 }
            },
            {
                s: { r: styleRow + 1, c: 25 },
                e: { r: styleRow + 2, c: 25 }
            },
            {
                s: { r: styleRow + 1, c: 26 },
                e: { r: styleRow + 2, c: 26 }
            },

            // table blank header
            {
                s: { r: styleRow, c: 5 },
                e: { r: styleRow, c: 15 }
            },
            {
                s: { r: styleRow, c: 19 },
                e: { r: styleRow, c: 21 }
            },
            {
                s: { r: styleRow, c: 22 },
                e: { r: styleRow, c: 26 }
            },

                // hvsnegtiin doorhi tomiyo
                {
                    s: { r: fRow, c: 1 },
                    e: { r: fRow, c: 12 }
                },

                // batalgajulsan hynasan medee gargasan
                {
                    s: { r: fRow + 4, c: 2 },
                    e: { r: fRow + 4, c: 4 }
                },
                {
                    s: { r: fRow + 7, c: 2 },
                    e: { r: fRow + 7, c: 4 }
                },
                {
                    s: { r: fRow + 10, c: 2 },
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

        worksheet['A4'].s = headerStyle

        worksheet['F10'] = { s: nullCell1, v: '' }
        worksheet['T10'] = { s: textCenterBorderStyle, v: 'Суралцагчид' }
        worksheet['W10'] = { s: textCenterBorderStyle, v: 'Сургалтын төлбөрийн хэлбэр' }

        worksheet['E10'].s = rotatedBorderFix

        worksheet['F11'] = { s: rotatedTextStyle, v:'Эрэгтэй'}
        worksheet['G11'] = { s: rotatedTextStyle, v:'Эмэгтэй'}

        worksheet['H11'] = { s: rotatedTextStyle, v:'Дипломын боловсрол'}

            worksheet['I11'] = {s: nullCell1, v: ''}
            worksheet['J11'] = {s: nullCell2, v: ''}
            worksheet['I12'] = {s: rotatedTextStyle, v: 'Эрэгтэй'}
            worksheet['J12'] = {s: rotatedTextStyle, v: 'Эмэгтэй'}

        worksheet['K11'] = { s: rotatedTextStyle, v:'Бакалаврын боловсрол'}

            worksheet['L11'] = {s: nullCell1, v: ''}
            worksheet['M11'] = {s: nullCell2, v: ''}
            worksheet['L12'] = {s: rotatedTextStyle, v: 'Эрэгтэй'}
            worksheet['M12'] = {s: rotatedTextStyle, v: 'Эмэгтэй'}

        worksheet['N11'] = { s: rotatedTextStyle, v:'Магистрын боловсрол'}

            worksheet['O11'] = {s: nullCell1, v: ''}
            worksheet['P11'] = {s: nullCell2, v: ''}
            worksheet['O12'] = {s: rotatedTextStyle, v: 'Эрэгтэй'}
            worksheet['P12'] = {s: rotatedTextStyle, v: 'Эмэгтэй'}

        worksheet['T11'] = { s: rotatedTextStyle, v:'Докторын боловсрол'}

            worksheet['U11'] = {s: nullCell1, v: ''}
            worksheet['V11'] = {s: nullCell2, v: ''}
            worksheet['U12'] = {s: rotatedTextStyle, v: 'Эрэгтэй'}
            worksheet['V12'] = {s: rotatedTextStyle, v: 'Эмэгтэй'}

        worksheet['W11'] = { s: rotatedTextStyle, v: 'Монгол Улсын Засгийн газрын тэтгэлэг'}
        worksheet['X11'] = { s: rotatedTextStyle, v: 'Дотоод, гадаадын аж ахуйн нэгж, байгууллага, сан, хүвь хүний нэрэмжит тэтгэлэг'}
        worksheet['Y11'] = { s: rotatedTextStyle, v: 'Тухайн сургуулийн тэтгэлэг'}
        worksheet['Z11'] = { s: rotatedTextStyle, v: 'Хувийн зардал'}
        worksheet['AA11'] = { s: rotatedTextStyle, v: 'Бусад'}

        worksheet['H11'].v = 'Дипломын боловсрол'

        writeFile(workbook, "A-DB-10.xlsx", { compression: true })

    }

    return(
        <div className="overflow-auto" style={{ minHeight: 200 }}>
            {/* <Button color="primary" className="mb-2 p-75" disabled={false} onClick={() => {convert()}}> */}
            <Button color="primary" className="mb-2 p-75" disabled={isLoading} onClick={() => {convert()}}>
                <FileText size={18} /> Excel татах
            </Button>
            {(isLoading || localLoaderDB10) ?
                Loader
                :
            <table>
                <thead>
                    <tr>
                        <th rowSpan={3}>Тив</th>
                        <th rowSpan={3}>Улс</th>
                        <th rowSpan={3} className="th-rotate-border">Нийт суралцагчид</th>
                            <th colSpan={11} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={3}>Тив</th>
                        <th rowSpan={3}>Улс</th>
                        <th className="text-center" colSpan={3}>Суралцагчид</th>
                        <th className="text-center" colSpan={5}>Сургалтын төлбөрийн хэлбэр</th>
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
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Монгол Улсын Засгийн газрын тэтгэлэг</th>
                        <th rowSpan={2} className="th-rotate-border">Дотоод, гадаадын аж ахуйн нэгж, байгууллага, сан, хүвь хүний нэрэмжит тэтгэлэг</th>
                        <th rowSpan={2} className="th-rotate-border">Тухайн сургуулийн тэтгэлэг</th>
                        <th rowSpan={2} className="th-rotate-border">Хувийн зардал</th>
                        <th rowSpan={2} className="th-rotate-border">Бусад</th>
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

                            data.map((value, index) => (
                                <tr>
                                    <th
                                        className={`${index === 0 ? '' : 'd-none'} ${value?.continent === value?.country_name ? 'text-center' : ''}`}
                                        rowSpan={data.length}
                                        colSpan={value?.continent === value?.country_name ? 2 : 1}
                                    >
                                        {value?.continent}
                                    </th>
                                    <td
                                        className={value?.continent === value?.country_name ? 'd-none' : ''}
                                    >
                                        {value?.country_name}
                                    </td>

                                {/* Нийт оюутны тоо */}
                                        <td>
                                            {value.degree.filter((deg, didx) => deg.degree_code === degreeAll)[0]?.all}
                                        </td>
                                        <td>
                                            {value.degree.filter((deg, didx) => deg.degree_code === degreeAll)[0]?.men}
                                        </td>
                                        <td>
                                            {value.degree.filter((deg, didx) => deg.degree_code === degreeAll)[0]?.women}
                                        </td>

                                {/* Дипломын боловсролд хамрагдах оюутны тоо */}
                                        <td>
                                            {value.degree.filter((deg, didx) => deg.degree_code === degreeDiplom)[0]?.all}
                                        </td>
                                        <td>
                                            {value.degree.filter((deg, didx) => deg.degree_code === degreeDiplom)[0]?.men}
                                        </td>
                                        <td>
                                            {value.degree.filter((deg, didx) => deg.degree_code === degreeDiplom)[0]?.women}
                                        </td>


                                {/* Бакалаврын боловсролд хамрагдах оюутны тоо */}
                                        <td>
                                            {value.degree.filter((deg, didx) => deg.degree_code === degreeBakalavr)[0]?.all}
                                        </td>
                                        <td>
                                            {value.degree.filter((deg, didx) => deg.degree_code === degreeBakalavr)[0]?.men}
                                        </td>
                                        <td>
                                            {value.degree.filter((deg, didx) => deg.degree_code === degreeBakalavr)[0]?.women}
                                        </td>


                                {/* Магистрын боловсролд хамрагдах оюутны тоо */}
                                        <td>
                                            {value.degree.filter((deg, didx) => deg.degree_code === degreeMagistr)[0]?.all}
                                        </td>
                                        <td>
                                            {value.degree.filter((deg, didx) => deg.degree_code === degreeMagistr)[0]?.men}
                                        </td>
                                        <td>
                                            {value.degree.filter((deg, didx) => deg.degree_code === degreeMagistr)[0]?.women}
                                        </td>


                                    <th
                                        className={`${index === 0 ? '' : 'd-none'} ${value?.continent === value?.country_name ? 'text-center' : ''}`}
                                        rowSpan={data.length}
                                        colSpan={value?.continent === value?.country_name ? 2 : 1}
                                    >
                                        {value?.continent}
                                    </th>
                                    <td
                                        className={value?.continent === value?.country_name ? 'd-none' : ''}
                                    >
                                        {value?.country_name}
                                    </td>
                                {/* Докторын боловсролд хамрагдах оюутны тоо */}
                                        <td>
                                            {value.degree.filter((deg, didx) => deg.degree_code === degreeDoctor)[0]?.all}
                                        </td>
                                        <td>
                                            {value.degree.filter((deg, didx) => deg.degree_code === degreeDoctor)[0]?.men}
                                        </td>
                                        <td>
                                            {value.degree.filter((deg, didx) => deg.degree_code === degreeDoctor)[0]?.women}
                                        </td>

                                    {value.study_type.map((value, vidx) => {
                                        return(
                                            <Fragment key={vidx}>
                                                <td>
                                                    {value?.student}
                                                </td>
                                            </Fragment>
                                        )
                                    })}
                                </tr>
                            ))
                        )
                    })}

                </tbody>
            </table>
            }
            </div>
    )
}

export default ADB10
