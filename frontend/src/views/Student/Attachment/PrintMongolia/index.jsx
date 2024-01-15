
import React, { useState, useEffect } from 'react'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import './style.css'

export default function PrintAttachmentMongolia()
{
    // Loader
	const { fetchData, Loader, isLoading } = useLoader({})

    // API
    const signatureApi = useApi().signature
    const studentApi = useApi().student

    // State
    const [ listArr, setListArr ] = useState([])
    const [ datas, setDatas ] = useState({})
    const [ isPageBreak, setIsPageBreak ] = useState(false)

    const [ printDatas, setPrintDatas ] = useState(JSON.parse(localStorage.getItem('blankDatas')))

    function getAllData(studentId)
    {
        Promise.all([
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
        [printDatas]
    )

    const lessonData = datas?.lessons || []

    const flattenedArray = lessonData.flatMap(item => [
        {
            type: "parent",
            name: item?.name
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

								if(flattenedArray[count - 1]?.type === "children") {

									let newCell1 = newRow.insertCell();
									let newCell2 = newRow.insertCell();
									let newCell3 = newRow.insertCell();
									let newCell4 = newRow.insertCell();
									let newCell5 = newRow.insertCell();

									newCell1.innerHTML = count
									newCell2.innerHTML = flattenedArray[count - 1]?.lesson?.lesson?.name || ''
									newCell3.innerHTML = flattenedArray[count - 1]?.kredit || ''

									// NaN буцаагаад байхаар нь шалгах функц бичсэн.
									// ер нь бол шаардлагагүй гэхдээ яахав

									// newCell4.innerHTML = !isNaN(flattenedArray[count - 1]?.score)
									// 	? flattenedArray[count - 1]?.score
									// 		: 'Default';

									newCell4.innerHTML = flattenedArray[count - 1]?.score ? flattenedArray[count - 1]?.score : ''

									newCell5.innerHTML = flattenedArray[count - 1]?.assesment || ''

									newCell1.className = 'border-dark mini-cell'
									newCell2.className = 'border-dark body-cell'
									newCell3.className = 'border-dark footer1-cell'
									newCell4.className = 'border-dark footer2-cell'
									newCell5.className = 'border-dark footer3-cell'

								}
									else {

									let newCell1 = newRow.insertCell();

									newCell1.innerHTML = flattenedArray[count - 1]?.name
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

    return (
        <>
            {isLoading && Loader}

            <div className={`position-relative d-flex justify-content-between ${isPageBreak && 'page-break'}`} style={{ fontSize: '9px', marginTop: '155px', backgroundColor: 'white', color: 'black' }} >

                <div className='d-flex flex-wrap align-content-start p-1' style={{ width: '33.1%' }} >

                    <table className='w-100 text-center d-none' id='table1' >
                        <thead>
                            <tr>
                                <td rowSpan={2} className='border-dark' style={{ width: '6.25%' }}>№</td>
                                <td rowSpan={2} className='border-dark' style={{ width: '63,75%' }}>Хичээлийн нэрс</td>
                                <td rowSpan={2} className='border-dark' style={{ width: '12%' }}  >Кр</td>
                            </tr>
                            <tr>
                                <td className='border-dark' style={{ width: '10%' }} >Оноо</td>
                                <td className='border-dark' style={{ width: '8%' }} >Дүн</td>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>
                </div>

                <div className='d-flex flex-wrap align-content-start p-1' style={{ width: '33.1%' }} >

                    <table className='w-100 text-center d-none' id='table2' >
                        <thead>
                            <tr>
                                <td rowSpan={2} className='border-dark' style={{ width: '6.25%' }}>№</td>
                                <td rowSpan={2} className='border-dark' style={{ width: '63,75%' }}>Хичээлийн нэрс</td>
                                <td rowSpan={2} className='border-dark' style={{ width: '12%' }}  >Кр</td>
                            </tr>
                            <tr>
                                <td className='border-dark' style={{ width: '10%' }} >Оноо</td>
                                <td className='border-dark' style={{ width: '8%' }} >Дүн</td>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>
                </div>

                <div className='d-flex flex-wrap align-content-start p-1' style={{ width: '33.1%' }} >

                    <table className='w-100 text-center d-none' id='table3' >
                        <thead>
                            <tr>
                                <td rowSpan={2} className='border-dark' style={{ width: '6.25%' }}>№</td>
                                <td rowSpan={2} className='border-dark' style={{ width: '63,75%' }}>Хичээлийн нэрс</td>
                                <td rowSpan={2} className='border-dark' style={{ width: '12%' }}  >Кр</td>
                            </tr>
                            <tr>
                                <td className='border-dark' style={{ width: '10%' }} >Оноо</td>
                                <td className='border-dark' style={{ width: '8%' }} >Дүн</td>
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
                                Энэхүү хавсралт-1 {new Date().getFullYear()} оны {printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.group?.profession?.code} дугаартай дипломын хамт хүчинтэй.
                            </div>
                            <div className='position-absolute' style={{ right: '12px', fontSize: '9px', top: '1242px' }} >
                                Энэхүү хавсралт-2 {new Date().getFullYear()} оны {printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.group?.profession?.code} дугаартай дипломын хамт хүчинтэй.
                            </div>
                        </>
                    )
                    :
                        null
                }

            </div>

            <div className={`${!isPageBreak && 'd-none'}`} style={{ marginTop: '155px', breakInside: 'avoid', backgroundColor: 'white', color: 'black' }} >
                <div className={`position-relative d-flex justify-content-between`} style={{ fontSize: '9px' }} >
                    <div className='d-flex flex-wrap align-content-start' style={{ width: '33.1%' }} >
                        <table className='w-100 text-center d-none' id='table4' >
                            <thead>
                                <tr>
                                    <td rowSpan={2} className='border-dark' style={{ width: '6.25%' }}>№</td>
                                    <td rowSpan={2} className='border-dark' style={{ width: '63,75%' }}>Хичээлийн нэрс</td>
                                    <td rowSpan={2} className='border-dark' style={{ width: '12%' }}  >Кр</td>
                                </tr>
                                <tr>
                                    <td className='border-dark' style={{ width: '10%' }} >Оноо</td>
                                    <td className='border-dark' style={{ width: '8%' }} >Дүн</td>
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
                                    <td rowSpan={2} className='border-dark' style={{ width: '6.25%' }}>№</td>
                                    <td rowSpan={2} className='border-dark' style={{ width: '63,75%' }}>Хичээлийн нэрс</td>
                                    <td rowSpan={2} className='border-dark' style={{ width: '12%' }}  >Кр</td>
                                </tr>
                                <tr>
                                    <td className='border-dark' style={{ width: '10%' }} >Оноо</td>
                                    <td className='border-dark' style={{ width: '8%' }} >Дүн</td>
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
                                    <td rowSpan={2} className='border-dark' style={{ width: '6.25%' }}>№</td>
                                    <td rowSpan={2} className='border-dark' style={{ width: '63,75%' }}>Хичээлийн нэрс</td>
                                    <td rowSpan={2} className='border-dark' style={{ width: '12%' }}  >Кр</td>
                                </tr>
                                <tr>
                                    <td className='border-dark' style={{ width: '10%' }} >Оноо</td>
                                    <td className='border-dark' style={{ width: '8%' }} >Дүн</td>
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
                    <p className='text-uppercase' style={{ marginBottom: '10px' }} >Дотоод Хэргийн Их Сургууль</p>
                    <p className='text-uppercase' style={{ marginBottom: '10px' }} >{printDatas?.student?.department?.school}</p>
                    <p style={{ fontSize: '10px' }} >{printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.graduation_work?.diplom_num} дугаартай дипломын хавсралт-</p>
                </div>

                <div className='fw-bolder d-flex' style={{ fontSize: '11px' }} >
                    <div className='d-flex' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Эцэг /Эх/-ийн нэр:</span> <span>{printDatas?.student?.last_name}</span>
                    </div>
                    <div className='d-flex px-1' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50' style={{ width: '200px'}}>Төгссөн он:</span> <span>{printDatas?.student?.graduation_work?.lesson_year?.substring(5, 9)}</span>
                    </div>
                    <div className='d-flex px-2' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Олгосон огноо:</span> <span>{printDatas?.registration_num}</span>
                    </div>
                </div>
                <div className='fw-bolder d-flex' style={{ fontSize: '11px' }} >
                    <div className='d-flex' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Нэр:</span> <span>{printDatas?.student?.first_name}</span>
                    </div>
                    <div className='d-flex px-1' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Хөтөлбөр:</span> <span>{printDatas?.student?.group?.profession?.name}</span>
                    </div>
                </div>
                <div className='fw-bolder d-flex' style={{ fontSize: '11px' }} >
                    <div className='d-flex' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Регистр:</span> <span>{printDatas?.student?.register_num}</span>
                    </div>
                    <div className='d-flex px-1' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Хөтөлбөрийн индекс: </span><span>{printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.group?.profession?.code}</span>
                    </div>
                    <div className='d-flex px-2' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Бүртгэлийн дугаар:</span> <span>{printDatas?.student?.graduation_work?.registration_num}</span>
                    </div>
                </div>
            </header>

            <footer className='w-100' style={{ fontSize: '10px', backgroundColor: 'white', color: 'black' }} >

                <div className='text-end'>
                    <span className='ms-5'>Нийт кредит: {datas?.score?.max_kredit}</span>
                    <span className='ms-5'>Голч дүн: {datas?.score?.assesment}</span>
                </div>

                <div className='px-2 mb-5' style={{ paddingTop: '2px', paddingBottom: '15px' }} >
                    { datas?.graduation_work?.lesson_type == 1 ? 'Төгсөлтйн ажил:' : 'Төгсөлтйн шалгалт:' }
                    {
                        datas?.graduation_work?.lesson?.map((val, idx) =>
                        {
                            return (
                                <span className='ms-5' key={idx} >{idx + 1}. {val?.name} / {(val?.score_register?.teach_score || 0) + (val?.score_register?.exam_score || 0)} {val?.score_register?.assessment} /</span>
                            )
                        })
                    }
                </div>

                <div className='d-flex justify-content-center'>
                    {
                        listArr.length != 0
                        &&
                        listArr.map((val, idx) =>
                        {
                            return (
                                <div className='px-1' style={{ width: `35%` }} key={idx} >
                                {/* <div className='bg-info px-1' style={{ width: `${100/listArr.length}%` }} key={idx} > */}
                                    <div className='d-inline-block text-center' >
                                        {/* <p>_____________________________________________________________</p> */}
                                        <div className='border-top pt-50 px-2' style={{ textTransform: 'uppercase'}}>
                                            {val?.position_name} {`${val?.last_name} ${val?.first_name}`}
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
                        <div className={`text-end mt-2`} style={{ fontSize: '9px', marginRight: '12px' }} >
                            Энэхүү хавсралт нь {new Date().getFullYear()} оны {printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.group?.profession?.code} дугаартай дипломын хамт хүчинтэй.
                        </div>
                    )
                    :
                        null
                }

            </footer>

        </>
    )
}
