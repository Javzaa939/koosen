import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import PrintError from '@src/components/PrintError'

import './style.scss'

function Print() {

    const location = useLocation()

    const datas = location.state || []

    /**
     * Сонгосон оюутнуудыг тушаалын дугаар болон тушаалын огноо тус бүрээр
     * Ангилж тус тус хуудсанд хэвлэнэ.
     */
    const tushaal_dates = [...new Set(datas.map(data => data?.statement_date))]
    const tushaal_states = [...new Set(datas.map(data => data?.statement))]

    function vfilter(date, state) {

        var mdata = datas.filter(cdata => cdata.statement_date === date).filter(cdata => cdata.statement === state)

        return mdata
    }

    var pages_length = [...tushaal_dates.flatMap(data => {
        return[
            ...tushaal_states.map(val => {
                if(vfilter(data, val).length > 0)
                return('test')
            }
            )
        ]})
    ].filter(val => val != null).length

    let printed = false
    function imageLoaded()
    {
        if (datas.length > 0 && !printed)
        {
            printed=true
            setTimeout(() => window.print(), 1000)
        }
    }

     useEffect(
        () =>
        {
            imageLoaded()

            window.onafterprint = function()
            {
                window.history.go(-1);
            }
        },
        []
    )

    if(datas?.length > 0) {
        return (
            <div>
                {
                    tushaal_dates.map(data => {
                        return(
                            tushaal_states.map((val, idx) => {
                                if(vfilter(data, val).length > 0){
                                    return(
                                        <div className={`m-1`} key={idx} style={{ pageBreakAfter:  idx == pages_length - 1 ? 'none' : 'always' }}>
                                            <div>
                                                <h1 style={{ color: 'black' }}>
                                                    Чөлөөний бүртгэл
                                                </h1>
                                                <div className='d-flex justify-content-between my-50'>
                                                    <div>
                                                    </div>
                                                    <div>
                                                        {
                                                            val &&
                                                            `Тушаалын дугаар: ${val}`
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <table className='tushaal'>
                                                <thead>
                                                    <tr>
                                                        <th>
                                                            №
                                                        </th>
                                                        <th>
                                                            Код
                                                        </th>
                                                        <th>
                                                            Овог
                                                        </th>
                                                        <th>
                                                            Нэр
                                                        </th>
                                                        <th>
                                                            7 хоног
                                                        </th>
                                                        <th>
                                                            Тушаал
                                                        </th>
                                                        <th>
                                                            Тушаалын огноо
                                                        </th>
                                                        <th>
                                                            Чөлөө авсан улирал
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                {
                                                    (vfilter(data, val)).map((cdata, cidx) => {
                                                        return(
                                                            <tr key={cidx}>
                                                                <td>{cidx + 1}</td>
                                                                <td>{cdata?.student.code}</td>
                                                                <td>{cdata?.student.last_name}</td>
                                                                <td>{cdata?.student.first_name}</td>
                                                                <td>{cdata?.learn_week}</td>
                                                                <td>{cdata?.statement || ''}</td>
                                                                <td>{cdata?.statement_date || ''}</td>
                                                                <td></td>
                                                            </tr>
                                                        )
                                                    })
                                                }
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                }
                            })
                        )
                    })
                }
            </div>
        )
    } else {
        return(
            <PrintError/>
        )
    }
}

export default Print
