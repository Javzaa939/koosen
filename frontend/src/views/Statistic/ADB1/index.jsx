import React, { Fragment, useContext, useEffect, useState } from "react";
import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";
import { Button, Spinner } from "reactstrap";
import { FileText } from 'react-feather'

import { utils, writeFile } from 'xlsx-js-style';
import './style.scss'
import ActiveYearContext from "@context/ActiveYearContext"

function ADB1(){

    const infoApi = useApi().status.db1
    const { cyear_name } = useContext(ActiveYearContext)

	// // Loader
	const { Loader, isLoading, fetchData } = useLoader({isSmall: true});
    const [localLoader, setLocal] = useState(true)

    // const [datas, setDatas] = useState(sample)

    const [datas, setDatas] = useState({
        datas: []
    })
    async function getDatas() {
        const {success, data} = await fetchData(infoApi.get())
        if(success) {
            setDatas(data)
            setLocal(false)
        }
    }

    useEffect(() => {
        getDatas()
    },[])


        function convert() {

            const header = Array.from({length: 10},(_, hidx) => {
                return(
                    {
                        'Аймаг, нийслэл, дүүрэг': ' ',
                        ' ': ' ',
                        'МД': ' ',
                        'Нийт сургалтын байгууллага': ' ',
                        'Өмчийн': ' ',
                        'Өмчийн оролцоотой, %': ' ',
                        'Хамтарсан': ' ',
                        'Монгол Улсын иргэний': ' ',
                        'Гадаадтай хамтарсан, %': ' ',
                        'Гадаад улсын': ' ',
                        'Өмчийн2': ' ',
                        'Өмчийн оролцоотой, %2': ' ',
                        'Хамтарсан2': ' ',
                        'Олон нийтийн /шашны': ' ',
                        'Гадаадын салбар сургууль': ' ',
                        'Их сургууль': ' ',
                        'Дээд сургууль': ' ',
                        'Коллеж': ' ',
                        'Технологийн коллеж': ' ',
                    }
                )
            })


// Датаг нэг Array дотор жагсаах функц
            const flattenedArray = datas.datas.flatMap(item => [
                { item },
                ...item.aimag.map(aimagItem => ({ aimagItem })),
            ]);

// Хүснэгтийн дата
            const mainData = flattenedArray.map((data, idx) => {
                return(
                        data.aimagItem ?
                            {
                                'Аймаг, нийслэл, дүүрэг': '    ' + data?.aimagItem?.name,
                                ' ': ' ',
                                'МД': idx + 1,
                                'Нийт сургалтын байгууллага': data?.aimagItem[1],
                                'Өмчийн':data?.aimagItem[2],
                                'Өмчийн оролцоотой, %':data?.aimagItem[3],
                                'Хамтарсан': data?.aimagItem[4],
                                'Монгол Улсын иргэний':data?.aimagItem[5],
                                'Гадаадтай хамтарсан, %':data?.aimagItem[6],
                                'Гадаад улсын':data?.aimagItem[7],
                                'Өмчийн2':data?.aimagItem[8],
                                'Өмчийн оролцоотой, %2': data?.aimagItem[9],
                                'Хамтарсан2':data?.aimagItem[10],
                                'Олон нийтийн /шашны':data?.aimagItem[11],
                                'Гадаадын салбар сургууль':data?.aimagItem[12],
                                'Их сургууль':data?.aimagItem[13],
                                'Дээд сургууль': data?.aimagItem[14],
                                'Коллеж':data?.aimagItem[15],
                                'Технологийн коллеж':data?.aimagItem[16],
                            }
                        :
                            {
                                'Аймаг, нийслэл, дүүрэг': data?.item?.name,
                                ' ': ' ',
                                'МД': idx + 1,
                                'Нийт сургалтын байгууллага': data?.item[1],
                                'Өмчийн':data?.item[2],
                                'Өмчийн оролцоотой, %':data?.item[3],
                                'Хамтарсан':data?.item[4],
                                'Монгол Улсын иргэний':data?.item[5],
                                'Гадаадтай хамтарсан, %':data?.item[6],
                                'Гадаад улсын':data?.item[7],
                                'Өмчийн2':data?.item[8],
                                'Өмчийн оролцоотой, %2': data?.item[9],
                                'Хамтарсан2':data?.item[10],
                                'Олон нийтийн /шашны':data?.item[11],
                                'Гадаадын салбар сургууль':data?.item[12],
                                'Их сургууль':data?.item[13],
                                'Дээд сургууль': data?.item[14],
                                'Коллеж':data?.item[15],
                                'Технологийн коллеж':data?.item[16],
                            }
                )
            })

            const footer = Array.from({length: 15},(_) => {
                return(
                    {
                        'Аймаг, нийслэл, дүүрэг': ' ',
                        ' ': ' ',
                        'МД': ' ',
                        'Нийт сургалтын байгууллага': ' ',
                        'Өмчийн': ' ',
                        'Өмчийн оролцоотой, %': ' ',
                        'Хамтарсан': ' ',
                        'Монгол Улсын иргэний': ' ',
                        'Гадаадтай хамтарсан, %': ' ',
                        'Гадаад улсын': ' ',
                        'Өмчийн2': ' ',
                        'Өмчийн оролцоотой, %2': ' ',
                        'Хамтарсан2': ' ',
                        'Олон нийтийн /шашны': ' ',
                        'Гадаадын салбар сургууль': ' ',
                        'Их сургууль': ' ',
                        'Дээд сургууль': ' ',
                        'Коллеж': ' ',
                        'Технологийн коллеж': ' ',
                    }
                )
            })


            const combo = [...header, ...mainData, ...footer]

            const worksheet = utils.json_to_sheet(combo);

            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, "A-DB-2-Report");



            const staticCells = [
                'Аймаг, нийслэл, дүүрэг',
                ' ',
                'МД',
                'Нийт сургалтын байгууллага',
                'Өмчийн',
                'Өмчийн оролцоотой, %',
                'Хамтарсан',
                'Монгол Улсын иргэний',
                'Гадаадтай хамтарсан, %',
                'Гадаад улсын',
                'Өмчийн',
                'Өмчийн оролцоотой, %',
                'Хамтарсан',
                'Олон нийтийн /шашны',
                'Гадаадын салбар сургууль',
                'Их сургууль',
                'Дээд сургууль',
                'Коллеж',
                'Технологийн коллеж',
            ];

            utils.sheet_add_aoa(worksheet, [staticCells], { origin: "A8" });
        // Хүснэгтийн стайлууд

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


// Толгой хэсэгт стайл болон Текст өгж буй хэсэг
const startRow = 0;
const endRow = 6;
const startCol = 0;
const endCol = 18;

for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cellAddress = utils.encode_cell({ r: row, c: col });

        if (!worksheet[cellAddress]) {
            worksheet[cellAddress] = {};
        }

      worksheet[cellAddress].s = row === 8 ? bottomBorder : textCellStyle
      worksheet[cellAddress].v = (row === 1 && col === 0) ?
            'Үндэсний статистикийн хорооны даргын 20. . . оны . . . сарын . . .  -ны өдрийн . . . дугаар тушаалаар батлав.'
        : (row === 3 && col === 0 ) ? cyear_name ? 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН  БАЙГУУЛЛАГЫН' + ' '+  cyear_name.replace('-', '/') + ' ' + 'ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, аймаг, нийслэл, дүүргээр'
                : ' ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН  БАЙГУУЛЛАГЫН 20... / 20... ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, аймаг, нийслэл, дүүргээр '
            : ''
    }
}

