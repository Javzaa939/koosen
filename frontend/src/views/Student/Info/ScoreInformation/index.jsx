
import React from "react"

import { Card, Row, Col, UncontrolledCollapse } from "reactstrap"
import { useTranslation } from 'react-i18next'

import { CTable } from "./CTable"

export default function ScoreInformation({ datas })
{
    const { t } = useTranslation()

    return (
        <Card className='mt-1 m-0'>

            <div className='added-cards border'>

                <div className='cardMaster rounded p-1 fw-bolder underline text-decoration-underline' role="button" id="scoreToggler">
                    Дүнгийн мэдээлэл
                </div>

                <UncontrolledCollapse toggler="#scoreToggler" className="m-2">
                <hr />
                    {
                        <div className="mt-2 text-center" sm={12}>
                            <span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
                        </div>
                        ?
                            <>
                                <Row className="m-1">
                                    <Col className="" md={12}>
                                        {
                                            datas && datas.length > 0 &&
                                            datas.map((data, idx) => {
                                                return (
                                                    <div className='mb-3' key={idx}>
                                                        <CTable
                                                            data={data}
                                                            title={data.year_season}
                                                        />
                                                    </div>
                                                )
                                            })
                                        }

                                    </Col>
                                    </Row>
                            </>
                        :
                            <div className="sc-dmctIk gLxfFK react-dataTable text-center">
                                <div className="sc-fLcnxK dApqnJ">
                                    <div className="sc-bcXHqe kVrXuC rdt_Table" role="table">
                                        <div className="sc-iveFHk bzRnkJ">
                                            <div className="my-2">
                                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    }

                    <div className="text-end" >
                        <button className="btn btn-primary me-2" onClick={() => { document.getElementById('scoreToggler').click() }} >
                            Хаах
                        </button>
                    </div>

                </UncontrolledCollapse>
            </div>
        </Card>
    )
}
