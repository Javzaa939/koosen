import React, { Fragment, useContext, useEffect, useState } from "react";
import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";
import { Button, Spinner } from "reactstrap";
import { FileText } from 'react-feather'

import './style.scss'
import { utils, writeFile } from 'xlsx-js-style';
import ActiveYearContext from "@context/ActiveYearContext"


// Төрлийн дугаар
const degreeAll = 0
const degreeBakalavr = 'D'
const degreeMagistr = 'E'
const degreeDoctor = 'F'
const degreeDiplom = 'C'

// Хөгжлийн бэрхшээлийн төрлийн дугаар

const disAll = 0
const disHaraa = 1
const disSonsgol = 2
const disYria = 3
const disHudulguun = 4
const disSetgets = 5
const disHavsarsan = 6
const disBusad = 7

function ADB2(){

    const infoApi = useApi().stipend.information
    const { cyear_name } = useContext(ActiveYearContext)

	// // Loader
	const { Loader, isLoading, fetchData } = useLoader({ isSmall: true });

    // const [datas, setDatas] = useState(sample)
    const [localLoader, setLocal] = useState(true)
    const [datas, setDatas] = useState([])
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

    // Backees ирж байгаа датаг excel санд зориулж хөрвүүлэх функц
    function convert() {

            //A1 cell буюу хамгийн эхний нүдэнд гарчиг өгч буй хэсэг

            const headerCells = Array.from({length: 11 },(_, idx) => {
                return(
                    {
                        "Үзүүлэлт": "",
                        "": '',
                        " ": "",
                        "  ": "",
                        "   ": "",
                        "МД": idx === 2 ? 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН БАЙГУУЛЛАГАД СУРАЛЦАГЧДЫН СУРГАЛТЫН ТӨЛБӨРИЙН 20... / 20... ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ  ' : '',
                        "Нийт суралцагчид": '',
                            "Эрэгтэй0": '',
                            "Эмэгтэй0": '',
                        "Дипломын боловсрол	": '',
                            "Эрэгтэй1": "",
                            "Эмэгтэй1": '',
                        "Бакалаврын боловсрол": '',
                            "Эрэгтэй2": '',
                            "Эмэгтэй2": '',
                        "Магистрын боловсрол": '',
                            "Эрэгтэй3": '',
                            "Эмэгтэй3": '',
                        "Докторын боловсрол": '',
                            "Эрэгтэй4": '',
                            "Эмэгтэй4": '',
                        "Хөгжлийн бэрхшээлтэй суралцагчид": '',
                            "Эрэгтэй5": '',
                            "Эмэгтэй5": '',

                        "Үзүүлэлт2": '',
                        "МД2": '',
                        "Харааны": '',
                            "Эрэгтэй6": '',
                            "Эмэгтэй6": '',
                        "Сонсголын": '',
                            "Эрэгтэй7":'',
                            "Эмэгтэй7":'',

                        "Ярианы":'',
                            "Эрэгтэй8":'',
                            "Эмэгтэй8":'',

                        "Хөдөлгөөний": '',
                            "Эрэгтэй9":'',
                            "Эмэгтэй9":'',

                        "Сэтгэцийн": '',
                            "Эрэгтэй10": '',
                            "Эмэгтэй10":'',

                        "Хавсарсан": '',
                            "Эрэгтэй11":'',
                            "Эмэгтэй11":'',

                        "Бусад": '',

                            "Эрэгтэй12":'',
                            "Эмэгтэй12":'',
                    }
                )
            })

            // Баганы дугаарлалт
            const md = {
                            "Үзүүлэлт": "A",
                            "МД": 'Б',
                            "Нийт суралцагчид": 1,
                                "Эрэгтэй0": 2,
                                "Эмэгтэй0": 3,
                            "Дипломын боловсрол	": 4,
                                "Эрэгтэй1": 5,
                                "Эмэгтэй1": 6,
                            "Бакалаврын боловсрол": 7,
                                "Эрэгтэй2": 8,
                                "Эмэгтэй2": 9,
                            "Магистрын боловсрол": 10,
                                "Эрэгтэй3": 11,
                                "Эмэгтэй3": 12,
                            "Докторын боловсрол": 13,
                                "Эрэгтэй4": 14,
                                "Эмэгтэй4": 15,
                            "Хөгжлийн бэрхшээлтэй суралцагчид": 16,
                                "Эрэгтэй5": 17,
                                "Эмэгтэй5": 18,

                            "Үзүүлэлт2": 'А',
                            "МД2": 'Б',
                            "Харааны": 19,
                                "Эрэгтэй6": 20,
                                "Эмэгтэй6": 21,
                            "Сонсголын": 22,
                                "Эрэгтэй7": 23,
                                "Эмэгтэй7": 24,

                            "Ярианы":25,
                                "Эрэгтэй8":26,
                                "Эмэгтэй8":27,

                            "Хөдөлгөөний": 28,
                                "Эрэгтэй9":29,
                                "Эмэгтэй9":30,

                            "Сэтгэцийн": 31,
                                "Эрэгтэй10": 32,
                                "Эмэгтэй10": 33,

                            "Хавсарсан": 34,
                                "Эрэгтэй11": 35,
                                "Эмэгтэй11": 36,

                            "Бусад": 37,
                                "Эрэгтэй12": 38,
                                "Эмэгтэй12": 39,
                        }

                // Үндсэн датаний хэсэг
                const krSeason = datas.map((data,idx)=>{
                    return(
                        {

                            "Үзүүлэлт": data.pay_type,
                            "МД": idx + 1,
                            "Нийт суралцагчид": data.profesion.filter((data) => data.degree_id === degreeAll)[0].all_student,

                                "Эрэгтэй0": data.profesion.filter((data) => data.degree_id === degreeAll)[0].student_men,
                                "Эмэгтэй0": data.profesion.filter((data) => data.degree_id === degreeAll)[0].student_women,
                                // Ижил нэртэй object-ийг зай ашиглаж ялгах боломжтой
                                // Ойлгомжтой байх үүднээс ингэж өгч байгаа ба
                                // Файл гаргахын өмнөхөн Header-ийн нэрийг сольж байгаа
                            "Дипломын боловсрол	": data.profesion.filter((data) => data.degree_code === degreeDiplom)[0].all_student,
                                "Эрэгтэй1": data.profesion.filter((data) => data.degree_code === degreeDiplom)[0].student_men,
                                "Эмэгтэй1": data.profesion.filter((data) => data.degree_code === degreeDiplom)[0].student_women,
                            "Бакалаврын боловсрол": data.profesion.filter((data) => data.degree_code === degreeBakalavr)[0].all_student,
                                "Эрэгтэй2": data.profesion.filter((data) => data.degree_code === degreeBakalavr)[0].student_men,
                                "Эмэгтэй2": data.profesion.filter((data) => data.degree_code === degreeBakalavr)[0].student_women,
                            "Магистрын боловсрол": data.profesion.filter((data) => data.degree_code === degreeMagistr)[0].all_student,
                                "Эрэгтэй3": data.profesion.filter((data) => data.degree_code === degreeMagistr)[0].student_men,
                                "Эмэгтэй3": data.profesion.filter((data) => data.degree_code === degreeMagistr)[0].student_women,
                            "Докторын боловсрол": data.profesion.filter((data) => data.degree_code === degreeDoctor)[0].all_student,
                                "Эрэгтэй4": data.profesion.filter((data) => data.degree_code === degreeDoctor)[0].student_men,
                                "Эмэгтэй4": data.profesion.filter((data) => data.degree_code === degreeDoctor)[0].student_women,
                            "Хөгжлийн бэрхшээлтэй суралцагчид": data.disability.filter((data) => data.disability_type_id === disAll)[0].all_student,
                                "Эрэгтэй5": data.disability.filter((data) => data.disability_type_id === disAll)[0].student_men,
                                "Эмэгтэй5": data.disability.filter((data) => data.disability_type_id === disAll)[0].student_women,

                            "Үзүүлэлт2": data.pay_type,
                            "МД2": idx === 0 ? "Б" : idx,

                            "Харааны": data.disability.filter((data) => data.disability_type_id === disHaraa)[0].all_student,
                                "Эрэгтэй6":data.disability.filter((data) => data.disability_type_id === disHaraa)[0].student_men,
                                "Эмэгтэй6":data.disability.filter((data) => data.disability_type_id === disHaraa)[0].student_women,
                            "Сонсголын": data.disability.filter((data) => data.disability_type_id === disSonsgol)[0].all_student,
                                "Эрэгтэй7":data.disability.filter((data) => data.disability_type_id === disSonsgol)[0].student_men,
                                "Эмэгтэй7":data.disability.filter((data) => data.disability_type_id === disSonsgol)[0].student_women,

                            "Ярианы": data.disability.filter((data) => data.disability_type_id === disYria)[0].all_student,
                                "Эрэгтэй8": data.disability.filter((data) => data.disability_type_id === disYria)[0].student_men,
                                "Эмэгтэй8": data.disability.filter((data) => data.disability_type_id === disYria)[0].student_women,

                            "Хөдөлгөөний": data.disability.filter((data) => data.disability_type_id === disHudulguun)[0].all_student,
                                "Эрэгтэй9": data.disability.filter((data) => data.disability_type_id === disHudulguun)[0].student_men,
                                "Эмэгтэй9": data.disability.filter((data) => data.disability_type_id === disHudulguun)[0].student_women,

                            "Сэтгэцийн": data.disability.filter((data) => data.disability_type_id === disSetgets)[0].all_student,
                                "Эрэгтэй10": data.disability.filter((data) => data.disability_type_id === disSetgets)[0].student_men,
                                "Эмэгтэй10": data.disability.filter((data) => data.disability_type_id === disSetgets)[0].student_women,

                            "Хавсарсан": data.disability.filter((data) => data.disability_type_id === disHavsarsan)[0].all_student,
                                "Эрэгтэй11": data.disability.filter((data) => data.disability_type_id === disHavsarsan)[0].student_men,
                                "Эмэгтэй11": data.disability.filter((data) => data.disability_type_id === disHavsarsan)[0].student_women,

                            "Бусад": data.disability.filter((data) => data.disability_type_id === disBusad)[0].all_student,
                                "Эрэгтэй12": data.disability.filter((data) => data.disability_type_id === disBusad)[0].student_men,
                                "Эмэгтэй12": data.disability.filter((data) => data.disability_type_id === disBusad)[0].student_women,

                        }
                    )
                })

            //Хүснэгтийн доор багахан зай гаргаж гарын үсэг г.м зурах зай үлдээх
            const footerCells = Array.from({length: 11 },(_, idx) => {
                return(
                    {
                        "Үзүүлэлт": "",
                        "": '',
                        " ": "",
                        "  ": "",
                        "   ": "",
                        "МД": '',
                        "Нийт суралцагчид": '',
                            "Эрэгтэй0": '',
                            "Эмэгтэй0": '',
                        "Дипломын боловсрол	": '',
                            "Эрэгтэй1": "",
                            "Эмэгтэй1": '',
                        "Бакалаврын боловсрол": '',
                            "Эрэгтэй2": '',
                            "Эмэгтэй2": '',
                        "Магистрын боловсрол": '',
                            "Эрэгтэй3": '',
                            "Эмэгтэй3": '',
                        "Докторын боловсрол": '',
                            "Эрэгтэй4": '',
                            "Эмэгтэй4": '',
                        "Хөгжлийн бэрхшээлтэй суралцагчид": '',
                            "Эрэгтэй5": '',
                            "Эмэгтэй5": '',

                        "Үзүүлэлт2": '',
                        "МД2": '',
                        "Харааны": '',
                            "Эрэгтэй6": '',
                            "Эмэгтэй6": '',
                        "Сонсголын": '',
                            "Эрэгтэй7":'',
                            "Эмэгтэй7":'',

                        "Ярианы":'',
                            "Эрэгтэй8":'',
                            "Эмэгтэй8":'',

                        "Хөдөлгөөний": '',
                            "Эрэгтэй9":'',
                            "Эмэгтэй9":'',

                        "Сэтгэцийн": '',
                            "Эрэгтэй10": '',
                            "Эмэгтэй10":'',

                        "Хавсарсан": '',
                            "Эрэгтэй11":'',
                            "Эмэгтэй11":'',

                        "Бусад": '',

                            "Эрэгтэй12":'',
                            "Эмэгтэй12":'',
                    }
                )
            })

            // Бүх мөрийн array ийг нэг array дотор нэгтгэсэн нь
                const combo = [...headerCells, md, ...krSeason, ...footerCells]



            const worksheet = utils.json_to_sheet(combo);
            const workbook = utils.book_new();
            // const workbook = XLSX.read(maygt, { type: 'binary' });

            utils.book_append_sheet(workbook, worksheet, "A-DB-2-Report");

            // Хүснэгтийн толгойнууд буюу эхний мөрийн текстүүд
                const staticCells = [
                    "Үзүүлэлт",
                    "МД",
                    " Нийт суралцагчид",
                        " Эрэгтэй",
                        " Эмэгтэй",
                    " Дипломын боловсрол",
                        " Эрэгтэй",
                        " Эмэгтэй",
                    " Бакалаврын боловсрол",
                        " Эрэгтэй",
                        " Эмэгтэй",
                    " Магистрын боловсрол",
                        " Эрэгтэй",
                        " Эмэгтэй",
                    " Докторын боловсрол",
                        " Эрэгтэй",
                        " Эмэгтэй",
                    " Хөгжлийн бэрхшээлтэй суралцагчид",
                        " Эрэгтэй",
                        " Эмэгтэй",
                    "Үзүүлэлт",
                    "МД",
                    " Харааны",
                        " Эрэгтэй",
                        " Эмэгтэй",
                    " Сонсголын",
                        " Эрэгтэй",
                        " Эмэгтэй",

                    " Ярианы",
                        " Эрэгтэй",
                        " Эмэгтэй",

                    " Хөдөлгөөний",
                        " Эрэгтэй",
                        " Эмэгтэй",

                    " Сэтгэцийн",
                        " Эрэгтэй",
                        " Эмэгтэй",

                    " Хавсарсан",
                        " Эрэгтэй",
                        " Эмэгтэй",

                    " Бусад",
                        " Эрэгтэй",
                        " Эмэгтэй",

                ];

                // Дээрхи гарчигуудийг тодорхой нүдэнд тогтоож тавьж байгаа нь
                // Эхний нүдийг нь тааруулж тавихад үлдсэн нь араас нь ороод ирнэ

                // utils.sheet_add_aoa(worksheet, [headerCells], { origin: "A1" });
                utils.sheet_add_aoa(worksheet, [staticCells], { origin: "E12" });




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
                            }
                        }

                        const allBordersStyle = {
                            border: {
                                top: { style: "thin", color: { rgb: "000000" } },
                                bottom: { style: "thin", color: { rgb: "000000" } },
                                left: { style: "thin", color: { rgb: "000000" } },
                                right: { style: "thin", color: { rgb: "000000" } }

                            },
                            alignment: {
                                vertical: 'center',
                            },
                            font:{
                                sz:10
                            }
                        };

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
                                // wrapText: true
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

                        const heightBoost = {
                            border: {
                                top: { style: "thin", color: { rgb: "000000" } },
                                bottom: { style: "thin", color: { rgb: "000000" } },
                                left: { style: "thin", color: { rgb: "000000" } },
                                right: { style: "thin", color: { rgb: "000000" } },
                                wrapText: true
                            },
                            innerHeight: 150

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
                                sz: 10,
                                italic: true
                            }

                        };

                        const headerStyle = {
                            font: {
                                bold: true
                            }

                        };

