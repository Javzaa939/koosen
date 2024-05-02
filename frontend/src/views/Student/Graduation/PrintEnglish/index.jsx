
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
            fetchData(signatureApi.get(2, data?.student?.group?.profession?.school)),
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
                setTimeout(() => window.print(), 1000)
            }
        },
        [data, listArr]
    )

    function monthToText(month)
    {
        let text = ''

        let intMonth = parseInt(month)

        switch (intMonth)
        {
            case 1 || '01':
                text = 'January'
                break;

            case 2:
                text = 'February'
                break;

            case 3:
                text = 'March'
                break;

            case 4:
                text = 'April'
                break;

            case 5:
                text = 'May'
                break;

            case 6:
                text = 'June'
                break;

            case 7:
                text = 'July'
                break;

            case 8:
                text = 'August'
                break;

            case 9:
                text = 'September'
                break;

            case 10:
                text = 'October'
                break;

            case 11:
                text = 'November'
                break;

            case 12:
                text = 'December'
                break;

            default:
                break;
        }

        return text
    }

    return (
        //<div className='vh-100 position-relative  d-flex flex-column  bg-white' style={{ fontFamily: 'Arial', color: 'black' }} >
        <div
            className={`vh-100 position-relative d-flex flex-column justify-content-end align-items-center bg-white`}
            style={{ fontFamily: 'Arial', color: 'black' }}
        >
            {isLoading && Loader}

            {/* Үндсэн хэсэг */}
            <div className='text-center' style={{ width: '100%', fontSize: '19px', lineHeight: '30px', top: '250px', }} >
                <div className='m-auto' >
                    <span className='text-center'>This is to certify that
                        <br />
                        <span className='fw-bolder text-uppercase'>{data?.student?.first_name_eng}</span> <span className='fw-bolder'>{data?.student?.last_name_eng}</span>
                        <br />
                        citizen of {data?.student?.citizenship?.name_eng},
                        <br />
                        has completed requirements of the programme {data?.student?.group?.profession?.name_eng} ({data?.student?.group?.degree?.degree_code}{data?.student?.group?.profession?.code})
                        <br />
                        was awarded the degree of <span className='text-uppercase'>{data?.student?.group?.degree?.degree_eng_name} OF {data?.student?.group?.profession?.dep_name_eng}</span>
                        <br />
                        by the President's order {data?.graduation_number} dated {data?.graduation_date?.substring(8, 10)} {monthToText(data?.graduation_date?.substring(5, 7))} {data?.graduation_date?.substring(0, 4)}, based on the decision of the
                        <br />
                        Graduation Examination Committee
                    </span>
                </div>
            </div>

            {/* Гарын үсгийн хэсэг */}
            <div style={{ bottom: '0', fontSize: '15px' }} >
                <div style={{ paddingLeft: '100px', paddingRight: '100px', lineHeight: '18px', marginTop: '80px', marginBottom: '10px' }} >
                    <div className='d-flex text-center justify-content-center' style={{width: '400px'}}>
                        {
                            listArr.length != 0
                            &&
                            listArr.map((val, idx) =>
                            {
                                return (
                                    <div className='d-flex flex-column pt-2 pb-2' style={{ paddingRight: '20px', paddingLeft: '20px' }} key={idx} >
                                        <span className='border-top-black' style={{ paddingTop: '3px' }}>{val?.last_name_eng}{val?.first_name_eng}</span>
                                        <span>{val?.position_name_eng}</span>
                                    </div>
                                )
                            })
                        }

                    </div>
                </div>

                {/* Footer */}
            </div>
            <div className='d-flex justify-content-between w-100 mb-5'>
                <span style={{ paddingLeft: '130px' }} >ULAANBAATAR CITY</span>
                <span style={{ paddingRight: '150px' }} >REGISTER No {data?.registration_num}</span>
            </div>
        </div>
    )
}
