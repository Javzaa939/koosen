
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

    return (

        // энэ мөрний стайлын учир сайн олдохгүй л байна.
        // Харагдах байдал нь print preview дээр зүгээр
        // хэрнээ хэвлэхээр арагшаа гүйгээд байна.

        // Ерөнхийдөө ажиллагаа одоогоор хэвийн. Өөр төхөөрөмжүүд дээр тестлэж, засвар хийж цэгцлэх шаардлагатай

        <div
            className={`
                vh-100 position-relative
                d-flex flex-column justify-content-center align-items-center

                pe-5

                bg-white
            `}
            style={{ fontFamily: 'Arial', color: 'black' }} >

            {isLoading && Loader}


            <div className='bg-info' style={{ height: 200 }}>
                {/* Хоосон хэсэг */}
            </div>

            {/* Үндсэн хэсэг */}
            <div className='text-center' style={{ top: '', width: '100%', lineHeight: '30px', fontSize: '19px' }} >
                <div className='m-auto' style={{ width: '1000px' }}>
                    <span className='fst-italic' >{data?.student?.citizenship?.name} улсын иргэн <span className='fw-bolder'>{data?.student?.last_name} <span className='fw-normal' >овогтой</span> {data?.student?.first_name}</span> нь </span>
                    <br />
                    <span className='fst-italic' >{data?.student?.group?.join_year?.substring(0, 4)}-{data?.lesson_year?.substring(5, 9)} онд Дотоод Хэргийн Их Сургуульд </span>
                    <br />
                    <span className='fw-bolder text-uppercase'>{data?.student?.group?.profession?.name}</span> <span className='fst-italic' >/{data?.student?.group?.degree?.degree_code}{data?.student?.group?.profession?.code}/</span>
                </div>
                <div className='m-auto' style={{ width: '1000px' }}>
                    <span className='text-center fst-italic' >мэргэжлээр суралцаж төгссөн тул төгсөлтийн шалгалтын комиссын <br /> {data?.decision_date?.substring(0, 4)} оны {data?.decision_date?.substring(5, 7)} дугаар сарын {data?.decision_date?.substring(8, 10)} өдрийн шийдвэрийг үндэслэн захирлын <br /> {data?.graduation_date?.substring(0, 4)} оны {data?.graduation_date?.substring(5, 7)} дугаар сарын {data?.graduation_date?.substring(8, 10)} өдрийн {data?.graduation_number} тоот тушаалаар <br /> <span className='fw-bolder text-uppercase'><span className='fst-normal'>{data?.student?.group?.profession?.dep_name}</span> <span className='text-uppercase' >{data?.student?.group?.degree?.degree_name}</span> </span>-ын зэрэг олгов. </span>
                </div>
            </div>

            {/* Гарын үсгийн хэсэг */}
            <div className='mb-2' style={{ bottom: '0', fontSize: '15px' }} >
                <div className='mb-2 mt-5' style={{ paddingLeft: '70px', paddingRight: '70px' }} >
                    <div className='d-flex w-100 text-center justify-content-center fst-italic'>

                        {
                            listArr.length != 0
                            &&
                            listArr.map((val, idx) =>
                            {
                                return (
                                    <div className='w-25 d-flex flex-column pt-2 pb-2' style={{ paddingRight: '7px', paddingLeft: '7px' }} key={idx} >
                                        <span>_______________________</span>
                                        <span>{val?.position_name}</span>
                                        <span>{val?.last_name} {val?.first_name}</span>
                                    </div>
                                )
                            })
                        }

                    </div>
                </div>

                {/* Footer */}
                <div className='d-flex justify-content-between fst-italic'>
                    <span style={{ paddingLeft: '130px' }} >Монгол улс, Улаанбаатар хот</span>
                    <span style={{ paddingRight: '150px' }} >Бүртгэлийн дугаар: {data?.registration_num}</span>
                </div>
            </div>

        </div>
    )
}