// Толгой хэсэгт стайл болон Текст өгж буй хэсэг
                const startRow = 0;
                const endRow = 8;
                const startCol = 0;
                const endCol = 46;

                for (let row = startRow; row <= endRow; row++) {
                    for (let col = startCol; col <= endCol; col++) {
                      const cellAddress = utils.encode_cell({ r: row, c: col });

                        if (!worksheet[cellAddress]) {
                            worksheet[cellAddress] = {};
                        }

                    //   worksheet[cellAddress].s = (row === 0 && col !== 0 && col !== 1 && col !== 20 && col !== 21) ? rotatedTextStyle : col === 0 ? allBordersStyle : numberCellStyle;
                    //   worksheet[cellAddress].s = (row === 0 && col !== 0 && col !== 1 && col !== 20 && col !== 21) ? rotatedTextStyle : col === 0 ? allBordersStyle : numberCellStyle;

                        worksheet[cellAddress].s = row === 8 ? bottomBorder : textCellStyle
                        worksheet[cellAddress].v = (row === 0 && col === 0) ?
                                'Үндэсний статистикийн хорооны даргын 20. . . оны . . . сарын . . .  -ны өдрийн . . . дугаар тушаалаар батлав.'
                            : (row === 2 && col === 6 ) ? cyear_name ? 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН БАЙГУУЛЛАГАД СУРАЛЦАГЧДЫН СУРГАЛТЫН ТӨЛБӨРИЙН' + ' '+  cyear_name.replace('-', '/') + ' ' + 'ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ'
                                    : 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН БАЙГУУЛЛАГАД СУРАЛЦАГЧДЫН СУРГАЛТЫН ТӨЛБӨРИЙН 20... / 20... ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ'
                                : ''
                    }
                }
                // { s: { r: 3, c: 7 }, e: { r: 3, c: 20 } }

                // const nrow = 9;
                // const nendrow = ;
                // const ncol = 0;
                // const nendcol = 46;

                // for (let row = nrow; row <= nendrow; row++) {
                //     for (let col = ncol; col <= nendcol; col++) {
                //       const cellAddress = utils.encode_cell({ r: row, c: col });

                //         if (!worksheet[cellAddress]) {
                //             worksheet[cellAddress] = {};
                //         }

                //     //   worksheet[cellAddress].s = (row === 0 && col !== 0 && col !== 1 && col !== 20 && col !== 21) ? rotatedTextStyle : col === 0 ? allBordersStyle : numberCellStyle;
                //     //   worksheet[cellAddress].s = (row === 0 && col !== 0 && col !== 1 && col !== 20 && col !== 21) ? rotatedTextStyle : col === 0 ? allBordersStyle : numberCellStyle;
                //       worksheet[cellAddress].s = textCellStyle
                //       worksheet[cellAddress].v = (row === 0 && col === 0) ?
                //             'Үндэсний статистикийн хорооны даргын 20. . . оны . . . сарын . . .  -ны өдрийн . . . дугаар тушаалаар батлав.'
                //         : (row === 2 && col === 6 ) ? 'ДЭЭД БОЛОВСРОЛЫН СУРГАЛТЫН БАЙГУУЛЛАГАД СУРАЛЦАГЧДЫН СУРГАЛТЫН ТӨЛБӨРИЙН 20... / 20... ОНЫ ХИЧЭЭЛИЙН ЖИЛИЙН МЭДЭЭ'
                //             : ''
                //     }
                // }

