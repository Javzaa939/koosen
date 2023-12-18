import React, { useEffect, useState } from "react";
import { FileText, Printer } from "react-feather";

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { read, utils, writeFile } from 'xlsx';

function PrintModal({ pmodal, modalToggler, groupId, file_name }) {

        // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

    const [datas, setDatas] = useState([])
    const [cheaders, setHeaders] = useState([])

    function convertV2() {
        const keys = Object.keys(datas[0])

        const worksheet = utils.json_to_sheet(datas);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // /* fix headers */
        utils.sheet_add_aoa(worksheet, [keys], { origin: "A1" });

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
                <ModalBody  style={{maxHeight: '800px', overflowX: 'auto'}}>
                    <Button onClick={() => convertV2()} color="primary" className="m-1"><FileText size={20}/> Excel татах</Button>
                    <div>
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