const styleRow = 7;
const sendRow = 46;
const styleCol = 0;
const sendCol = 20;


for (let row = styleRow; row <= sendRow; row++) {
    for (let col = styleCol; col <= sendCol; col++) {
      const cellNum = utils.encode_cell({ r: row, c: col });

        if (!worksheet[cellNum]) {
            worksheet[cellNum] = {};
        }

        worksheet[cellNum].s =
            (row === 7 && col !== 0 && col !== 2 && col !== 4 && col !== 15)
                ? rotatedTextStyle
                        : numberCellStyle;

    }
}



const fRow = 47;
const fendRow = 62;
const fCol = 0;
const fendCol = 20;


for (let row = fRow; row <= fendRow; row++) {
    for (let col = fCol; col <= fendCol; col++) {
      const cellNum = utils.encode_cell({ r: row, c: col });

        if (!worksheet[cellNum]) {
            worksheet[cellNum] = {};
        }

        worksheet[cellNum].s = row === 47 ? footerBorder : textCellStyle
                    worksheet[cellNum].v = (row === 22 && col === 0) ?
                            'Балансын шалгалт:'
                                : (row === 51 && col === 1 ) ? 'Баталгаажуулсан:'
                                : (row === 54 && col === 1 ) ? 'Хянасан:'
                                : (row === 57 && col === 1 ) ? 'Мэдээ гаргасан:'
                                    : (row === 51 && col === 5 ) ? '.............................'
                                    : (row === 54 && col === 5 ) ? '.............................'
                                    : (row === 57 && col === 5 ) ? '.............................'
                                        : (row === 52 && col === 5 ) ? '/Албан тушаал/'
                                        : (row === 55 && col === 5 ) ? '/Албан тушаал/'
                                        : (row === 58 && col === 5 ) ? '/Албан тушаал/'
                                            : (row === 51 && col === 9 ) ? '.............................'
                                            : (row === 54 && col === 9 ) ? '.............................'
                                            : (row === 57 && col === 9 ) ? '.............................'
                                                : (row === 52 && col === 9 ) ? '/Нэр/'
                                                : (row === 55 && col === 9 ) ? '/Нэр/'
                                                : (row === 58 && col === 9 ) ? '/Нэр/'
                                                    : (row === 51 && col === 13 ) ? '.............................'
                                                    : (row === 54 && col === 13 ) ? '.............................'
                                                    : (row === 57 && col === 13 ) ? '.............................'
                                                        : (row === 52 && col === 13 ) ? '/Гарын үсэг/'
                                                        : (row === 55 && col === 13 ) ? '/Гарын үсэг/'
                                                        : (row === 58 && col === 13 ) ? '/Гарын үсэг/'
                                : (row === 61 && col === 6 ) ? '20 ….. оны ….. сарын ….. өдөр'
                                    : ''
                            }
                        }

            const phaseZeroCells = Array.from({length: 14}, (_) => {return({wch: 3})})
            const phaseTwoCells = Array.from({length: 4}, (_) => {return({wch: 4})})

            worksheet["!cols"] = [ { wch: 20 }, ...phaseZeroCells,...phaseTwoCells ];


            const phaseOneRow = Array.from({length: 3}, (_) => {return({hpx: 10})})

            worksheet["!rows"] = [
                { hpx: 10 },
                { hpx: 40 },
                { hpx: 10 },
                { hpx: 40 },
                ...phaseOneRow,
                { hpx: 30 },
                { hpx: 20 },
                { hpx: 100 }
            ];

            const mergeCells = Array.from({length: 47 },(_, idx) => { return (
                {
                    s: {
                        // эдгээр мөрийн дугааруудад хамрагдсан хүснэгт байвал merge хийхгүй
                            r: (idx === 0 || idx === 1 || idx === 3 || idx === 7 || idx === 8 || idx === 9)
                                ? null
                                    : idx,
                                // эдгээр баганы дугааруудад хамрагдсан хүснэгт байвал merge хийхгүй
                            c: (idx === 0 || idx === 1 || idx === 3 || idx === 7 || idx === 8 || idx === 9)
                                ? null
                                    : 0
                        },

                        // эдгээр мөрийн дугааруудад хамрагдсан хүснэгт байвал merge хийхгүй
                    e: {    r: (idx === 0 || idx === 1 || idx === 3 || idx === 7 || idx === 8 || idx === 9)
                                ? null
                                    : idx,
                                // эдгээр баганы дугааруудад хамрагдсан хүснэгт байвал merge хийхгүй
                            c: (idx === 0 || idx === 1 || idx === 3 || idx === 7 || idx === 8 || idx === 9)
                                ? null
                                    : 1
                        }

                }
            )})


            worksheet['!merges'] = [
                ...mergeCells,
                // Аймаг, нийслэл, дүүрэг
                {
                    s: { r: 1, c: 0 },
                    e: { r: 1, c: 3 }
                },
                {
                    s: { r: 3, c: 0 },
                    e: { r: 3, c: 18 }
                },
                {
                    s: { r: 7, c: 0 },
                    e: { r: 9, c: 1 }
                },

                // МД
                {
                    s: { r: 7, c: 2 },
                    e: { r: 9, c: 2 }
                },

                // Нийт сургалтын байгууллага
                {
                    s: { r: 7, c: 3 },
                    e: { r: 9, c: 3 }
                },

                // Өмчийн хэлбэр subheader merge
                {
                    s: { r: 7, c: 4 },
                    e: { r: 7, c: 13 }
                },

                // Төрийн
                {
                    s: { r: 8, c: 4 },
                    e: { r: 8, c: 6 }
                },

                // Хувийн
                {
                    s: { r: 8, c: 7 },
                    e: { r: 8, c: 9 }
                },

                // Орон нутгийн
                {
                    s: { r: 8, c: 10 },
                    e: { r: 8, c: 12 }
                },

                // Олон нийтийн /шашны
                {
                    s: { r: 8, c: 13 },
                    e: { r: 9, c: 13 }
                },

                // Гадаадын салбар сургууль
                {
                    s: { r: 7, c: 14 },
                    e: { r: 9, c: 14 }
                },

                // Сургалтын байгууллагын ангилал
                {
                    s: { r: 7, c: 15 },
                    e: { r: 7, c: 18 }
                },

                // Их сургууль
                {
                    s: { r: 8, c: 15 },
                    e: { r: 9, c: 15 }
                },

                // Дээд сургууль
                {
                    s: { r: 8, c: 16 },
                    e: { r: 9, c: 16 }
                },

                // Коллеж
                {
                    s: { r: 8, c: 17 },
                    e: { r: 9, c: 17 }
                },

                // Технологийн коллеж
                {
                    s: { r: 8, c: 18 },
                    e: { r: 9, c: 18 }
                },
                // багана: 1=
                {
                    s: { r: 47, c: 1 },
                    e: { r: 47, c: 9 }
                },
                // Мөр: 1=
                {
                    s: { r: 48, c: 1 },
                    e: { r: 48, c: 18 }
                },


                //  FOOTER MERGE PREFIX   //
                /////////////////////////////////////////////////////////////
                        {
                            s: { r: 51, c: 1 },
                            e: { r: 51, c: 4 }
                        },

                        //......
                        {
                            s: { r: 51, c: 5 },
                            e: { r: 51, c: 8 }
                        },
                        {
                            s: { r: 51, c: 9 },
                            e: { r: 51, c: 12 }
                        },
                        {
                            s: { r: 51, c: 13 },
                            e: { r: 51, c: 16 }
                        },

                        // TUSHAAL NER GARIIN USEG
                        {
                            s: { r: 52, c: 5 },
                            e: { r: 52, c: 8 }
                        },
                        {
                            s: { r: 52, c: 9 },
                            e: { r: 52, c: 12 }
                        },
                        {
                            s: { r: 52, c: 13 },
                            e: { r: 52, c: 16 }
                        },


                        //......
                        {
                            s: { r: 54, c: 1 },
                            e: { r: 54, c: 4 }
                        },

                        {
                            s: { r: 54, c: 5 },
                            e: { r: 54, c: 8 }
                        },
                        {
                            s: { r: 54, c: 9 },
                            e: { r: 54, c: 12 }
                        },
                        {
                            s: { r: 54, c: 13 },
                            e: { r: 54, c: 16 }
                        },

                        // TUSHAAL NER GARIIN USEG
                        {
                            s: { r: 55, c: 5 },
                            e: { r: 55, c: 8 }
                        },
                        {
                            s: { r: 55, c: 9 },
                            e: { r: 55, c: 12 }
                        },
                        {
                            s: { r: 55, c: 13 },
                            e: { r: 55, c: 16 }
                        },


                        //......
                        {
                            s: { r: 57, c: 1 },
                            e: { r: 57, c: 4 }
                        },
                        {
                            s: { r: 57, c: 5 },
                            e: { r: 57, c: 8 }
                        },
                        {
                            s: { r: 57, c: 9 },
                            e: { r: 57, c: 12 }
                        },
                        {
                            s: { r: 57, c: 13 },
                            e: { r: 57, c: 16 }
                        },

                        // TUSHAAL NER GARIIN USEG
                        {
                            s: { r: 58, c: 5 },
                            e: { r: 58, c: 8 }
                        },
                        {
                            s: { r: 58, c: 9 },
                            e: { r: 58, c: 12 }
                        },
                        {
                            s: { r: 58, c: 13 },
                            e: { r: 58, c: 16 }
                        },


                    {
                        s: { r: 61, c: 6 },
                        e: { r: 61, c: 16 }
                    },
                /////////////////////////////////////////////////////////////

                // //
                // {
                //     s: { r: , c:  },
                //     e: { r: , c:  }
                // },

            ];

            //  Хүчилсэн утга оноох хэсэг

            worksheet['A11'].v = 'A'
            worksheet['C11'].v = 'Б'
            worksheet['D11'].v = '1'
            worksheet['E11'].v = '2'
            worksheet['F11'].v = '3'
            worksheet['G11'].v = '4'
            worksheet['H11'].v = '5'
            worksheet['I11'].v = '6'
            worksheet['J11'].v = '7'
            worksheet['K11'].v = '8'
            worksheet['L11'].v = '9'
            worksheet['M11'].v = '10'
            worksheet['N11'].v = '11'
            worksheet['O11'].v = '12'
            worksheet['P11'].v = '13'
            worksheet['Q11'].v = '14'
            worksheet['R11'].v = '15'
            worksheet['S11'].v = '16'
            // worksheet['11'].v = ''

            worksheet['E8'].v = 'Өмчийн хэлбэр'
            worksheet['E9'].v = 'Төрийн'
            worksheet['H9'].v = 'Хувийн'
            worksheet['K9'].v = 'Орон нутгийн'

            worksheet['E10'].v = 'Өмчийн'
            worksheet['E10'].s = rotatedTextStyle
            worksheet['F10'].v = 'Өмчийн оролцоотой, %'
            worksheet['F10'].s = rotatedTextStyle
            worksheet['G10'].v = 'Хамтарсан'
            worksheet['G10'].s = rotatedTextStyle

            worksheet['H10'].v = 'Монгол Улсын иргэний'
            worksheet['H10'].s = rotatedTextStyle
            worksheet['I10'].v = 'Гадаадтай хамтарсан, %'
            worksheet['I10'].s = rotatedTextStyle
            worksheet['J10'].v = 'Гадаад улсын'
            worksheet['J10'].s = rotatedTextStyle

            worksheet['K10'].v = 'Өмчийн'
            worksheet['K10'].s = rotatedTextStyle
            worksheet['L10'].v = 'Өмчийн оролцоотой, %'
            worksheet['L10'].s = rotatedTextStyle
            worksheet['M10'].v = 'Хамтарсан'
            worksheet['M10'].s = rotatedTextStyle
            worksheet['N9'].v = 'Олон нийтийн /шашны'
            worksheet['N9'].s = rotatedTextStyle

            worksheet['P8'].v = 'Сургалтын байгууллагын ангилал'
            worksheet['P9'].v = 'Их сургууль'
            worksheet['P9'].s = rotatedTextStyle
            worksheet['Q9'].v = 'Дээд сургууль'
            worksheet['Q9'].s = rotatedTextStyle
            worksheet['R9'].v = 'Коллеж'
            worksheet['R9'].s = rotatedTextStyle
            worksheet['S9'].v = 'Технологийн коллеж'
            worksheet['S9'].s = rotatedTextStyle

            worksheet['A48'].v = 'Балансын шалгалт:'
            worksheet['B48'].v = 'Багана: 1=(2÷11)=(13+14+15), 15>16;'
            worksheet['B49'].v = 'Мөр: 1=(2+8+15+23+27), 2=(3÷7), 8=(9÷14), 15=(16÷22), 23=(24÷26), 27=(28÷36);'

            writeFile(workbook, "A-DB-1.xlsx", { compression: true });
        }

    return(
        <div className="overflow-auto">
            {/* <Button color="primary" className="mb-2 p-75" disabled={false} onClick={() => {convert()}}> */}
            <Button color="primary" className="mb-2 p-75" disabled={isLoading} onClick={() => {convert()}}>
                <FileText size={18} /> Excel татах
            </Button>
            {localLoader || isLoading ?
                <div className="p-5">
                    {Loader}
                </div>
                :
            <table>
                <thead>
                    <tr>
                        <th rowSpan={3}>
                            Аймаг, нийслэл, дүүрэг
                        </th>
                        {/* <th rowSpan={3}>
                            МД
                        </th> */}
                        <th rowSpan={3} className="th-rotate">
                            Нийт сургалтын байгууллага
                        </th>
                        <th colSpan={10}>
                            Өмчийн хэлбэр
                        </th>

                        <th rowSpan={3} className="th-rotate">
                            Гадаадын салбар сургууль
                        </th>
                        <th colSpan={4}>
                            Сургалтын байгууллагын ангилал
                        </th>
                    </tr>
                    <tr>
                        <th colSpan={3}>
                            Төрийн
                        </th>
                        <th colSpan={3}>
                            Хувийн
                        </th>
                        <th colSpan={3}>
                            Орон нутгийн
                        </th>
                        <th rowSpan={2} className="th-rotate">Олон нийтийн /шашны</th>
                        <th rowSpan={2} className="th-rotate">Их сургууль</th>
                        <th rowSpan={2} className="th-rotate">Дээд сургууль</th>
                        <th rowSpan={2} className="th-rotate">Коллеж</th>
                        <th rowSpan={2} className="th-rotate">Технологийн коллеж</th>

                    </tr>
                    <tr style={{ height: 200 }}>
                        <th  className="th-rotate">
                            Өмчийн
                        </th>
                        <th  className="th-rotate">Өмчийн оролцоотой, %</th>
                        <th  className="th-rotate">Хамтарсан</th>
                        <th  className="th-rotate">Монгол Улсын иргэний</th>
                        <th  className="th-rotate">Гадаадтай хамтарсан, %</th>
                        <th  className="th-rotate">Гадаад улсын</th>
                        <th  className="th-rotate">Өмчийн</th>
                        <th  className="th-rotate">Өмчийн оролцоотой, %</th>
                        <th  className="th-rotate">Хамтарсан</th>
                    </tr>
                </thead>
                <tbody>
                    {datas?.datas.map((data, idx) => (

                        <Fragment key={`data${idx}`}>
                            {data.aimag ?
                                    <tr>
                                        <th>{data?.name}</th>

                                        {
                                        Array.from({length: datas?.header_count },(_, vidx) => { return (
                                            <td key={`uniq${vidx}`}>
                                                {data[vidx + 1]}
                                            </td>
                                        )})
                                }
                                    </tr>
                                :
                                    <tr>
                                        <th>{data?.zone_name}</th>
                                        {
                                            Array.from({length: datas?.header_count },(_, vidx) => { return (
                                                <td>
                                                    {data[vidx + 1]}
                                                </td>
                                            )})
                                        }
                                    </tr>
                            }
                            {data.aimag &&
                                data.aimag.map((info, iidx) => {
                                return(
                                <tr key={`aimag${iidx}`}>
                                    <td style={{ paddingLeft: 30 }}>
                                        {info?.name}
                                    </td>
                                    {/* <td>

                                    </td> */}
                                {
                                    Array.from({length: datas?.header_count },(_, vidx) => { return (
                                        <td key={`uniq${vidx}`}>
                                            {info[vidx + 1]}
                                        </td>
                                    )})
                                }

                                    {/* <td>

                                    </td>
                                    <td>

                                    </td>
                                    <td>

                                    </td>
                                    <td>

                                    </td>
                                    <td>

                                    </td>
                                    <td>

                                    </td>
                                    <td>

                                    </td>
                                    <td>

                                    </td>
                                    <td>

                                    </td>
                                    <td>

                                    </td>
                                    <td>

                                    </td>
                                    <td>

                                    </td>
                                    <td>

                                    </td>
                                    <td>

                                    </td>
                                    <td>

                                    </td> */}
                                </tr>
                            )})}
                        </Fragment>
                    ))}
                </tbody>
            </table>
            }
            </div>
    )
}

export default ADB1;