// Хүснэгтийн стайл

                const styleRow = 11;
                const sendRow = 21;
                const styleCol = 0;
                const sendCol = 46;


                for (let row = styleRow; row <= sendRow; row++) {
                    for (let col = styleCol; col <= sendCol; col++) {
                      const cellNum = utils.encode_cell({ r: row, c: col });

                        if (!worksheet[cellNum]) {
                            worksheet[cellNum] = {};
                        }

                    //   worksheet[cellNum].s = (row === 0 && col !== 0 && col !== 1 && col !== 20 && col !== 21) ? rotatedTextStyle : col === 0 ? allBordersStyle : numberCellStyle;
                      worksheet[cellNum].s = (row === 11 && col !== 4 && col !== 5 && col !== 24 && col !== 25) ? rotatedTextStyle : numberCellStyle;
                    }
                }


// Хүснэгтийн доод хэсгийн стайл
                const footerRow = 22;
                const fendRow = 30;
                const footerCol = 0;
                const fendCol = 46;

                for (let row = footerRow; row <= fendRow; row++) {
                    for (let col = footerCol; col <= fendCol; col++) {
                      const cellAddress = utils.encode_cell({ r: row, c: col });

                        if (!worksheet[cellAddress]) {
                            worksheet[cellAddress] = {};
                        }

                    //   worksheet[cellAddress].s = (row === 0 && col !== 0 && col !== 1 && col !== 20 && col !== 21) ? rotatedTextStyle : col === 0 ? allBordersStyle : numberCellStyle;
                    //   worksheet[cellAddress].s = (row === 0 && col !== 0 && col !== 1 && col !== 20 && col !== 21) ? rotatedTextStyle : col === 0 ? allBordersStyle : numberCellStyle;
                    worksheet[cellAddress].s = row === 22 ? footerBorder : textCellStyle
                    worksheet[cellAddress].v = (row === 22 && col === 0) ?
                            'Балансын шалгалт:'
                        : (row === 22 && col === 6 ) ? 'Багана: 1=(2+3)=(4+7+10+13), 4=(5+6), 7=(8+9), 10=(11+12), 13=(14+15), 16=(17+18)=(19+22+25+28+31+34+37); '
                            : (row === 23 && col === 6 ) ? 'Мөр: 1=(2÷8);'
                            // Цэгцгүй бичсэнд уучлаарай :')
                                : (row === 23 && col === 25 ) ? 'Баталгаажуулсан:'
                                : (row === 26 && col === 25 ) ? 'Хянасан:'
                                : (row === 29 && col === 25 ) ? 'Мэдээ гаргасан:'
                                    : (row === 23 && col === 30 ) ? '.............................'
                                    : (row === 26 && col === 30 ) ? '.............................'
                                    : (row === 29 && col === 30 ) ? '.............................'
                                        : (row === 24 && col === 30 ) ? '/Албан тушаал/'
                                        : (row === 27 && col === 30 ) ? '/Албан тушаал/'
                                        : (row === 30 && col === 30 ) ? '/Албан тушаал/'
                                            : (row === 23 && col === 34 ) ? '.............................'
                                            : (row === 26 && col === 34 ) ? '.............................'
                                            : (row === 29 && col === 34 ) ? '.............................'
                                                : (row === 24 && col === 34 ) ? '/Нэр/'
                                                : (row === 27 && col === 34 ) ? '/Нэр/'
                                                : (row === 30 && col === 34 ) ? '/Нэр/'
                                                    : (row === 23 && col === 38 ) ? '.............................'
                                                    : (row === 26 && col === 38 ) ? '.............................'
                                                    : (row === 29 && col === 38 ) ? '.............................'
                                                        : (row === 24 && col === 38 ) ? '/Гарын үсэг/'
                                                        : (row === 27 && col === 38 ) ? '/Гарын үсэг/'
                                                        : (row === 30 && col === 38 ) ? '/Гарын үсэг/'
                                                            : ''

                    }
                }

                const nullCell1 = {
                    border: {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "ffffff" } },
                        right: { style: "thin", color: { rgb: "ffffff" } }}
                }

                const nullCell2 = {
                    border: {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "ffffff" } },
                        right: { style: "thin", color: { rgb: "000000" } }}
                }


    // Хүснэгтийн утга ### гэж гарч ирвэл тухайн хүснэгтийн өргөн нь багадсан гэсэн үг.
    // Хэрэв өргөжүүлэхийг хүсвэл доорхи код доторхи wch-ийг нэг нэгээр нэмж тестлээрэй

            const phaseZeroCells = Array.from({length: 4 },(_) => { return ({wch: 0})})
            const phaseOneCells = Array.from({length: 19 },(_) => { return ({wch: 4})})
            const phaseTwoCells = Array.from({length: 20 },(_) => { return ({wch: 4})})

            worksheet["!cols"] = [ ...phaseZeroCells,{ wch: 50 }, ...phaseOneCells, {wch: 50}, ...phaseTwoCells ];
            // worksheet["!cols"] = [ { wch: 50 }, ...phaseOneCells, {wch: 50}, ...phaseTwoCells ];

            worksheet['A1'].s = { alignment: { wrapText: true }, font: { sz: 8 }, border: {top: { style: "thin", color: { rgb: "ffffff" } },bottom: { style: "thin", color: { rgb: "ffffff" } },left: { style: "thin", color: { rgb: "ffffff" } },right: { style: "thin", color: { rgb: "ffffff" } }}};
            worksheet['A10'] = {v:'Үзүүлэлт', s:{ alignment:{ horizontal: 'center', vertical: 'center'}, border: {top: { style: "thin", color: { rgb: "000000" } },bottom: { style: "thin", color: { rgb: "000000" } },left: { style: "thin", color: { rgb: "000000" } },right: { style: "thin", color: { rgb: "000000" } }}}}
            worksheet['G3'].s = headerStyle

