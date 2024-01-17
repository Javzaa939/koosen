
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
    const [ listArr, setListArr ] = useState([
        {
            "id": 2,
            "dedication_type": 2,
            "last_name": "П.",
            "first_name": "БАТБААТАР",
            "position_name": "Дотоод хэргийн их сургуулийн захирал, доктор (Ph.D), профессор, цагдаагийн хурандаа",
            "last_name_eng": "P.",
            "first_name_eng": "BATBAATAR",
            "position_name_eng": "(Ph.D), Professor, Police Colonel, President, University of Internal Affairs",
            "last_name_uig": "ᠫᠦ,",
            "first_name_uig": "ᠪᠠᠲᠤᠪᠠᠭᠠᠲᠤᠷ",
            "position_name_uig": "ᠳᠣᠲᠣᠭᠠᠳᠤ ᠬᠡᠷᠡᠭ ᠦᠨ ᠶᠡᠬᠡ ᠰᠤᠷᠭᠠᠭᠤᠯᠢ ᠶᠢᠨ ᠵᠠᠬᠢᠷᠤᠯ᠂ ᠳ᠋ᠣᠺᠲ᠋ᠣᠷ᠂ ᠫᠷᠣᠹᠧᠰᠰᠣᠷ᠂ ᠴᠠᠭᠳᠠᠭ᠎ᠠ ᠶᠢᠨ ᠬᠤᠷᠠᠨᠳᠠ",
            "is_order": true,
            "order": 2,
            "created_at": "2024-01-09T15:09:14.664780",
            "updated_at": "2024-01-15T11:38:48.546054"
        },
        {
            "id": 3,
            "dedication_type": 2,
            "last_name": "Д.",
            "first_name": "ЭРДЭНЭБААТАР",
            "position_name": "Төгсөлтийн шалгалтын төв комиссын дарга, доктор (Ph.D), дэд профессор, цагдаагийн хурандаа",
            "last_name_eng": "D.",
            "first_name_eng": "ERDENEBAATAR",
            "position_name_eng": "(Ph.D), associate professor, Police Colonel, Chairmen of the Graduation Examination Committee",
            "last_name_uig": "ᠳ,",
            "first_name_uig": "ᠡᠷᠳᠡᠨᠢᠪᠠᠭᠠᠲᠤᠷ",
            "position_name_uig": "ᠲᠡᠭᠦᠰᠦᠯᠲᠡ ᠶᠢᠨ ᠰᠢᠯᠭᠠᠯᠲᠠ ᠶᠢᠨ ᠲᠥᠪ ᠺᠣᠮᠢᠰ ᠤᠨ ᠳᠠᠷᠤᠭ᠎ᠠ᠂ ᠳ᠋ᠣᠺᠲ᠋ᠣᠷ᠂ ᠳᠡᠳ᠋ ᠫᠷᠣᠹᠧᠰᠰᠣᠷ᠂ ᠴᠠᠭᠳᠠᠭ᠎ᠠ ᠶᠢᠨ ᠬᠤᠷᠠᠨᠳᠠ",
            "is_order": true,
            "order": 3,
            "created_at": "2024-01-09T15:17:25.760208",
            "updated_at": "2024-01-15T10:32:59.093960"
        },
        {
            "id": 4,
            "dedication_type": 2,
            "last_name": "Ш.",
            "first_name": "АРИУНБИЛЭГ",
            "position_name": "Эрх зүй, нийгмийн ухааны сургуулийн захирал, доктор (Ph.D), дэд профессор, цагдаагийн хурандаа",
            "last_name_eng": "Sh.",
            "first_name_eng": "ARIUNBILEG",
            "position_name_eng": "(Ph.D), associate professor, Police Colonel, Director, School of Law and Social Science",
            "last_name_uig": "ᠰ,",
            "first_name_uig": "ᠠᠷᠢᠭᠤᠨᠪᠢᠯᠢᠭ᠌",
            "position_name_uig": "ᠡᠷᠬᠡ ᠵᠦᠢ᠂ ᠨᠡᠶᠢᠭᠡᠮ ᠦᠨ ᠤᠬᠠᠭᠠᠨ ᠤ ᠰᠤᠷᠭᠠᠭᠤᠯᠢ ᠶᠢᠨ ᠵᠠᠬᠢᠷᠤᠯ᠂ ᠳ᠋ᠣᠺᠲ᠋ᠣᠷ᠂ ᠳᠡᠳ᠋ ᠫᠷᠣᠹᠧᠰᠰᠣᠷ᠂ ᠴᠠᠭᠳᠠᠭ᠎ᠠ ᠶᠢᠨ ᠬᠤᠷᠠᠨᠳᠠ",
            "is_order": true,
            "order": 4,
            "created_at": "2024-01-09T15:18:23.277539",
            "updated_at": "2024-01-15T10:28:58.416960"
        }
    ])

    async function getAllData()
    {
        await Promise.all([
            fetchData(signatureApi.get(2)),
        ]).then((values) => {
            setListArr(values[0]?.data)
        })
    }

    // console.log('listArr', listArr)

    // useEffect(
    //     () =>
    //     {
    //         getAllData()

    //         // window.onafterprint = function()
    //         // {
    //         //     window.close()
    //         // }
    //     },
    //     []
    // )

    // useEffect(
    //     () =>
    //     {
    //         if (data && listArr.length != 0)
    //         {
    //             setTimeout(() => window.print(), 1000)
    //         }
    //     },
    //     [data, listArr]
    // )

    function tooBichih(too)
    {
        return ( <span style={{ fontFamily: 'CMSUB', fontSize: '30px' }}>{too}</span> )
    }

    function tushaal(text)
    {
        let slash = text.split('/')

        return <><span>ᠠ/</span><span style={{ fontFamily: 'CMSUB', fontSize: '30px' }}>{slash[1]}</span></>
    }

    console.log('data', data)

    return (
        <div className='vh-100 position-relative' style={{ fontFamily: 'mongolianScript', fontSize: '24px', padding: '125px 160px 100px 240px' }}>
            {isLoading && Loader}

            <div className='d-flex justify-content-between h-100' >
                <div className='d-flex'>
                    <div className='text-center' style={{ writingMode: 'vertical-lr' }} >
                        ᠳ᠋ᠤᠭᠠᠷ <span style={{ fontFamily: 'cmdashitseden' }}>{data?.student?.group?.degree?.degree_code}</span><span style={{ fontFamily: 'CMSUB', fontSize: '30px' }}>{data?.diplom_num}</span>
                    </div>
                    <div style={{ writingMode: 'vertical-lr', marginLeft: '30px' }} >
                        ᠮᠣᠩᠭᠣᠯ ᠤᠯᠤᠰ ᠤ᠋ᠨ ᠢᠷᢉᠡᠨ {data?.student?.last_name_uig} ᠶᠢᠨ / ᠤᠨ {data?.student?.first_name_uig} ᠨᠢ <span style={{ fontFamily: 'CMSUB', fontSize: '30px' }}>{data?.student?.group?.join_year?.substring(0, 4)} - {data?.lesson_year?.substring(5, 9)}</span> ᠣᠨ ᠳ᠋ᠤ {data?.student?.school_name_uig} ᠳ᠋ᠤ {data?.student?.group?.profession?.name_uig} ᠮᠡᠷᢉᠡᠵᠢᠯ <span style={{ fontFamily: 'cmdashitseden' }}>({data?.student?.group?.degree?.degree_code}</span><span style={{ fontFamily: 'CMSUB', fontSize: '30px' }}>{data?.diplom_num}</span>)
                        ᠢ᠋ᠶᠡᠷ ᠰᠤᠷᠤᠯᠴᠠᠵᠤ ᠲᠡᢉᠦᠰᠦᢉᠰᠡᠨ ᠲᠤᠯᠠ ᠶᠡᢈᠡ ᠰᠤᠷᠭᠠᠭᠤᠯᠢ ᠶ᠋ᠢᠨ ᠵᠠᢈᠢᠷᠤᠯ ᠤ᠋ᠨ {tooBichih(data?.decision_date?.substring(0, 4))} ᠣᠨ ᠤ᠋ {tooBichih(data?.decision_date?.substring(5, 7))} ᠳ᠋ᠤᠭᠠᠷ ᠰᠠᠷ᠎ᠠ ᠶ᠋ᠢᠨ {tooBichih(data?.decision_date?.substring(8, 10))}{tooBichih('-')} ᠪ
                        ᠡᠳᠦᠷ ᠦ᠋ᠨ {tushaal(data?.graduation_number)} ᠳ᠋ᠤᠭᠠᠷ ᠲᠤᠰᠢᠶᠠᠯ ᠢ᠋ᠶᠠᠷ {data?.student?.group?.profession?.dep_name_uig} ᠶᠢᠨ {data?.student?.group?.degree?.degree_name} ᠤ᠋ᠨ ᠵᠡᠷᢉᠡ ᠣᠯᠭᠤᠪᠠ.
                    </div>
                </div>
                <div className='d-flex' style={{ fontSize: '18px', lineHeight: '35px' }}>
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
                        <span>ᠪᠦᠷᠢᠳᢈᠡᠯ ᠦ᠋ᠨ ᠳ᠋ᠤᠭᠠᠷ <span style={{ fontFamily: 'CMSUB', fontSize: '28px' }}>{data?.registration_num}</span></span>
                    </div>
                </div>
            </div>


                {/* <div className='d-flex position-absolute start-0' >
                    <div className='text-center' style={{ writingMode: 'vertical-rl', transform: 'scale(-1, 1)', fontSize: '30px', marginRight: '30px' }} >
                        doge* <span style={{ fontFamily: 'serif' }}>{data?.student?.group?.degree?.degree_code}</span>{data?.diplom_num}
                    </div>

                    <div style={{ writingMode: 'vertical-rl', transform: 'scale(-1, 1)', fontSize: '30px', textAlign: 'justify' }} >
                        {data?.student?.citizenship?.name_uig} folo_ oa fJrhEa {data?.student?.last_name_uig} {data?.student?.first_name_uig} nh {data?.student?.group?.join_year?.substring(0, 4)} - {data?.lesson_year?.substring(5, 9)} Foa dO Moekgo& oa foiedosoa O YekEt SorgegolI dO {data?.student?.group?.profession?.name_uig} <span style={{ fontFamily: 'serif' }}>({data?.student?.group?.degree?.degree_code}</span > {data?.student?.group?.profession?.code} <span style={{ fontFamily: 'serif' }}>)</span> MerkEji& iie* Sorolcea DeKsohsea Dola
                        DeKsolda iia Silgelda iia |mis_ oa {data?.decision_date?.substring(0, 4)} Foa O {data?.decision_date?.substring(5, 7)} doge* Se*T iia {data?.decision_date?.substring(8, 10)} - O Fdo* oa SiioeBrI iI Foiedosolea , Jehuro& oa {data?.graduation_date?.substring(0, 4)} Foa O {data?.graduation_date?.substring(5, 7)} doge* Se*T iia {data?.graduation_date?.substring(8, 10)} - O Fdo* oa {data?.graduation_number} DogedO Dosiye& iie* {data?.student?.group?.profession?.dep_name_uig}
                        <br />
                        <span className='fw-bolder'>{data?.student?.group?.degree?.degree_name_uig}</span> oa JerhEt FolgobEt.
                    </div>
                </div>

                <div className='d-flex position-absolute' style={{ right: 100 }}>

                    {
                        listArr.map((val, idx) =>
                        {
                            return (
                                <div style={{ writingMode: 'vertical-rl', fontSize: '20px', fontFamily: 'cmdashitseden' }} key={idx} >
                                    <span>{val?.position_name_uig}</span> <span>{val?.last_name_uig} {val?.first_name_uig}</span>
                                </div>
                            )
                        })
                    }

                    <div className='d-flex justify-content-between' style={{ writingMode: 'vertical-rl', fontSize: '24px', marginLeft: '20px', fontFamily: 'mongolianScript' }} >
                        <span>ᠤᠯᠠᠭᠠᠨᠪᠠᠭᠠᠲᠤᠷ ᠬᠣᠲᠠ</span>
                        <span>ᠪᠦᠷᠢᠳᢈᠡᠯ ᠦ᠋ᠨ ᠳ᠋ᠤᠭᠠᠷ <span style={{ fontFamily: 'CMSUBDP' }}>{data?.registration_num}</span></span>
                    </div>
                </div> */}

        </div>
    )
}
