import React, { Fragment, useContext, useEffect, useState } from "react";
import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";
import { Button, Spinner } from "reactstrap";
import { FileText } from 'react-feather'

import { utils, writeFile } from 'xlsx-js-style';
import './style.scss'
import ActiveYearContext from "@context/ActiveYearContext"

import { sampledata } from "./sample";



// Боловсролын зэргийн төрөл
const degreeAll = 0
const degreeBakalavr = 'D'
const degreeMagistr = 'E'
const degreeDoctor = 'F'
const degreeDiplom = 'C'

function ADB8(){

    const infoApi = useApi().status.db8
    const { cyear_name } = useContext(ActiveYearContext)

	// // Loader
	const { Loader, isLoading, fetchData } = useLoader({isSmall: true});
    const [localLoaderDB8, setLocalLoaderDB8] = useState(true)

    const [datas, setDatas] = useState([])

    async function getDatas() {
        const {success, data} = await fetchData(infoApi.get())
        if(success) {
            setDatas(data)
            setLocalLoaderDB8(false)
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
                    'Нас': 'А',
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
                    'Нас2': 'A',
                    'МД2': 'Б',
                        'Тухайн жилд бүрэн дунд боловсрол эзэмшигчдээс': 16,
                            'Эрэгтэй5': 17,
                            'Эмэгтэй5': 18,
                        'Тухайн жилд техникийн болон мэргэжлийн боловсрол эзэмшигчдээс': 19,
                            'Эрэгтэй6': 20,
                            'Эмэгтэй6': 21,
                        'Тухайн жилд бакалаврын боловсрол эзэмшигчдээс': 22,
                            'Эрэгтэй7': 23,
                            'Эмэгтэй7': 24,
                        'Ажиллагчдаас': 25,
                            'Эрэгтэй8': 26,
                            'Эмэгтэй8': 27,
                        'Ажилгүй иргэдээс': 28,
                            'Эрэгтэй9': 29,
                            'Эмэгтэй9': 30,
                        'Бусад': 31,
                            'Эрэгтэй10': 32,
                            'Эмэгтэй10': 33
                })})


        // const flattenedArray = datas.flatMap(item => [
        //     item,
        //     ...item.aimag.map(ditem => ({ ...ditem })),
        // ]);

        const mainData = datas.map((data, idx) => {
                return(
                        {
                            // {data?.age_list?.degree.filter((datz) => datz?.all_degree_id === degreeAll)[0]?.all_student}
                            'Нас': data?.range_age,
                            'МД': idx + 1,
                            'Нийт суралцагчид': data?.age_list?.degree.filter((datz) => datz?.all_degree_id === degreeAll)[0]?.all_student,
                                'Эрэгтэй': data?.age_list?.degree.filter((datz) => datz?.all_degree_id === degreeAll)[0]?.men_student,
                                'Эмэгтэй': data?.age_list?.degree.filter((datz) => datz?.all_degree_id === degreeAll)[0]?.women_student,
                            'Дипломын боловсрол': data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeDiplom)[0]?.all_student,
                                'Эрэгтэй1': data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeDiplom)[0]?.men_student,
                                'Эмэгтэй1': data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeDiplom)[0]?.women_student,
                            'Бакалаврын боловсрол': data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeBakalavr)[0]?.all_student,
                                'Эрэгтэй2': data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeBakalavr)[0]?.men_student,
                                'Эмэгтэй2': data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeBakalavr)[0]?.women_student,
                            'Магистрын боловсрол': data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeMagistr)[0]?.all_student,
                                'Эрэгтэй3': data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeMagistr)[0]?.men_student,
                                'Эмэгтэй3': data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeMagistr)[0]?.women_student,
                            'Докторын боловсрол': data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeDoctor)[0]?.all_student,
                                'Эрэгтэй4': data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeDoctor)[0]?.men_student,
                                'Эмэгтэй4': data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeDoctor)[0]?.women_student,

                                // {data?.age_list?.admission.map((dis, didx) => (

                            'Нас2': data?.range_age,
                            'МД2': idx + 1,
                            'Тухайн жилд бүрэн дунд боловсрол эзэмшигчдээс': data?.age_list?.admission[0]?.all,
                                'Эрэгтэй5': data?.age_list?.admission[0]?.men,
                                'Эмэгтэй5': data?.age_list?.admission[0]?.women,
                            "Тухайн жилд техникийн болон мэргэжлийн боловсрол эзэмшигчдээс": data?.age_list?.admission[1]?.all,
                                "Эрэгтэй6":data?.age_list?.admission[1]?.men,
                                "Эмэгтэй6":data?.age_list?.admission[1]?.women,
                            "Тухайн жилд бакалаврын боловсрол эзэмшигчдээс": data?.age_list?.admission[2]?.all,
                                "Эрэгтэй7":data?.age_list?.admission[2]?.men,
                                "Эмэгтэй7":data?.age_list?.admission[2]?.women,

                            "Ажиллагчдаас": data?.age_list?.admission[3]?.all,
                                "Эрэгтэй8": data?.age_list?.admission[3]?.men,
                                "Эмэгтэй8": data?.age_list?.admission[3]?.women,

                            "Ажилгүй иргэдээс": data?.age_list?.admission[4]?.all,
                                "Эрэгтэй9": data?.age_list?.admission[4]?.men,
                                "Эмэгтэй9": data?.age_list?.admission[4]?.women,

                            "Бусад": data?.age_list?.admission[5]?.all,
                                "Эрэгтэй10": data?.age_list?.admission[5]?.men,
                                "Эмэгтэй10": data?.age_list?.admission[5]?.women,

                            // "Хавсарсан": data?.age_list?.admission.filter((datz) => datz.dis_id === disHavsarsan)[0]?.all,
                            //     "Эрэгтэй11": data?.age_list?.admission.filter((datz) => datz.dis_id === disHavsarsan)[0]?.men,
                            //     "Эмэгтэй11": data?.age_list?.admission.filter((datz) => datz.dis_id === disHavsarsan)[0]?.women,

                            // "Бусад": data?.age_list?.admission.filter((datz) => datz.dis_id === disBusad)[0]?.all,
                            //     "Эрэгтэй12": data?.age_list?.admission.filter((datz) => datz.dis_id === disBusad)[0]?.men,
                            //     "Эмэгтэй12": data?.age_list?.admission.filter((datz) => datz.dis_id === disBusad)[0]?.women,
                        }
                    )
                })

                const footer = Array.from({length: 12},(_, hidx) => {
                    return(
                        {
                            'Нас': '',
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
                            'Нас2': '',
                            'МД2': '',
                            'Тухайн жилд бүрэн дунд боловсрол эзэмшигчдээс': '',
                                'Эрэгтэй5': '',
                                'Эмэгтэй5': '',
                            'Тухайн жилд техникийн болон мэргэжлийн боловсрол эзэмшигчдээс': '',
                                'Эрэгтэй6': '',
                                'Эмэгтэй6': '',
                            'Тухайн жилд бакалаврын боловсрол эзэмшигчдээс': '',
                                'Эрэгтэй7': '',
                                'Эмэгтэй7': '',
                            'Ажиллагчдаас': '',
                                'Эрэгтэй8': '',
                                'Эмэгтэй8': '',
                            'Ажилгүй иргэдээс': '',
                                'Эрэгтэй9':'',
                                'Эмэгтэй9':'',
                            'Бусад': '',
                                'Эрэгтэй10':'',
                                'Эмэгтэй10':''
                        })})

        const combo = [...header, ...mainData, ...footer]

        const worksheet = utils.json_to_sheet(combo);

        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "A-DB-8-Report")
        const staticCells = [
            'Нас',
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
            'Нас',
            'МД',
            'Тухайн жилд бүрэн дунд боловсрол эзэмшигчдээс',
                'Эрэгтэй',
                'Эмэгтэй',
            'Тухайн жилд техникийн болон мэргэжлийн боловсрол эзэмшигчдээс',
                'Эрэгтэй',
                'Эмэгтэй',
            'Тухайн жилд бакалаврын боловсрол эзэмшигчдээс',
                'Эрэгтэй',
                'Эмэгтэй',
            'Ажиллагчдаас',
                'Эрэгтэй',
                'Эмэгтэй',
            'Ажилгүй иргэдээс',
                'Эрэгтэй',
                'Эмэгтэй',
            'Бусад',
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
                    const endRow = 8;
                    const startCol = 0;
                    const endCol = 36;

                    for (let row = startRow; row <= endRow; row++) {
                        for (let col = startCol; col <= endCol; col++) {
                        const cellAddress = utils.encode_cell({ r: row, c: col });

                            if (!worksheet[cellAddress]) {
                                worksheet[cellAddress] = {};
                            }

                        worksheet[cellAddress].s = row === 8 ? bottomBorder : textCellStyle
                        worksheet[cellAddress].v = (row === 0 && col === 0) ?
                                'Үндэсний статистикийн хорооны даргын 20. . . оны . . . сарын . . .  -ны өдрийн . . . дугаар тушаалаар батлав.'
                            : (row === 2 && col === 0 ) ? cyear_name ? 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН  БАЙГУУЛЛАГАД ШИНЭЭР ЭЛСЭГЧДИЙН' + ' '+  cyear_name.replace('-', '/') + ' ' + 'ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, насны ангиллаар'
                                    : 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН  БАЙГУУЛЛАГАД ШИНЭЭР ЭЛСЭГЧДИЙН 20... / 20... ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ, насны ангиллаар'
                                : ''
                        }
                    }

                    const styleRow = 9;
                    const sendRow = 40;
                    const styleCol = 0;
                    const sendCol = 36;

                    for (let row = styleRow; row <= sendRow; row++) {
                        for (let col = styleCol; col <= sendCol; col++) {
                            const cellNum = utils.encode_cell({ r: row, c: col });

                            if (!worksheet[cellNum]) {
                                worksheet[cellNum] = {};
                            }

                            worksheet[cellNum].s =
                                (row === 9 && col !== 0 && col !== 1 && col !== 21 && col !== 20)
                                    ? rotatedTextStyle : (col === 0 || col === 20) ? defaultTextStyle : numberCellStyle;
                        }
                    }

                    const fRow = 41;
                    const fendRow = 54;
                    const fCol = 0;
                    const fendCol = 36;


                    for (let row = fRow; row <= fendRow; row++) {
                        for (let col = fCol; col <= fendCol; col++) {
                        const cellNum = utils.encode_cell({ r: row, c: col });

                            if (!worksheet[cellNum]) {
                                worksheet[cellNum] = {};
                            }

                            worksheet[cellNum].s = (row === 41) ? footerBorder : textCellStyle
                            worksheet[cellNum].v = (row === 41 && col === 0) ?
                            'Балансын шалгалт:'
                                : (row === 44 && col === 2 ) ? 'Баталгаажуулсан:'
                                : (row === 46 && col === 2 ) ? 'Хянасан:'
                                : (row === 48 && col === 2 ) ? 'Мэдээ гаргасан:'
                                    : (row === 44 && col === 6 ) ? '.............................'
                                    : (row === 46 && col === 6 ) ? '.............................'
                                    : (row === 48 && col === 6 ) ? '.............................'
                                        : (row === 45 && col === 6 ) ? '/Албан тушаал/'
                                        : (row === 47 && col === 6 ) ? '/Албан тушаал/'
                                        : (row === 49 && col === 6 ) ? '/Албан тушаал/'
                                            : (row === 44 && col === 12 ) ? '.............................'
                                            : (row === 46 && col === 12 ) ? '.............................'
                                            : (row === 48 && col === 12 ) ? '.............................'
                                                : (row === 45 && col === 12 ) ? '/Нэр/'
                                                : (row === 47 && col === 12 ) ? '/Нэр/'
                                                : (row === 49 && col === 12 ) ? '/Нэр/'
                                                    : (row === 44 && col === 18 ) ? '.............................'
                                                    : (row === 46 && col === 18 ) ? '.............................'
                                                    : (row === 48 && col === 18 ) ? '.............................'
                                                        : (row === 45 && col === 18 ) ? '/Гарын үсэг/'
                                                        : (row === 47 && col === 18 ) ? '/Гарын үсэг/'
                                                        : (row === 49 && col === 18 ) ? '/Гарын үсэг/'
                                : (row === 53 && col === 6 ) ? '20 ….. оны ….. сарын ….. өдөр'
                                    : ''
                        }
                    }


                    const phaseOneCol = Array.from({length: 15}, (_) => {return( { wch: 4 } )})
                    const phaseTwoCol = Array.from({length: 21}, (_) => {return( { wch: 6 } )})

        worksheet["!cols"] = [
            { wch: 20 },
            { wch: 3 },
            ...phaseOneCol,
            { wch: 20 },
            { wch: 3 },
            ...phaseTwoCol
        ];

        const phaseTwoRow = Array.from({length: 6}, (_) => {return( { hpx: 10 } )})

        worksheet["!rows"] = [
            { hpx: 40 },
            { hpx: 10 },
            { hpx: 40 },
            ...phaseTwoRow,
            // Хүснэгтийн эхний мөр
            { hpx: 20 },
            { hpx: 20 },
            { hpx: 120 },
        ];

        worksheet['!merges'] = [

            //header merge
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
                s: { r: 9, c: 3 },
                e: { r: 9, c: 16 }
            },
            {
                s: { r: 9, c: 0 },
                e: { r: 11, c: 0 }
            },
            {
                s: { r: 9, c: 1 },
                e: { r: 11, c: 1 }
            },
            {
                s: { r: 9, c: 2 },
                e: { r: 11, c: 2 }
            },
            {
                s: { r: 10, c: 3 },
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
            {
                s: { r: 10, c: 8 },
                e: { r: 11, c: 8 }
            },
            {
                s: { r: 10, c: 11 },
                e: { r: 11, c: 11 }
            },
            {
                s: { r: 10, c: 14 },
                e: { r: 11, c: 14 }
            },

            // end tom
            {
                s: { r: 9, c: 17 },
                e: { r: 11, c: 17 }
            },
            {
                s: { r: 9, c: 18 },
                e: { r: 11, c: 18 }
            },
            {
                s: { r: 10, c: 19 },
                e: { r: 11, c: 19 }
            },
            // {
            //     s: { r: 10, c: 20 },
            //     e: { r: 11, c: 20 }
            // },
            // {
            //     s: { r: 10, c: 21 },
            //     e: { r: 11, c: 21 }
            // },
            {
                s: { r: 9, c: 19 },
                e: { r: 9, c: 36 }
            },
            {
                s: { r: 10, c: 22 },
                e: { r: 11, c: 22 }
            },
            {
                s: { r: 10, c: 25 },
                e: { r: 11, c: 25 }
            },
            {
                s: { r: 10, c: 28 },
                e: { r: 11, c: 28 }
            },
            {
                s: { r: 10, c: 31 },
                e: { r: 11, c: 31 }
            },
            {
                s: { r: 10, c: 34 },
                e: { r: 11, c: 34 }
            },
            {
                s: { r: 10, c: 37 },
                e: { r: 11, c: 37 }
            },
            {
                s: { r: 10, c: 40 },
                e: { r: 11, c: 40 }
            },

            // балансын шалгалт
            {
                s: { r: 41, c: 1 },
                e: { r: 41, c: 15 }
            },
            {
                s: { r: 42, c: 1 },
                e: { r: 42, c: 5 }
            },


            {
                s: { r: 41, c: 19 },
                e: { r: 41, c: 36 }
            },


// Баталгаажуулсан, хянасан, мэдээ гаргасан
            {
                s: { r: 44, c: 2 },
                e: { r: 44, c: 5 }
            },
            {
                s: { r: 46, c: 2 },
                e: { r: 46, c: 5 }
            },
            {
                s: { r: 48, c: 2 },
                e: { r: 48, c: 5 }
            },

//
            {
                s: { r: 44, c: 6 },
                e: { r: 44, c: 9 }
            },
            {
                s: { r: 46, c: 6 },
                e: { r: 46, c: 9 }
            },
            {
                s: { r: 48, c: 6 },
                e: { r: 48, c: 9 }
            },
                    {
                        s: { r: 45, c: 6 },
                        e: { r: 45, c: 9 }
                    },
                    {
                        s: { r: 47, c: 6 },
                        e: { r: 47, c: 9 }
                    },
                    {
                        s: { r: 49, c: 6 },
                        e: { r: 49, c: 9 }
                    },
//
            {
                s: { r: 44, c: 12 },
                e: { r: 44, c: 15 }
            },
            {
                s: { r: 46, c: 12 },
                e: { r: 46, c: 15 }
            },
            {
                s: { r: 48, c: 12 },
                e: { r: 48, c: 15 }
            },

                    {
                        s: { r: 45, c: 12 },
                        e: { r: 45, c: 15 }
                    },
                    {
                        s: { r: 47, c: 12 },
                        e: { r: 47, c: 15 }
                    },
                    {
                        s: { r: 49, c: 12 },
                        e: { r: 49, c: 15 }
                    },
//
            {
                s: { r: 44, c: 18 },
                e: { r: 44, c: 21 }
            },
            {
                s: { r: 46, c: 18 },
                e: { r: 46, c: 21 }
            },
            {
                s: { r: 48, c: 18 },
                e: { r: 48, c: 21 }
            },
                    {
                        s: { r: 45, c: 18 },
                        e: { r: 45, c: 21 }
                    },
                    {
                        s: { r: 47, c: 18 },
                        e: { r: 47, c: 21 }
                    },
                    {
                        s: { r: 49, c: 18 },
                        e: { r: 49, c: 21 }
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


        worksheet['C10'].s = rotatedBorderFix

            worksheet['D10'] = {s: nullCell1, v: "" }
            worksheet['E10'] = {s: nullCell2, v: "" }
            worksheet['D11'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['E11'] = {s: rotatedTextStyle, v: "Эмэгтэй" }


        worksheet['F11'] = {v:'Дипломын боловсрол', s: rotatedBorderFix}

            worksheet['G11'] = {s: nullCell1, v: "" }
            worksheet['H11'] = {s: nullCell2, v: "" }
            worksheet['G12'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['H12'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

        worksheet['I11'] = {v:'Бакалаврын боловсрол', s: rotatedBorderFix}

            worksheet['J11'] = {s: nullCell1, v: "" }
            worksheet['K11'] = {s: nullCell2, v: "" }
            worksheet['J12'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['K12'] = {s: rotatedTextStyle, v: "Эмэгтэй" }


        worksheet['L11'] = {v:'Магистрын боловсрол', s: rotatedBorderFix}

            worksheet['M11'] = {s: nullCell1, v: "" }
            worksheet['N11'] = {s: nullCell2, v: "" }
            worksheet['M12'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['N12'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

        worksheet['O11'] = {v:'Докторын боловсрол', s: rotatedBorderFix}

            worksheet['P11'] = {s: nullCell1, v: "" }
            worksheet['Q11'] = {s: nullCell2, v: "" }
            worksheet['P12'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['Q12'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

        worksheet['R10'] = {v:'Нас', s: defaultTextStyle}
        worksheet['S10'] = {v:'МД', s: defaultTextStyle}

            // worksheet['T10'] = {s: nullCell2, v: "" }
            // worksheet['S11'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            // worksheet['T11'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

        worksheet['T10'] = {v:'Шинээр элсэгчид', s: defaultTextStyle }

        worksheet['T11'] = {v:'Тухайн жилд бүрэн дунд боловсрол эзэмшигчдээс', s: rotatedBorderFix}

            worksheet['U11'] = {s: nullCell1, v: "" }
            worksheet['V11'] = {s: nullCell2, v: "" }
            worksheet['U12'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['V12'] = {s: rotatedTextStyle, v: "Эмэгтэй" }


        worksheet['W11'] = {v:'Тухайн жилд техникийн болон мэргэжлийн боловсрол эзэмшигчдээс', s: rotatedBorderFix}

            worksheet['X11'] = {s: nullCell1, v: "" }
            worksheet['Y11'] = {s: nullCell2, v: "" }
            worksheet['X12'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['Y12'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

        worksheet['Z11'] = {v:'Тухайн жилд бакалаврын боловсрол эзэмшигчдээс', s: rotatedBorderFix}

            worksheet['AA11'] = {s: nullCell1, v: "" }
            worksheet['AB11'] = {s: nullCell2, v: "" }
            worksheet['AA12'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['AB12'] = {s: rotatedTextStyle, v: "Эмэгтэй" }

        worksheet['AC11'] = {v:'Ажиллагчдаас', s: rotatedBorderFix}

            worksheet['AD11'] = {s: nullCell1, v: "" }
            worksheet['AE11'] = {s: nullCell2, v: "" }
            worksheet['AD12'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['AE12'] = {s: rotatedTextStyle, v: "Эмэгтэй" }


        worksheet['AF11'] = {v:'Ажилгүй иргэдээс', s: rotatedBorderFix}

            worksheet['AG11'] = {s: nullCell1, v: "" }
            worksheet['AH11'] = {s: nullCell2, v: "" }
            worksheet['AG12'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['AH12'] = {s: rotatedTextStyle, v: "Эмэгтэй" }


        worksheet['AI11'] = {v:'Бусад', s: rotatedBorderFix}

            worksheet['AJ11'] = {s: nullCell1, v: "" }
            worksheet['AK11'] = {s: nullCell2, v: "" }
            worksheet['AJ12'] = {s: rotatedTextStyle, v: "Эрэгтэй" }
            worksheet['AK12'] = {s: rotatedTextStyle, v: "Эмэгтэй" }


        worksheet['B42'].v = "Багана: 1=(2+3)=(4+7+10+13), 4=(5+6), 7=(8+9), 10=(11+12), 13=(14+15); "
        worksheet['B43'].v = "Мөр: 1=(2÷28);"


        worksheet['R42'].v = "Балансын шалгалт:"
        worksheet['T42'].v = "Багана: 1=(16+19+22+25+28+31), 16=(17+18), 19=(20+21), 22=(23+24), 25=(26+27), 28=(29+30), 31=(32+33);"


            writeFile(workbook, "A-DB-8.xlsx", { compression: true });

    }


    return(
        <div className="overflow-auto" style={{ minHeight: 200 }}>
            {/* <Button color="primary" className="mb-2 p-75" disabled={false} onClick={() => {convert()}}> */}
            <Button color="primary" className="mb-2 p-75" disabled={isLoading} onClick={() => {convert()}}>
                <FileText size={18} /> Excel татах
            </Button>
            {(isLoading || localLoaderDB8) ?
                Loader
                :
                <table>
                    <thead>
                        <tr>
                            <th rowSpan={3} className="p-5">Нас</th>
                            <th rowSpan={3} className="th-rotate-border">Нийт шинээр элсэгчид</th>
                                <th colSpan={14} style={{ borderLeft: 0, height: 15 }}></th>
                            <th rowSpan={3} className="p-5">Нас</th>
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

                            {/* <th rowSpan={2} className="th-rotate-border">Хөгжлийн бэрхшээлтэй суралцагчид</th> */}
                            <th rowSpan={2} className="th-rotate-border">Тухайн жилд бүрэн дунд боловсрол эзэмшигчдээс</th>
                                <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                            <th rowSpan={2} className="th-rotate-border">Тухайн жилд техникийн болон мэргэжлийн боловсрол эзэмшигчдээс</th>
                                <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                            <th rowSpan={2} className="th-rotate-border">Тухайн жилд бакалаврын боловсрол эзэмшигчдээс</th>
                                <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                            <th rowSpan={2} className="th-rotate-border">Ажиллагчдаас</th>
                                <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                            <th rowSpan={2} className="th-rotate-border">Ажилгүй иргэдээс</th>
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
                        {datas.map((data, idx) => (
                            <tr key={`maindata${idx}`}>
                                <td className="text-center">
                                    {data?.range_age}
                                </td>

                                <td>
                                    {data?.age_list?.degree.filter((datz) => datz?.all_degree_id === degreeAll)[0]?.all_student}
                                </td>
                                    <td>
                                        {data?.age_list?.degree.filter((datz) => datz?.all_degree_id === degreeAll)[0]?.men_student}
                                    </td>
                                    <td>
                                        {data?.age_list?.degree.filter((datz) => datz?.all_degree_id === degreeAll)[0]?.women_student}
                                    </td>
                                <td>
                                    {data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeDiplom)[0]?.all_student}
                                </td>
                                    <td>
                                        {data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeDiplom)[0]?.men_student}
                                    </td>
                                    <td>
                                        {data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeDiplom)[0]?.women_student}
                                    </td>
                                <td>
                                    {data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeBakalavr)[0]?.all_student}
                                </td>
                                    <td>
                                        {data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeBakalavr)[0]?.men_student}
                                    </td>
                                    <td>
                                        {data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeBakalavr)[0]?.women_student}
                                    </td>
                                <td>
                                    {data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeMagistr)[0]?.all_student}
                                </td>
                                    <td>
                                        {data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeMagistr)[0]?.men_student}
                                    </td>
                                    <td>
                                        {data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeMagistr)[0]?.women_student}
                                    </td>
                                <td>
                                    {data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeDoctor)[0]?.all_student}
                                </td>
                                <td>
                                    {data?.age_list?.degree.filter((datz) => datz?.all_degree_code === degreeDoctor)[0]?.men_student}
                                </td>
                                <td>
                                    {data?.age_list?.degree.filter((datz) => datz?.all_degree_id === degreeDoctor)[0]?.women_student}
                                </td>


                            <td>{data?.range_age}</td>


                                {data?.age_list?.admission.map((dis, didx) => (
                                    <Fragment key={`age${didx}`}>
                                        <td>
                                            {dis?.all}
                                        </td>
                                        <td>
                                            {dis?.men}
                                        </td>
                                        <td>
                                            {dis?.women}
                                        </td>
                                    </Fragment>
                                ))}

                            </tr>
                        ))}
                    </tbody>
                </table>
                }
            </div>
    )
}

export default ADB8