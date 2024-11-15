
import React, { useState, useEffect, useRef } from 'react'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import './style.css'

export default function PrintNationalAttachment()
{
    const headerSectionRef = useRef(null)
    const footerSectionRef = useRef(null)
    const body1SectionRef = useRef(null)
    const body2SectionRef = useRef(null)

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
    // const rowSum = tableRowCount?.reduce((partialSum, a) => partialSum + a, 0);
    const [ tableRowCount, setTableRowCount ] = useState([])
    const [ rowSum, setRowSum ] = useState(0)

    const [width, setWidth] = useState(
        {
            header: 0,
            footer: 0,
            body1: 0,
            body2: 0
        }
    )

    async function getAllData(studentId)
    {
        // Нэгдсэн нэг сургуулийн захирал гарын үсэг хэвлэж байгаа болохоор, data?.student?.group?.profession?.school
        // , printDatas.student?.department?.sub_orgs
        await Promise.all([
            fetchData(signatureApi.get(3)),
            fetchData(studentApi.calculateGpaDimplomaGet(studentId)),
            fetchData(studentApi.getConfig(printDatas?.student?.group?.id, 'uigarjin'))
        ]).then((values) => {
            setListArr(values[0]?.data)
            setDatas(values[1]?.data)
            setTableRowCount(values[2]?.data?.row_count ? values[2]?.data?.row_count : [])
            var sum_count = values[2]?.data?.row_count?.reduce((partialSum, a) => partialSum + a, 0);
            setRowSum(sum_count)
        })
    }

    useEffect(() => {
        setWidth(
            {
                header:headerSectionRef.current.offsetWidth,
                footer:footerSectionRef.current.offsetWidth,
                body1:body1SectionRef.current.offsetWidth,
                body2:body2SectionRef.current.offsetWidth,
            }
        )
    }, [])

    useEffect(
        () =>
        {
            getAllData(printDatas.student.id)
        },
        []
    )

    useEffect(
        () =>
        {
            if (datas, listArr.length != 0)
            {
                document.title = `${printDatas?.student?.full_name}-хавсралт-уйгаржин`
            }
        },
        [datas, listArr]
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
                    let half = tableRowCount.length / 2

                    for (let [idx, val] of tableRowCount.entries())
                    {
                        if (idx == half)
                        {
                            if (val > 0)
                            {
                                // setIsPageBreak(true)
                            }
                        }

                        if (val > 0)
                        {
                            let tableDoc = document.getElementById(`tableNational${idx + 1}`)
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
                                    {
                                        printDatas?.student?.group?.degree?.degree_code !== 'D'
                                        ?
                                        newCell2.className = `border-dark ${printDatas.isCenter && 'px-75'} body-cell2`
                                        :
                                        newCell2.className = `border-dark ${printDatas.isCenter && 'px-75'} body-cell`
                                    }
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

    /* Крилл үсгийг уйгаржин руу хөрвүүлэх */
    function uigVseg(vseg)
    {
        switch (vseg?.toUpperCase())
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
                return 'ᠳ'
            case 'Е':
                return 'ᠶᠢ'
            case 'Ё':
                return 'ᠶ'
            case 'Ж':
                return 'ᠵ'
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
            case 'Щ':
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

        <div className='d-flex' style={{ height: '100vh', overflow: 'hidden' }}>
            {Loading && Loader}

            <header
                className='d-flex py-1'
                style={{ fontFamily: 'mongolianScript', fontSize: '14px' }}
                ref={headerSectionRef}
            >

                <div className='d-flex flex-column text-center' style={{ writingMode: 'vertical-lr', fontSize: '16px', marginRight: '3px', marginBottom: '75px' }} >
                    <span style={{ marginLeft: '13px' }}>{printDatas?.student?.department?.school_uig}</span>
                    <span style={{ fontSize: '11px', marginLeft: '10px' }}>
                        {tooBichih(printDatas?.student?.graduation_work?.diplom_num)} ᠳ᠋ᠤᠭᠠᠷ ᠲᠠᠢ {printDatas?.student?.group?.degree?.degree_uig_name} ᠤ᠋ᠨ ᠳ᠋ᠢᠫᠯᠣᠮ ᠤ᠋ᠨ ᠬᠠᠪᠰᠤᠷᠤᠯᠲᠠ
                    </span>
                    <span style={{ fontSize: '11px', marginLeft: '10px' }}>
                        ᠪᠦᠷᠢᠳᢈᠡᠯ ᠦ᠋ᠨ ᠳ᠋ᠤᠭᠠᠷ {tooBichih(printDatas?.student?.graduation_work?.registration_num)}
                    </span>
                </div>

                <div className='d-flex flex-column lh-sm' style={{ fontSize: '11px', marginLeft: '10px' }} >
                    <div style={{ height: '33.3%', writingMode: 'vertical-lr', display: 'flex' }}>
                        <span className='h-50'>ᠡᠴᠢᢉᠡ / ᠡᢈᠡ ᠶ᠋ᠢᠨ ᠨᠡᠷ᠎ᠡ:</span>
                        {printDatas?.student?.last_name_uig}
                    </div>
                    <div style={{ height: '47.6%', writingMode: 'vertical-lr', display: 'flex' }}>
                        <span className='h-50'>ᢈᠥᠲᠦᠯᠪᠦᠷᠢ ᠶ᠋ᠢᠨ ᠨᠡᠷ:</span>
                        {printDatas?.student?.group?.profession?.name_uig}
                    </div>
                    <div style={{ height: '20%', writingMode: 'vertical-lr', display: 'flex' }}>
                        <span className='h-50'>ᠡᠯᠰᠡᢉᠰᠡᠨ ᠣᠨ:</span>
                        <span style={{ fontFamily: 'cmdashitseden', fontSize: '14px' }}>{tooBichih(printDatas?.student?.group?.join_year?.substring(0, 4))}</span>
                    </div>
                </div>

                <div className='d-flex flex-column lh-sm' style={{ fontSize: '11px', marginLeft: '10px' }} >
                    <div style={{ height: '33.3%', writingMode: 'vertical-lr', display: 'flex' }} >
                        <span className='h-50'>ᠨᠡᠷ᠎ᠡ:</span>
                        {printDatas?.student?.first_name_uig}
                    </div>
                    <div style={{ height: '44.3%', writingMode: 'vertical-lr', display: 'flex' }}>
                        {
                            printDatas?.student?.group?.degree?.degree_code === 'D'
                            ?
                                <>
                                    <span className='h-50'>ᠢᠨ᠋ᠳᠧᠻᠰ:</span>
                                    {tooBichih(printDatas?.student?.group?.profession?.code)}
                                </>
                            :
                            <>
                                <span className='h-50'>ᠲᠥᠷᠦᠯᠵᠢᢉᠰᠡᠨ ᠴᠢᢉᠯᠡᠯ:</span>
                                {printDatas?.student?.group?.profession?.dep_name_uig}
                            </>
                        }
                    </div>
                    <div style={{ height: '22%', writingMode: 'vertical-lr', display: 'flex' }}>
                        <span className='h-50'>ᠲᠡᢉᠦᠰᠦᢉᠰᠡᠨ ᠣᠨ:</span>
                        {tooBichih(printDatas?.student?.graduation_work?.graduation_date?.substring(0, 4))}
                    </div>
                </div>

                <div className='d-flex flex-column lh-sm' style={{ fontSize: '11px', marginLeft: '10px' }} >
                    <div style={{ height: '33.3%', writingMode: 'vertical-lr', display: 'flex' }}>
                        <span className='h-50'>
                            ᠷᠧᢉᠢᠰᠲ᠋ᠧᠷ ᠦ᠋ᠨ ᠳ᠋ᠤᠭᠠᠷ:
                        </span>
                        {uigVseg(printDatas?.student?.register_num[0])} {uigVseg(printDatas?.student?.register_num[1])}  &nbsp;{tooBichih(printDatas?.student?.register_num.slice(-8))}
                    </div>
                    {
                        printDatas?.student?.group?.degree?.degree_code !== 'D'
                        &&
                        <div style={{ height: '39.3%', writingMode: 'vertical-lr', display: 'flex' }}>
                            <span className='h-50'>{printDatas?.student?.group?.degree?.degree_code === 'E' ?  'ᠪᠠᠻᠠᠯᠠᠸᠷ ᠤ᠋ᠨ ᠳ᠋ᠤᠭᠠᠷ:' : 'ᠮᠠᢉᠢᠰᠲ᠋ᠷ ᠤ᠋ᠨ ᠳ᠋ᠤᠭᠠᠷ:'}</span>
                            {tooBichih(printDatas?.student?.graduation_work?.back_diplom_num)}
                        </div>
                    }
                    <div style={{ height: '27.3%', writingMode: 'vertical-lr', display: 'flex' }}>
                        <span className='h-50'>ᠲᠤᠰᠢᠶᠠᠯ ᠤ᠋ᠨ ᠳ᠋ᠤᠭᠠᠷ:</span>
                        {uigVseg(printDatas?.student?.graduation_work?.graduation_number ? printDatas?.student?.graduation_work?.graduation_number[0] : printDatas?.student?.graduation_work?.graduation_number)} &nbsp; <span style={{ fontFamily: 'cmdashitseden' }}>/</span> &nbsp;{tooBichih(printDatas?.student?.graduation_work?.graduation_number?.slice(-3))}
                    </div>
                </div>
                {
                    printDatas?.student?.group?.degree?.degree_code === 'D'
                    &&
                    <div className='d-flex flex-column lh-sm' style={{ fontSize: '11px', marginLeft: '10px' }} >
                        {
                            printDatas?.student?.eysh_score
                            &&
                            <div style={{ height:'40%', writingMode: 'vertical-lr', display: 'flex' }}>
                                <span className='h-50'>ᠡᠯᠰᠡᠯᠲᠡ ᠶ᠋ᠢᠨ ᠰᠢᠯᠭᠠᠯᠲᠠ ᠶ᠋ᠢᠨ ᠣᠨᠤᠭ᠎ᠠ:</span>
                                <span style={{ fontFamily: 'cmdashitseden', fontSize: '14px' }}>{tooBichih(printDatas?.student?.eysh_score)}</span>
                            </div>
                        }
                        <div style={{ height: '60%', writingMode: 'vertical-lr', display: 'flex' }}>
                            <span className='h-50'>ᠡᠮᠦᠨᠡᢈᠢ ᠱᠠᠲᠤᠨ ᠤ᠋ ᠪᠣᠯᠪᠠᠰᠤᠷᠠᠯ ᠤ᠋ᠨ ᠦᠨᠡᠯᠡᢉᠡᠨ ᠦ᠋ ᠳᠤᠨᠳᠠᠵᠢ ᠣᠨᠤᠭ᠎ᠠ:</span>
                            {tooBichih(printDatas?.student?.secondary_school)}
                        </div>
                        {printDatas?.student?.graduation_work?.back_diplom_num && printDatas?.student?.group?.degree?.degree_code === 'D'
                        &&
                        <div style={{ height: '40%', writingMode: 'vertical-lr', display: 'flex' }}>
                            <span className='h-50'>ᠪᠠᠻᠠᠯᠠᠸᠷ ᠤ᠋ᠨ ᠳ᠋ᠤᠭᠠᠷ:</span>
                            {tooBichih(printDatas?.student?.graduation_work?.back_diplom_num)}
                        </div>
                        }
                    </div>
                }

            </header>

            <div
                ref={body1SectionRef}
                className={`h-100 p-0 d-flex py-1 flex-column justify-content-between align-items-start position-relative ${isPageBreak && 'page-break'} ms-1`}
                style={{ fontFamily: 'mongolianScript', flex: 1, left: printDatas?.student?.group?.degree?.degree_code !== 'D' ? '25px' : '' }}
            >
                <div style={{ height: printDatas?.isCenter ? '98%' : '49.5%' }}  className={`${printDatas.isCenter ? 'center-table' : 'not-center-table' }`} >
                    <table id='tableNational1' className='text-center w-100 d-none parent_table' style={{ writingMode: 'vertical-lr', marginBottom: '1px', height: '100%' }} >
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

                <div style={{ height: printDatas?.isCenter ? '98%' : '49.5%' }} className={`${printDatas.isCenter ? 'center-table' : 'not-center-table' }`} >
                    <table id='tableNational2' className='text-center w-100 d-none parent_table' style={{ writingMode: 'vertical-lr', marginBottom: '1px', height: '100%' }} >
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

            <div
                className={`${!isPageBreak && 'd-none'}`}
                ref={body2SectionRef}
            >
                <div className='h-100 p-0 d-flex py-1 flex-column justify-content-between align-items-start position-relative' style={{ fontFamily: 'mongolianScript' }} >

                    <div style={{ height: '373px', marginLeft: '178px' }} className={`${printDatas.isCenter ? 'center-table' : 'not-center-table' }`}>

                        <table id='tableNational3' className='text-center w-100 d-none parent_table' style={{ writingMode: 'vertical-lr', marginBottom: '1px' }}  >
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

                        <table id='tableNational4' className='text-center w-100 d-none parent_table' style={{ writingMode: 'vertical-lr', marginBottom: '1px' }}  >

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
            <footer
                ref={footerSectionRef}
                className={`py-2 ${isPageBreak && 'footer-margin'}`}
                style={{ fontFamily: 'mongolianScript', fontSize: '11px' }}
            >
                <div className={`d-flex ${rowSum > 50 ? '' : ''}`}>
                {
                        printDatas?.student?.group?.degree?.degree_code != 'D'
                        &&
                        <div style={{ writingMode: 'vertical-lr', display: 'flex', marginRight: '20px' }} >
                        {
                            datas?.graduation_work?.lesson_type == 1
                            ?
                                <span className=''>{`${printDatas?.student?.group?.degree?.degree_code == 'E' ? "ᠮᠠᢉᠢᠰᠲ᠋ᠷ" : "ᠳ᠋ᠣᠻᠲ᠋ᠣᠷ"} ᠤ᠋ᠨ ᠲᠡᢉᠦᠰᠦᠯᠲᠡ ᠶ᠋ᠢᠨ ᠠᠵᠢᠯ/ ᠳ᠋ᠢᠰᠰᠠᠷᠲ᠋ᠠᠴᠠ ᠶ᠋ᠢᠨ ᠨᠡᠷ᠎ᠡ:`} &nbsp;<span className='fw-bolder'>{datas?.graduation_work?.diplom_topic_uig}</span></span>
                            :
                                <>
                                    <span className=''>
                                        ᠲᠡᢉᠦᠰᠦᠯᠲᠡ ᠶ᠋ᠢᠨ ᠰᠢᠯᠭᠠᠯᠲᠠ: <span>{datas?.graduation_work?.shalgalt_onoo && <span>{tooBichih(datas?.graduation_work?.shalgalt_onoo)}</span>}</span>
                                    </span>
                                        {
                                            datas?.graduation_work?.lesson?.map((val, idx) =>
                                            {
                                                return (
                                                    <div key={idx} style={{ height: `${100/datas?.graduation_work?.lesson.length}%`, display: 'flex' }}>
                                                        <span style={{ height: '65%' }}>{val?.name_uig}</span>
                                                        {tooBichih((val?.score_register?.teach_score || 0) + (val?.score_register?.exam_score || 0))} <span style={{ fontFamily: 'serif' }}>.{val?.score_register?.assessment}</span>
                                                    </div>
                                                )
                                            })
                                        }
                                </>
                        }
                    </div>
                    }

                    {
                    printDatas?.student?.graduation_work?.back_diplom_num && printDatas?.student?.group?.degree?.degree_code === 'D'
                    &&
                    <div className='d-flex' style={{ writingMode: 'vertical-lr', marginRight: '20px', height: '100%' }}>
                        ᠡᠮᠦᠨᠡᢈᠢ ᠪᠣᠯᠪᠠᠰᠤᠷᠠᠯ ᠤ᠋ᠨ ᠳ᠋ᠢᠫᠯᠣᠮ ᠠ᠋ᠴᠠ ᠓᠐ ᠪᠠᠭᠴᠠ ᠴᠠᠭ ᠢ᠋ ᠲᠣᠭᠠᠴᠠᠪᠠ᠃
                    </div>
                    }
                    {
                        printDatas?.student?.group?.degree?.degree_code !== 'D'
                        &&
                            <div className='d-flex' style={{ writingMode: 'vertical-lr', marginRight: '20px', height: '100%' }}>
                                <div className='' style={{height: '33.3%'}}>ᠨᠡᠶᠢᠲᠡ ᠪᠠᠭᠴᠡ ᠴᠠᠭ: {tooBichih(datas?.score?.max_kredit)}</div>
                                <div className={'mt-2'} style={{height: '33.3%'}}>ᠭᠣᠣᠯᠴᠢ ᠣᠨᠤᠭ᠎ᠠ:  <span style={{ fontFamily: 'CMSUB', fontSize: '12px' }}>{datas?.score?.average_score.split('.')[0]}<span style={{ fontFamily: 'serif', fontWeight: 'bolder' }}>.</span>{datas?.score?.average_score.split('.')[1]}</span></div>
                                {
                                    printDatas?.student?.group?.degree?.degree_code !== 'D'
                                    &&
                                    <div className='mt-2' style={{height: '33.3%'}}>ᠭᠣᠣᠯᠴᠢ ᠳᠦᠩ:   <span style={{ fontFamily: 'CMSUB', fontSize: '12px' }}>{datas?.score?.assesment.split('.')[0]}<span style={{ fontFamily: 'serif', fontWeight: 'bolder' }}>.</span>{datas?.score?.assesment.split('.')[1]}</span></div>
                                }
                            </div>
                    }

                    {
                        printDatas?.student?.group?.degree?.degree_code === 'D'
                        &&
                            <div className='d-flex' style={{ writingMode: 'vertical-lr', marginRight: '20px', height: '100%' }}>
                                <div className='' style={{height: '33.3%'}}>ᠨᠡᠶᠢᠲᠡ ᠪᠠᠭᠴᠡ ᠴᠠᠭ: {tooBichih(datas?.score?.max_kredit)}</div>

                                <div className='' style={{height: '33.3%'}}>ᠭᠣᠣᠯᠴᠢ ᠳᠦᠩ:   <span style={{ fontFamily: 'CMSUB', fontSize: '12px' }}>{datas?.score?.assesment.split('.')[0]}<span style={{ fontFamily: 'serif', fontWeight: 'bolder' }}>.</span>{datas?.score?.assesment.split('.')[1]}</span></div>
                                <div className='mt-2' style={{height: '66.7%'}}>ᠲᠤᠬᠠᠢ ᠶ᠋ᠢᠨ ᠤᠯᠠᠷᠢᠯ ᠤ᠋ᠨ ᠢᠵᠢᠯ ᠮᠡᠷᢉᠡᠵᠢᠯ ᠦ᠋ᠨ ᠲᠡᢉᠦᠰᠦᢉᠴᠢᠳ ᠦ᠋ᠨ ᠭᠣᠣᠯᠴᠢ ᠳ᠋ᠦᠩ ᠦ᠋ᠨ ᠳᠤᠨᠳᠠᠵᠢ:   <span style={{ fontFamily: 'CMSUB', fontSize: '12px' }}>{datas?.score?.average_score_prof && datas?.score?.average_score_prof?.split('.')[0]}<span style={{ fontFamily: 'serif', fontWeight: 'bolder' }}>.</span>{datas?.score?.average_score_prof && datas?.score?.average_score_prof?.split('.')[1]}</span></div>
                            </div>
                    }

                    {
                        (datas?.graduation_work?.lesson_type != 1 && datas?.graduation_work?.diplom_topic)
                        &&
                        <div style={{ writingMode: 'vertical-lr', display: 'flex', marginRight: '10px' }} >
                            <span className=''>ᠳ᠋ᠢᠫᠯᠣᠮ ᠤ᠋ᠨ ᠠᠵᠢᠯ ᠤ᠋ᠨ ᠨᠡᠷ᠎ᠡ: &nbsp;<span className='fw-bolder'>{datas?.graduation_work?.diplom_topic_uig}</span></span>
                        </div>
                    }

                    {
                        printDatas?.student?.group?.degree?.degree_code == 'D'
                        &&
                        <div style={{ writingMode: 'vertical-lr', display: 'flex', marginRight: '50px' }} >
                            {
                                datas?.graduation_work?.lesson_type == 1
                                ?
                                    printDatas?.student?.group?.degree?.degree_code !== 'D'
                                    ?
                                        <span className=''>ᠮᠠᢉᠢᠰᠲ᠋ᠷ ᠤ᠋ᠨ ᠲᠡᢉᠦᠰᠦᠯᠲᠡ ᠶ᠋ᠢᠨ ᠠᠵᠢᠯ/ ᠳ᠋ᠢᠰᠰᠠᠷᠲ᠋ᠠᠴᠠ ᠶ᠋ᠢᠨ ᠨᠡᠷ᠎ᠡ: &nbsp;<span className='fw-bolder'>{datas?.graduation_work?.diplom_topic_uig}</span></span>
                                    :
                                        <span className=''>ᠳ᠋ᠢᠫᠯᠣᠮ ᠤ᠋ᠨ ᠠᠵᠢᠯ ᠤ᠋ᠨ ᠨᠡᠷ᠎ᠡ: &nbsp;<span className='fw-bolder'>{datas?.graduation_work?.diplom_topic_uig}</span></span>

                                :
                                    <>
                                        <span className=''>
                                            ᠲᠡᢉᠦᠰᠦᠯᠲᠡ ᠶ᠋ᠢᠨ ᠰᠢᠯᠭᠠᠯᠲᠠ:
                                        </span>
                                            {
                                                datas?.graduation_work?.lesson?.map((val, idx) =>
                                                {
                                                    return (
                                                        <div key={idx} style={{ height: `${100/datas?.graduation_work?.lesson.length}%`, display: 'flex' }}>
                                                            <span style={{ height: '65%' }}>{val?.name_uig}</span>
                                                            {tooBichih((val?.score_register?.teach_score || 0) + (val?.score_register?.exam_score || 0))} <span style={{ fontFamily: 'serif' }}>.{val?.score_register?.assessment}</span>
                                                        </div>
                                                    )
                                                })
                                            }
                                    </>
                            }
                        </div>
                    }

                    {
                        listArr.map(
                            (val, idx) =>
                            {
                                return (
                                    <div className='h-100 d-flex justify-content-start' style={{ writingMode: 'vertical-lr', fontSize: '12px', marginRight: '10px', lineHeight: '26px' }} key={idx} >
                                        <span>{val?.position_name_uig}</span>
                                        <span style={{marginTop: '150px'}}>{val?.last_name_uig} {val?.first_name_uig}</span>
                                    </div>
                                )
                            }
                        )
                    }

                    {/* <div style={{ writingMode: 'vertical-lr', marginLeft: '11px', fontSize: '11px' }} >
                        <span>ᠡᠨᠡᢈᠦ ᠬᠠᠪᠰᠤᠷᠤᠯᠲᠠ {tooBichih(new Date().getFullYear())} ᠣᠨ ᠤ᠋ <span style={{ fontFamily: 'cmdashitseden', fontSize: '12px' }}></span>{tooBichih(printDatas?.student?.graduation_work?.diplom_num)} ᠳ᠋ᠤᠭᠠᠷ ᠲᠠᠢ ᠳ᠋ᠢᠫᠯᠣᠮ ᠤ᠋ᠨ ᠬᠠᠮᠲᠤ ᢈᠦᠴᠦᠨ ᠲᠡᠢ</span>
                    </div> */}
                </div>
            </footer>
        </div>
    )
}
