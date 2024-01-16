
import React, { useState, useEffect } from 'react'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import './style.css'

export default function PrintMongolia()
{
    const data = JSON.parse(localStorage.getItem('blankDatas'))

    // Loader
	const { fetchData, Loader, isLoading } = useLoader({ isFullScreen: false })

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

    function dugeerUg(too)
    {
        switch (too)
        {
            case '0' || 0:
                return 'дүгээр'
            case '1' || 1:
                return 'дүгээр'
            case '2' || 2:
                return 'дугаар'
            case '3' || 3:
                return 'дугаар'
            case '4' || 4:
                return 'дүгээр'
            case '5' || 5:
                return 'дугаар'
            case '6' || 6:
                return 'дугаар'
            case '7' || 7:
                return 'дугаар'
            case '8' || 8:
                return 'дугаар'
            case '9' || 9:
                return 'дүгээр'
            default:
                break;
        }
    }

    return (
        <div
            className={`vh-100 position-relative d-flex flex-column justify-content-end align-items-center bg-white`}
            style={{ fontFamily: 'Arial', color: 'black' }}
        >

            {isLoading && Loader}

            {/* Үндсэн хэсэг */}
            <div className='text-center' style={{ width: '100%', lineHeight: '30px', fontSize: '19px' }} >
                <div className='m-auto' style={{ width: '700px' }}>
                    {data?.student?.citizenship?.name} улсын иргэн <span className='text-uppercase fw-bolder'>{data?.student?.lastname} {data?.student?.first_name}</span> нь
                    <br />
                    {data?.student?.group?.join_year?.substring(0, 4)}-{data?.lesson_year?.substring(5, 9)} онд {data?.student?.school_name}д
                    "{data?.student?.group?.profession?.name}" мэргэжил ({data?.student?.group?.degree?.degree_code}{data?.student?.group?.profession?.code})-ээр суралцаж төгссөн тул Их сургуулийн захирлын
                    &nbsp;{data?.decision_date?.substring(0, 4)} оны {data?.decision_date?.substring(5, 7)} {dugeerUg(data?.decision_date?.substring(5, 7) && data?.decision_date?.substring(5, 7).charAt(data?.decision_date?.substring(5, 7).length - 1))} сарын {data?.decision_date?.substring(8, 10)} өдрийн {data?.graduation_number} {dugeerUg(data?.graduation_number && data?.graduation_number.charAt(data?.graduation_number.length - 1))} тушаалаар
                    <span style={{ whiteSpace: 'nowrap' }}><span className='text-uppercase'> {data?.student?.group?.profession?.dep_name} {data?.student?.group?.degree?.degree_name}</span>-ын зэрэг олгов.</span>
                </div>
            </div>

            {/* Гарын үсгийн хэсэг */}
            <div style={{ bottom: '0', fontSize: '15px' }} >
                <div style={{ paddingLeft: '100px', paddingRight: '100px', lineHeight: '18px', marginTop: '100px', marginBottom: '10px' }} >
                    <div className='d-flex w-100 text-center justify-content-center'>

                        {
                            listArr.map((val, idx) =>
                            {
                                return (
                                    <div className='d-flex flex-column pt-2 pb-2' style={{ paddingRight: '20px', paddingLeft: '20px' }} key={idx} >
                                        <span className='border-top-black'>{val?.position_name}</span>
                                        <span>{val?.last_name}{val?.first_name}</span>
                                    </div>
                                )
                            })
                        }

                    </div>
                </div>

                {/* Footer */}
                <div className='d-flex justify-content-between'>
                    <span style={{ paddingLeft: '180px' }} >Улаанбаатар хот</span>
                    <span style={{ paddingRight: '230px' }} >Бүртгэлийн дугаар: {data?.registration_num}</span>
                </div>
            </div>
        </div>
    )
}
