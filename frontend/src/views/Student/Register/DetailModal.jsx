import React, {Fragment} from 'react'
import {
	Row,
	Col,
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

export default function DetailModal({ isOpen, handleModal, datas, file_name, errorDatas }) {

    const { showWarning } = useModal()

    const excelColumns = {
        "code": "Оюутны код",
        "department": "Хөтөлбөрийн баг",
        "group": "Анги",
        "register_num": "РД",
        "family_name": "Ургийн овог",
        "last_name": "Эцэг эхийн нэр",
        "last_name_eng": "Эцэг эхийн нэр англи",
        "first_name": "Өөрийн нэр",
        "first_name_eng": "Өөрийн нэр англи",
        "gender": "Хүйс",
        "yas_undes": "Яс үндэс",
        "status": "Бүртгэлийн байдал",
        "pay_type": "Төлбөр төлөлт",
    }

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { isLoading, Loader, fetchData } = useLoader({})
    const scoreApi = useApi().score.register
    const studentApi = useApi().student

    const headers = [

        {
            key: 'code',
            name: 'Оюутны код',
        },
        {
            key: 'department',
            name: 'Хөтөлбөрийн баг',
        },
        {
            key: 'group',
            name: 'Анги',
        },
        {
            key: 'register',
            name: 'РД',
        },
        {
            key: 'family_name',
            name: 'Ургийн овог',
        },
        {
            key: 'last_name',
            name: 'Эцэг эхийн нэр',
        },
        {
            key: 'last_name_eng',
            name: 'Эцэг эхийн нэр англи',
        },
        {
            key: 'first_name',
            name: 'Өөрийн нэр',
        },
        {
            key: 'first_name_eng',
            name: 'Өөрийн нэр англи',
        },
        {
            key: 'gender',
            name: 'Хүйс',
        },
        {
            key: 'yas_undes',
            name: 'Яс үндэс',
        },
        {
            key: 'state',
            name: 'Бүртгэлийн байдал',
        },
        {
            key: 'payment',
            name: 'Төлбөр төлөлт',
        },
    ]

    async function onSubmit() {

        const { success, data }  = await fetchData(studentApi.postStudentImportData(datas?.create_datas))
        if (success) {
            handleModal()
        }

    }

    function handleDownload() {
        if (errorDatas?.length > 0) {
            downloadExcel(errorDatas, excelColumns, `${file_name}_алдаа`)
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
                        <AlertCircle size={15} color='#fb8500'/>
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
                        <Button size='sm'  color='primary' onClick={handleDownload} className='justify-content-end' disabled={!(errorDatas?.length > 0)}><Download size={15} className='me-1'/> Алдаатай дата татах</Button>
                    </div>
                    {
                        Object.keys(datas).length > 0 &&
                        <div>
                            {
                                Object.values(datas).map((data, idx) => {
                                    return (
                                        <Row key={idx}>
                                            <h5 className='ms-1'>{idx == 0 ? `Зөв оруулах датанууд` : idx == 1 ? 'Хичээлийн мэдээлэл олдоогүй датанууд' : 'Оюутны мэдээлэл олдоогүй датанууд'}{`(${data.length})`}</h5>
                                            {
                                                idx == 1 &&
                                                <div className='ms-1'>
                                                    <small>Хичээлийн код болон нэрээр хичээлийн стандарт цэснээс хайгаад олдсонгүй.</small> <br/>
                                                    <small>Хичээлийн кодонд англи монгол үсэг холилдсон, </small>
                                                    <small>хичээлийн нэрний урд хойно нь үг үлдсэн гэх мэт алдаануудыг шалгаж файлаа засаад оруулах боломжтой.</small>
                                                </div>
                                            }
                                            {
                                                idx == 2 &&
                                                <div className='ms-1'>
                                                    <small>Тухайн кодтой оюутны мэдээлэл олдсонгүй.</small> <br/>
                                                </div>
                                            }
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
                            <hr/>
                        </div>
                    }
                </ModalBody>
            </Modal>
        </Fragment>
    )
}
