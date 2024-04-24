
import React, { useState, useEffect } from 'react'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import './style.css'

export default function PrintAttachmentEnglish()
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

									newCell1.innerHTML = perCount
									newCell2.innerHTML = flattenedArray[count - 1]?.name_eng || ''
									newCell3.innerHTML = flattenedArray[count - 1]?.kredit || ''

                                    newCell4.innerHTML = flattenedArray[count - 1]?.score ? flattenedArray[count - 1]?.score : ''

									newCell5.innerHTML = flattenedArray[count - 1]?.assesment || ''

									newCell1.className = 'border-dark mini-cell'
									newCell2.className = 'border-dark body-cell'
									newCell3.className = 'border-dark footer1-cell'
									newCell4.className = 'border-dark footer2-cell'
									newCell5.className = 'border-dark footer3-cell'
                                }
                                else
                                {
                                    let newCell1 = newRow.insertCell();

									newCell1.innerHTML = flattenedArray[count - 1]?.eng_name
									newCell1.colSpan = 5

									newCell1.className = 'border-dark body-cell text-center'
                                }
                            }
                        }
                    }
                }
            }
        },
        [datas]
    )

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

            <div className={`position-relative d-flex justify-content-between ${isPageBreak && 'page-break'}`} style={{ fontSize: '9px', marginTop: '135px' }} >

                <div className='d-flex flex-wrap align-content-start p-1' style={{ width: '33.1%' }} >
                    <table className='w-100 text-center d-none' id='table1' >
                        <thead className='fw-bolder'>
                             <tr style={{ height: '25px' }}>
                                <td className='border-dark' style={{ width: '6.25%' }}  >№</td>
                                <td className='border-dark' style={{ width: '63.75%' }}  >Name of subject</td>
                                <td className='border-dark' style={{ width: '12%' }}  >Cr</td>
                                <td className='border-dark' style={{ width: '10%' }} >Point</td>
                                <td className='border-dark' style={{ width: '8%' }} >Grade</td>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>
                </div>

                <div className='d-flex flex-wrap align-content-start p-1' style={{ width: '33.1%' }} >
                    <table className='w-100 text-center d-none' id='table2' >
                        <thead className='fw-bolder'>
                             <tr style={{ height: '25px' }}>
                                <td className='border-dark' style={{ width: '6.25%' }}  >№</td>
                                <td className='border-dark' style={{ width: '63.75%' }}  >Name of subject</td>
                                <td className='border-dark' style={{ width: '12%' }}  >Cr</td>
                                <td className='border-dark' style={{ width: '10%' }} >Point</td>
                                <td className='border-dark' style={{ width: '8%' }} >Grade</td>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>
                </div>

                <div className='d-flex flex-wrap align-content-start p-1' style={{ width: '33.1%' }} >

                    <table className='w-100 text-center d-none' id='table3' >
                        <thead className='fw-bolder'>
                             <tr style={{ height: '25px' }}>
                                <td className='border-dark' style={{ width: '6.25%' }}  >№</td>
                                <td className='border-dark' style={{ width: '63.75%' }}  >Name of subject</td>
                                <td className='border-dark' style={{ width: '12%' }}  >Cr</td>
                                <td className='border-dark' style={{ width: '10%' }} >Point</td>
                                <td className='border-dark' style={{ width: '8%' }} >Grade</td>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>
                </div>

                {
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
                }

            </div>

            <div className={`${!isPageBreak && 'd-none'}`} style={{ marginTop: '135px', breakInside: 'avoid' }} >
                <div className={`position-relative d-flex justify-content-between`} >
                    <div className='d-flex flex-wrap align-content-start p-1' style={{ width: '33.1%' }} >
                        <table className='w-100 text-center d-none' id='table4' >
                            <thead className='fw-bolder'>
                                 <tr style={{ height: '25px' }}>
                                    <td className='border-dark' style={{ width: '6.25%' }}  >№</td>
                                    <td className='border-dark' style={{ width: '63.75%' }}  >Name of subject</td>
                                    <td className='border-dark' style={{ width: '12%' }}  >Cr</td>
                                    <td className='border-dark' style={{ width: '10%' }} >Point</td>
                                    <td className='border-dark' style={{ width: '8%' }} >Grade</td>
                                </tr>
                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    </div>

                    <div className='d-flex flex-wrap align-content-start p-1' style={{ width: '33.1%' }} >

                        <table className='w-100 text-center d-none' id='table5' >
                            <thead className='fw-bolder'>
                                 <tr style={{ height: '25px' }}>
                                    <td className='border-dark' style={{ width: '6.25%' }}  >№</td>
                                    <td className='border-dark' style={{ width: '63.75%' }}  >Name of subject</td>
                                    <td className='border-dark' style={{ width: '12%' }}  >Cr</td>
                                    <td className='border-dark' style={{ width: '10%' }} >Point</td>
                                    <td className='border-dark' style={{ width: '8%' }} >Grade</td>
                                </tr>
                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    </div>

                    <div className='d-flex flex-wrap align-content-start p-1' style={{ width: '33.1%' }} >

                        <table className='w-100 text-center d-none' id='table6' >
                            <thead className='fw-bolder'>
                                 <tr style={{ height: '25px' }}>
                                    <td className='border-dark' style={{ width: '6.25%' }}  >№</td>
                                    <td className='border-dark' style={{ width: '63.75%' }}  >Name of subject</td>
                                    <td className='border-dark' style={{ width: '12%' }}  >Cr</td>
                                    <td className='border-dark' style={{ width: '10%' }} >Point</td>
                                    <td className='border-dark' style={{ width: '8%' }} >Grade</td>
                                </tr>
                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <header className='w-100 px-1' style={{ backgroundColor: 'white', color: 'black' }} >
                <div className='d-flex flex-column text-center fw-bolder'>
                    <p className='text-uppercase' style={{ marginBottom: '0px' }} >UNIVERSITY OF INTERNAL AFFAIRS, MONGOLIA</p>
                    <p className='text-uppercase' style={{ marginBottom: '0px' }} >{printDatas?.student?.department?.school_eng}</p>
                    <p style={{ fontSize: '12px', fontWeight: '500' }} >{printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.graduation_work?.diplom_num} <span className='text-lowercase'>{printDatas?.student?.group?.degree?.degree_eng_name}</span> degree diploma</p>
                </div>

                <div className='fw-bolder d-flex' style={{ fontSize: '11px' }} >
                    <div className='d-flex' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Last name:</span> <span>{printDatas?.student?.last_name_eng}</span>
                    </div>
                    <div className='d-flex px-1' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50' style={{ width: '200px'}}>Graduated year:</span> <span>{printDatas?.student?.graduation_work?.lesson_year?.substring(5, 9)}</span>
                    </div>
                    <div className='d-flex px-2' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Date:</span> <span>{printDatas?.registration_num?.replaceAll('.', '-')}</span>
                    </div>
                </div>
                <div className='fw-bolder d-flex' style={{ fontSize: '11px' }} >
                    <div className='d-flex' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>First name:</span> <span>{printDatas?.student?.first_name_eng}</span>
                    </div>
                    <div className='d-flex px-1' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Professional Index: </span><span>{printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.group?.profession?.code}</span>
                    </div>
                    <div className='d-flex px-2' style={{ width: '33.3%' }} >
                    <span className='fw-normal w-50'>Registration No:</span> <span>{printDatas?.student?.graduation_work?.registration_num}</span>
                    </div>
                </div>
                <div className='fw-bolder d-flex' style={{ fontSize: '11px' }} >
                    <div className='d-flex' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Registration number:</span> <span>{engVseg(printDatas?.student?.register_num[0])}{engVseg(printDatas?.student?.register_num[1])}{printDatas?.student?.register_num.slice(-8)}</span>
                    </div>
                    <div className='d-flex px-1' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Profession:</span> <span>{printDatas?.student?.group?.profession?.name_eng}</span>
                    </div>
                </div>
            </header>

            <footer className='w-100' style={{ fontSize: '10px', backgroundColor: 'white', color: 'black' }} >

                <div className='text-end me-1'>
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
                </div>

                <div className='d-flex justify-content-center' style={{ paddingInline: '100px' }} >
                    {
                        listArr.length != 0
                        &&
                        listArr.map((val, idx) =>
                        {
                            return (
                                <div className='px-1' style={{ width: `${100/listArr.length}%` }} key={idx} >
                                    <div className='d-inline-block text-center' >
                                        <div className='pt-50 px-2' style={{ textTransform: 'uppercase', borderTop: '1px solid black' }}>
                                        {`${val?.last_name_eng}${val?.first_name_eng}`}, {val?.position_name_eng}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>

                {
                    isPageBreak === false
                    ?
                    (
                        <div className={`text-end mt-2`} style={{ fontSize: '11px', marginRight: '12px' }} >
                            {printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.graduation_work?.diplom_num} Invalid without diploma.
                        </div>
                    )
                    :
                        null
                }

            </footer>

        </>
    )
}
