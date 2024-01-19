
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

                let highest = 0

                for (let data of document.getElementsByClassName('signature_national'))
                {
                    if (highest < data.getBoundingClientRect().height)
                    {
                        highest = data.getBoundingClientRect().height
                    }
                }

                for (let data of document.getElementsByClassName('signature_national'))
                {
                    data.style.height = `${highest}px`
                }
            }
        },
        [data, listArr]
    )

    function tooBichih(too)
    {
        return ( <span style={{ fontFamily: 'CMSUB', fontSize: '25px' }}>{too}</span> )
    }

    function tushaal(text)
    {
        let slash = text.split('/')

        return <><span>ᠠ/</span><span style={{ fontFamily: 'CMSUB', fontSize: '25px' }}>{slash[1]}</span></>
    }

    function dugeerUg(too)
    {
        switch (too)
        {
            case '0' || 0:
                return 'ᠳ᠋ᠤᠭᠠᠷ'
            case '1' || 1:
                return 'ᠳ᠋ᠦᠭᠠᠷ'
            case '2' || 2:
                return 'ᠳ᠋ᠤᠭᠠᠷ'
            case '3' || 3:
                return 'ᠳ᠋ᠤᠭᠠᠷ'
            case '4' || 4:
                return 'ᠳ᠋ᠦᠭᠠᠷ'
            case '5' || 5:
                return 'ᠳ᠋ᠤᠭᠠᠷ'
            case '6' || 6:
                return 'ᠳ᠋ᠤᠭᠠᠷ'
            case '7' || 7:
                return 'ᠳ᠋ᠤᠭᠠᠷ'
            case '8' || 8:
                return 'ᠳ᠋ᠤᠭᠠᠷ'
            case '9' || 9:
                return 'ᠳ᠋ᠦᠭᠠᠷ'
            default:
                break;
        }
    }

    return (
        <div className='vh-100 position-relative' style={{ fontFamily: 'mongolianScript', fontSize: '16px', padding: '125px 160px 100px 260px' }}>
            {isLoading && Loader}

            <div className='d-flex justify-content-between h-100' >
                <div className='d-flex'>
                    <div className='text-center' style={{ writingMode: 'vertical-lr' }} >
                        ᠳ᠋ᠤᠭᠠᠷ <span style={{ fontFamily: 'cmdashitseden', fontSize: '24px' }}>{data?.student?.group?.degree?.degree_code}</span>{tooBichih(data?.diplom_num)}
                    </div>
                    <div style={{ writingMode: 'vertical-lr', marginLeft: '36px', lineHeight: '46px' }} >
                        ᠮᠣᠩᠭᠣᠯ ᠤᠯᠤᠰ ᠤ᠋ᠨ ᠢᠷᢉᠡᠨ {data?.student?.last_name_uig} ᠶ᠋ᠢᠨ / ᠤ᠋ᠨ {data?.student?.first_name_uig} ᠨᠢ <span style={{ fontFamily: 'CMSUB', fontSize: '25px' }}>{data?.student?.group?.join_year?.substring(0, 4)} - {data?.lesson_year?.substring(5, 9)}</span> ᠣᠨ ᠳ᠋ᠤ {data?.student?.school_name_uig} ᠳ᠋ᠤ {data?.student?.group?.profession?.name_uig} ᠮᠡᠷᢉᠡᠵᠢᠯ <span style={{ fontFamily: 'cmdashitseden', fontSize: '24px' }}>
                        <br />
                        ({data?.student?.group?.degree?.degree_code}</span>{tooBichih(data?.student?.group?.profession?.code)}) ᠢ᠋ᠶᠡᠷ ᠰᠤᠷᠤᠯᠴᠠᠵᠤ ᠲᠡᢉᠦᠰᠦᢉᠰᠡᠨ ᠲᠤᠯᠠ ᠶᠡᢈᠡ ᠰᠤᠷᠭᠠᠭᠤᠯᠢ ᠶ᠋ᠢᠨ ᠵᠠᢈᠢᠷᠤᠯ ᠤ᠋ᠨ {tooBichih(data?.decision_date?.substring(0, 4))} ᠣᠨ ᠤ᠋ {tooBichih(data?.decision_date?.substring(5, 7))} {dugeerUg(data?.decision_date?.substring(5, 7) && data?.decision_date?.substring(5, 7).charAt(data?.decision_date?.substring(5, 7).length - 1))} ᠰᠠᠷ᠎ᠠ ᠶ᠋ᠢᠨ {tooBichih(data?.decision_date?.substring(8, 10))}{tooBichih('-')} ᠪ
                        ᠡᠳᠦᠷ ᠦ᠋ᠨ {tushaal(data?.graduation_number)} {dugeerUg(data?.graduation_number && data?.graduation_number.charAt(data?.graduation_number.length - 1))} ᠲᠤᠰᠢᠶᠠᠯ ᠢ᠋ᠶᠠᠷ {data?.student?.group?.profession?.dep_name_uig} ᠶ᠋ᠢᠨ {data?.student?.group?.degree?.degree_uig_name} ᠤ᠋ᠨ ᠵᠡᠷᢉᠡ ᠣᠯᠭᠤᠪᠠ.
                    </div>
                </div>
                <div className='d-flex' style={{ fontSize: '14px', lineHeight: '42px' }}>
                {
                    listArr.map((val, idx) =>
                    {
                        return (
                            <div className='d-flex justify-content-between' style={{ writingMode: 'vertical-lr' }} key={idx} >
                                <span style={{ height: '60%' }}>{val?.position_name_uig}</span>
                                <span className='signature_national' style={{ marginLeft: 'auto' }}>{val?.last_name_uig} {val?.first_name_uig}</span>
                            </div>
                        )
                    })
                }
                    <div className='d-flex justify-content-between' style={{ writingMode: 'vertical-rl', paddingTop: '30px', paddingBottom: '30px', paddingLeft: '30px' }} >
                        <span>ᠤᠯᠠᠭᠠᠨᠪᠠᠭᠠᠲᠤᠷ ᠬᠣᠲᠠ</span>
                        <span>ᠪᠦᠷᠢᠳᢈᠡᠯ ᠦ᠋ᠨ ᠳ᠋ᠤᠭᠠᠷ <span style={{ fontFamily: 'CMSUB', fontSize: '20px' }}>{data?.registration_num}</span></span>
                    </div>
                </div>
            </div>
        </div>
    )
}
