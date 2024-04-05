
import { utils, writeFile } from 'xlsx-js-style';

export function excelDownLoad(datas) {

        const header = Array.from({length: 14},(_, hidx) => {
            return(
                {
                    '':''
                })})

                const mainData = datas.map((data, idx) => {
                    return(
                        {
                            'test':idx,
                            'kk':''
                        })})

                const footer = Array.from({length: 15},(_, hidx) => {
                    return(
                        {
                            '':''
                        })})

        const combo = [...header, ...mainData, ...footer]

        const worksheet = utils.json_to_sheet(combo);

        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "A-DB-8-Report")
        const staticCells = [
                'Байгууллагын ангилал',
                ' ',
                'МД',
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

            writeFile(workbook, "A-DB-12.xlsx");
}