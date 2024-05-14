import React, {Fragment} from 'react'
import {
	Row,
	Button,
	Modal,
    Table,
	ModalHeader,
	ModalBody,
} from 'reactstrap'

import { X, Download } from 'react-feather'
import { downloadExcel } from '@utils'

export function CTable({headers, datas, file_name}) {
    return(
        <div className='m-1'>
            <Table size='sm' responsive>
                <thead>
                    <tr>
                        <th style={{width: '80px'}}>№</th>
                        {
                            headers.map((header) =>
                                <th key={header.key} className='text-left'>
                                    {header.name}
                                </th>
                            )
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        datas && datas.map((row, idx) =>
                            <tr key={idx}>
                                <td>{idx + 1}</td>
                                {
                                    headers.map((column, idx2) => {
                                        <td key={`score-${idx2}${idx}`}>{row[column.key]}</td>
                                    }
                                )}
                            </tr>
                    )}
                </tbody>
            </Table>
        </div>
    )
}

export default function DetailModal({ isOpen, handleModal,  errorDatas }) {

    const excelColumns = {
        "code": "Оюутны код",
        "last_name": "Оюутны овог",
        "first_name": "Оюутны нэр",
        "register": "Reгистрийн дугаар",
        "diplom_num": "Дипломын дугаар",
    }

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const headers = [
        {
            key: 'code',
            name: 'Оюутны код',
        },
        {
            key: 'last_name',
            name: 'Оюутны овог',
        },
        {
            key: 'first_name',
            name: 'Оюутны нэр',
        },
        {
            key: 'register',
            name: 'Reгистрийн дугаар',
        },
        {
            key: 'diplom_num',
            name: 'Дипломын дугаар',
        },
    ]


    function handleDownload() {
        if (errorDatas?.length > 0) {
            downloadExcel(errorDatas, excelColumns, `алдаа`)
        }
    }

    return (
        <Fragment>
            <Modal
                isOpen={isOpen}
                toggle={handleModal}
                className="modal-dialog-centered modal-xl"
                onClosed={handleModal}
                contentClassName="pt-0"
                scrollable={true}
            >
                <ModalHeader
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                    className='justify-content-between'
                >
                    <h5>{'QR татагдсан датанууд'}</h5>
                </ModalHeader>
                <ModalBody>
                    <div className='mb-1 d-flex justify-content-end'>
                        <Button size='sm'  color='primary' onClick={handleDownload} className='justify-content-end' disabled={!(errorDatas?.length > 0)}><Download size={15} className='me-1'/> Алдаатай дата татах</Button>
                    </div>
                    <div>

                        <Row>
                            <h5 className='ms-1'>Дипломын дугаараар QR олдоогүй оюутнууд</h5>
                            <div className='m-1' style={{maxHeight: '300px', overflowX: 'scroll'}}>
                                <Table size='sm' responsive>
                                    <thead>
                                        <tr>
                                            <th style={{width: '80px'}}>№</th>
                                            {
                                                headers.map((header) =>
                                                    <th key={header.key} className='text-left '>
                                                        {header.name}
                                                    </th>
                                                )
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            errorDatas.map((row, idx) =>
                                                <tr key={idx}>
                                                    <td className='bg-transparent'>{idx + 1}</td>
                                                    {
                                                        headers.map((column, idx2) => (
                                                            <td key={`score-${idx2}${idx}`} className='bg-transparent'>{row[column.key]}</td>
                                                        )
                                                    )}
                                                </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Row>
                    </div>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}