// Хүснэгтийн дээд талын
            worksheet['F10'] = {v: 'МД', s: allBordersStyle}
            worksheet['Z10'] = {v: 'МД', s: allBordersStyle}
            worksheet['G10'] = {v: 'Нийт суралцагчид', s: rotatedTextStyle}
            worksheet['V10'] = {v: 'Хөгжлийн бэрхшээлтэй суралцагчид', s: rotatedBorderFix}
            worksheet['Y10'] = {v: 'Үзүүлэлт', s: { alignment:{ vertical: 'center', horizontal: 'center'} }}
            worksheet['A9'].v = 'А.Үндсэн мэдээлэл'
            worksheet['X9'].v = '/Тоо/'
            worksheet['H10'].s = {border: {top: { style: "thin", color: { rgb: "000000" } },bottom: { style: "thin", color: { rgb: "000000" } },left: { style: "thin", color: { rgb: "ffffff" } },right: { style: "thin", color: { rgb: "ffffff" } }}}
            worksheet['K11'].s = nullCell1
            worksheet['L11'].s = nullCell2
            worksheet['N11'].s = nullCell1
            worksheet['O11'].s = nullCell2
            worksheet['Q11'].s = nullCell1
            worksheet['R11'].s = nullCell2
            worksheet['T11'].s = nullCell1
            worksheet['U11'].s = nullCell2
            worksheet['W10'].s = nullCell1
            worksheet['X10'].s = nullCell2
            // worksheet['H10'] = {s: { border: {bottom: { style: "thin", color: { rgb: "000000" } }} }}
            worksheet['H11'] = {v: 'Эрэгтэй', s: rotatedTextStyle}
            worksheet['I11'] = {v: 'Эмэгтэй', s: rotatedTextStyle}
            worksheet['J11'] = {v: 'Дипломын боловсрол', s: rotatedBorderFix}
            worksheet['M11'] = {v: 'Бакалаврын боловсрол', s: rotatedBorderFix}
            worksheet['P11'] = {v: 'Магистрын боловсрол', s: rotatedBorderFix}
            worksheet['S11'] = {v: 'Докторын боловсрол', s: rotatedBorderFix}
            worksheet['W11'] = {v: 'Эрэгтэй', s: rotatedTextStyle}
            worksheet['X11'] = {v: 'Эмэгтэй', s: rotatedTextStyle}


            // subheader
            worksheet['AA10'] = {v: 'Хөгжлийн бэрхшээлийн хэлбэр', s: { alignment:{ horizontal: 'center', vertical: 'center'}, border: {top: { style: "thin", color: { rgb: "000000" } },bottom: { style: "thin", color: { rgb: "000000" } },left: { style: "thin", color: { rgb: "000000" } },right: { style: "thin", color: { rgb: "000000" }}}}}
            worksheet['AA11'] = {v: 'Харааны', s: rotatedBorderFix}
            worksheet['AD11'] = {v: 'Сонсголын', s: rotatedBorderFix}
            worksheet['AG11'] = {v: 'Ярианы', s: rotatedBorderFix}
            worksheet['AJ11'] = {v: 'Хөдөлгөөний', s: rotatedBorderFix}
            worksheet['AM11'] = {v: 'Сэтгэцийн', s: rotatedBorderFix}
            worksheet['AP11'] = {v: 'Хавсарсан', s: rotatedBorderFix}
            worksheet['AS11'] = {v: 'Бусад', s: rotatedBorderFix}
            worksheet['AB11'].s = nullCell1
            worksheet['AC11'].s = nullCell2
            worksheet['AE11'].s = nullCell1
            worksheet['AF11'].s = nullCell2
            worksheet['AH11'].s = nullCell1
            worksheet['AI11'].s = nullCell2
            worksheet['AK11'].s = nullCell1
            worksheet['AL11'].s = nullCell2
            worksheet['AN11'].s = nullCell1
            worksheet['AO11'].s = nullCell2
            worksheet['AQ11'].s = nullCell1
            worksheet['AR11'].s = nullCell2
            worksheet['AT11'].s = nullCell1
            worksheet['AU11'].s = nullCell2
            // worksheet['AV10'] = { v: 'test',s: { border: {top: { style: "thin", color: { rgb: "ffffff" } },bottom: { style: "thin", color: { rgb: "ffffff" } },left: { style: "thin", color: { rgb: "000000" } },right: { style: "thin", color: { rgb: "ffffff" }}} }}

            // Хүснэгт нэгтгэх хэсэг
            const mergeCells = Array.from({length: 34 },(_, idx) => { return (
                {
                    s: { r: (idx === 9 || idx === 10 || idx === 11) ? null : idx, c: 0 },
                    // s: { r: idx === 9 || 10 || 11 ? null : idx, c: idx === 9 || 10 || 11 ? null : 0 },
                    e: { r: (idx === 9 || idx === 10 || idx === 11) ? null : idx, c: 4 }
                    // e: { r: idx === 9 || 10 || 11 ? null : idx, c: idx === 9 || 10 || 11 ? null : 4 }

                })})

            const mergePOne = [

                { s: { r: 9, c: 5 }, e: { r: 11, c: 5 } },
                { s: { r: 9, c: 6 }, e: { r: 11, c: 6 } },
                { s: { r: 9, c: 21 }, e: { r: 11, c: 21 }},
                { s: { r: 9, c: 24 }, e: { r: 11, c: 24 }},
                { s: { r: 9, c: 26 }, e: { r: 9, c: 46 }}, //
                { s: { r: 9, c: 25 }, e: { r: 11, c: 25 } },
                { s: { r: 9, c: 7 }, e: { r: 9, c: 20 } }, // ehnii phase hundlun header merge
            ]

                const mergePTwo = [
                    { s: { r: 10, c: 7 }, e: { r: 11, c: 7 } },
                    { s: { r: 10, c: 8 }, e: { r: 11, c: 8 } },
                    { s: { r: 10, c: 9 }, e: { r: 11, c: 9 } },
                    { s: { r: 10, c: 12 }, e: { r: 11, c: 12 } },
                    { s: { r: 10, c: 15 }, e: { r: 11, c: 15 } },
                    { s: { r: 10, c: 18 }, e: { r: 11, c: 18 } },
                    { s: { r: 10, c: 22 }, e: { r: 11, c: 22 } },
                    { s: { r: 10, c: 23 }, e: { r: 11, c: 23 } },
                    { s: { r: 10, c: 26 }, e: { r: 11, c: 26 } },
                    { s: { r: 10, c: 29 }, e: { r: 11, c: 29 } },
                    { s: { r: 10, c: 32 }, e: { r: 11, c: 32 } },
                    { s: { r: 10, c: 35 }, e: { r: 11, c: 35 } },
                    { s: { r: 10, c: 38 }, e: { r: 11, c: 38 } },
                    { s: { r: 10, c: 41 }, e: { r: 11, c: 41 } },
                    { s: { r: 10, c: 44 }, e: { r: 11, c: 44 } },
            ]


            // const mergePone = Array.from({length: 10 },(_, idx) => { return ({ s: { r: 9, c: idx + 5 }, e: { r: 11, c: idx + 5 } })})
            // const mergeHeader = Array.from({length: 20 },(_, idx) => { return ({ s: { r: 9, c: idx + 5 }, e: { r: 11, c: idx + 5 } })})
            // const mergeHeader = Array.from({length: 20 },(_, idx) => { return ({ s: { r: 9, c: idx + 5 }, e: { r: 11, c: idx + 5 } })})
            // const mergeHeader = Array.from({length: 20 },(_, idx) => { return ({ s: { r: 9, c: idx + 5 }, e: { r: 11, c: idx + 5 } })})

            const footerMerge = [
                { s: { r: 24, c: 16 }, e: { r: 24, c: 20 } },
                { s: { r: 26, c: 16 }, e: { r: 26, c: 20 } },
                { s: { r: 28, c: 16 }, e: { r: 28, c: 20 } },
                { s: { r: 22, c: 6 }, e: { r: 22, c: 23 } },
                { s: { r: 23, c: 6 }, e: { r: 23, c: 9 } },

                // Баталгаажуулсан
                { s: { r: 23, c: 25 }, e: { r: 23, c: 29 } },

                // Хянасан
                { s: { r: 26, c: 25 }, e: { r: 26, c: 29 } },

                // Мэдээ гаргасан
                { s: { r: 29, c: 25 }, e: { r: 29, c: 29 } },


                // ......................
                { s: { r: 23, c: 30 }, e: { r: 23, c: 33 } },
                { s: { r: 26, c: 30 }, e: { r: 26, c: 33 } },
                { s: { r: 29, c: 30 }, e: { r: 29, c: 33 } },

                { s: { r: 23, c: 34 }, e: { r: 23, c: 37 } },
                { s: { r: 26, c: 34 }, e: { r: 26, c: 37 } },
                { s: { r: 29, c: 34 }, e: { r: 29, c: 37 } },

                { s: { r: 23, c: 38 }, e: { r: 23, c: 41 } },
                { s: { r: 26, c: 38 }, e: { r: 26, c: 41 } },
                { s: { r: 29, c: 38 }, e: { r: 29, c: 41 } },


                // Албан тушаал
                { s: { r: 24, c: 30 }, e: { r: 24, c: 33 } },
                { s: { r: 27, c: 30 }, e: { r: 27, c: 33 } },
                { s: { r: 30, c: 30 }, e: { r: 30, c: 33 } },

                // Нэр
                { s: { r: 24, c: 34 }, e: { r: 24, c: 37 } },
                { s: { r: 27, c: 34 }, e: { r: 27, c: 37 } },
                { s: { r: 30, c: 34 }, e: { r: 30, c: 37 } },

                // Гарын үсэг
                { s: { r: 24, c: 38 }, e: { r: 24, c: 41 } },
                { s: { r: 27, c: 38 }, e: { r: 27, c: 41 } },
                { s: { r: 30, c: 38 }, e: { r: 30, c: 41 } },
            ]

            const headTitleMerge = { s: { r: 2, c: 6 }, e: { r: 2, c: 26 } }

            worksheet['!merges'] = [...mergeCells, headTitleMerge,{ s: { r: 9, c: 0 }, e: { r: 11, c: 4 } }, ...mergePTwo, ...mergePOne, ...footerMerge];
            // worksheet['!merges'] = [...mergeCells, headTitleMerge,{ s: { r: 9, c: 0 }, e: { r: 11, c: 4 } }, ...mergeHeader, ...footerMerge];


