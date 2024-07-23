import React, { Fragment } from 'react'
import {
    Row,
    Button,
    Modal,
    Table,
    ModalHeader,
    ModalBody,
} from 'reactstrap'

import { X, AlertCircle, Download } from 'react-feather'
import { downloadExcel } from '@utils'

import useModal from "@hooks/useModal"
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

export function CTable({ headers, datas }) {
    return (
        <div className='m-1'>
            <Table size='sm' responsive>
                <thead>
                    <tr>
                        <th style={{ width: '80px' }}>№</th>
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

export default function DetailModal({ isOpen, handleModal, datas, file_name, errorDatas }) {
    const { showWarning } = useModal()

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { isLoading, Loader, fetchData } = useLoader({})
    const ExcelPostDataApi = useApi().elselt.health.physical

    const headers = [
        { key: 'register_num', name: 'РД' },
        { key: 'total_score', name: 'Нийт оноо' },
        { key: 'turnik', name: 'Савлуурт суниах' },
        { key: 'patience_1000m', name: 'Тэсвэр 1000 м' },
        { key: 'speed_100m', name: 'Хурд 100 м' },
        { key: 'quickness', name: 'Авхаалж самбаа' },
        { key: 'flexible', name: 'Уян хатан'}
    ];

    async function onSubmit() {
        const { success, data } = await fetchData(ExcelPostDataApi.postExcelImportData(datas?.create_datas))
        if (success) {
            handleModal()
        }
    }

    function handleDownload() {
        if (errorDatas?.length > 0) {
            downloadExcel(errorDatas, headers, `${file_name}_алдаа`)
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
                    className='justify-content-between align-items-center'
                >
                    <h5>{'Import хийсэн датанууд'}</h5>
                </ModalHeader>
                <ModalBody>
                    {isLoading && Loader}
                    <div className='mb-1'>
                        <AlertCircle size={15} color='#fb8500' />
                        <span className='ms-1'>Зөвхөн зөв датанууд хадгалагдах болно. Болих товч дарах үед дата хадгалагдахгүй байхыг анхаарна уу</span>
                    </div>
                    <div className='mb-1 d-flex justify-content-between'>
                        <Button
                            className="me-2  justify-content-start"
                            color="primary"
                            type="submit"
                            disabled={!(datas.create_datas?.length > 0) || isLoading}
                            size='sm'
                            onClick={() =>
                                showWarning({
                                    header: {
                                        title: `Дата оруулах`,
                                    },
                                    question: `Та датануудыг оруулахдаа  итгэлтэй байна уу?`,
                                    onClick: () => onSubmit(),
                                    btnText: 'Дата оруулах',
                                })
                            }
                        >
                            {'Дата оруулах'}
                        </Button>
                        <Button size='sm' color='primary' onClick={handleDownload} className='justify-content-end' disabled={!(errorDatas?.length > 0)}><Download size={15} className='me-1' /> Алдаатай дата татах</Button>
                    </div>
                    {
                        Object.keys(datas).length > 0 &&
                        <div>
                            {
                                Object.values(datas).map((data, idx) => {
                                    return (
                                        <Row key={idx}>
                                            <h5 className='ms-1'>{idx == 0 ? `Зөв оруулах датанууд` : idx == 1 ? 'Шаардлагатай баганы утга дутуу датанууд' : ''}{`(${data.length})`}</h5>
                                            {
                                                idx == 1 &&
                                                <div className='ms-1'>
                                                    <small>Багана тус бүрийн мэдээлэл бүрэн байх ёстой гэдгийг анхаарна уу.</small> <br />
                                                </div>
                                            }
                                            {
                                                idx == 2 &&
                                                <div className='ms-1'>
                                                    <small>Оюутны мэдээлэл олдсонгүй.</small> <br />
                                                </div>
                                            }
                                            <div className='m-1' style={{ maxHeight: '300px', overflowX: 'scroll' }}>
                                                <Table size='sm' responsive>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '80px' }}>№</th>
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
                                                            data?.map((row, idx) =>
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
                                    )
                                }
                                )}
                            <hr />
                        </div>
                    }
                </ModalBody>
            </Modal>
        </Fragment>
    )
}
