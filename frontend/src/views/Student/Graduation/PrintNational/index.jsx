
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
                        ({data?.student?.group?.degree?.degree_code}</span>{tooBichih(data?.student?.group?.profession?.code)}) ᠢ᠋ᠶᠡᠷ ᠰᠤᠷᠤᠯᠴᠠᠵᠤ ᠲᠡᢉᠦᠰᠦᢉᠰᠡᠨ ᠲᠤᠯᠠ ᠶᠡᢈᠡ ᠰᠤᠷᠭᠠᠭᠤᠯᠢ ᠶ᠋ᠢᠨ ᠵᠠᢈᠢᠷᠤᠯ ᠤ᠋ᠨ {tooBichih(data?.decision_date?.substring(0, 4))} ᠣᠨ ᠤ᠋ {tooBichih(data?.decision_date?.substring(5, 7))} ᠳ᠋ᠤᠭᠠᠷ ᠰᠠᠷ᠎ᠠ ᠶ᠋ᠢᠨ {tooBichih(data?.decision_date?.substring(8, 10))}{tooBichih('-')} ᠪ
                        ᠡᠳᠦᠷ ᠦ᠋ᠨ {tushaal(data?.graduation_number)} ᠳ᠋ᠤᠭᠠᠷ ᠲᠤᠰᠢᠶᠠᠯ ᠢ᠋ᠶᠠᠷ {data?.student?.group?.profession?.dep_name_uig} ᠶ᠋ᠢᠨ {data?.student?.group?.degree?.degree_uig_name} ᠤ᠋ᠨ ᠵᠡᠷᢉᠡ ᠣᠯᠭᠤᠪᠠ.
                    </div>
                </div>
                <div className='d-flex' style={{ fontSize: '14px', lineHeight: '42px' }}>
                {
                    listArr.map((val, idx) =>
                    {
                        return (
                            <div className='d-flex justify-content-between' style={{ writingMode: 'vertical-lr' }} key={idx} >
                                <span style={{ height: '60%' }}>{val?.position_name_uig}</span>
                                <span style={{ marginLeft: 'auto' }}>{val?.last_name_uig} {val?.first_name_uig}</span>
                            </div>
                        )
                    })
                }
                    <div className='d-flex justify-content-between' style={{ writingMode: 'vertical-rl', paddingTop: '30px', paddingBottom: '30px' }} >
                        <span>ᠤᠯᠠᠭᠠᠨᠪᠠᠭᠠᠲᠤᠷ ᠬᠣᠲᠠ</span>
                        <span>ᠪᠦᠷᠢᠳᢈᠡᠯ ᠦ᠋ᠨ ᠳ᠋ᠤᠭᠠᠷ <span style={{ fontFamily: 'CMSUB', fontSize: '20px' }}>{data?.registration_num}</span></span>
                    </div>
                </div>
            </div>
        </div>
    )
}