// Хүснэгтэд өндөр буюу height өгж буй хэсэг
            const phaseOneRow = Array.from({length: 2 },(_, idx) => { return ({ hpx: idx === 0 ? 20 : 0 })})
            const phaseTwoRow = Array.from({length: 7 },(_, idx) => { return ({ hpx: 0 })})

            worksheet["!rows"] = [ ...phaseOneRow, { hpx: 20 }, ...phaseTwoRow, {hpx:20},{ hpx: 120, level: 1 } ];
            // worksheet["!rows"] = [ ...phaseOneRow, { hpx: 40 }, { hpx: 20 },  { hpx: 20 },  { hpx: 20 }, { hpx: 20 }, { hpx: 20 }, { hpx: 20 },{ hpx: 20 }, { hpx: 20 },{ hpx: 150, level: 1 } ];

            worksheet['!margins'] = { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };
            worksheet['!pageSetup'] = { scale: '100', orientation: 'landscape' }
            writeFile(workbook, "A-DB-2.xlsx", { compression: true });

    }

    return(
        <div className="overflow-auto tabscroll pb-2">
            <div className="d-flex justify-content-end position-fixed">
                {/* <Button color="primary" className="mb-2 p-75" disabled={false} onClick={() => {convert()}}> */}
                <Button color="primary" className="mb-2 p-75" disabled={localLoader || isLoading} onClick={() => {convert()}}>
                    <FileText size={18} /> Excel татах
                </Button>
            </div>

            {localLoader || isLoading ?
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
                        {Loader}
                        {/* <Spinner/> */}
                    </div>
                :
                    <table className="mt-5">
                        <thead>
                            <tr>
                                {/* {datas.map((data,id) => (
                                    data.all_data.map((data, idx) =>
                                    {
                                        console.log(data,'data')

                                    return(<th>ner</th>)})
                                ))} */}
                                <th>
                                    Үзүүлэлт
                                </th>
                                {/* {datas[0].all_data[0].pay_type_name} */}
                                <th className="">МД</th>
                                <th className="th-rotate">Нийт суралцагчид</th>
                                    <th className="th-rotate gender">
                                        Эрэгтэй
                                    </th>
                                    <th className="th-rotate gender">
                                        Эмэгтэй
                                    </th>
                                <th className="th-rotate">Дипломын боловсрол</th>
                                    <th className="th-rotate gender">Эрэгтэй</th>
                                    <th className="th-rotate gender">Эмэгтэй</th>
                                <th className="th-rotate">Бакалаврын боловсрол</th>
                                    <th className="th-rotate gender">Эрэгтэй</th>
                                    <th className="th-rotate gender">Эмэгтэй</th>
                                <th className="th-rotate">Магистрын боловсрол</th>
                                    <th className="th-rotate gender">Эрэгтэй</th>
                                    <th className="th-rotate gender">Эмэгтэй</th>
                                <th className="th-rotate">Докторын боловсрол</th>
                                    <th className="th-rotate gender">Эрэгтэй</th>
                                    <th className="th-rotate gender">Эмэгтэй</th>
                                <th className="th-rotate text-wrap">Хөгжлийн бэрхшээлтэй суралцагчид</th>
                                    <th className="th-rotate gender">Эрэгтэй</th>
                                    <th className="th-rotate gender">Эмэгтэй</th>
                                <th>Үзүүлэлт</th>
                                <th>МД</th>

                                <th className="th-rotate">Харааны</th>
                                    <th className="th-rotate gender">Эрэгтэй</th>
                                    <th className="th-rotate gender">Эмэгтэй</th>
                                <th className="th-rotate">Сонсголын</th>
                                    <th className="th-rotate gender">Эрэгтэй</th>
                                    <th className="th-rotate gender">Эмэгтэй</th>
                                <th className="th-rotate">Ярианы</th>
                                    <th className="th-rotate gender">Эрэгтэй</th>
                                    <th className="th-rotate gender">Эмэгтэй</th>
                                <th className="th-rotate">Хөдөлгөөний</th>
                                    <th className="th-rotate gender">Эрэгтэй</th>
                                    <th className="th-rotate gender">Эмэгтэй</th>
                                <th className="th-rotate">Сэтгэцийн</th>
                                    <th className="th-rotate gender">Эрэгтэй</th>
                                    <th className="th-rotate gender">Эмэгтэй</th>
                                <th className="th-rotate">Хавсарсан</th>
                                    <th className="th-rotate gender">Эрэгтэй</th>
                                    <th className="th-rotate gender">Эмэгтэй</th>
                                <th className="th-rotate">Бусад</th>


                                {/* <tr>
                                    <th colSpan='19' className="text-center">Хөгжлийн бэрхшээлийн хэлбэр</th>
                                </tr>
                                <tr>
                                    <th className="th-rotate">Харааны</th>
                                        <th className="th-rotate gender">Эрэгтэй</th>
                                        <th className="th-rotate gender">Эмэгтэй</th>
                                    <th className="th-rotate">Сонсголын</th>
                                        <th className="th-rotate gender">Эрэгтэй</th>
                                        <th className="th-rotate gender">Эмэгтэй</th>
                                    <th className="th-rotate">Ярианы</th>
                                        <th className="th-rotate gender">Эрэгтэй</th>
                                        <th className="th-rotate gender">Эмэгтэй</th>
                                    <th className="th-rotate">Хөдөлгөөний</th>
                                        <th className="th-rotate gender">Эрэгтэй</th>
                                        <th className="th-rotate gender">Эмэгтэй</th>
                                    <th className="th-rotate">Сэтгэцийн</th>
                                        <th className="th-rotate gender">Эрэгтэй</th>
                                        <th className="th-rotate gender">Эмэгтэй</th>
                                    <th className="th-rotate">Хавсарсан</th>
                                        <th className="th-rotate gender">Эрэгтэй</th>
                                        <th className="th-rotate gender">Эмэгтэй</th>
                                    <th className="th-rotate">Бусад</th>

                                </tr> */}
                            </tr>
                        </thead>
                        <tbody>
                            {datas.map((data,idx) => (
                                <tr key={`mainData${idx}`}>
                                    <td style={{ minWidth: 200 }}>
                                        {data?.pay_type}
                                    </td>
                                    <td>
                                        {data.pay_type_id === 0 ? 'Б' : data.pay_type_id}
                                    </td>
                                    {/*
                                    {data.profesion.map((prof, pidx) => {
                                        console.log(prof)
                                        return(
                                            <Fragment key={`profess${pidx}`}>
                                                <td>
                                                    {prof.all_student}
                                                </td>
                                                <td>
                                                    {prof.student_men}
                                                </td>
                                                <td>
                                                    {prof.student_women}
                                                </td>
                                            </Fragment>
                                        )})
                                    } */}

                        {/* Нийт оюутны тоо */}
                                    {/* <td>
                                        {data.profesion.filter((data) => data.degree_id === degreeAll)[0].all_student}
                                    </td>
                                    <td>
                                        {data.profesion.filter((data) => data.degree_id === degreeAll)[0].student_men}
                                    </td>
                                    <td>
                                        {data.profesion.filter((data) => data.degree_id === degreeAll)[0].student_women}
                                    </td> */}

                            {/* Дипломын боловсролд хамрагдах оюутны тоо */}
                                    {/* <td>
                                        {data.profesion.filter((data) => data.degree_code === degreeDiplom)[0].all_student}
                                    </td>
                                    <td>
                                        {data.profesion.filter((data) => data.degree_code === degreeDiplom)[0].student_men}
                                    </td>
                                    <td>
                                        {data.profesion.filter((data) => data.degree_code === degreeDiplom)[0].student_women}
                                    </td> */}


                            {/* Бакалаврын боловсролд хамрагдах оюутны тоо */}
                                    {/* <td>
                                        {data.profesion.filter((data) => data.degree_code === degreeBakalavr)[0].all_student}
                                    </td>
                                    <td>
                                        {data.profesion.filter((data) => data.degree_code === degreeBakalavr)[0].student_men}
                                    </td>
                                    <td>
                                        {data.profesion.filter((data) => data.degree_code === degreeBakalavr)[0].student_women}
                                    </td> */}


                            {/* Магистрын боловсролд хамрагдах оюутны тоо */}
                                    {/* <td>
                                        {data.profesion.filter((data) => data.degree_code === degreeMagistr)[0].all_student}
                                    </td>
                                    <td>
                                        {data.profesion.filter((data) => data.degree_code === degreeMagistr)[0].student_men}
                                    </td>
                                    <td>
                                        {data.profesion.filter((data) => data.degree_code === degreeMagistr)[0].student_women}
                                    </td> */}


                            {/* Докторын боловсролд хамрагдах оюутны тоо */}
                                    {/* <td>
                                        {data.profesion.filter((data) => data.degree_code === degreeDoctor)[0].all_student}
                                    </td>
                                    <td>
                                        {data.profesion.filter((data) => data.degree_code === degreeDoctor)[0].student_men}
                                    </td>
                                    <td>
                                        {data.profesion.filter((data) => data.degree_code === degreeDoctor)[0].student_women}
                                    </td> */}

                            {/* Нийт хөгжлийн бэрхшээлтэй оюутны тоо */}
                                            {/* <td>
                                                {data.disability.filter((data) => data.disability_type_id === disAll)[0].all_student}
                                            </td>
                                            <td>
                                                {data.disability.filter((data) => data.disability_type_id === disAll)[0].student_men}
                                            </td>
                                            <td>
                                                {data.disability.filter((data) => data.disability_type_id === disAll)[0].student_women}
                                            </td> */}

                        {/* Үзүүлэлт */}
                    <td style={{ minWidth: 200 }}>
                        {data?.pay_type}
                    </td>
                    <td>
                        {data.pay_type_id === 0 ? 'Б' : data.pay_type_id}
                    </td>

                                        {/* Харааны бэрхшээлтэй оюутны тоо */}

                                                {/* <td>{data.disability.filter((data) => data.disability_type_id === disHaraa)[0].all_student}</td>
                                                <td>{data.disability.filter((data) => data.disability_type_id === disHaraa)[0].student_men}</td>
                                                <td>{data.disability.filter((data) => data.disability_type_id === disHaraa)[0].student_women}</td> */}

                                        {/* Сонсголын бэрхшээлтэй оюутны тоо */}

                                                {/* <td>{data.disability.filter((data) => data.disability_type_id === disSonsgol)[0].all_student}</td>
                                                <td>{data.disability.filter((data) => data.disability_type_id === disSonsgol)[0].student_men}</td>
                                                <td>{data.disability.filter((data) => data.disability_type_id === disSonsgol)[0].student_women}</td> */}

                                        {/* Ярианы бэрхшээлтэй оюутны тоо */}

                                                {/* <td>{data.disability.filter((data) => data.disability_type_id === disYria)[0].all_student}</td>
                                                <td>{data.disability.filter((data) => data.disability_type_id === disYria)[0].student_men}</td>
                                                <td>{data.disability.filter((data) => data.disability_type_id === disYria)[0].student_women}</td> */}

                                        {/* Хөдөлгөөний бэрхшээлтэй оюутны тоо */}
                                                {/* <td>{data.disability.filter((data) => data.disability_type_id === disHudulguun)[0].all_student}</td>
                                                <td>{data.disability.filter((data) => data.disability_type_id === disHudulguun)[0].student_men}</td>
                                                <td>{data.disability.filter((data) => data.disability_type_id === disHudulguun)[0].student_women}</td> */}


                                        {/* Сэтгэцийн бэрхшээлтэй оюутны тоо */}

                                                {/* <td>{data.disability.filter((data) => data.disability_type_id === disSetgets)[0].all_student}</td>
                                                <td>{data.disability.filter((data) => data.disability_type_id === disSetgets)[0].student_men}</td>
                                                <td>{data.disability.filter((data) => data.disability_type_id === disSetgets)[0].student_women}</td> */}

                                        {/* Хавсарсан бэрхшээлтэй оюутны тоо */}
                                                {/* <td>{data.disability.filter((data) => data.disability_type_id === disHavsarsan)[0].all_student}</td>
                                                <td>{data.disability.filter((data) => data.disability_type_id === disHavsarsan)[0].student_men}</td>
                                                <td>{data.disability.filter((data) => data.disability_type_id === disHavsarsan)[0].student_women}</td> */}


                                        {/* Бусад төрлийн хөгжлийн бэрхшээлтэй оюутны тоо */}
                                                {/* <td>{data.disability.filter((data) => data.disability_type_id === disBusad)[0].all_student}</td>
                                                <td>{data.disability.filter((data) => data.disability_type_id === disBusad)[0].student_men}</td>
                                                <td>{data.disability.filter((data) => data.disability_type_id === disBusad)[0].student_women}</td> */}


                                    {/* {data.disability.map((disab, didx) => {
                                        return(
                                            <Fragment key={`disability${didx}`}>
                                                {didx === 1 &&
                                                    <>
                                                    </>
                                                }
                                                <td>
                                                    {disab.all_student}
                                                </td>
                                                {data.disability.length === didx + 1 ?
                                                    ''
                                                :
                                                    <td>
                                                        {disab.student_men}
                                                    </td>
                                                }
                                                {data.disability.length === didx + 1 ?
                                                    ''
                                                :
                                                    <td>
                                                        {disab.student_women}
                                                    </td>
                                                }
                                            </Fragment>
                                        )})
                                    } */}
                                </tr>
                                ))}
                        </tbody>
                    </table>
            }
        </div>
    )
}

export default ADB2
