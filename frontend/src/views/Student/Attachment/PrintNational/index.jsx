
import React, { useState, useEffect, useRef } from 'react'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import './style.css'

export default function PrintAttachmentMongolia()
{
    // Loader
	const { fetchData, Loader, Loading } = useLoader({})

    // API
    const signatureApi = useApi().signature
    const studentApi = useApi().student

    // State
    const [ listArr, setListArr ] = useState([])
    const [ isPageBreak, setIsPageBreak ] = useState(false)
    const [ printDatas, setPrintDatas ] = useState(JSON.parse(localStorage.getItem('blankDatas')))
    const [ datas, setDatas ] = useState([])

    async function getAllData(studentId)
    {
        await Promise.all([
            fetchData(signatureApi.get(3, printDatas.student?.department?.sub_orgs)),
            fetchData(studentApi.calculateGpaDimplomaGet(studentId))
        ]).then((values) => {
            setListArr(values[0]?.data)
            setDatas(values[1]?.data)
        })
    }

    useEffect(
        () =>
        {
            getAllData(printDatas.student.id)
        },
        []
    )

    const lessonData = datas?.lessons || []

    const flattenedArray = lessonData.flatMap(item => [
        {
            type: "parent",
            uig_name: item?.uig_name
        },
		...item.lessons.map((lesson) => {
            return {
                ...lesson,
                type: "children"
            };
        })
    ]);

    useEffect(
        () =>
        {
            if (datas?.lessons)
            {
                if (datas?.lessons?.length != 0)
                {
                    let count = 0
                    let perCount = 0
                    let half = printDatas.tableRowCount.length / 2

                    for (let [idx, val] of printDatas.tableRowCount.entries())
                    {
                        if (idx == half)
                        {
                            if (val > 0)
                            {
                                setIsPageBreak(true)
                            }
                        }

                        if (val > 0)
                        {
                            let tableDoc = document.getElementById(`table${idx + 1}`)
                            tableDoc.classList.toggle('d-none')

                            var tbodyRef = tableDoc.getElementsByTagName('tbody')[0];

                            for (let bodyIdx = 0; bodyIdx < val; bodyIdx++)
                            {
                                let newRow = tbodyRef.insertRow();

                                count++

                                if(flattenedArray[count - 1]?.type === "children")
                                {
                                    let newCell1 = newRow.insertCell();
                                    let newCell2 = newRow.insertCell();
                                    let newCell3 = newRow.insertCell();
                                    let newCell4 = newRow.insertCell();
                                    let newCell5 = newRow.insertCell();

                                    perCount++

                                    newCell1.innerHTML = `<span style="font-family: CMSUB; font-size: 12px;">${perCount}</span>`
                                    newCell2.innerHTML = flattenedArray[count - 1]?.name_uig || ''
                                    newCell3.innerHTML = flattenedArray[count - 1]?.kredit ? `<span style="font-family: CMSUB; font-size: 12px;">${flattenedArray[count - 1]?.kredit}</span>` : ''

                                    // Тооцов дүнг харуулахдаа
                                    if (flattenedArray[count - 1]?.grade_letter) {
                                        newCell4.innerHTML = flattenedArray[count - 1]?.grade_letter ? `<span style="font-family: CMSUB; font-size: 12px;">ᠲᠣᠭᠠᠴᠠᠪᠠ</span>` : ''
                                        newCell4.colSpan = 2
                                    } else {
                                        newCell4.innerHTML = flattenedArray[count - 1]?.score ? `<span style="font-family: CMSUB; font-size: 12px;">${flattenedArray[count - 1]?.score}</span>` : ''
                                        newCell5.innerHTML = flattenedArray[count - 1]?.assesment || ''
                                        newCell5.className = `border-dark ${printDatas.isCenter && 'px-75'} footer3-cell`
                                    }


                                    newCell1.className = `border-dark ${printDatas.isCenter && 'px-75'} mini-cell`
                                    newCell2.className = `border-dark ${printDatas.isCenter && 'px-75'} body-cell`
                                    newCell3.className = `border-dark ${printDatas.isCenter && 'px-75'} footer1-cell`
                                    newCell4.className = `border-dark ${printDatas.isCenter && 'px-75'} footer2-cell`
                                }
                                else
                                {
                                    let newCell1 = newRow.insertCell();
                                    if (flattenedArray[count - 1]) {
                                        newCell1.innerHTML = flattenedArray[count - 1]?.uig_name
                                        newCell1.colSpan = 5

                                        newCell1.className = 'border-dark body-cell text-center'
                                    }
                                }

                            }
                        }
                    }
                }
            }
        },
        [datas]
    )

    function tooBichih(too)
    {
        return ( <span style={{ fontFamily: 'CMSUB', fontSize: '14px' }}>{too}</span> )
    }

    function uigVseg(vseg)
    {
        switch (vseg)
        {
            case 'А':
                return 'ᠠ'
            case 'Б':
                return 'ᠪ'
            case 'В':
                return 'ᠸ'
            case 'Г':
                return 'ᠭ'
            case 'Д':
                return 'ᠲ'
            case 'Е':
                return 'ᠶᠢ'
            case 'Ё':
                return 'ᠶ'
            case 'Ж':
                return 'ᠵᠢ'
            case 'З':
                return 'ᠵ'
            case 'И':
                return 'ᠢ'
            case 'Й':
                return 'ᠢ'
            case 'К':
                return 'ᠻ'
            case 'Л':
                return 'ᠯ'
            case 'М':
                return 'ᠮ'
            case 'Н':
                return 'ᠨ᠋'
            case 'О':
                return 'ᠣ'
            case 'Ө':
                return 'ᠥ'
            case 'П':
                return 'ᠫ'
            case 'Р':
                return 'ᠷ'
            case 'С':
                return 'ᠰ'
            case 'Т':
                return 'ᠲ'
            case 'У':
                return 'ᠤ'
            case 'Ү':
                return 'ᠦ‍'
            case 'Ф':
                return 'ᠹ'
            case 'Х':
                return 'ᠬ'
            case 'Ц':
                return 'ᠴ'
            case 'Ч':
                return 'ᠴ'
            case 'Ш':
                return 'ᠰ'
            case 'Ы':
                return 'ᠢ'
            case 'Ь':
                return 'ᠢ'
            case 'Э':
                return 'ᠡ'
            case 'Ю':
                return 'ᠶᠦ᠋'
            case 'Я':
                return 'ᠶ'
            default:
                break;
        }
    }

    return (

        <>
            {Loading && Loader}

            <div className={`vh-100 p-0 d-flex flex-column justify-content-between align-items-start position-relative ${isPageBreak && 'page-break'}`} style={{ fontFamily: 'mongolianScript'}} >

                <div style={{ height: printDatas?.isCenter ? '100%' : '49.5%', marginLeft: '178px' }}  className={`${printDatas.isCenter ? 'center-table' : 'not-center-table' }`} >
                    <table id='table1' className='text-center w-100 d-none' style={{ writingMode: 'vertical-lr', marginBottom: '1px', height: '100%' }} >
                        <thead>
                            <tr style={{ fontSize: '9px' }} >
                                <td rowSpan={2} className='border-dark' style={{ rotate: '90deg', height: '8%', fontFamily: 'sans-serif', fontSize: '12px'  }} >№</td>
                                <td className='border-dark' style={{ height: '69%' }} >ᢈᠢᠴᠢᠶᠡᠯ ᠦ᠋ᠨ ᠨᠡᠷ᠎ᠡ</td>
                                <td className='border-dark' style={{ height: '5%' }} >ᠻᠷ</td>
                                <td className='border-dark' style={{ height: '9%' }}>ᠣᠨᠤᠭ᠎ᠠ</td>
                                <td className='border-dark' style={{ height: '9%' }} >ᠳ᠋ᠦᠩ</td>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>

                <div style={{ height: printDatas?.isCenter ? '100%' : '49.5%', marginLeft: '178px' }} className={`${printDatas.isCenter ? 'center-table' : 'not-center-table' }`} >
                    <table id='table2' className='text-center w-100 d-none' style={{ writingMode: 'vertical-lr', marginBottom: '1px', height: '100%' }} >
                        <thead>
                            <tr style={{ fontSize: '9px' }} >
                                <td rowSpan={2} className='border-dark' style={{ rotate: '90deg', height: '8%', fontFamily: 'sans-serif', fontSize: '12px'  }} >№</td>
                                <td className='border-dark' style={{ height: '69%' }} >ᢈᠢᠴᠢᠶᠡᠯ ᠦ᠋ᠨ ᠨᠡᠷ᠎ᠡ</td>
                                <td className='border-dark' style={{ height: '5%' }} >ᠻᠷ</td>
                                <td className='border-dark' style={{ height: '9%' }}>ᠣᠨᠤᠭ᠎ᠠ</td>
                                <td className='border-dark' style={{ height: '9%' }} >ᠳ᠋ᠦᠩ</td>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>


            <div className={`${!isPageBreak && 'd-none'}`}  >
                <div className='vh-100 p-0 d-flex flex-column justify-content-between align-items-start position-relative' style={{ fontFamily: 'mongolianScript' }} >

                    <div style={{ height: '373px', marginLeft: '178px' }} className={`${printDatas.isCenter ? 'center-table' : 'not-center-table' }`}>

                        <table id='table3' className='text-center w-100 d-none' style={{ writingMode: 'vertical-lr', marginBottom: '1px' }}  >
                            <thead>

                                <tr style={{ fontSize: '6px' }} >
                                    <td rowSpan={2} className='border-dark' style={{ rotate: '90deg', height: '8%', fontFamily: 'sans-serif', fontSize: '12px'  }} >№</td>
                                    <td className='border-dark' style={{ height: '69%' }} >ᢈᠢᠴᠢᠶᠡᠯ ᠦ᠋ᠨ ᠨᠡᠷ᠎ᠡ</td>
                                    <td className='border-dark' style={{ height: '5%' }} >ᠻᠷ</td>
                                    <td className='border-dark' style={{ height: '9%' }}>ᠣᠨᠤᠭ᠎ᠠ</td>
                                    <td className='border-dark' style={{ height: '9%' }} >ᠳ᠋ᠦᠩ</td>
                                </tr>

                            </thead>
                            <tbody>

                            </tbody>
                        </table>

                    </div>

                    <div style={{ height: '376px', marginLeft: '178px' }} className={`${printDatas.isCenter ? 'center-table' : 'not-center-table' }`}>

                        <table id='table4' className='text-center w-100 d-none' style={{ writingMode: 'vertical-lr', marginBottom: '1px' }}  >

                            <thead>

                                <tr style={{ fontSize: '6px' }} >
                                    <td rowSpan={2} className='border-dark' style={{ rotate: '90deg', height: '8%', fontFamily: 'sans-serif', fontSize: '12px'  }} >№</td>
                                    <td className='border-dark' style={{ height: '69%' }} >ᢈᠢᠴᠢᠶᠡᠯ ᠦ᠋ᠨ ᠨᠡᠷ᠎ᠡ</td>
                                    <td className='border-dark' style={{ height: '5%' }} >ᠻᠷ</td>
                                    <td className='border-dark' style={{ height: '9%' }}>ᠣᠨᠤᠭ᠎ᠠ</td>
                                    <td className='border-dark' style={{ height: '9%' }} >ᠳ᠋ᠦᠩ</td>
                                </tr>

                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <header className='d-flex' style={{ fontFamily: 'mongolianScript', fontSize: '16px' }} >

                <div className='d-flex flex-column text-center' style={{ writingMode: 'vertical-lr', fontSize: '16px', marginRight: '3px', marginBottom: '75px' }} >
                    <span style={{ marginLeft: '13px' }}>{printDatas?.student?.department?.school_uig}</span>
                    <span style={{ fontSize: '11px', marginLeft: '10px' }}>
                        <span className='font-serif' style={{ writingMode: 'vertical-lr', rotate: '180deg' }} >
                            <span style={{ fontFamily: 'cmdashitseden', fontSize: '16px' }}>{printDatas?.student?.group?.degree?.degree_code}</span>
                        </span>
                        {tooBichih(printDatas?.student?.graduation_work?.diplom_num)} ᠳᠤᠭᠠᠷᠲᠠᠢ {printDatas?.student?.group?.degree?.degree_uig_name} ᠤ᠋ᠨ ᠳ᠋ᠢᠫᠯᠣᠮ ᠤ᠋ᠨ ᠬᠠᠪᠰᠤᠷᠤᠯᠲᠠ
                    </span>
                </div>

                <div className='d-flex flex-column lh-sm' style={{ fontSize: '11px', marginLeft: '10px' }} >
                    <div style={{ height: '33.3%', writingMode: 'vertical-lr', display: 'flex' }}>
                        <span className='h-50'>ᠡᠴᠢᢉᠡ / ᠡᢈᠡ ᠶ᠋ᠢᠨ ᠨᠡᠷ᠎ᠡ:</span>
                        {printDatas?.student?.last_name_uig}
                    </div>
                    <div style={{ height: '33.3%', writingMode: 'vertical-lr', display: 'flex' }}>
                        <span className='h-50'>ᠲᠡᢉᠦᠰᠦᢉᠰᠡᠨ ᠣᠨ:</span>
                        {tooBichih(printDatas?.student?.graduation_work?.lesson_year?.substring(5, 9))}
                    </div>
                    <div style={{ height: '33.3%', writingMode: 'vertical-lr', display: 'flex' }}>
                        <span className='h-50'>ᠣᠯᠭᠠᠭᠰᠠᠨ ᠣᠨ:</span>
                        {tooBichih(printDatas?.registration_num?.replaceAll('.', '-'))}
                    </div>
                </div>

                <div className='d-flex flex-column lh-sm' style={{ fontSize: '11px', marginLeft: '10px' }} >
                    <div style={{ height: '33.3%', writingMode: 'vertical-lr', display: 'flex' }} >
                        <span className='h-50'>ᠨᠡᠷ᠎ᠡ:</span>
                        {printDatas?.student?.first_name_uig}
                    </div>
                    <div style={{ height: '33.3%', writingMode: 'vertical-lr', display: 'flex' }}>
                        <span className='h-50'>ᠮᠡᠷᢉᠡᠵᠢᠯ ᠦ᠋ᠨ ᠢᠨᠳᠧᠻᠰ:</span>
                        <span style={{ fontFamily: 'cmdashitseden', fontSize: '14px' }}>{printDatas?.student?.group?.degree?.degree_code}</span>{tooBichih(printDatas?.student?.group?.profession?.code)}
                    </div>
                    <div style={{ height: '33.3%', writingMode: 'vertical-lr', display: 'flex' }}>
                        <span className='h-50'>ᠪᠦᠷᠢᠳᢈᠡᠯ ᠦ᠋ᠨ ᠳ᠋ᠤᠭᠠᠷ:</span>
                        {tooBichih(printDatas?.student?.graduation_work?.registration_num)}
                    </div>
                </div>

                <div className='d-flex flex-column lh-sm' style={{ fontSize: '11px', marginLeft: '10px' }} >
                    <div style={{ height: '33.3%', writingMode: 'vertical-lr', display: 'flex' }}>
                        <span className='h-50'>
                            ᠷᠧᢉᠢᠰᠲ᠋ᠧᠷ ᠦ᠋ᠨ ᠳ᠋ᠤᠭᠠᠷ:
                        </span>
                        {uigVseg(printDatas?.student?.register_num[0])} {uigVseg(printDatas?.student?.register_num[1])}  &nbsp;{tooBichih(printDatas?.student?.register_num.slice(-8))}
                    </div>
                    <div style={{ height: '66.6%', writingMode: 'vertical-lr', display: 'flex' }}>
                        <span className='h-50'>ᠮᠡᠷᢉᠡᠵᠢᠯ:</span>
                        {printDatas?.student?.group?.profession?.name_uig}
                    </div>
                </div>

            </header>

            <footer className={`${isPageBreak && 'footer-margin'}`} style={{ fontFamily: 'mongolianScript', fontSize: '11px' }} >
                <div className='d-flex'>

                    <div className='d-flex' style={{ writingMode: 'vertical-lr', marginRight: '30px' }} >
                        <span style={{ height: '40%' }}>ᠨᠡᠶᠢᠲᠡ ᠪᠠᠭᠴᠡ ᠴᠠᠭ: {tooBichih(datas?.score?.max_kredit)}</span>
                        <span>ᠭᠣᠣᠯᠴᠢ ᠳᠦᠩ:&nbsp;
                            {
                                datas?.score?.assesment
                                ?
                                    <span style={{ fontFamily: 'CMSUB', fontSize: '12px' }}>{datas?.score?.assesment.split('.')[0]}<span style={{ fontFamily: 'serif', fontWeight: 'bolder' }}>.</span>{datas?.score?.assesment.split('.')[1]}</span>
                                :
                                    null
                            }
                        </span>
                    </div>

                    <div style={{ writingMode: 'vertical-lr', marginRight: '6px' }} >
                        {datas?.graduation_work?.lesson_type == 1 ? 'ᠲᠡᢉᠦᠰᠦᠯᠲᠡ ᠶ᠋ᠢᠨ ᠠᠵᠢᠯ:' : 'ᠲᠡᢉᠦᠰᠦᠯᠲᠡ ᠶ᠋ᠢᠨ ᠰᠢᠯᠭᠠᠯᠲᠠ:'}
                    </div>

                    <div style={{ writingMode: 'vertical-lr', display: 'flex', marginRight: '70px' }} >
                    {
                    datas?.graduation_work?.lesson_type == 1
                    ?
                        <span style={{ height: '80%' }}>{datas?.graduation_work?.diplom_topic_uig}</span>
                    :
                        datas?.graduation_work?.lesson?.map((val, idx) =>
                        {
                            return (
                                <div key={idx} style={{ height: `${100/datas?.graduation_work?.lesson.length}%`, display: 'flex' }}>
                                    <span style={{ height: '80%' }}>{val?.name_uig}</span>
                                    {tooBichih((val?.score_register?.teach_score || 0) + (val?.score_register?.exam_score || 0))} <span style={{ fontFamily: 'serif' }}>.{val?.score_register?.assessment}</span>
                                </div>
                            )
                        })
                    }
                    </div>

                    {
                        listArr.map((val, idx) =>
                        {
                            return (
                                <div style={{ writingMode: 'vertical-lr', height: '60%', fontSize: '12px', marginRight: '30px', lineHeight: '26px' }} key={idx} >
                                    <span>{val?.position_name_uig}</span> <span>{val?.last_name_uig} {val?.first_name_uig}</span>
                                </div>
                            )
                        })
                    }

                    <div style={{ writingMode: 'vertical-lr', marginLeft: '11px', fontSize: '11px' }} >
                        <span>ᠡᠨᠡᢈᠦ ᠬᠠᠪᠰᠤᠷᠤᠯᠲᠠ {tooBichih(new Date().getFullYear())} ᠣᠨ ᠤ᠋ <span style={{ fontFamily: 'cmdashitseden', fontSize: '12px' }}>{printDatas?.student?.group?.degree?.degree_code}</span>{tooBichih(printDatas?.student?.graduation_work?.diplom_num)} ᠳ᠋ᠤᠭᠠᠷ ᠲᠠᠢ ᠳ᠋ᠢᠫᠯᠣᠮ ᠤ᠋ᠨ ᠬᠠᠮᠲᠤ ᢈᠦᠴᠦᠨ ᠲᠡᠢ</span>
                    </div>
                </div>
            </footer>
        </>
    )
}
