
import React, { useState, useEffect, useRef } from 'react'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import './style.css'

export default function PrintAttachmentEnglish()
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
    const [ tableRowCount, setTableRowCount ] = useState([])
    const [ rowSum, setRowSum ] = useState(0)

    // const rowSum = printDatas.tableRowCount?.reduce((partialSum, a) => partialSum + a, 0);

    const [height, setHeight] = useState(
        {
            header: 0,
            footer: 0,
            body1: 0,
            body2: 0
        }
    )

    async function getAllData(studentId)
    {
        await Promise.all([
            // Нэгдсэн нэг сургуулийн захирал гарын үсэг хэвлэж байгаа болохоор, data?.student?.group?.profession?.school
            // , printDatas.student?.department?.sub_orgs
            fetchData(signatureApi.get(3)),
            fetchData(studentApi.calculateGpaDimplomaGet(studentId)),
            fetchData(studentApi.getConfig(printDatas?.student?.group?.id, 'english'))
        ]).then((values) => {
            setListArr(values[0]?.data)
            setDatas(values[1]?.data)
            setTableRowCount(values[2]?.data?.row_count ? values[2]?.data?.row_count : [])
            var sum_count = values[2]?.data?.row_count?.reduce((partialSum, a) => partialSum + a, 0);
            setRowSum(sum_count)
        })
    }


    useEffect(() => {
        setHeight(
            {
                header:headerSectionRef.current.clientHeight,
                footer:footerSectionRef.current.clientHeight,
                body1:body1SectionRef.current.clientHeight,
                body2:body2SectionRef.current.clientHeight,

            }
        )
    }, [])

    useEffect(
        () =>
        {
            if (datas, listArr.length != 0)
            {
                document.title = `${printDatas?.student?.full_name}-хавсралт-англи`
            }
        },
        [datas, listArr]
    )

    useEffect(
        () =>
        {
            getAllData(printDatas.student.id)
        },
        [printDatas]
    )

    const lessonData = datas?.lessons || []

    const flattenedArray = lessonData.flatMap(item => [
        {
            type: "parent",
            name: item?.name,
            eng_name: item?.eng_name,
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

                    let divide = tableRowCount.filter(element => element !== 0).length
                    let dividePage1 = divide > 3 ? 3 : divide
                    let dividePage2 = divide - 3 > 0 ? divide - 3 : 0

                    for (let [idx, val] of tableRowCount.entries())
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
                            let parentTableDoc = document.getElementById(`table${idx + 1}-${idx + 1}`)
                            tableDoc.classList.toggle('d-none')

                            var tbodyRef = tableDoc.getElementsByTagName('tbody')[0];

                            if (tableRowCount[2] == 0 && tableRowCount[1] == 0)
                            {
                                if (idx == 0)
                                {
                                    parentTableDoc.style.padding = '0px 76px 0px 70px'
                                }
                            }

                            if (tableRowCount[2] == 0 && tableRowCount[1] !== 0)
                            {
                                if (idx == 0)
                                {
                                    parentTableDoc.style.padding = '0px 0px 0px 70px'
                                }
                                else
                                {
                                    parentTableDoc.style.padding = '0px 76px 0px 0px'
                                }
                            }

                            parentTableDoc.style.width = `${99.1 / dividePage1}%`

                            // if (half <= idx)
                            // {
                            //     parentTableDoc.style.width = `${99.1 / dividePage2}%`
                            // }
                            // else
                            // {
                            //     parentTableDoc.style.width = `${99.1 / dividePage1}%`
                            // }

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

                                    newCell1.innerHTML = perCount
                                    newCell2.innerHTML = flattenedArray[count - 1]?.name_eng || ''
                                    newCell3.innerHTML = flattenedArray[count - 1]?.kredit || ''

                                    // Тооцов дүнг харуулахдаа
                                    if (flattenedArray[count - 1]?.grade_letter) {
                                        newCell4.innerHTML = flattenedArray[count - 1]?.grade_letter ? 'Allow' : ''
                                        newCell4.colSpan = 2
                                    } else {
                                        newCell4.innerHTML = flattenedArray[count - 1]?.score ? flattenedArray[count - 1]?.score : ''
                                        // NaN буцаагаад байхаар нь шалгах функц бичсэн.
                                        // ер нь бол шаардлагагүй гэхдээ яахав

                                        // newCell4.innerHTML = !isNaN(flattenedArray[count - 1]?.score)
                                        // 	? flattenedArray[count - 1]?.score
                                        // 		: 'Default';

                                        newCell5.innerHTML = flattenedArray[count - 1]?.assesment || ''
                                        newCell5.className = 'border-dark footer3-cell'
                                    }

                                    newCell1.className = 'border-dark mini-cell'
                                    newCell2.className = 'border-dark body-cell'
                                    newCell3.className = 'border-dark footer1-cell'
                                    newCell4.className = 'border-dark footer2-cell'
                                }
                                else
                                {
                                    let newCell1 = newRow.insertCell();
                                    if (flattenedArray[count - 1]) {
                                        newCell1.innerHTML = flattenedArray[count - 1]?.eng_name
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

    /* Монгол үсгийг англи үсэг болгох хэсэг*/
    function engVseg(vseg)
    {
        switch (vseg)
        {
            case 'А':
                return 'A'
            case 'Б':
                return 'B'
            case 'В':
                return 'V'
            case 'Г':
                return 'G'
            case 'Д':
                return 'D'
            case 'Е':
                return 'Ye'
            case 'Ё':
                return 'Yo'
            case 'Ж':
                return 'J'
            case 'З':
                return 'Z'
            case 'И':
                return 'I'
            case 'Й':
                return 'i'
            case 'К':
                return 'K'
            case 'Л':
                return 'L'
            case 'М':
                return 'M'
            case 'Н':
                return 'N'
            case 'О':
                return 'O'
            case 'Ө':
                return 'O'
            case 'П':
                return 'P'
            case 'Р':
                return 'R'
            case 'С':
                return 'S'
            case 'Т':
                return 'T'
            case 'У':
                return 'U'
            case 'Ү':
                return 'U'
            case 'Ф':
                return 'F'
            case 'Х':
                return 'Kh'
            case 'Ц':
                return 'Ts'
            case 'Ч':
                return 'Ch'
            case 'Ш':
                return 'Sh'
            case 'Ы':
                return 'I'
            case 'Ь':
                return 'I'
            case 'Э':
                return 'E'
            case 'Ю':
                return 'Yu'
            case 'Я':
                return 'Ya'
            default:
                break;
        }
    }

    return (
        <>
            {Loading && Loader}
            <div ref={body1SectionRef} className={`position-relative px-1 d-flex justify-content-between d-flex gap-1 ${isPageBreak && 'page-break'}`} style={{ fontSize: '13px', paddingTop: height.header + (printDatas?.student?.group?.degree?.degree_code === 'D' ? 18 : 24),  backgroundColor: 'white', color: 'black', fontFamily: 'Arial' }} >

            {/* <div ref={body1SectionRef} className={`position-relative d-flex justify-content-between ${isPageBreak && 'page-break'}`} style={{ fontSize: '9px', marginTop: '135px', paddingTop: height.header + 24, }} > */}

                <div className='d-flex flex-wrap align-content-start mt-1' id='table1-1' >

                    <table className='w-100 text-center d-none' id='table1' style={{fontSize: printDatas?.student?.group?.degree?.degree_code === 'D' ? '9px' : '10px'}}>
                        <thead className='fw-bolder'>
                            <tr style={{ height: '20px' }}>
                                <td className='border-dark' style={{ width: '4%' }}  >№</td>
                                <td className='border-dark' style={{ width: '70%' }}  >Name of subject</td>
                                <td className='border-dark' style={{ width: '7%' }}  >Cr</td>
                                <td className='border-dark' style={{ width: '11%' }} >Point</td>
                                <td className='border-dark' style={{ width: '8%' }} >Grade</td>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>
                </div>

                <div className='d-flex flex-wrap align-content-start mt-1' id='table2-2' >

                    <table className='w-100 text-center d-none' id='table2' style={{fontSize: printDatas?.student?.group?.degree?.degree_code === 'D' ? '9px' : '10px'}}>
                        <thead className='fw-bolder'>
                            <tr style={{ height: '25px' }}>
                                <td className='border-dark' style={{ width: '4%' }}>№</td>
                                <td className='border-dark' style={{ width: '70%' }}>Name of subject</td>
                                <td className='border-dark' style={{ width: '7%' }} >Cr</td>
                                <td className='border-dark' style={{ width: '11%' }} >Point</td>
                                <td className='border-dark' style={{ width: '8%' }} >Grade</td>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>
                </div>

                <div className='d-flex flex-wrap align-content-start mt-1' id='table3-3' >
                    <table className='w-100 text-center d-none' id='table3' style={{fontSize: printDatas?.student?.group?.degree?.degree_code === 'D' ? '9px' : '10px'}}>
                        <thead className='fw-bolder'>
                            <tr style={{ height: '25px' }}>
                                <td className='border-dark' style={{ width: '4%' }}  >№</td>
                                <td className='border-dark' style={{ width: '70%' }}  >Name of subject</td>
                                <td className='border-dark' style={{ width: '7%' }}  >Cr</td>
                                <td className='border-dark' style={{ width: '11%' }} >Point</td>
                                <td className='border-dark' style={{ width: '8%' }} >Grade</td>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>
                </div>

                {/* {
                    isPageBreak
                    ?
                    (
                        <>
                            <div className='position-absolute' style={{ right: '12px', fontSize: '11px', top: '533px' }} >
                                This annex-1 is valid with Diploma No. {printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.graduation_work?.diplom_num} in {new Date().getFullYear()}
                            </div>
                            <div className='position-absolute' style={{ right: '12px', fontSize: '11px', top: '1242px' }} >
                                This annex-2 is valid with Diploma No. {printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.graduation_work?.diplom_num} in {new Date().getFullYear()}
                            </div>
                        </>
                    )
                    :
                        null
                } */}

            </div>

            {/* <div ref={body2SectionRef} className={`${!isPageBreak && 'd-none'}`} style={{ marginTop: '135px', breakInside: 'avoid' }} > */}
            <div ref={body2SectionRef} className={`${!isPageBreak && 'd-none'}`} style={{ marginTop: '175px', breakInside: 'avoid', backgroundColor: 'white', color: 'black', fontFamily: 'serif' }} >

                <div className={`position-relative d-flex justify-content-between`} >
                    <div className='d-flex flex-wrap align-content-start p-1' style={{ width: '33.1%' }} id='table4-4'>
                        <table className='w-100 text-center d-none' id='table4' >
                            <thead className='fw-bolder'>
                                 <tr style={{ height: '25px' }}>
                                    <td className='border-dark' style={{ width: '4%' }} >№</td>
                                    <td className='border-dark' style={{ width: '70%' }} >Name of subject</td>
                                    <td className='border-dark' style={{ width: '7%' }}  >Cr</td>
                                    <td className='border-dark' style={{ width: '11%' }} >Point</td>
                                    <td className='border-dark' style={{ width: '8%' }} >Grade</td>
                                </tr>
                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    </div>

                    <div className='d-flex flex-wrap align-content-start p-1' style={{ width: '33.1%' }} id='table5-5'>

                        <table className='w-100 text-center d-none' id='table5' >
                            <thead className='fw-bolder'>
                                 <tr style={{ height: '25px' }}>
                                    <td className='border-dark' style={{ width: '4%' }}  >№</td>
                                    <td className='border-dark' style={{ width: '70%' }}  >Name of subject</td>
                                    <td className='border-dark' style={{ width: '7%' }}  >Cr</td>
                                    <td className='border-dark' style={{ width: '11%' }} >Point</td>
                                    <td className='border-dark' style={{ width: '8%' }} >Grade</td>
                                </tr>
                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    </div>

                    <div className='d-flex flex-wrap align-content-start p-1' style={{ width: '33.1%' }} id='table6-6'>

                        <table className='w-100 text-center d-none' id='table6' >
                            <thead className='fw-bolder'>
                                 <tr style={{ height: '25px' }}>
                                    <td className='border-dark' style={{ width: '4%' }}  >№</td>
                                    <td className='border-dark' style={{ width: '70%' }}  >Name of subject</td>
                                    <td className='border-dark' style={{ width: '7%' }}  >Cr</td>
                                    <td className='border-dark' style={{ width: '11%' }} >Point</td>
                                    <td className='border-dark' style={{ width: '8%' }} >Grade</td>
                                </tr>
                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <header
                className='w-100 px-1'
                style={{ backgroundColor: 'white', color: 'black', fontFamily: 'Arial' }}
                ref={headerSectionRef}
            >

                <div className='d-flex flex-column text-center fw-bolder'>
                    <p className='text-uppercase' style={{ marginBottom: '0px' }} >UNIVERSITY OF INTERNAL AFFAIRS, MONGOLIA</p>
                    <p className='text-uppercase' style={{ marginBottom: '0px' }} >{printDatas?.student?.department?.school_eng}</p>
                    <p style={{ fontSize: '12px', fontWeight: '500' }} className='mb-0' >{printDatas?.student?.graduation_work?.diplom_num} <span className='text-lowercase'>{printDatas?.student?.group?.degree?.degree_eng_name}</span> degree diploma</p>
                    <p className='' style={{ fontSize: 12, fontWeight: 500 }}>Register No: {printDatas?.student?.graduation_work?.registration_num}</p>
                </div>

                <div className='fw-bolder d-flex' style={{ fontSize: '11px' }} >
                    <div className='d-flex' style={{ width: printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score ? '25%' : '33.3%' }} >
                        <span className='fw-normal w-50'>Last name:</span> <span className='text-uppercase'>{printDatas?.student?.last_name_eng}</span>
                    </div>
                    <div className='d-flex px-1' style={{ width: printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score ? '25%' : '33.3%' }} >
                        <span className='fw-normal w-50'>Profession:</span> <span className=''>{printDatas?.student?.group?.profession?.name_eng}</span>
                    </div>
                    <div className='d-flex px-2' style={{ width: printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score ? '25%' : '33.3%' }} >
                        <span className='fw-normal w-50' style={{ width: '200px'}}>Commenced:</span><span>{printDatas?.student?.group?.join_year?.substring(0, 4)}</span>
                    </div>
                    {
                        printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score
                        &&
                        <div className='d-flex px-2' style={{ width: '25%'}} >
                            <span className='fw-normal w-50' style={{ width: '200px'}}>Entrance exam point:</span><span className='ms-5'>{printDatas?.student?.eysh_score}</span>
                        </div>
                    }
                </div>
                <div className='fw-bolder d-flex' style={{ fontSize: '11px' }} >
                    <div className='d-flex' style={{ width: printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score ? '25%' : '33.3%' }} >
                        <span className='fw-normal w-50'>First name:</span> <span className='text-uppercase'>{printDatas?.student?.first_name_eng}</span>
                    </div>
                    <div className='d-flex px-1' style={{ width: printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score ? '25%' : '33.3%' }} >
                        {
                            printDatas?.student?.group?.degree?.degree_code === 'D'
                            ?
                                <>
                                    <span className='fw-normal w-50'>Index: </span><span>{printDatas?.student?.group?.profession?.code}</span>
                                </>
                            :
                                <>
                                    <span className='fw-normal w-50'>Major specified: </span><span>{printDatas?.student?.group?.profession?.dep_name_eng}</span>
                                </>
                        }
                    </div>
                    <div className='d-flex px-2' style={{ width: printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score ? '25%' : '33.3%' }} >
                        <span className='fw-normal w-50' style={{ width: '200px'}}>Completed:</span> <span>{printDatas?.student?.graduation_work?.lesson_year?.substring(5, 9)}</span>
                    </div>
                </div>
                <div className='fw-bolder d-flex' style={{ fontSize: '11px' }} >
                    <div className='d-flex' style={{ width: printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score ? '25%' : '33.3%' }} >
                        <span className='fw-normal w-50'>Registration number:</span> <span>{engVseg(printDatas?.student?.register_num[0])}{engVseg(printDatas?.student?.register_num[1])}{printDatas?.student?.register_num.slice(-8)}</span>
                    </div>
                    {
                        printDatas?.student?.group?.degree?.degree_code !== 'D'
                        &&
                            <div className='d-flex px-1' style={{ width: '33.3%' }} >
                                <span className='fw-normal w-50'>Diploma Number of Bachelor's Degree:</span> <span className='text-uppercase'>{printDatas?.student?.graduation_work?.back_diplom_num}</span>
                            </div>
                    }
                    <div className={`d-flex ${printDatas?.student?.group?.degree?.degree_code === 'D' ? 'px-1' : 'px-2'}`} style={{ width: printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score ? '25%' : '33.3%' }} >
                        <span className='fw-normal w-50'>Order number:</span> <span className='text-uppercase'>{printDatas?.student?.graduation_work?.graduation_number}</span>
                    </div>
                    {
                        printDatas?.student?.group?.degree?.degree_code === 'D'
                        &&
                        <div className='d-flex px-2' style={{ width: printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score ? '50%' : '33.3%' }} >
                            <span className='fw-normal w-50' style={{ width: '200px'}}>GPA of previous level of education: </span><span className='ms-5'>{printDatas?.student?.secondary_school}</span>
                        </div>
                    }
                </div>

                {/* <div className='fw-bolder d-flex' style={{ fontSize: '11px' }} >
                    <div className='d-flex' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Last name:</span> <span>{printDatas?.student?.last_name_eng}</span>
                    </div>
                    <div className='d-flex px-1' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50' style={{ width: '200px'}}>Graduated year:</span> <span>{printDatas?.student?.graduation_work?.lesson_year?.substring(5, 9)}</span>
                    </div>
                    <div className='d-flex px-2' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Date:</span> <span>{printDatas?.registration_num?.replaceAll('.', '-')}</span>
                    </div>
                </div> */}
                {/* <div className='fw-bolder d-flex' style={{ fontSize: '11px' }} >
                    <div className='d-flex' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>First name:</span> <span>{printDatas?.student?.first_name_eng}</span>
                    </div>
                    <div className='d-flex px-1' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Professional Index: </span><span>{printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.group?.profession?.code}</span>
                    </div>
                    <div className='d-flex px-2' style={{ width: '33.3%' }} >
                    <span className='fw-normal w-50'>Registration No:</span> <span>{printDatas?.student?.graduation_work?.registration_num}</span>
                    </div>
                </div> */}
                {/* <div className='fw-bolder d-flex' style={{ fontSize: '11px' }} >
                    <div className='d-flex' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Registration number:</span> <span>{engVseg(printDatas?.student?.register_num[0])}{engVseg(printDatas?.student?.register_num[1])}{printDatas?.student?.register_num.slice(-8)}</span>
                    </div>
                    <div className='d-flex px-1' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Profession:</span> <span>{printDatas?.student?.group?.profession?.name_eng}</span>
                    </div>
                </div> */}
            </header>

            <footer
                ref={footerSectionRef}
                className='w-100'
                style={{ fontSize: printDatas?.student?.group?.degree?.degree_code == 'D' ? '10px': '11px', backgroundColor: 'white', color: 'black', bottom: printDatas?.student?.group?.degree?.degree_code == 'D' ? '4px': '10px', fontFamily: 'Arial'  }}
            >
                {
                    printDatas?.student?.group?.degree?.degree_code == 'E'
                    &&
                        <div className='px-1 mb-1' style={{ paddingTop: '2px' }} >
                        {
                            datas?.graduation_work?.lesson_type == 1
                            ?
                                printDatas?.student?.group?.degree?.degree_code !== 'D'
                                ?
                                    <span className=''>Master's thesis/dissertation title: &nbsp;<span className='fw-bolder'>{datas?.graduation_work?.diplom_topic_eng}</span></span>
                                :
                                    <span className=''>Diploma thesis: &nbsp;<span className='fw-bolder'>{datas?.graduation_work?.diplom_topic_eng}</span></span>

                            :
                                <>
                                    <span className=''>
                                        Graduation Exams:
                                    </span>
                                        {
                                            datas?.graduation_work?.lesson?.map((val, idx) =>
                                            {
                                                return (
                                                    <span className='ms-5' key={idx} >{idx + 1}. {val?.name_eng} / {(val?.score_register?.teach_score || 0) + (val?.score_register?.exam_score || 0)} {val?.score_register?.assessment} /</span>
                                                )
                                            })
                                        }
                                </>
                        }
                        </div>
                }

                <div className={`d-flex justify-content-center gap-5 me-1 ${rowSum > 51 ? 'mb-0': 'mb-2'}`}>
                    <div>Total Credits: <span className='fw-bolder'>{datas?.score?.max_kredit}</span></div>
                    <div>GPA: <span className='fw-bolder'>{datas?.score?.average_score}</span></div>
                    <div>Cumulative (GPA): <span className='fw-bolder'>{datas?.score?.assesment}</span></div>
                    {
                        printDatas?.student?.group?.degree?.degree_code == 'D'
                        &&
                        <div>GPA OF graduates from same major of the current semester: <span className='fw-bolder'>{datas?.score?.average_score_prof}</span></div>
                    }
                </div>

                {
                    (datas?.graduation_work?.lesson_type != 1 && datas?.graduation_work?.diplom_topic)
                    &&
                    <div className='px-1 mb-25' style={{ paddingTop: '2px' }} >
                        <span className=''>Diploma thesis: &nbsp;<span className='fw-bolder'>{datas?.graduation_work?.diplom_topic_eng}</span></span>
                    </div>
                }

                {
                    printDatas?.student?.group?.degree?.degree_code == 'D'
                    &&
                    <div className='px-1 mb-25' style={{ paddingTop: '2px' }} >
                    {
                        datas?.graduation_work?.lesson_type == 1
                        ?
                            printDatas?.student?.group?.degree?.degree_code !== 'D'
                            ?
                                <span className=''>Master's thesis/dissertation title: &nbsp;<span className='fw-bolder'>{datas?.graduation_work?.diplom_topic_eng}</span></span>
                            :
                                <span className=''>Diploma thesis: &nbsp;<span className='fw-bolder'>{datas?.graduation_work?.diplom_topic_eng}</span></span>

                        :
                            <>
                                <span className=''>
                                    Graduation Exams:
                                </span>
                                    {
                                        datas?.graduation_work?.lesson?.map((val, idx) =>
                                        {
                                            return (
                                                <span className='ms-5' key={idx} >{idx + 1}. {val?.name_eng} / {(val?.score_register?.teach_score || 0) + (val?.score_register?.exam_score || 0)} {val?.score_register?.assessment} /</span>
                                            )
                                        })
                                    }
                            </>
                    }
                    </div>
                }


                {/* <div className='text-end me-1'>
                    <span className='ms-5'>Total Credits: {datas?.score?.max_kredit}</span>
                    <span className='ms-5'>GPA: {datas?.score?.assesment}</span>
                </div>

                <div className='px-1 mb-5' style={{ paddingTop: '2px', paddingBottom: '15px' }} >
                    { datas?.graduation_work?.lesson_type == 1 ? 'Diploma thesis:' : 'Graduation Exams:' }
                    {
                        datas?.graduation_work?.lesson_type == 1
                        ?
                            <span className='ms-5'>{datas?.graduation_work?.diplom_topic_eng}</span>
                        :
                            datas?.graduation_work?.lesson?.map((val, idx) =>
                            {
                                return (
                                    <span className='ms-5' key={idx} >{idx + 1}. {val?.name_eng} / {(val?.score_register?.teach_score || 0) + (val?.score_register?.exam_score || 0)} {val?.score_register?.assessment} /</span>
                                )
                            })
                    }
                </div> */}

                {/* <div className='d-flex justify-content-center' style={{ paddingInline: '100px' }} >
                    {
                        listArr.length != 0
                        &&
                        listArr.map((val, idx) =>
                        {
                            return (
                                <div className='px-1' style={{ width: `${100/2}%` }} key={idx} >
                                    <div className='d-inline-block text-center' >
                                        <div className='pt-50 px-2' style={{ textTransform: 'uppercase', borderTop: '1px solid black' }}>
                                        {`${val?.last_name_eng}${val?.first_name_eng}`}, {val?.position_name_eng}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div> */}

                <div className='d-flex justify-content-center mt-5'>
                {/* <div className='d-flex justify-content-center' style={{ paddingInline: '100px' }} > */}
                    {
                        listArr.length != 0
                        &&
                        listArr.map((val, idx) =>
                        {
                            return (
                                <div className='text-center px-1' style={{width: '470px'}} key={idx} >
                                    <div className='text-center d-inline-block text-center' >
                                        <div className='text-center pt-50 px-2' style={{ textTransform: 'uppercase', borderTop: '1px solid black' }}>
                                            <span >{val?.last_name_eng}{val?.first_name_eng}</span>
                                            <br/>
                                            <span>{`${val?.position_name_eng}`}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
                <div className={`text-center mt-1`} style={{ fontSize: '11px' }} >
                    Score(GPA): F{'<'}60(0) 60≤D-{'<'}65(1.0) 65≤D{'<'}70(1.4) 70≤C-{'<'}75(1.9) 75≤C{'<'}80(2.3) 80≤B-{'<'}85(3.1) 85≤B{'<'}90(3.1) 90≤A-{'<'}95(3.6) 95≤A{'<'}100(4.0) S=Allow CR=Correspond Credit
                </div>

                {/* {
                    isPageBreak === false
                    ?
                    (
                        <div className={`text-end mt-2`} style={{ fontSize: '11px', marginRight: '12px' }} >
                            {printDatas?.student?.graduation_work?.diplom_num} Invalid without diploma.
                        </div>
                    )
                    :
                        null
                } */}

            </footer>

        </>
    )
}
