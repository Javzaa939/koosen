import React, { useState, useEffect, useRef } from 'react'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import './style.css'

import themeConfig from '@src/configs/themeConfig';

export default function PrintAttachmentMongolia()
{
    // Loader
	const { fetchData, Loader, isLoading } = useLoader({ isFullScreen: false })

    // API
    const signatureApi = useApi().signature
    const studentApi = useApi().student

    // State
    const [ listArr, setListArr ] = useState([])
    const [ tableRowCount, setTableRowCount ] = useState([])
    const [ rowSum, setRowSum ] = useState(0)
    const [ datas, setDatas ] = useState({})
    const [ isPageBreak, setIsPageBreak ] = useState(false)
    const [ printDatas, setPrintDatas ] = useState(JSON.parse(localStorage.getItem('blankDatas')))

    function getAllData(studentId)
    {
        // Нэгдсэн нэг сургуулийн захирал гарын үсэг хэвлэж байгаа болохоор, data?.student?.group?.profession?.school
        // , printDatas.student?.department?.sub_orgs
        Promise.all([
            fetchData(signatureApi.get(3)),
            fetchData(studentApi.calculateGpaDimplomaGet(studentId)),
            fetchData(studentApi.getConfig(printDatas?.student?.group?.id, 'mongolian'))
        ]).then((values) => {
            setListArr(values[0]?.data)
            setDatas(values[1]?.data)
            setTableRowCount(values[2]?.data?.row_count ? values[2]?.data?.row_count : [])
            var sum_count = values[2]?.data?.row_count?.reduce((partialSum, a) => partialSum + a, 0);
            setRowSum(sum_count)
        })
    }

    const [height, setHeight] = useState(
        {
            header: 0,
            footer: 0,
            body1: 0,
            body2: 0
        }
    )

    const headerSectionRef = useRef(null)
    const footerSectionRef = useRef(null)
    const body1SectionRef = useRef(null)
    const body2SectionRef = useRef(null)

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
            getAllData(printDatas.student.id)
        },
        [printDatas]
    )

    useEffect(
        () =>
        {
            if (datas, listArr.length != 0)
            {
                document.title = `${printDatas?.student?.full_name}-хавсралт-монгол`
            }
        },
        [datas, listArr]
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
            if (datas?.lessons && tableRowCount.length > 0)
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
                                    newCell2.innerHTML = flattenedArray[count - 1]?.name || ''
                                    newCell3.innerHTML = flattenedArray[count - 1]?.kredit || ''

                                    // Тооцов дүнг харуулахдаа
                                    if (flattenedArray[count - 1]?.grade_letter) {
                                        newCell4.innerHTML = flattenedArray[count - 1]?.grade_letter ? flattenedArray[count - 1]?.grade_letter : ''
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
                                    {
                                        printDatas?.student?.group?.degree?.degree_code === 'D'
                                        ?
                                            newCell2.className = 'border-dark body-cell'
                                        :
                                            newCell2.className = 'border-dark body-cell1'

                                    }
                                    newCell3.className = 'border-dark footer1-cell'
                                    newCell4.className = 'border-dark footer2-cell'
                                }
                                else
                                {
                                    let newCell1 = newRow.insertCell();
                                    if (flattenedArray[count - 1]) {
                                        newCell1.innerHTML = flattenedArray[count - 1]?.name
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
        [datas, tableRowCount]
    )

    return (
        <>
            {isLoading && Loader}

            <div ref={body1SectionRef} className={`position-relative px-1 d-flex justify-content-between d-flex gap-1 ${isPageBreak && 'page-break'}`} style={{ fontSize: '11px', paddingTop: height.header + (printDatas?.student?.group?.degree?.degree_code === 'D' ? 20 : 37),  backgroundColor: 'white', color: 'black', fontFamily: 'Arial' }} >
                <div
                    className='d-flex flex-wrap align-content-start mt-1'
                    id='table1-1'
                    // style={{ marginTop: height }}
                >

                    <table className='font-dark w-100 text-center d-none' id='table1' style={{fontSize: printDatas?.student?.group?.degree?.degree_code === 'D' ? '9px' : '10px'}}>
                        <thead className='fw-bolder'>
                            <tr style={{ height: '25px' }}>
                                <td className='border-dark' style={{ width: '4%' }}>№</td>
                                <td className='border-dark' style={{ width: '70%' }}>Хичээлийн нэр</td>
                                <td className='border-dark' style={{ width: '7%' }}>Багц цаг</td>
                                <td className='border-dark' style={{ width: '11%' }}>Тоо үнэлгээ</td>
                                <td className='border-dark' style={{ width: '8%' }}>Үсгэн үнэлгээ</td>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>
                </div>

                <div className='d-flex flex-wrap align-content-start mt-1' id='table2-2' >

                    <table className='font-dark w-100 text-center d-none' id='table2' style={{fontSize: printDatas?.student?.group?.degree?.degree_code === 'D' ? '9px' : '10px'}}>
                        <thead className='fw-bolder'>
                            <tr style={{ height: '25px' }}>
                                <td className='border-dark' style={{ width: '4%' }}>№</td>
                                <td className='border-dark' style={{ width: '70%' }}>Хичээлийн нэр</td>
                                <td className='border-dark' style={{ width: '7%' }}  >Багц цаг</td>
                                <td className='border-dark' style={{ width: '11%' }} >Тоо үнэлгээ</td>
                                <td className='border-dark' style={{ width: '8%' }} >Үсгэн үнэлгээ</td>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                    </table>
                </div>

                <div className='d-flex flex-wrap align-content-start mt-1' id='table3-3' >

                    <table className='font-dark w-100 text-center d-none' id='table3' style={{fontSize: printDatas?.student?.group?.degree?.degree_code === 'D' ? '9px' : '10px'}}>
                        <thead className='fw-bolder'>
                            <tr style={{ height: '25px' }}>
                                <td className='border-dark' style={{ width: '4%' }}>№</td>
                                <td className='border-dark' style={{ width: '70%' }}>Хичээлийн нэр</td>
                                <td className='border-dark' style={{ width: '7%' }}  >Багц цаг</td>
                                <td className='border-dark' style={{ width: '11%' }} >Тоо үнэлгээ</td>
                                <td className='border-dark' style={{ width: '8%' }} >Үсгэн үнэлгээ</td>
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
                            {/* <div className='position-absolute' style={{ right: '12px', fontSize: '11px', top: '533px' }} >
                                Энэхүү хавсралт-1 {new Date().getFullYear()} оны {printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.graduation_work?.diplom_num} дугаартай дипломын хамт хүчинтэй.
                            </div>
                            <div className='position-absolute' style={{ right: '12px', fontSize: '11px', top: '1242px' }} >
                                Энэхүү хавсралт-2 {new Date().getFullYear()} оны {printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.graduation_work?.diplom_num} дугаартай дипломын хамт хүчинтэй.
                            </div> */}
                        </>
                    )
                    :
                        null
                }

            </div>

            <div ref={body2SectionRef} className={`${!isPageBreak && 'd-none'}`} style={{ marginTop: '175px', breakInside: 'avoid', backgroundColor: 'white', color: 'black', fontFamily: 'Arial' }} >
                <div className={`position-relative px-1 gap-1 d-flex justify-content-between`} style={{ fontSize: '13px' }} >
                    <div className='d-flex flex-wrap align-content-start mt-1' id='table4-4' >
                        <table className='font-dark w-100 text-center d-none' id='table4' >
                            <thead className='fw-bolder'>
                                <tr style={{ height: '25px' }}>
                                    <td className='border-dark' style={{ width: '4%' }}>№</td>
                                    <td className='border-dark' style={{ width: '70%' }}>Хичээлийн нэр</td>
                                    <td className='border-dark' style={{ width: '7%' }}  >Багц цаг</td>
                                    <td className='border-dark' style={{ width: '11%' }} >Тоо үнэлгээ</td>
                                    <td className='border-dark' style={{ width: '8%' }} >Үсгэн үнэлгээ</td>
                                </tr>
                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    </div>

                    <div className='d-flex flex-wrap align-content-start mt-1' id='table5-5' >

                        <table className='font-dark w-100 text-center d-none' id='table5' >
                            <thead className='fw-bolder'>
                                <tr style={{ height: '25px' }}>
                                    <td className='border-dark' style={{ width: '4%' }}>№</td>
                                    <td className='border-dark' style={{ width: '70%' }}>Хичээлийн нэр</td>
                                    <td className='border-dark' style={{ width: '7%' }}  >Багц цаг</td>
                                    <td className='border-dark' style={{ width: '11%' }} >Тоо үнэлгээ</td>
                                    <td className='border-dark' style={{ width: '8%' }} >Үсгэн үнэлгээ</td>
                                </tr>
                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    </div>

                    <div className='d-flex flex-wrap align-content-start mt-1' id='table6-6' >

                        <table className='font-dark w-100 text-center d-none' id='table6' >
                            <thead className='fw-bolder'>
                                <tr style={{ height: '25px' }}>
                                    <td className='border-dark' style={{ width: '4%' }}>№</td>
                                    <td className='border-dark' style={{ width: '70%' }}>Хичээлийн нэр</td>
                                    <td className='border-dark' style={{ width: '7%' }}  >Багц цаг</td>
                                    <td className='border-dark' style={{ width: '11%' }} >Тоо үнэлгээ</td>
                                    <td className='border-dark' style={{ width: '8%' }} >Үсгэн үнэлгээ</td>
                                </tr>
                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    </div>

                </div>
            </div>

            {/*

                Магистрийн толгой хэсэг

                Доор нь хуучин байсныг нь комментлосон байгаа

             */}
            <header
                className='w-100 px-1 font-dark'
                style={{ backgroundColor: 'white', color: 'black', fontFamily: 'Arial' }}
                ref={headerSectionRef}
            >
                <div className='d-flex flex-column text-center fw-bolder'>
                    <p className='text-uppercase' style={{ marginBottom: '0px' }} >{themeConfig.school.name}</p>
                    <p className='text-uppercase' style={{ marginBottom: '0px' }} >{printDatas?.student?.department?.school}</p>
                    <p className='m-0' style={{ fontSize: '12px', fontWeight: '500' }} >{printDatas?.student?.graduation_work?.diplom_num} дугаартай <span className='text-lowercase'>{printDatas?.student?.group?.degree?.degree_name && `${printDatas?.student?.group?.degree?.degree_name}ын`}</span> дипломын хавсралт</p>
                    <p className='' style={{ fontSize: 12, fontWeight: 500 }}>Бүртгэлийн дугаар: {printDatas?.student?.graduation_work?.registration_num}</p>
                </div>

                <div className='fw-bolder d-flex' style={{ fontSize: '11px' }} >
                    <div className='d-flex' style={{ width: printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score ? '25%' : '33.3%' }} >
                        <span className='fw-normal w-50'>Эцэг /Эх/-ийн нэр:</span> <span>{printDatas?.student?.last_name}</span>
                    </div>
                    <div className='d-flex px-1' style={{ width: printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score ? '25%' : '33.3%' }} >
                        <span className='fw-normal w-50'>Хөтөлбөрийн нэр:</span> <span className=''>{printDatas?.student?.group?.profession?.name}</span>
                    </div>
                    <div className='d-flex px-2' style={{ width: printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score === 'D' ? '25%' : '33.3%' }} >
                        <span className='fw-normal w-50' style={{ width: '200px'}}>Элссэн он:</span><span>{printDatas?.student?.group?.join_year?.substring(0, 4)}</span>
                    </div>
                    {
                        (printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score)
                        &&
                        <div className='d-flex px-2' style={{ width: '25%'}} >
                            <span className='fw-normal w-50' style={{ width: '200px'}}>Элсэлтийн шалгалтын оноо:</span><span className='ms-5'>{printDatas?.student?.eysh_score}</span>
                        </div>
                    }
                </div>
                <div className='fw-bolder d-flex' style={{ fontSize: '11px' }} >
                    <div className='d-flex' style={{ width: printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score ? '25%' : '33.3%' }} >
                        <span className='fw-normal w-50'>Нэр:</span> <span>{printDatas?.student?.first_name}</span>
                    </div>
                    <div className='d-flex px-1' style={{ width: printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score ? '25%' : '33.3%' }} >
                        {
                            printDatas?.student?.group?.degree?.degree_code === 'D'
                            ?
                                <>
                                    <span className='fw-normal w-50'>Индекс: </span><span>{printDatas?.student?.group?.profession?.code}</span>
                                </>
                            :
                                <>
                                    <span className='fw-normal w-50'>Төрөлжсөн чиглэл: </span><span>{printDatas?.student?.group?.profession?.dep_name}</span>
                                </>
                        }
                    </div>
                    <div className='d-flex px-2' style={{ width: printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score ? '25%' : '33.3%' }} >
                        <span className='fw-normal w-50' style={{ width: '200px'}}>Төгссөн он:</span> <span>{printDatas?.student?.graduation_work?.lesson_year?.substring(5, 9)}</span>
                    </div>
                </div>
                <div className='fw-bolder d-flex' style={{ fontSize: '11px' }}>
                    <div className='d-flex' style={{ width: printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score ? '25%' : '33.3%' }} >
                        <span className='fw-normal w-50'>Регистрийн дугаар:</span> <span>{printDatas?.student?.register_num}</span>
                    </div>
                    {
                        printDatas?.student?.group?.degree?.degree_code !== 'D'
                        &&
                        <div className='d-flex px-1' style={{ width: printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score ? '25%' : '33.3%' }}>
                            <span className='fw-normal w-50'>Өмнөх зэргийн дипломын дугаар:</span> <span className='text-uppercase'>{printDatas?.student?.graduation_work?.back_diplom_num}</span>
                        </div>
                    }
                    <div className={`d-flex ${printDatas?.student?.group?.degree?.degree_code === 'D' ? 'px-1' : 'px-2'}`} style={{ width: printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score ? '25%' : '33.3%' }} >
                        <span className='fw-normal w-50'>Тушаалын дугаар:</span> <span className='text-uppercase'>{printDatas?.student?.graduation_work?.graduation_number}</span>
                    </div>
                    {
                        printDatas?.student?.group?.degree?.degree_code === 'D'
                        &&
                        <div className='d-flex px-2' style={{ width: printDatas?.student?.group?.degree?.degree_code === 'D' && printDatas?.student?.eysh_score ? '50%' : '33.3%' }} >
                            <span className='fw-normal w-50' style={{ width: '200px'}}>Өмнөх шатны боловсролын үнэлгээний дундаж оноо: </span><span className='ms-5'>{printDatas?.student?.secondary_school}</span>
                        </div>
                    }
                </div>
            </header>


            {/* <header className='w-100 px-1' style={{ backgroundColor: 'white', color: 'black' }} >
                <div className='d-flex flex-column text-center fw-bolder'>
                    <p className='text-uppercase' style={{ marginBottom: '0px' }} >{themeConfig.school.name}</p>
                    <p className='text-uppercase' style={{ marginBottom: '0px' }} >{printDatas?.student?.department?.school}</p>
                    <p style={{ fontSize: '12px', fontWeight: '500' }} >{printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.graduation_work?.diplom_num} дугаартай <span className='text-lowercase'>{printDatas?.student?.group?.degree?.degree_name && `${printDatas?.student?.group?.degree?.degree_name}ын`}</span> дипломын хавсралт</p>
                </div>

                <div className='fw-bolder d-flex' style={{ fontSize: '11px' }} >
                    <div className='d-flex' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Эцэг /Эх/-ийн нэр:</span> <span>{printDatas?.student?.last_name}</span>
                    </div>
                    <div className='d-flex px-1' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50' style={{ width: '200px'}}>Төгссөн он:</span> <span>{printDatas?.student?.graduation_work?.lesson_year?.substring(5, 9)}</span>
                    </div>
                    <div className='d-flex px-2' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Олгосон огноо:</span> <span>{printDatas?.registration_num?.replaceAll('.', '-')}</span>
                    </div>
                </div>
                <div className='fw-bolder d-flex' style={{ fontSize: '11px' }} >
                    <div className='d-flex' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Нэр:</span> <span>{printDatas?.student?.first_name}</span>
                    </div>
                    <div className='d-flex px-1' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Мэргэжлийн индекс: </span><span>{printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.group?.profession?.code}</span>
                    </div>
                    <div className='d-flex px-2' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Бүртгэлийн дугаар:</span> <span>{printDatas?.student?.graduation_work?.registration_num}</span>
                    </div>
                </div>
                <div className='fw-bolder d-flex' style={{ fontSize: '11px' }} >
                    <div className='d-flex' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Регистрийн дугаар:</span> <span>{printDatas?.student?.register_num}</span>
                    </div>
                    <div className='d-flex px-1' style={{ width: '33.3%' }} >
                        <span className='fw-normal w-50'>Мэргэжил:</span> <span className='text-uppercase'>{printDatas?.student?.group?.profession?.name}</span>
                    </div>
                </div>
            </header> */}

            {/* <div className='mt-2'>
                { datas?.graduation_work?.lesson_type == 1 ? printDatas?.student?.group?.degree?.degree_code !== 'D' ? 'Магистрын төгсөлтийн ажил/диссертацийн нэр:' : 'Дипломын ажлын нэр' : 'Төгсөлтийн шалгалт:' }
            </div> */}
            <footer
                ref={footerSectionRef}
                className='w-100 font-dark'
                style={{ fontSize: printDatas?.student?.group?.degree?.degree_code == 'D' ? '10px': '11px', backgroundColor: 'white', color: 'black', bottom: printDatas?.student?.group?.degree?.degree_code == 'D' ? '4px': '10px', fontFamily: 'Arial' }} >

                {
                    printDatas?.student?.group?.degree?.degree_code != 'D'
                    &&
                        <div className='px-1 mb-1' style={{ paddingBottom: '2px' }} >
                        {
                            datas?.graduation_work?.lesson_type == 1
                            ?
                                <span className=''>{`Магистрын төгсөлтийн ажил/диссертацийн нэр ${printDatas?.student?.group?.degree?.degree_code == 'F' ? '(24 багц цаг)' : '(5 багц цаг)'}:`}&nbsp;<span className='fw-bolder'>{datas?.graduation_work?.diplom_topic}</span></span>

                            :
                                <>
                                    <span className=''>
                                        Төгсөлтийн шалгалт:
                                    </span>
                                        {
                                            datas?.graduation_work?.lesson?.map((val, idx) =>
                                            {
                                                return (
                                                    <span className='ms-5' key={idx} >{idx + 1}. {val?.name} / {(val?.score_register?.teach_score || 0) + (val?.score_register?.exam_score || 0)} {val?.score_register?.assessment} /</span>
                                                )
                                            })
                                        }
                                </>
                        }
                        </div>
                }

                <div className={`d-flex justify-content-center gap-5 me-1 ${rowSum > 51 ? '': 'mb-2'}`}>
                    <div>Нийт багц цаг: <span className='fw-bolder'>{printDatas?.student?.group?.degree?.degree_code == 'F' ? datas?.score?.max_kredit + 24 : datas?.score?.max_kredit + 5}</span></div>
                    <div>Голч оноо: <span className='fw-bolder'>{datas?.score?.average_score}</span></div>
                    <div>Голч дүн: <span className='fw-bolder'>{datas?.score?.assesment}</span></div>
                    {
                        printDatas?.student?.group?.degree?.degree_code == 'D'
                        &&
                        <div>Тухайн улирлын ижил мэргэжлийн төгсөгчдийн голч дүнгийн дундаж: <span className='fw-bolder'>{datas?.score?.average_score_prof}</span></div>
                    }
                </div>

                {
                    (datas?.graduation_work?.lesson_type != 1 && datas?.graduation_work?.diplom_topic)
                    &&
                    <div className='px-1 mb-25' style={{ paddingTop: '2px' }} >
                        <span className=''>Дипломын ажлын сэдэв: &nbsp;<span className='fw-bolder'>{datas?.graduation_work?.diplom_topic}</span></span>
                    </div>
                }
                {
                    printDatas?.student?.group?.degree?.degree_code == 'D'
                    &&
                    <div className='px-1 mb-25' style={{ paddingTop: '2px' }} >
                    {
                        datas?.graduation_work?.lesson_type == 1
                        ?
                            <span className=''>Дипломын ажлын нэр: &nbsp;<span className='fw-bolder'>{datas?.graduation_work?.diplom_topic}</span></span>

                        :
                            <>
                                <span className=''>
                                    Төгсөлтийн шалгалт:
                                </span>
                                    {
                                        datas?.graduation_work?.lesson?.map((val, idx) =>
                                        {
                                            return (
                                                <span className='ms-5' key={idx} >{idx + 1}. {val?.name} / {(val?.score_register?.teach_score || 0) + (val?.score_register?.exam_score || 0)} {val?.score_register?.assessment} /</span>
                                            )
                                        })
                                    }
                            </>
                    }
                    </div>
                }


                <div className={`d-flex justify-content-center ${rowSum > 51 ? 'mt-3' : 'mt-5'}`}>
                    {
                        listArr.length != 0
                        &&
                        listArr.map((val, idx) =>
                        {
                            return (
                                <div className='text-center px-1' style={{width: '400px'}} key={idx} >
                                    <div className='text-center d-inline-block text-center'>
                                        <div className='text-center pt-50 px-2' style={{ textTransform: 'uppercase', borderTop: '1px solid black' }}>
                                            <span style={{textWrap: 'wrap'}}></span>{val?.position_name} <span>{`${val?.last_name}${val?.first_name}`}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>

                <div className={`text-center mt-1`} style={{ fontSize: '11px' }} >
                    Дүн(голч): F{'<'}60(0) 60≤D-{'<'}65(1.0) 65≤D{'<'}70(1.4) 70≤C-{'<'}75(1.9) 75≤C{'<'}80(2.3) 80≤B-{'<'}85(3.1) 85≤B{'<'}90(3.1) 90≤A-{'<'}95(3.6) 95≤A{'<'}100(4.0) S=Тооцов CR=Дүйцүүлсэн багц цаг
                </div>
                {/* {
                    isPageBreak === false
                    ?
                    (
                        <div className={`text-center mt-2 me-1`} style={{ fontSize: '11px' }} >
                            Дүн(голч): F{'<'}60(0) 60≤D-{'<'}65(1.0) 65≤D{'<'}70(1.4) 70≤C-{'<'}75(1.9) 75≤C{'<'}80(2.3) 80≤B-{'<'}85(3.1) 85≤B{'<'}90(3.1) 90≤A-{'<'}95(3.6) 95≤A{'<'}100(4.0) S=Тооцов CR=Дүйцүүлсэн баг цаг
                        </div>
                    )
                    :
                        null
                } */}
                {/* Энэхүү хавсралт нь {new Date().getFullYear()} оны {printDatas?.student?.group?.degree?.degree_code}{printDatas?.student?.graduation_work?.diplom_num} дугаартай дипломын хамт хүчинтэй. */}

            </footer>

        </>
    )
}
