
import React, { useState, useEffect } from 'react'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import './style.css'

export default function PrintMongolia({ nestingData })
{
    const data = JSON.parse(localStorage.getItem('blankDatas'))

    if (nestingData) {
        Object.assign(data, nestingData);
    }
    // Loader
	const { fetchData, Loader, isLoading } = useLoader({ isFullScreen: false })

    // API
    const signatureApi = useApi().signature

    // State
    const [ listArr, setListArr ] = useState([])

    async function getAllData()
    {
        await Promise.all([
            // Нэгдсэн нэг сургуулийн захирал гарын үсэг хэвлэж байгаа болохоор data?.student?.group?.profession?.school
            fetchData(signatureApi.get(2)),
        ]).then((values) => {
            setListArr(values[0]?.data)
        })
    }

    useEffect(
        () =>
        {
            getAllData()

            // window.onafterprint = function()
            // {
            //     window.close()
            // }
        },
        []
    )

    useEffect(
        () =>
        {
            if (data && listArr.length != 0)
            {
                document.title = `${data?.student?.full_name}-хавсралт-монгол`
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

    function niiUg(too)
    {
        switch (too)
        {
            case '0' || 0:
                return '-ны'
            case '1' || 1:
                return '-ний'
            case '2' || 2:
                return '-ны'
            case '3' || 3:
                return '-ны'
            case '4' || 4:
                return '-ний'
            case '5' || 5:
                return '-ны'
            case '6' || 6:
                return '-ны'
            case '7' || 7:
                return '-ны'
            case '8' || 8:
                return '-ны'
            case '9' || 9:
                return '-ний'
            default:
                break;
        }
    }

    const PADDING_QR = 50

    return (
        <div
            className={`vh-100 position-relative d-flex flex-column justify-content-end align-items-center bg-white`}
            style={{ fontFamily: 'Arial', color: 'black' }}
        >

            {isLoading && Loader}

            {/* Үндсэн хэсэг */}
            <div className='text-center' style={{ width: '100%', lineHeight: '30px', fontSize: '19px' }} >
                <div className='m-auto' style={{ width: '700px' }}>
                    {data?.student?.citizenship?.name} Улсын иргэн <span className='text-uppercase fw-bolder'>{data?.student?.last_name}</span> овогтой <span className='text-uppercase fw-bolder'>{data?.student?.first_name}</span> нь
                    <br/>
                    {/* {data?.student?.group?.join_year?.substring(0, 4)}-{data?.lesson_year?.substring(5, 9)} онд {data?.student?.school_name}д */}
                    {data?.student?.group?.profession?.name}, {data?.student?.group?.profession?.code} хөтөлбөрөөр суралцан төгссөн тул Их сургуулийн
                    <br/>
                    захирлын {data?.decision_date?.substring(0, 4)} оны {data?.decision_date?.substring(5, 7)} {dugeerUg(data?.decision_date?.substring(5, 7) && data?.decision_date?.substring(5, 7).charAt(data?.decision_date?.substring(5, 7).length - 1))} сарын {data?.decision_date?.substring(8, 10)}{niiUg(data?.decision_date?.substring(8, 10) && data?.decision_date?.substring(8, 10).charAt(data?.decision_date?.substring(8, 10).length - 1))} өдрийн {data?.graduation_number} {dugeerUg(data?.graduation_number && data?.graduation_number.charAt(data?.graduation_number.length - 1))} тушаалаар
                    <span style={{ whiteSpace: 'nowrap' }}><span className='text-uppercase'> {data?.student?.group?.profession?.dep_name} {data?.student?.group?.degree?.degree_name}</span>-ын зэрэг олгов.</span>
                </div>
            </div>

            {/* Гарын үсгийн хэсэг */}
            <div style={{ bottom: '0', fontSize: '15px' }} >
                <div style={{ paddingLeft: '100px', paddingRight: '100px', lineHeight: '18px', marginTop: '80px', marginBottom: '10px' }} >
                    <div className='d-flex text-center justify-content-center' style={{width: '400px'}}>
                        {
                            listArr.map((val, idx) =>
                            {
                                var splitted = val?.position_name?.split(',')
                                return (
                                    <div className='d-flex flex-column pt-2 pb-2' style={{ paddingRight: '20px', paddingLeft: '20px' }} key={idx} >
                                        <div className='border-top-black' style={{width: '400px'}}>
                                            <span className='' style={{textWrap: 'wrap'}}>{`${splitted[0]},`}</span>
                                            <br/>
                                            <span className='' style={{textWrap: 'wrap'}}>{splitted.slice(1).join(',')}</span>
                                        </div>
                                        <span>{val?.last_name}{val?.first_name}</span>
                                    </div>
                                )
                            })
                        }

                    </div>
                </div>
            </div>
            {/* <div className='d-flex justify-content-between align-items-end w-100 mb-5'>
                <div className='d-flex align-items-end' style={{ paddingLeft: '180px' }} >
                    <img src='/publicfiles/student_uia (1).png' height={100}/>
                    <p className='mb-50'>Улаанбаатар хот</p>
                </div>
                <p className='mb-50' style={{ paddingRight: '230px' }} >Бүртгэлийн дугаар {data?.registration_num}</p>
            </div> */}

            <div className='d-flex justify-content-between w-100 align-items-center' style={{ paddingBottom: PADDING_QR, paddingLeft: PADDING_QR, paddingRight: PADDING_QR }}>
                <span className='d-flex align-items-center' style={{ paddingLeft: '1rem' }} >
                    {
                        data?.diplom_qr
                        &&
                        <img
                            src={`data:image/jpeg;base64,${data?.diplom_qr}`}
                            alt="img"
                            width={100}
                            height={110}
                            style={{ objectFit: 'cover' }}
                            onError={({ currentTarget }) =>
                            {
                                currentTarget.onerror = null;
                            }}
                        />
                    }
                    <div className='pb-50 ms-25'>Улаанбаатар хот</div>
                </span>
                <span className='pb-50 pe-5 me-1'>Бүртгэлийн дугаар: {data?.registration_num}</span>
            </div>
        </div>
    )
}
