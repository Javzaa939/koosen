import React, { Fragment, useEffect } from "react"

import { Row } from 'reactstrap'
import { useLocation } from 'react-router-dom';

// ** Styles
import '@styles/base/pages/app-invoice-print.scss'

import './style.css'

export default function Print()
{
    const location = useLocation();
    const data = location.state
    const datas = data.datas
    const dates = data.dates

    var statement_date = dates.statement_date?.split('-')
    var month = statement_date[statement_date.length - 2]
    var day = statement_date[statement_date.length - 1]
    const now_year = new Date().getFullYear()

    useEffect(
        () =>
        {
            if (Object.keys(datas).length != 0)
            {
                setTimeout(() => window.print(), 1000)
            }
        },
        [data]
    )

    useEffect(
        () =>
        {

            window.onafterprint = function()
            {
                window.history.go(-1);
            }
        },
        []
    )

    return (
        <Fragment>
            <div className='invoice-print mt-5 fontchange' style={{color: '#1a1a1a !important'}} >
                <div className='d-flex justify-content-end align-items-center '>
                    <div className="d-flex flex-column text-center me-4 state-print w-25">
                        <span className='text-dark ms-1 mt-1' style={{ fontWeight: 800}}>
                            {`Сургуулийн захирлын ${now_year} оны ${month} сарын ${day}-н өдрийн ${dates.statement} дугаар тушаалын хавсралт № 1`}
                        </span>
                    </div>
                </div>
            </div>
            <Row className="px-5 mt-5 fontchange" style={{ fontWeight: 100}}>
                <table className="table-bordered">
                    <thead style={{ color: '#1a1a1a'}}>
                        <tr className="text-center">
                            <th scope="col">№</th>
                            <th scope="col">Овог</th>
                            <th scope="col">Нэр</th>
                            <th scope="col">Регистр</th>
                            <th scope="col">Суралцаж байсан анги</th>
                            <th scope="col">Суралцах анги</th>
                        </tr>
                    </thead>
                    <tbody style={{ color: 'black'}}>
                        {
                            datas.map((item, idx) =>
                                <tr key={idx} className='text-center p-1'>
                                    <th scope="row">{idx + 1}</th>
                                    <th>{item?.student?.last_name}</th>
                                    <th>{item?.student?.first_name}</th>
                                    <th>{item?.student?.register_num}</th>
                                    <th>{item?.student?.group_name}</th>
                                    <th>{item?.student_new?.group_name}</th>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </Row>
        </Fragment>
    )
}