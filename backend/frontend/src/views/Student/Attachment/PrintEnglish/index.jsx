
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
            fetchData(signatureApi.get(3)),
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

    useEffect(
        () =>
        {
            if (datas?.lessons)
            {
                if (datas?.lessons?.length != 0)
                {
                    let count = 0
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
                                let newCell1 = newRow.insertCell();
                                let newCell2 = newRow.insertCell();
                                let newCell3 = newRow.insertCell();
                                let newCell4 = newRow.insertCell();
                                let newCell5 = newRow.insertCell();

                                count++

                                newCell1.innerHTML = count
                                newCell2.innerHTML = datas?.lessons[count - 1]?.lesson?.lesson?.name_eng || ''
                                newCell3.innerHTML = datas?.lessons[count - 1]?.kredit
                                newCell4.innerHTML = datas?.lessons[count - 1]?.score ? Math.round(datas?.lessons[count - 1]?.score) : ''
                                newCell5.innerHTML = datas?.lessons[count - 1]?.assesment

                                newCell1.className = 'border-dark mini-cell'
                                newCell2.className = 'border-dark body-cell'
                                newCell3.className = 'border-dark footer-cell1'
                                newCell4.className = 'border-dark footer-cell2'
                                newCell5.className = 'border-dark footer-cell3'
                            }
                        }
                    }
                }
            }
        },
        [datas]
    )

    return (
        <>
            {Loading && Loader}

            <div className={`position-relative d-flex justify-content-between ${isPageBreak && 'page-break'}`} style={{ fontSize: '8px', marginTop: '160px' }} >

                <div className='d-flex flex-wrap align-content-start' style={{ width: '33.1%' }} >
                    <table className='w-100 text-center d-none' id='table1' >
                        <thead>
                            <tr>
                                <td rowSpan={2} className='border-dark' style={{ width: '6.25%' }}  >№</td>
                                <td rowSpan={2} className='border-dark' style={{ width: '63.75%' }}  >Subject</td>
                                <td rowSpan={2} className='border-dark' style={{ width: '12%' }}  >Credit hours</td>
                                <td colSpan={2} className='border-dark' style={{ width: '18%' }}  >Study</td>
                            </tr>
                            <tr>
                                <td className='border-dark' style={{ width: '10%' }} >Point</td>
                                <td className='border-dark' style={{ width: '8%' }} >Mark</td>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>
                </div>

                <div className='d-flex flex-wrap align-content-start' style={{ width: '33.1%' }} >
                    <table className='w-100 text-center d-none' id='table2' >
                        <thead>
                            <tr>
                                <td rowSpan={2} className='border-dark' style={{ width: '6.25%' }}  >№</td>
                                <td rowSpan={2} className='border-dark' style={{ width: '63.75%' }}  >Subject</td>
                                <td rowSpan={2} className='border-dark' style={{ width: '12%' }}  >Credit hours</td>
                                <td colSpan={2} className='border-dark' style={{ width: '18%' }}  >Study</td>
                            </tr>
                            <tr>
                                <td className='border-dark' style={{ width: '10%' }} >Point</td>
                                <td className='border-dark' style={{ width: '8%' }} >Mark</td>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>
                </div>

                <div className='d-flex flex-wrap align-content-start' style={{ width: '33.1%' }} >

                    <table className='w-100 text-center d-none' id='table3' >
                        <thead>
                            <tr>
                                <td rowSpan={2} className='border-dark' style={{ width: '6.25%' }}  >№</td>
                                <td rowSpan={2} className='border-dark' style={{ width: '63.75%' }}  >Subject</td>
                                <td rowSpan={2} className='border-dark' style={{ width: '12%' }}  >Credit hours</td>
                                <td colSpan={2} className='border-dark' style={{ width: '18%' }}  >Study</td>
                            </tr>
                            <tr>
                                <td className='border-dark' style={{ width: '10%' }} >Point</td>
                                <td className='border-dark' style={{ width: '8%' }} >Mark</td>
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
                            <div className='position-absolute' style={{ right: '12px', fontSize: '9px', top: '533px' }} >
                                This annex-1 is valid with Diploma No. {printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.group?.profession?.code} in {new Date().getFullYear()}
                            </div>
                            <div className='position-absolute' style={{ right: '12px', fontSize: '9px', top: '1242px' }} >
                                This annex-2 is valid with Diploma No. {printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.group?.profession?.code} in {new Date().getFullYear()}
                            </div>
                        </>
                    )
                    :
                        null
                }

            </div>

            <div className={`${!isPageBreak && 'd-none'}`} style={{ marginTop: '160px', breakInside: 'avoid' }} >
                <div className={`position-relative d-flex justify-content-between`} >
                    <div className='d-flex flex-wrap align-content-start' style={{ width: '33.1%' }} >
                        <table className='w-100 text-center d-none' id='table4' >
                            <thead>
                                <tr>
                                    <td rowSpan={2} className='border-dark' style={{ width: '6.25%' }}  >№</td>
                                    <td rowSpan={2} className='border-dark' style={{ width: '63.75%' }}  >Subject</td>
                                    <td rowSpan={2} className='border-dark' style={{ width: '12%' }}  >Credit hours</td>
                                    <td colSpan={2} className='border-dark' style={{ width: '18%' }}  >Study</td>
                                </tr>
                                <tr>
                                    <td className='border-dark' style={{ width: '10%' }} >Point</td>
                                    <td className='border-dark' style={{ width: '8%' }} >Mark</td>
                                </tr>
                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    </div>

                    <div className='d-flex flex-wrap align-content-start' style={{ width: '33.1%' }} >

                        <table className='w-100 text-center d-none' id='table5' >
                            <thead>
                                <tr>
                                    <td rowSpan={2} className='border-dark' style={{ width: '6.25%' }}  >№</td>
                                    <td rowSpan={2} className='border-dark' style={{ width: '63.75%' }}  >Subject</td>
                                    <td rowSpan={2} className='border-dark' style={{ width: '12%' }}  >Credit hours</td>
                                    <td colSpan={2} className='border-dark' style={{ width: '18%' }}  >Study</td>
                                </tr>
                                <tr>
                                    <td className='border-dark' style={{ width: '10%' }} >Point</td>
                                    <td className='border-dark' style={{ width: '8%' }} >Mark</td>
                                </tr>
                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    </div>

                    <div className='d-flex flex-wrap align-content-start' style={{ width: '33.1%' }} >

                        <table className='w-100 text-center d-none' id='table6' >
                            <thead>
                                <tr>
                                    <td rowSpan={2} className='border-dark' style={{ width: '6.25%' }}  >№</td>
                                    <td rowSpan={2} className='border-dark' style={{ width: '63.75%' }}  >Subject</td>
                                    <td rowSpan={2} className='border-dark' style={{ width: '12%' }}  >Credit hours</td>
                                    <td colSpan={2} className='border-dark' style={{ width: '18%' }}  >Study</td>
                                </tr>
                                <tr>
                                    <td className='border-dark' style={{ width: '10%' }} >Point</td>
                                    <td className='border-dark' style={{ width: '8%' }} >Mark</td>
                                </tr>
                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <header className='w-100' >
                <div className='d-flex flex-column text-center fw-bolder'>
                    <p className='text-uppercase' style={{ marginBottom: '10px' }} >Mongolian national university</p>
                    <p className='text-uppercase' style={{ marginBottom: '10px' }} >{printDatas?.student?.department?.school}</p>
                    <p style={{ fontSize: '10px' }} >Annex to the Diploma No. {printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.graduation_work?.diplom_num}</p>
                </div>

                <div className='fw-bolder' style={{ fontSize: '11px' }} >
                    <div className='d-inline-block' style={{ width: '33.3%' }} >
                        Surname: <span className='fw-normal' >{printDatas?.student?.last_name_eng}</span>
                    </div>
                    <div className='d-inline-block' style={{ width: '33.3%' }} >
                        Year of Graduation: <span className='fw-normal' >{printDatas?.student?.graduation_work?.lesson_year?.substring(5, 9)}</span>
                    </div>
                    <div className='d-inline-block' style={{ width: '33.3%' }} >
                        Date of Issue: <span className='fw-normal' >{printDatas?.registration_num}</span>
                    </div>
                </div>
                <div className='fw-bolder' style={{ fontSize: '11px' }} >
                    <div className='d-inline-block' style={{ width: '33.3%' }} >
                        Given name: <span className='fw-normal' >{printDatas?.student?.first_name_eng}</span>
                    </div>
                    <div className='d-inline-block' style={{ width: '33.3%' }} >
                        Profession: <span className='fw-normal' >{printDatas?.student?.group?.profession?.name_eng}</span>
                    </div>
                </div>
                <div className='fw-bolder' style={{ fontSize: '11px' }} >
                    <div className='d-inline-block' style={{ width: '33.3%' }} >
                        ID Registration No:: <span className='fw-normal' >{printDatas?.student?.register_num}</span>
                    </div>
                    <div className='d-inline-block' style={{ width: '33.3%' }} >
                        Professional Index: <span className='fw-normal' >{printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.group?.profession?.code}</span>
                    </div>
                    <div className='d-inline-block' style={{ width: '33.3%' }} >
                        Diploma Registration No: <span className='fw-normal' >{printDatas?.student?.graduation_work?.registration_num}</span>
                    </div>
                </div>
            </header>

            <footer className='w-100' style={{ fontSize: '10px' }} >

                <div className='text-center'>
                    <span>Total Credits: {datas?.score?.max_kredit}</span>
                    <span className='ms-5'>GPA: {datas?.score?.assesment}</span>
                </div>

                <div className='px-2 pb-2' style={{ paddingTop: '5px' }} >
                    { datas?.graduation_work?.lesson_type == 1 ? 'Diploma thesis:' : 'Graduation Exams:' }
                    {
                        datas?.graduation_work?.lesson?.map((val, idx) =>
                        {
                            return (
                                <span className='ms-5' key={idx} >{idx + 1}. {val?.name_eng} / {(val?.score_register?.teach_score || 0) + (val?.score_register?.exam_score || 0)} {val?.score_register?.assessment} /</span>
                            )
                        })
                    }
                </div>

                <div>
                    {
                        listArr.length != 0
                        &&
                        listArr.map((val, idx) =>
                        {
                            return (
                                <div className='d-inline-block px-2' style={{ width: `${100/listArr.length}%` }} key={idx} >
                                    <div className='d-inline-block text-start' >
                                        {val?.position_name_eng}
                                        <p>________________ {`${val?.last_name_eng} ${val?.first_name_eng}`}</p>
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
                        <div className={`text-end`} style={{ fontSize: '9px', marginRight: '12px' }} >
                            This annex is valid with Diploma No. {printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.group?.profession?.code} in {new Date().getFullYear()}
                        </div>
                    )
                    :
                        null
                }

            </footer>

        </>
    )
}
