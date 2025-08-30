
import React from "react"

import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap";

// ** Styles
import '@styles/base/pages/app-invoice-print.scss'

import { moneyFormat, formatDate } from '@utils'

// ** Theme Config Import
import themeConfig from "@configs/themeConfig"

import empty from "@src/assets/images/empty-image.jpg"

import { useNavigate } from "react-router-dom";

export default function SmallPrintModal({ isOpen, datas, handleModal }) {

    const navigate = useNavigate()

    function errorImage(e) {
        e.target.src = empty
    }

    const handlePrint = async () => {
        handleModal()
        navigate(`ebarimt/small_print/`, { state: datas })
    };

    return (
        <Modal
            isOpen={isOpen}
            toggle={handleModal}
            className="modal-dialog-centered modal-lg"
            onClosed={handleModal}
        >
            <ModalHeader tag="h3" className='bg-transparent pb-0' toggle={handleModal}>
                Төлбөрийн баримт
            </ModalHeader>
            <ModalBody>
                <div className='invoice-print' style={{ fontWeight: 500 }}>
                    {
                        datas?.map((ebarimtDatas, index) => {
                            // Байгууллага эсэх
                            const isBusiness = ["B2B_RECEIPT", "B2B_INVOICE"].includes(ebarimtDatas?.type)

                            return(
                                <div key={index}>
                                    <div className="text-end mt-5" style={{ lineHeight: 0.9 }}>
                                        <small className="text-end">Сангийн сайдын 2017 оны</small>
                                        <br />
                                        <small className="text-end"> 347 дугаар тушаалын хавсралт</small>
                                    </div>
                                    <div className="position-relative ms-5 me-1 p-4">
                                        <div className="position-absolute top-50 start-0 translate-middle">
                                            <img width={60} height={60} src={themeConfig.app.appLogoImage} alt="logo" />
                                        </div>
                                        <div className="position-absolute top-50 start-50 translate-middle">
                                            <h4 className="text-uppercase fw-bolder">
                                                {ebarimtDatas?.org_name || 'Төлбөрийн баримт'}
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="px-2" style={{ fontSize: '11px', marginTop: '10px', fontWeight: 500 }}>
                                        {
                                            isBusiness &&
                                            <div className="fw-bolder">
                                                Борлуулагч:
                                            </div>
                                        }
                                        <div>
                                            ТТД: <span>{ebarimtDatas?.org_tin || '........'}</span>
                                        </div>
                                        {
                                            isBusiness &&
                                            <>
                                                <div>
                                                    Нэр: <span>{ebarimtDatas?.org_name || '........'}</span>
                                                </div>
                                            </>
                                        }
                                        {
                                            isBusiness &&
                                            <>
                                                <div>
                                                    Хаяг: <span>{ebarimtDatas?.address || '........'}</span>
                                                </div>
                                                <div>
                                                    Утас: <span>{ebarimtDatas?.phone || '........'}</span>
                                                </div>
                                            </>
                                        }
                                        {
                                            isBusiness &&
                                            <>
                                                <div className="fw-bolder mt-1">
                                                    Худалдан авагч
                                                </div>
                                                <div>
                                                    ТТД: <span>{ebarimtDatas?.customer_tin || '........'}</span>
                                                </div>
                                                <div>
                                                    Нэр: <span>{ebarimtDatas?.customer_name || '........'}</span>
                                                </div>
                                                <div>
                                                    Хаяг:
                                                </div>
                                            </>
                                        }
                                        <div className={isBusiness ? 'mt-1' : ''}>
                                            ДДТД: <span>{ebarimtDatas?.id || '........'}</span>
                                        </div>
                                        <div>
                                            Огноо: <span> {formatDate(ebarimtDatas?.date, 'YYYY-MM-DD HH:mm:ss') || '........'}</span>
                                        </div>
                                    </div>
                                    <Row className="px-2 mt-1">
                                        <table style={{ fontSize: '11px' }}>
                                            <thead>
                                                <tr>
                                                    <th className="text-center p-50" style={{ width: '5%' }}>№</th>
                                                    <th className="p-50" style={{ width: '45%' }}>Бараа</th>
                                                    <th className="p-50" style={{ width: '10%' }}>Т/ш</th>
                                                    <th className="text-end p-50" style={{ width: '20%' }}>Үнэ</th>
                                                    <th className="text-end p-50" style={{ width: '20%' }}>Дүн</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    ebarimtDatas?.receipts[0]?.items?.map((item, idx) => {
                                                        return(
                                                            <tr key={idx} style={{ lineHeight: 1 }}>
                                                                <td className="text-center p-50" style={{ width: '5%' }}>{idx+1}</td>
                                                                <td className="p-50" style={{ width: '45%' }}>{item?.name}</td>
                                                                <td className="p-50" style={{ width: '10%' }}>{item?.qty}</td>
                                                                <td className="text-end p-50" style={{ width: '20%' }}>{moneyFormat(item?.unitPrice, 2)}</td>
                                                                <td className="text-end p-50" style={{ width: '20%' }}>{moneyFormat(item?.totalAmount, 2)}</td>
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                        <table className="border border-end-0 border-start-0" style={{ fontSize: '11px' }}>
                                            <tr>
                                                <td className="ps-1">Нийт үнэ:</td>
                                                <td>{moneyFormat(ebarimtDatas?.totalAmount, 2)}</td>
                                                <td>НХАТ:</td>
                                                <td>{moneyFormat(ebarimtDatas?.totalCityTax, 2)}</td>
                                            </tr>
                                            <tr>
                                                <td className="ps-1">НӨАТ:</td>
                                                <td>{moneyFormat(ebarimtDatas?.totalVAT, 2)}</td>
                                                <td>Бүгд үнэ:</td>
                                                <td>{moneyFormat(ebarimtDatas?.totalAmount, 2)}</td>
                                            </tr>
                                        </table>
                                        <div className="text-center mt-3" style={{ fontSize: '12px' }}>
                                            {
                                                ebarimtDatas?.lottery &&
                                                <div className="fw-bolder">Сугалаа <strong>{ebarimtDatas?.lottery}</strong></div>
                                            }
                                            <img
                                                width={120}
                                                style={{ objectFit: 'cover' }}
                                                src={ebarimtDatas?.q_image ? `data:image/png;base64,${ebarimtDatas?.q_image}` : empty}
                                                alt=''
                                                onError={errorImage}
                                            />
                                            {
                                                ebarimtDatas?.b_image &&
                                                <div>
                                                    <img
                                                        alt="img"
                                                        width={250}
                                                        height={30}
                                                        style={{ objectFit: 'cover' }}
                                                        onError={({ currentTarget }) => {
                                                            currentTarget.onerror = null;
                                                            currentTarget.src = "/images/empty-image.jpg";
                                                        }}
                                                        src={ebarimtDatas?.b_image ? `data:image/png;base64,${ebarimtDatas?.b_image}` : empty}
                                                    />
                                                    <p className="fw-bolder">{ebarimtDatas?.id}</p>
                                                </div>
                                            }
                                        </div>
                                    </Row>
                                    {
                                        isBusiness &&
                                        <div className="row text-center fw-bold mt-5" style={{ fontSize: '11px' }}>
                                            <div className="col-3">
                                                <br />
                                                Тамга
                                            </div>
                                            <div className="col-8">
                                                <div className="col-12" md={12}>
                                                    <span>Хүлээн авсан: ...................................................... /....................................../</span>
                                                </div>
                                                <div className="col-12" md={12}>
                                                    <span className="text-end ms-5" style={{ fontStyle: 'italic' }}>(гарын үсэг)</span>
                                                    <span className="ms-50" style={{ fontStyle: 'italic' }}>(нэр)</span>
                                                </div>
                                                <div className="col-12">
                                                    <span>Хүлээлгэн өгсөн: ................................................. /....................................../</span>
                                                </div>
                                                <div className="col-12">
                                                    <span className="text-end ms-5" style={{ fontStyle: 'italic' }}>(гарын үсэг)</span>
                                                    <span className="ms-50" style={{ fontStyle: 'italic' }}>(нэр)</span>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            </ModalBody>
            <ModalFooter className='d-flex justify-content-center'>
                <Button color="secondary" type="reset" outline size="sm" onClick={handleModal}>
                    Хаах
                </Button>
                <Button className="me-2" color="primary" type="submit" size="sm" onClick={() => handlePrint()}>
                    Хэвлэх
                </Button>
            </ModalFooter>
        </Modal>
    )
}