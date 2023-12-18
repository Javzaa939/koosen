
import React, { Fragment, useEffect } from 'react'

import { Row, Col, Modal, ModalBody, ModalHeader, Card, CardBody } from "reactstrap";
import { useTranslation } from 'react-i18next';
import DataTable from 'react-data-table-component';
import { CheckSquare, XSquare } from 'react-feather'

import { zeroFill } from "@utils"

export default function Detail({ isOpen, handleModal, datas })
{
    const { t } = useTranslation()

    const columns = [
        {
            header: 'shiidverleh_negj',
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
                            <CheckSquare width={"15px"} />
                        :
                            <XSquare width={"15px"} />
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

    function betweenDateSolve(cStartDate, cLeaveType, cCount)
    {
        let betweenDate = ''

        let startDate = new Date(cStartDate)

        if (cLeaveType == 1)
        {
            const customDate = new Date(cStartDate)
            customDate.setFullYear(customDate.getFullYear() + 1)

            betweenDate = `${startDate.getFullYear()}-${zeroFill(startDate.getMonth() + 1)}-${zeroFill(startDate.getDate())} - ${customDate.getFullYear()}-${zeroFill(customDate.getMonth() + 1)}-${zeroFill(customDate.getDate())}`
        }
        else if (cLeaveType == 2)
        {
            const customDate = new Date(cStartDate)
            customDate.setMonth(customDate.getMonth() + parseInt(cCount));
            betweenDate = `${startDate.getFullYear()}-${zeroFill(startDate.getMonth() + 1)}-${zeroFill(startDate.getDate())} - ${customDate.getFullYear()}-${zeroFill(customDate.getMonth() + 1)}-${zeroFill(customDate.getDate())}`
        }
        else if (cLeaveType == 3)
        {
            const customDate = new Date(cStartDate)
            customDate.setDate(customDate.getDate() + parseInt(cCount))
            betweenDate = `${startDate.getFullYear()}-${zeroFill(startDate.getMonth() + 1)}-${zeroFill(startDate.getDate())} - ${customDate.getFullYear()}-${zeroFill(customDate.getMonth() + 1)}-${zeroFill(customDate.getDate())}`

        }

        return betweenDate
    }

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
                    <Card className='invoice-preview-card'>
                        <CardBody className='invoice-padding pb-0'>
                            <div className='d-flex justify-content-between flex-md-row flex-column invoice-spacing mt-0'>
                                <div>
                                    <div className='logo-wrapper'>
                                        <h3 className='text-primary invoice-logo'>Чөлөөний хүсэлтийн дэлгэрэнгүйw</h3>
                                    </div>
                                </div>
                            </div>
                        </CardBody>

                        <hr className='invoice-spacing' />

                        <CardBody className='invoice-padding pt-0'>
                            <Row className='invoice-spacing'>
                                <Col className='p-1'>
                                    <h6 className='mb-2'>Оюутны бөглөсөн мэдээлэл:</h6>
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
                                                <td className='pe-1'>Хичээлийн жил:</td>
                                                <td>{datas?.lesson_year}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Улирал:</td>
                                                <td>{datas?.lesson_season?.season_name}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Чөлөөний төрөл:</td>
                                                <td>{datas?.leave_type?.leave_name}</td>
                                            </tr>
                                            <tr className='border-bottom'>
                                                <td className='pe-1'>Чөлөөний хугацаа:</td>
                                                <td>{betweenDateSolve(datas?.start_date, datas?.leave_type?.leave_id, datas?.count)}</td>
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
                                                            {datas?.file.toString().split("/").pop()}
                                                        </a>
                                                        :
                                                        <></>
                                                    }
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className='pe-1'>Тайлбар:</td>
                                                <td>1{datas?.cause}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </Col>
                            </Row>
                        </CardBody>

                        <hr className='invoice-spacing' />

                        <CardBody className='invoice-padding pt-0'>
                            <Row className='invoice-spacing'>
                                <Col className='p-1'>
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
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}
