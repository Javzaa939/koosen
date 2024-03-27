import React, { Fragment, useContext, useEffect, useState } from "react";
import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";
import { Button, Spinner } from "reactstrap";
import { FileText } from 'react-feather'

import { utils, writeFile } from 'xlsx-js-style';
import './style.scss'
import ActiveYearContext from "@context/ActiveYearContext"

import { sampledata } from "./sample";

function ADB12(){

    const infoApi = useApi().status.db12
    const { cyear_name } = useContext(ActiveYearContext)

	// // Loader
	const { Loader, isLoading, fetchData } = useLoader({isSmall: true});
    const [localLoaderDB12, setLocalLoaderDB12] = useState(false)

    const [datas, setDatas] = useState([])

    async function getDatas() {
        const {success, data} = await fetchData(infoApi.get())
        if(success) {
            setDatas(data)
            setLocalLoaderDB12(false)
        }
    }

    useEffect(() => {
        getDatas()
    },[])

    // const datas = sampledata

    function convert() {

        const header = Array.from({length: 14},(_, hidx) => {
            return(
                {
                    'Байгууллагын ангилал': '',
                    ' ':'',
                    'МД': '',
                    'Дотуур байрны тоо': '',
                    'Дотуур байранд амьдрах хүсэлт гаргасан суралцагчид': '',
                        'Эрэгтэй': '',
                        'Эмэгтэй': '',
                    'Дотуур байранд амьдарч буй суралцагчид': '',
                        'Эрэгтэй2': '',
                        'Эмэгтэй2': '',
                    'Дипломын боловсролд суралцагчид': '',
                        'Эрэгтэй3': '',
                        'Эмэгтэй3': '',
                    'Бакалаврын боловсролд суралцагчид': '',
                        'Эрэгтэй4': '',
                        'Эмэгтэй4': '',
                    'Бусад': '',
                        'Эрэгтэй5': '',
                        'Эмэгтэй5': '',
                })})

                const mainData = datas.map((data, idx) => {
                    return(
                        {
                            'Байгууллагын ангилал': data?.institution === 'Бүгд' ? data?.property : '   ' + data?.institution,
                            ' ':'',
                            'МД': idx + 1,
                            'Дотуур байрны тоо': data?.col_data_list[0],
                            'Дотуур байранд амьдрах хүсэлт гаргасан суралцагчид': data?.col_data_list[1],
                                'Эрэгтэй': data?.col_data_list[2],
                                'Эмэгтэй': data?.col_data_list[3],
                            'Дотуур байранд амьдарч буй суралцагчид': data?.col_data_list[4],
                                'Эрэгтэй2': data?.col_data_list[5],
                                'Эмэгтэй2': data?.col_data_list[6],
                            'Дипломын боловсролд суралцагчид': data?.col_data_list[7],
                                'Эрэгтэй3': data?.col_data_list[8],
                                'Эмэгтэй3': data?.col_data_list[9],
                            'Бакалаврын боловсролд суралцагчид': data?.col_data_list[10],
                                'Эрэгтэй4': data?.col_data_list[11],
                                'Эмэгтэй4': data?.col_data_list[12],
                            'Бусад': data?.col_data_list[13],
                                'Эрэгтэй5': data?.col_data_list[14],
                                'Эмэгтэй5': data?.col_data_list[15],
                        })})

                const footer = Array.from({length: 15},(_, hidx) => {
                    return(
                        {
                            'Байгууллагын ангилал': '',
                            ' ':'',
                            'МД': '',
                            'Дотуур байрны тоо': '',
                            'Дотуур байранд амьдрах хүсэлт гаргасан суралцагчид': '',
                                'Эрэгтэй': '',
                                'Эмэгтэй': '',
                            'Дотуур байранд амьдарч буй суралцагчид': '',
                                'Эрэгтэй2': '',
                                'Эмэгтэй2': '',
                            'Дипломын боловсролд суралцагчид': '',
                                'Эрэгтэй3': '',
                                'Эмэгтэй3': '',
                            'Бакалаврын боловсролд суралцагчид': '',
                                'Эрэгтэй4': '',
                                'Эмэгтэй4': '',
                            'Бусад': '',
                                'Эрэгтэй5': '',
                                'Эмэгтэй5': '',
                        })})

        const combo = [...header, ...mainData, ...footer]

        const worksheet = utils.json_to_sheet(combo);

        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "A-DB-8-Report")
        const staticCells = [
                'Байгууллагын ангилал',
                ' ',
                'МД',
                'Дотуур байрны тоо',
                'Дотуур байранд амьдрах хүсэлт гаргасан суралцагчид',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'Дотуур байранд амьдарч буй суралцагчид',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'Дипломын боловсролд суралцагчид',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'Бакалаврын боловсролд суралцагчид',
                    'Эрэгтэй',
                    'Эмэгтэй',
                'Бусад',
                    'Эрэгтэй',
                    'Эмэгтэй',
            ];

            utils.sheet_add_aoa(worksheet, [staticCells], { origin: "A12" });
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


                    // Толгой хэсэгт стайл болон Текст өгж буй хэсэг
                    const startRow = 0;
                    const endRow = 10;
                    const startCol = 0;
                    const endCol = 20;

                    for (let row = startRow; row <= endRow; row++) {
                        for (let col = startCol; col <= endCol; col++) {
                        const cellAddress = utils.encode_cell({ r: row, c: col });

                            if (!worksheet[cellAddress]) {
                                worksheet[cellAddress] = {};
                            }

                        worksheet[cellAddress].s = row === endRow ? bottomBorder : textCellStyle
                        worksheet[cellAddress].v = (row === 1 && col === 0) ?
                                'Үндэсний статистикийн хорооны даргын 20. . . оны . . . сарын . . .  -ны өдрийн . . . дугаар тушаалаар батлав.'
                            : (row === 3 && col === 0 ) ? cyear_name ? 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН БАЙГУУЛЛАГЫН ДОТУУР БАЙРНЫ' + ' '+  cyear_name.replace('-', '/') + ' ' + 'ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, өмчийн хэлбэрээр'
                                    : 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН БАЙГУУЛЛАГЫН ДОТУУР БАЙРНЫ 20... /20... ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, өмчийн хэлбэрээр'
                                : ''
                        }
                    }

                    const styleRow = endRow + 1;
                    const sendRow = endRow + mainData.length + 3;
                    const styleCol = 0;
                    const sendCol = 20;

                    for (let row = styleRow; row <= sendRow; row++) {
                        for (let col = styleCol; col <= sendCol; col++) {
                        const cellNum = utils.encode_cell({ r: row, c: col });

                            if (!worksheet[cellNum]) {
                                worksheet[cellNum] = {};
                            }

                            worksheet[cellNum].s =
                                (row === styleRow && col !== 0 && col !== 2)
                                    ? rotatedTextStyle
                                            : numberCellStyle;
                        }
                    }

                    const fRow = sendRow + 1;
                    const fendRow = sendRow + 15;
                    const fCol = 0;
                    const fendCol = 20;

                    for (let row = fRow; row <= fendRow; row++) {
                        for (let col = fCol; col <= fendCol; col++) {
                        const cellNum = utils.encode_cell({ r: row, c: col });

                            if (!worksheet[cellNum]) {
                                worksheet[cellNum] = {};
                            }

                            worksheet[cellNum].s = row === fRow ? footerBorder : textCellStyle
                                        worksheet[cellNum].v = (row === fRow && col === 0) ?
                                                'Балансын шалгалт:' :
                                                 (row === fRow  && col === 2) ? 'Багана: 2=(3+4), 5=(6+7)=(8+11+14), 8=(9+10), 11=(12+13), 14=(15+16);' :
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

                const phaseTwoCells = Array.from({length: 18}, (_) => {return({wch: 5})})

                worksheet["!cols"] = [
                    { wch: 20 },
                    { wch: 2 },
                    ...phaseTwoCells
                ];

                const phaseOneRow = Array.from({length: 7}, (_) => {return({hpx: 10})})
                const tableRow = Array.from({length: mainData.length + 1}, (_) => {return({hpx: 20})})

                    worksheet["!rows"] = [
                        { hpx: 10 },
                        { hpx: 40 },
                        { hpx: 10 },
                        { hpx: 40 },
                        ...phaseOneRow,
                        { hpx: 30 },
                        { hpx: 20 },
                        { hpx: 120 },
                        ...tableRow
                    ];

            const tableColMerge = Array.from({length: mainData.length}, (_, idx) =>
                {
                    return(
                        {
                            s: { r: styleRow + idx + 3, c: 0 },
                            e: { r: styleRow + idx + 3, c: 1 }
                        }
                    )
                }
            )

            worksheet['!merges'] = [

                // header text
                {
                    s: { r: 1, c: 0 },
                    e: { r: 1, c: 3 }
                },
                {
                    s: { r: 3, c: 0 },
                    e: { r: 3, c: 18 }
                },
                // table header merge
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
                {
                    s: { r: styleRow, c: 4 },
                    e: { r: styleRow + 2, c: 4 }
                },

                // ehnii er em
                {
                    s: { r: styleRow + 1, c: 5 },
                    e: { r: styleRow + 2, c: 5 }
                },
                {
                    s: { r: styleRow + 1, c: 6 },
                    e: { r: styleRow + 2, c: 6 }
                },

                // Дотуур байранд амьдарч буй суралцагчид
                {
                    s: { r: styleRow, c: 7 },
                    e: { r: styleRow + 2, c: 7 }
                },
                {
                    s: { r: styleRow + 1, c: 8 },
                    e: { r: styleRow + 2, c: 8 }
                },
                {
                    s: { r: styleRow + 1, c: 9 },
                    e: { r: styleRow + 2, c: 9 }
                },

                // Дипломын боловсролд суралцагчид
                {
                    s: { r: styleRow + 1, c: 10 },
                    e: { r: styleRow + 2, c: 10 }
                },

                // Бакалаврын боловсролд суралцагчид
                {
                    s: { r: styleRow + 1, c: 13 },
                    e: { r: styleRow + 2, c: 13 }
                },
                // Бусад
                {
                    s: { r: styleRow + 1, c: 16 },
                    e: { r: styleRow + 2, c: 16 }
                },


                {
                    s: { r: styleRow, c: 8 },
                    e: { r: styleRow, c: 18 }
                },
                ...tableColMerge,

                    // hvsnegtiin doorhi tomiyo
                    {
                        s: { r: fRow, c: 2 },
                        e: { r: fRow, c: 11 }
                    },
                    {
                        s: { r: fRow + 1, c: 2 },
                        e: { r: fRow + 1, c: 11 }
                    },

                    // batalgaajsan hynasan medee gargasan
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

            worksheet['F12'] = {v:'',s:nullCell1}
            worksheet['G12'] = {v:'',s:nullCell2}
            worksheet['F13'] = {v:'Эрэгтэй', s: rotatedTextStyle}
            worksheet['G13'] = {v:'Эмэгтэй', s: rotatedTextStyle}

            worksheet['I12'] = {v:'',s:nullCell1}
            worksheet['J12'] = {v:'',s:nullCell2}
            worksheet['I13'] = {v:'Эрэгтэй', s: rotatedTextStyle}
            worksheet['J13'] = {v:'Эмэгтэй', s: rotatedTextStyle}

            worksheet['K13'] = {v:'Дипломын боловсролд суралцагчид', s: rotatedTextStyle}

            worksheet['L13'] = {v:'',s:nullCell1}
            worksheet['M13'] = {v:'',s:nullCell2}
            worksheet['L14'] = {v:'Эрэгтэй', s: rotatedTextStyle}
            worksheet['M14'] = {v:'Эмэгтэй', s: rotatedTextStyle}

            worksheet['N13'] = {v:'Бакалаврын боловсролд суралцагчид', s: rotatedTextStyle}

            worksheet['O13'] = {v:'',s:nullCell1}
            worksheet['P13'] = {v:'',s:nullCell2}
            worksheet['O14'] = {v:'Эрэгтэй', s: rotatedTextStyle}
            worksheet['P14'] = {v:'Эмэгтэй', s: rotatedTextStyle}

            worksheet['Q13'] = {v:'Бусад', s: rotatedTextStyle}

            worksheet['R13'] = {v:'',s:nullCell1}
            worksheet['S13'] = {v:'',s:nullCell2}
            worksheet['R14'] = {v:'Эрэгтэй', s: rotatedTextStyle}
            worksheet['S14'] = {v:'Эмэгтэй', s: rotatedTextStyle}

            writeFile(workbook, "A-DB-12.xlsx");
    }

    return(
        <div className="overflow-auto" style={{ minHeight: 200 }}>
            {/* <Button color="primary" className="mb-2 p-75" disabled={false} onClick={() => {convert()}}> */}
            <Button color="primary" className="mb-2 p-75" disabled={isLoading || localLoaderDB12} onClick={() => {convert()}}>
                <FileText size={18} /> Excel татах
            </Button>
            {(isLoading || localLoaderDB12) ?
                Loader
                :
            <table>
                <thead>
                    <tr>
                        <th rowSpan={3}>Байгууллагын ангилал</th>
                        <th rowSpan={3} className="th-rotate">Дотуур байрны тоо</th>
                        <th rowSpan={3} className="th-rotate-border">Дотуур байранд амьдрах хүсэлт гаргасан суралцагчид</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={3} className="th-rotate-border">Дотуур байранд амьдарч буй суралцагчид</th>
                            <th colSpan={20} style={{ borderLeft: 0, height: 15 }}></th>
                    </tr>
                    <tr>
                        <th rowSpan={2} className="th-rotate">Эрэгтэй</th>
                        <th rowSpan={2} className="th-rotate">Эмэгтэй</th>
                        <th rowSpan={2} className="th-rotate">Эрэгтэй</th>
                        <th rowSpan={2} className="th-rotate">Эмэгтэй</th>
                        <th rowSpan={2} className="th-rotate-border">Дипломын боловсролд суралцагчид</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Бакалаврын боловсролд суралцагчид</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Бусад</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                    </tr>
                    <tr>
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
                                    {
                                        data.col_data_list.map((col, cidx) => (<td key={cidx}>{col}</td>))
                                    }
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

export default ADB12