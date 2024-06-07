import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import themeConfig from "@configs/themeConfig"

import PrintError from '@src/components/PrintError'
import './style.scss'

function Print() {

    const navigate = useNavigate()
    const location = useLocation()
    const datas = location?.state || []

    let printed = false
    function handlePrint(){
        if(datas?.length > 0) {
            if(!printed){
                setTimeout(() => {
                    window.print()
                }, 1500);
            }
        }
        printed = true
    }

    useEffect(() => {
        handlePrint();
        window.onafterprint = function(){
            navigate(-1)
        }
    })

    if (datas?.length > 0) {
        return (
            <div>
                <div className='text-center'>
                    <img height={80} width={80} src={themeConfig.app.appLogoImage}/>
                </div>
                <div>
                    <h4 style={{ color: '#000' }}>
                        Голч дүнгийн жагсаалт
                    </h4>
                </div>
                <table className='gpareport w-100'>
                    <thead>
                        <tr>
                            <th>
                                №
                            </th>
                            <th>
                                Оюутны код
                            </th>
                            <th>
                                Регистрийн дугаар
                            </th>
                            <th>
                                Овог
                            </th>
                            <th>
                                Нэр
                            </th>
                            <th>
                                Багц цаг
                            </th>
                            <th>
                                Дүнгийн онооны дундаж
                            </th>
                            <th>
                                Голч дүн
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            datas?.map((data, idx) => {
                                return(
                                    <tr key={idx}>
                                        <td>
                                            {idx + 1}
                                        </td>
                                        <td>
                                            {data?.code || ''}
                                        </td>
                                        <td>
                                            {data?.register_num || ''}
                                        </td>
                                        <td>
                                            {data?.last_name || ''}
                                        </td>
                                        <td>
                                            {data?.first_name || ''}
                                        </td>
                                        <td>
                                            {data?.total_kr || ''}
                                        </td>
                                        <td>
                                            {data?.total_avg || ''}
                                        </td>
                                        <td>
                                            {data?.total_gpa || ''}
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        )
    } else {
        return(
            <PrintError />
        )
    }
}

export default Print
