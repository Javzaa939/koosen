
import React, { useState, useEffect } from 'react'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import './style.css'

export default function PrintMongolia()
{
    const data = JSON.parse(localStorage.getItem('blankDatas'))

    // Loader
	const { fetchData, Loader, isLoading } = useLoader({})

    // API
    const signatureApi = useApi().signature

    // State
    const [ listArr, setListArr ] = useState([])

    async function getAllData()
    {
        await Promise.all([
            fetchData(signatureApi.get(2)),
        ]).then((values) => {
            setListArr(values[0]?.data)
        })
    }

    useEffect(
        () =>
        {
            getAllData()

            window.onafterprint = function()
            {
                window.close()
            }
        },
        []
    )

    useEffect(
        () =>
        {
            if (data && listArr.length != 0)
            {
                setTimeout(() => window.print(), 1000)
            }
        },
        [data, listArr]
    )

    return (
        // <div className='vh-100 p-0' style={{ fontFamily: 'CMs Urga dp' }}  >
        //<div className='vh-100 p-0' style={{ fontFamily: 'CMSUBDP' }}  >
        <div className='vh-100 p-0' style={{ fontFamily: 'CMSHRDP' }}  >

            {isLoading && Loader}

            <div className='position-relative w-100 h-100'>

                <div className='d-flex position-absolute start-0' >
                    <div className='text-center' style={{ writingMode: 'vertical-rl', transform: 'scale(-1, 1)', fontSize: '30px' }} >
                        doge* <span style={{ fontFamily: 'serif' }}>{data?.student?.group?.degree?.degree_code}</span>{data?.diplom_num}
                    </div>

                    <div style={{ writingMode: 'vertical-rl', transform: 'scale(-1, 1)', fontSize: '30px', textAlign: 'justify', textAlignLast: 'center' }} >
                        {data?.student?.citizenship?.name_uig} folo_ oa fJrhEa {data?.student?.last_name_uig} {data?.student?.first_name_uig} nh {data?.student?.group?.join_year?.substring(0, 4)} - {data?.lesson_year?.substring(5, 9)} Foa dO Moekgo& oa foiedosoa O YekEt SorgegolI dO {data?.student?.group?.profession?.name_uig} <span style={{ fontFamily: 'serif' }}>/{data?.student?.group?.degree?.degree_code}</span > {data?.student?.group?.profession?.code} <span style={{ fontFamily: 'serif' }}>/</span> MerkEji& iie* Sorolcea DeKsohsea Dola
                        DeKsolda iia Silgelda iia |mis_ oa {data?.decision_date?.substring(0, 4)} Foa O {data?.decision_date?.substring(5, 7)} doge* Se*T iia {data?.decision_date?.substring(8, 10)} - O Fdo* oa SiioeBrI iI Foiedosolea , Jehuro& oa {data?.graduation_date?.substring(0, 4)} Foa O {data?.graduation_date?.substring(5, 7)} doge* Se*T iia {data?.graduation_date?.substring(8, 10)} - O Fdo* oa {data?.graduation_number} DogedO Dosiye& iie* {data?.student?.group?.profession?.dep_name_uig}
                        <br />
                        <span className='fw-bolder'>{data?.student?.group?.degree?.degree_name_uig}</span> oa JerhEt FolgobEt.
                    </div>
                </div>

                <div className='d-flex position-absolute' style={{ right: '70px' }} >

                    {/* Гарын үсгийн хэсэг */}
                            {
                                listArr.length != 0
                                &&
                                listArr.map((val, idx) =>
                                {
                                    return (
                                        <div style={{ writingMode: 'vertical-rl', transform: 'scale(-1, 1)', fontSize: '20px', marginTop: '40px' }} key={idx} >
                                            <span>{val?.position_name_uig}</span> <span>{val?.last_name_uig} {val?.first_name_uig} ,,,,,,,,,,,,,</span>
                                        </div>
                                    )
                                })
                            }

                    <div className='d-flex justify-content-between' style={{ writingMode: 'vertical-rl', transform: 'scale(-1, 1)', fontSize: '24px', marginLeft: '58px' }} >
                        <span>Moekgo& folo_ , folegefbEgedo* Hoda</span>
                        <span>BirioekE& oa doge* {data?.registration_num}</span>
                    </div>
                </div>

            </div>
        </div>
    )
}
