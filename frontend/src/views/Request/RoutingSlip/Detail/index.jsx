
import React, { Fragment } from 'react'

import { Row, Col, Modal, ModalBody, ModalHeader, Card } from "reactstrap";
import { useTranslation } from 'react-i18next';
import DataTable from 'react-data-table-component';
import { CheckSquare, XSquare } from 'react-feather'

export default function Detail({ isOpen, handleModal, datas })
{
    const { t } = useTranslation()

    const columns = [
        {
            name: "№",
            selector: (row, idx) => (
                <span>{idx + 1}</span>
            ),
            width: "70px",
        },
        {
            name: `${t('Шийдвэрлэх нэгж')}`,
            selector: row => (
                <span>{row.name}</span>
            ),
            width: "300px",
        },
        {
            name: `${t('Хүсэлтийн огноо')}`,
            selector: row => row.date,
            width: "180px",
            center: true,
        },
        {
            name: `${t('Зөвшөөрсөн эсэх')}`,
            selector: row => {
                return (
                    row.is_answer
                    ?
                        row.is_confirm
                        ?
                            <CheckSquare width={"15px"} color='green'/>
                        :
                            <XSquare width={"15px"} color='red'/>
                    :
                        <></>
                )
            },
            width: "180px",
            center: true,
        },
        {
            name: `${t('Тайлбар')}`,
            selector: row => (
                <span className=''>{row?.message}</span>
            ),
        },
    ];

    return (
        <Fragment>
            <Modal
                isOpen={isOpen}
                toggle={handleModal}
                className="modal-dialog-centered modal-lg"
                contentClassName="pt-0"
                scrollable={true}
            >
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="">
                    <Card className='invoice-preview-card p-2'>
                        <h3 className='text-primary '>Тойрох хуудасны дэлгэрэнгүй</h3>

                        <hr className='invoice-spacing' />
                        <Row className='invoice-spacing '>
                            <Col className='p-1'>
                                <h6 className='mb-2'>Оюутны үндсэн мэдээлэл:</h6>
                                <table className='w-100'>
                                    <tbody>
                                        <tr className='border-bottom'>
                                            <td className='pe-1' style={{ width: '33%' }}>Нэр:</td>
                                            <td>
                                                <span className='fw-bold'>{datas?.student?.full_name}</span>
                                            </td>
                                        </tr>
                                        <tr className='border-bottom'>
                                            <td className='pe-1'>Код:</td>
                                            <td>{datas?.student?.code}</td>
                                        </tr>
                                        <tr className='border-bottom'>
                                            <td className='pe-1'>Тойрох хуудас хүсэлтийн төрөл:</td>
                                            <td>{datas?.type_name}</td>
                                        </tr>
                                        <tr className='border-bottom'>
                                            <td className='pe-1'>Файл:</td>
                                            <td>
                                                {
                                                    datas?.file?
                                                    <a
                                                        href={datas?.file}
                                                        className="me-2 text-primary text-decoration-underline"
                                                        target={"_blank"}
                                                    >
                                                        {datas?.file_name}
                                                    </a>
                                                    :
                                                    <></>
                                                }
                                            </td>
                                        </tr>
                                        <tr className='border-bottom'>
                                            <td className='pe-1'>Гарчиг:</td>
                                            <td>{datas?.title}</td>
                                        </tr>
                                        <tr>
                                            <td className='pe-1'>Тайлбар:</td>
                                            <td>{datas?.body}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </Col>
                        </Row>

                        <hr className='invoice-spacing' />

                        <h6 className='mb-2'>Өргөдөлд хариу илгээсэн бүртгэл:</h6>
                        <div className='react-dataTable react-dataTable-selectable-rows'>
                            <DataTable
                                noHeader
                                className='react-dataTable'
                                noDataComponent={(
                                    <div className="my-2">
                                        <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                    </div>
                                )}
                                columns={columns}
                                pagination={false}
                                data={datas?.answers}
                                fixedHeader
                                fixedHeaderScrollHeight='62vh'
                            />
                        </div>
                    </Card>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}
