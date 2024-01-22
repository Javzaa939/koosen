import React, { useEffect, useState } from "react";
import { FileText, Printer } from "react-feather";

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { utils, writeFile } from 'xlsx-js-style';

function PrintModal({ pmodal, modalToggler, groupId, file_name }) {

        // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

    const [datas, setDatas] = useState([])
    const [cheaders, setHeaders] = useState([])

    function convertV2() {
        const keys = Object.keys(datas[3])


        // ЭНЭ УТГЫГ ӨӨРЧИЛСНӨӨР ХҮСНЭГТИЙН ДЭЭРХИ ТОЛГОЙ ХЭСГИЙН ӨНДРИЙГ ӨӨРЧЛӨНӨ.
        const HEADER_HEIGHT = 3

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

        const key_prefix = datas.map((data, vidx) => (
            {
                ' ': '',
                '№': vidx + 1,
                ...data
            }));

        const combo = [...headerCells, ...key_prefix]

        const worksheet = utils.json_to_sheet(combo);

        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // /* fix headers */

        const prefix = [
            ' ',
            '№',
            ...keys
        ]

        // console.log(prefix,'prefix')


        utils.sheet_add_aoa(worksheet, [prefix], { origin: "A4" });


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
            font:{
                sz: 9
            }
        };


        // ene style 90 gradus erguulehgui shuu !!
        const rotatedTextStyle = {
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            },
            alignment: {
                horizontal: 'start',
                vertical: 'center',
                wrapText: true
            },
            font:{
                sz: 9
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
                sz: 10,
                italic: true
            }

        };

        const rightBorder = {
            border: {
                top: { style: "thin", color: { rgb: "ffffff" } },
                bottom: { style: "thin", color: { rgb: "ffffff" } },
                left: { style: "thin", color: { rgb: "ffffff" } },
                right: { style: "thin", color: { rgb: "0000000" } },
                wrapText: true
            },
            font:{
                sz: 10,
                italic: true
            }

        };

        const column_length = keys.length + 3

        const startRow = 0;
        const endRow = HEADER_HEIGHT - 1;
        const startCol = 0;
        const endCol = column_length;
        // const endCol = key_prefix[0].length;

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
              const cellAddress = utils.encode_cell({ r: row, c: col });

                if (!worksheet[cellAddress]) {
                    worksheet[cellAddress] = {};
                }

            //   worksheet[cellAddress].s = (row === 0 && col !== 0 && col !== 1 && col !== 20 && col !== 21) ? rotatedTextStyle : col === 0 ? allBordersStyle : numberCellStyle;
            //   worksheet[cellAddress].s = (row === 0 && col !== 0 && col !== 1 && col !== 20 && col !== 21) ? rotatedTextStyle : col === 0 ? allBordersStyle : numberCellStyle;

                worksheet[cellAddress].s = row === 3 ? bottomBorder : textCellStyle
                worksheet[cellAddress].v = ''
            }
        }

        const styleRow = HEADER_HEIGHT;
        const sendRow = HEADER_HEIGHT + datas.length;
        const styleCol = 1;
        const sendCol = column_length - 1;


        for (let row = styleRow; row <= sendRow; row++) {
            for (let col = styleCol; col <= sendCol; col++) {
              const cellNum = utils.encode_cell({ r: row, c: col });

                if (!worksheet[cellNum]) {
                    worksheet[cellNum] = {};
                }

            //   worksheet[cellNum].s = (row === 0 && col !== 0 && col !== 1 && col !== 20 && col !== 21) ? rotatedTextStyle : col === 0 ? allBordersStyle : numberCellStyle;
                worksheet[cellNum].s = (
                    row === HEADER_HEIGHT
                        &&
                    col !== 0
                        &&
                    col !== 1
                        &&
                    col !== 2
                        &&
                    col !== column_length - 1
                        &&
                    col !== column_length - 2
                        &&
                    col !== column_length - 3
                        &&
                    col !== column_length - 4
                        &&
                    col !== column_length - 5
                        &&
                    col !== column_length - 6
                ) ? rotatedTextStyle : numberCellStyle;
            //   worksheet[cellNum].s = (row === HEADER_HEIGHT && col !== 0 && col !== 1 && col !== 2 && col !== column_length - 1 && col !== column_length ) ? rotatedTextStyle : numberCellStyle;
            }
        }


        const fRow = HEADER_HEIGHT;
        const fendRow = HEADER_HEIGHT + datas.length;


        for (let row = fRow; row <= fendRow; row++) {
              const cellNum = utils.encode_cell({ r: row, c: 0 });

                if (!worksheet[cellNum]) {
                    worksheet[cellNum] = {};
                }

            //   worksheet[cellNum].s = (row === 0 && col !== 0 && col !== 1 && col !== 20 && col !== 21) ? rotatedTextStyle : col === 0 ? allBordersStyle : numberCellStyle;
              worksheet[cellNum].s = rightBorder;
        }


        const phaseZeroCells = Array.from({length: keys.length - 6 },(_) => { return ({wch: 8})})
        const phaseTwoCells = Array.from({length: 5 },(_) => { return ({wch: 3})})

        worksheet["!cols"] = [
            { wch: 3 },
            { wch: 3 },
            { wch: 30 },
            ...phaseZeroCells,
            ...phaseTwoCells,
        ];

        worksheet["!rows"] = [
            { hpx: 10 },
            { hpx: 10 },
            { hpx: 10 },
            { hpx: 150 },
        ];

        writeFile(workbook, file_name ? `${file_name}.xlsx` : 'Ангийн нийт дүн.xlsx');
    }

    // Api
    const getListApi = useApi().print.score

    /*Жагсаалт дата авах функц */
    async function getDatas() {
        const { success, data } = await fetchData(getListApi.getListNoLimit( groupId, '', '' ))
        if (success && data.length > 0) {
            var one_data = data[2]
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
        () =>
        {
            getDatas();

        },
        []
    )

    return(
        <Modal isOpen={pmodal} toggle={modalToggler} centered className="modal-xl">
            <ModalHeader toggle={modalToggler}>
                Хэвлэгдэх дүнгийн загвар
            </ModalHeader>
                {isLoading ? Loader :
                <ModalBody  style={{ maxHeight: '800px', overflowX: 'auto'}}>
                    <Button onClick={() => convertV2()} color="primary" className="m-1"><FileText size={20}/> Excel татах</Button>
                    <div style={{ minHeight: '400px' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>№</th>
                                    {
                                        cheaders.map((head, hidx) => (
                                            <th key={hidx}>{head?.name}</th>
                                        ))
                                    }
                                </tr>
                            </thead>
                                <tbody>
                                    {datas.map((data, index) => (
                                        <tr key={index}>
                                            <td>{(index === 0 || index === 1) ? '' : index - 1}</td>

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
