
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
            printAuto()
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
                // setTimeout(() => window.print(), 1000)
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
        <div className='vh-100 position-relative bg-white' style={{ fontFamily: 'Arial', color: 'black' }} >

            {isLoading && Loader}

            {/* Үндсэн хэсэг */}
            <div className='position-absolute text-center' style={{ top: '300px', width: '100%', fontSize: '19px', lineHeight: '30px' }} >
                <div className='m-auto' style={{ width: '1000px' }}>
                    <span className='text-center fst-italic'>This is to certify that <span className='fw-bolder text-uppercase'>{data?.student?.last_name_eng} {data?.student?.first_name_eng}</span> a citizen of {data?.student?.citizenship?.name_eng},
                    <br />
                    has been duly awarded by the President order {data?.graduation_number} dated on {monthToText(data?.graduation_date?.substring(5, 7))} {data?.graduation_date?.substring(8, 10)}, {data?.graduation_date?.substring(0, 4)} upon
                    <br />
                    the decision of the Graduation Commission on {monthToText(data?.decision_date?.substring(5, 7))} {data?.decision_date?.substring(8, 10)}, {data?.decision_date?.substring(0, 4)} the degree of</span>
                    <br />
                    <span className='fw-bolder text-uppercase'>{data?.student?.group?.degree?.degree_eng_name} of {data?.student?.group?.profession?.dep_name_eng}</span>
                    <br />
                    <span className='text-center fst-italic'>for having successfully complated the prescribed course of study in
                    <br />
                    <span className='text-uppercase'><span className='fst-normal fw-bolder'>{data?.student?.group?.profession?.name_eng}</span> / {data?.student?.group?.degree?.degree_code}{data?.student?.group?.profession?.code} /</span>
                    <br />
                     at the Mongolian National University for the period of {data?.student?.group?.join_year?.substring(0, 4)}-{data?.lesson_year?.substring(5, 9)}.</span>
                </div>
            </div>

            {/* Гарын үсгийн хэсэг */}
            <div className='position-absolute' style={{ bottom: '100px', fontSize: '15px' }} >
                <div style={{ paddingLeft: '170px', paddingRight: '70px' }} >
                    <div className='d-flex w-100 text-center justify-content-center fst-italic'>

                        {
                            listArr.length != 0
                            &&
                            listArr.map((val, idx) =>
                            {
                                return (
                                    <div className='w-25 d-flex flex-column pt-4 pb-2' style={{ paddingRight: '7px', paddingLeft: '7px' }} key={idx} >
                                        <span>_______________________</span>
                                        <span>{val?.last_name_eng} {val?.first_name_eng}</span>
                                        <span>{val?.position_name_eng}</span>
                                    </div>
                                )
                            })
                        }

                    </div>
                </div>

                {/* Footer */}
                <div className='d-flex justify-content-between fst-italic'>
                    <span style={{ paddingLeft: '130px' }} >Ulaanbaatar, Mongolia</span>
                    <span style={{ paddingRight: '150px' }} >Registration No: {data?.registration_num}</span>
                </div>
            </div>

        </div>
    )
}
