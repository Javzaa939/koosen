import React, { Fragment, useEffect, useState } from "react";
import { FileText, Printer } from "react-feather";

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { utils, writeFile } from 'xlsx-js-style';

function PrintModal({ pmodal, modalToggler, groupId, file_name, printValues }) {

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true })
    const [isMapRendering, setIsMapRendering] = useState(false)

    const [datas, setDatas] = useState({})
    const [cheaders, setHeaders] = useState([])
    const [seasons, setSeasons] = useState([])

    function convertV2() {
        const data = datas?.datas
        const keys = Object.keys(data?.[0] || {})

        // #region to add empty rows that may be filled by header data (not header of table, it is header of document)
        const HEADER_HEIGHT = 4

        const headerCells = Array.from({ length: HEADER_HEIGHT }, (_, idx) => {
            const obj = {
                ' ': '',
                '№': '',
            };
            keys.forEach(data => {
                obj[data] = '';
            });
            return obj;
        });
        // #endregion

        // to add additional empty row
        const blank = () => {
            const obj = {
                ' ': '',
                '№': '',
            };
            keys.forEach(data => {
                obj[data] = '';
            });
            return obj;
        }

        // to add additional empty row and add indexes for rows with student names. For data rows
        const key_prefix = [blank(), ...data]?.map((data, vidx) => (
            {
                ' ': '',
                '№': (vidx === 0 || vidx === 1 || !data['Нэр'] || !data['Оюутны код']) || !data['Регистрийн дугаар'] ? '' : vidx - 1,
                ...data
            }
        ));

        // to merge empty rows with data rows
        const combo = [...headerCells, ...key_prefix]

        // to add all to sheet
        const worksheet = utils.json_to_sheet(combo);

        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Sheet1");
        const prefix = [
            ' ',
            '№',
            ...keys.map(key => key.replace(/^.*?_-_-_/, '')) // to cut out unique key addon from keys names
        ]

        // to add headers: №	Овог	Нэр	Оюутны код. They are merged so their first row is 5
        utils.sheet_add_aoa(worksheet, [prefix], { origin: "A5" });

        // to add headers-lesson names. They are merged so their first row is 6
        // because of merge in different rows unnecessary values are hided by cells-merge effect, therefore  code-lines with a5 a6 looks same
        utils.sheet_add_aoa(worksheet, [prefix], { origin: "A6" });

        // #region define styles
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
            font: {
                sz: 9
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
                vertical: 'center',
                horizontal: 'center',
                textRotation: 90,
                wrapText: true
            },
            font: {
                sz: 9
            }
        };

        const notRotatedTextStyle = { ...rotatedTextStyle }
        notRotatedTextStyle.alignment = { ...notRotatedTextStyle.alignment }
        notRotatedTextStyle.alignment.textRotation = 0

        const footerBorder = {
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "ffffff" } },
                left: { style: "thin", color: { rgb: "ffffff" } },
                right: { style: "thin", color: { rgb: "ffffff" } },
                wrapText: true
            },
            font: {
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
            font: {
                sz: 10,
                italic: true
            }

        };

        // const rightBorder = {
        //     border: {
        //         top: { style: "thin", color: { rgb: "ffffff" } },
        //         bottom: { style: "thin", color: { rgb: "ffffff" } },
        //         left: { style: "thin", color: { rgb: "ffffff" } },
        //         right: { style: "thin", color: { rgb: "0000000" } },
        //         wrapText: true
        //     },
        //     font: {
        //         sz: 10,
        //         italic: true
        //     }

        // };
        // #endregion

        const columns_count_prefix = prefix.length - keys.length // columns: '', '№'
        const columns_count_before_lessons_after_prefix = 4 // columns: ovog, ner, oyutny kod, rd
        const columns_count_lessons = datas?.lessons_length // columns: lessons
        const columns_count_kr = 4 // columns: sudalsan, toocson
        const columns_count_assessments = 8 // columns: assessment letters
        const columns_count_grades = 6 // columns: grade letters
        const columns_count_letters_sum = 1 // columns: Хичээлийн тоо
        const columns_count_quality_success = 2 // columns: Амжилт, Чанар
        const column_length = prefix.length // total columns count

        // #region style of document header
        const startRow = 0;
        const endRow = HEADER_HEIGHT - 1;
        const startCol = 0;
        const endCol = column_length - 1;

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const cellAddress = utils.encode_cell({ r: row, c: col });

                if (!worksheet[cellAddress]) {
                    worksheet[cellAddress] = {};
                }
                worksheet[cellAddress].s = row === HEADER_HEIGHT ? bottomBorder : textCellStyle

                // to remove default header cells to move it to different row. So additional empty row added
                worksheet[cellAddress].v = ''
            }
        }
        // #endregion

        const styleRow = HEADER_HEIGHT;
        const sendRow = HEADER_HEIGHT + data?.length + 1;
        const styleCol = 1;
        const sendCol = column_length - 1;
        const columns_count_before_kr = columns_count_prefix + columns_count_before_lessons_after_prefix + columns_count_lessons
        const columns_count_before_letters_sum = columns_count_prefix + columns_count_before_lessons_after_prefix + columns_count_lessons + columns_count_kr + columns_count_assessments + columns_count_grades

        for (let row = styleRow; row <= sendRow; row++) {
            for (let col = styleCol; col <= sendCol; col++) {
                const cellNum = utils.encode_cell({ r: row, c: col });

                if (!worksheet[cellNum]) {
                    worksheet[cellNum] = {};
                }

                // to rotate lessons names. in 6th row (index is 5) only lesson names displayed, so condition is just with whole row
                if (row === HEADER_HEIGHT + 1) worksheet[cellNum].s = rotatedTextStyle

                // to rotate sudalsan kr and toocson kr columns
                else if (
                    row === HEADER_HEIGHT &&
                    (col === columns_count_before_kr || col === columns_count_before_kr + 1 || col === columns_count_before_kr + 2 || col === columns_count_before_kr + 3)
                ) worksheet[cellNum].s = rotatedTextStyle

                // to wrap text in "Хичээлийн тоо" column
                else if (
                    row === HEADER_HEIGHT &&
                    col >= columns_count_before_letters_sum && col <= columns_count_before_letters_sum + columns_count_quality_success
                ) worksheet[cellNum].s = notRotatedTextStyle

                // to style rest cells
                else worksheet[cellNum].s = numberCellStyle
            }
        }

        // const fRow = HEADER_HEIGHT;
        // const fendRow = HEADER_HEIGHT + data?.length;

        // for (let row = fRow; row <= fendRow; row++) {
        //     const cellNum = utils.encode_cell({ r: row, c: 0 });

        //     if (!worksheet[cellNum]) {
        //         worksheet[cellNum] = {};
        //     }

        //     worksheet[cellNum].s = rightBorder;
        // }

        // #region to merge cells
        const seasonHeaderMerge = datas?.seasons && datas?.seasons.length > 0
            ? datas.seasons.map((val, i) => {
                const previousLength = datas.seasons
                    .slice(0, i)
                    .reduce((sum, season) => sum + (season.count || 0), 0);

                const cellNum = utils.encode_cell({ r: HEADER_HEIGHT, c: i === 0 ? 6 : previousLength + 6 });

                const seasonCellStyle = {
                    border: {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } }
                    },
                    alignment: {
                        horizontal: 'center',
                    },
                    font: {
                        sz: 9
                    }
                }

                if (worksheet[cellNum]) {
                    if (val?.season) {
                        // #region to get season name
                        let year_season = val.season.split('-')
                        const season_id = Number(year_season[2])
                        const season_name = seasons.find(item => item.id === season_id)?.season_name
                        year_season = `${year_season[0]}-${year_season[1]}-${season_name}`
                        // #endregion

                        worksheet[cellNum].v = year_season
                        worksheet[cellNum].s = seasonCellStyle
                    }
                }

                return {
                    s: {
                        r: HEADER_HEIGHT,
                        c: i === 0
                            ? 6
                            : 6 + previousLength,
                    },
                    e: {
                        r: HEADER_HEIGHT,
                        c: 6 + previousLength + (val.count || 0) - 1,
                    }
                };
            })
            : [];
        // const lessonsMerge = Array.from({ length: datas?.lessons_length }, (_, vidx) => {
        //     return(
        //         {
        //             s: {
        //                 r: HEADER_HEIGHT,
        //                 c: 5 + vidx
        //             },
        //             e: {
        //                 r: HEADER_HEIGHT + 1,
        //                 c: 5 + vidx,
        //             }
        //         }
        //     )
        // })

        // to set last columns merge options that after lesson names columns
        const last_columns = Array.from({
            length: (
                columns_count_kr +
                columns_count_assessments +
                columns_count_grades +
                columns_count_letters_sum +
                columns_count_quality_success
            )
        }, (value, index) => {
            return ({
                s: { r: HEADER_HEIGHT, c: columns_count_before_kr + index },
                e: { r: HEADER_HEIGHT + 2, c: columns_count_before_kr + index }
            })
        })

        worksheet["!merges"] = [
            // first column
            {
                s: { r: HEADER_HEIGHT, c: 1 },
                e: { r: HEADER_HEIGHT + 2, c: 1 }
            },
            {
                s: { r: HEADER_HEIGHT, c: 2 },
                e: { r: HEADER_HEIGHT + 2, c: 2 }
            },
            {
                s: { r: HEADER_HEIGHT, c: 3 },
                e: { r: HEADER_HEIGHT + 2, c: 3 }
            },
            {
                s: { r: HEADER_HEIGHT, c: 4 },
                e: { r: HEADER_HEIGHT + 2, c: 4 }
            },
            {
                s: { r: HEADER_HEIGHT, c: 5 },
                e: { r: HEADER_HEIGHT + 2, c: 5 }
            },

            // Season merge
            ...seasonHeaderMerge,
            // ...lessonsMerge,

            // last columns
            ...last_columns
        ]
        // #endregion

        // 3 is first 3 columns
        // 2 is sudalsan and toocson kr columns
        // 8 is 8 columns with assessment letters
        // etc

        // #region to set sizes
        // to set lesson names columns width
        const phaseZeroCells = Array.from({ length: columns_count_lessons }, (_) => { return ({ wch: 8 }) })

        // to set kr, letters columns width
        const phaseTwoCells = Array.from({
            length: (
                columns_count_kr +
                columns_count_assessments +
                columns_count_grades
            )
        }, (_) => { return ({ wch: 3 }) })

        // to set "Хичээлийн тоо" column width
        const letters_sum_col = Array.from({ length: columns_count_letters_sum }, (_) => { return ({ wch: 8 }) })

        // widths
        worksheet["!cols"] = [
            { wch: 3 }, // first column
            { wch: 3 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 }, // fifth column
            ...phaseZeroCells,
            ...phaseTwoCells,
            ...letters_sum_col
        ];

        // heights
        worksheet["!rows"] = [
            { hpx: 10 }, // first row
            { hpx: 10 },
            { hpx: 20 }, // group name is here
            { hpx: 10 },
            { hpx: 10 }, // season names are here
            { hpx: 150 }, // fifth row. rotated lesson names are here
        ];
        // #endregion

        worksheet['B3'].v = datas?.group_name ? `Анги бүлгийн нэр: ${datas?.group_name}` : ''
        writeFile(workbook, file_name ? `${file_name}.xlsx` : 'Ангийн нийт дүн.xlsx');
    }

    // Api
    const getListApi = useApi().print.score
    const seasonApi = useApi().settings.season

    // Улирлын жагсаалт авах
    async function getSeasons() {
        const { success, data } = await fetchData(seasonApi.get())
        if (success) {
            setSeasons(data)
        }
    }

    /*Жагсаалт дата авах функц */
    async function getDatas() {
        const { success, data } = await fetchData(getListApi.getListNoLimit(groupId, printValues.current['group'], printValues.current['chosenYear'], printValues.current['chosenSeason']))

        if (success) {
            // to get all lessons-headers. Because on 0 index kredits row is located that has all lessons-headers
            var one_data = data?.datas[0]

            var headers = []
            Object.keys(one_data).forEach((c) =>
                headers.push({
                    'key': c,
                    'name': c
                })
            )
            setDatas(data)
            setHeaders(headers)
        }
    }

    useEffect(
        () => {
            // to show loader while mapping is processing. because it can be longer then fetchData loading
            setIsMapRendering(true)

            getDatas();
            getSeasons();
        },
        []
    )

    console.log(datas)
    // to show loader while mapping is processing
    useEffect(() => {
        if (datas?.datas?.length) {
            requestAnimationFrame(() => {
                setIsMapRendering(false)
            });
        }
    }, [datas]);

    return (
        <Modal isOpen={pmodal} toggle={modalToggler} centered className="modal-xl" backdrop="static">
            <ModalHeader toggle={modalToggler}>
                Хэвлэгдэх дүнгийн загвар
            </ModalHeader>
            {isLoading || isMapRendering ? Loader :
                <ModalBody style={{ maxHeight: '800px', overflowX: 'auto' }}>
                    <Button onClick={() => convertV2()} color="primary" className="m-1"><FileText size={20} /> Excel татах</Button>
                    <div style={{ minHeight: '400px' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>№</th>
                                    {
                                        cheaders.map((head, hidx) => (
                                            <th key={hidx}>{head?.name.replace(/^.*?_-_-_/, '')/* to cut out unique key addon from keys names*/}</th>
                                        ))
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {datas?.datas?.map((data, index) => (
                                    <tr key={index}>
                                        <td>{(index === 0) ? '' : index}</td>

                                        {
                                            cheaders.map((header, cindex) => {
                                                return (
                                                    <td key={cindex}>{data[header.key]}</td>
                                                )
                                            })
                                        }
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ModalBody>
            }
        </Modal>
    )
}

export default PrintModal;
