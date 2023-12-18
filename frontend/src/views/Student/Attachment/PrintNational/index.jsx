
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
                                newCell2.innerHTML = datas?.lessons[count - 1]?.lesson?.lesson?.name_uig || ''
                                newCell3.innerHTML = datas?.lessons[count - 1]?.kredit
                                newCell4.innerHTML = datas?.lessons[count - 1]?.score ? Math.round(datas?.lessons[count - 1]?.score) : ''
                                newCell5.innerHTML = datas?.lessons[count - 1]?.assesment

                                newCell1.className = 'border-dark mini-cell'
                                newCell2.className = 'border-dark body-cell'
                                newCell3.className = 'border-dark footer1-cell'
                                newCell4.className = 'border-dark footer2-cell'
                                newCell5.className = 'border-dark footer3-cell font-serif'
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

            <div className={`vh-100 p-0 d-flex flex-column justify-content-center align-items-start position-relative ${isPageBreak && 'page-break'}`} style={{ fontFamily: 'CMs Urga dp'}} >

                <div style={{ height: '373px', marginLeft: '178px' }} >

                    <table id='table1' className='text-center w-100 d-none' style={{ writingMode: 'vertical-rl', transform: 'scale(-1, 1)', marginBottom: '1px', }} >
                        <thead>

                            <tr style={{ fontSize: '16px' }} >
                                <td rowSpan={2} className='border-dark' style={{ transform: 'scale(-1, 1)', rotate: '270deg', height: '8%', paddingRight: '5px' }} >№</td>
                                <td rowSpan={2} className='border-dark' style={{ height: '61%' }} >Sodoloeesea kuciye& oa Ne*T</td>
                                <td rowSpan={2} className='border-dark' style={{ height: '13%' }} >\rwdiDA Ce(</td>
                                <td colSpan={2} className='border-dark' style={{ height: '18%' }} >Sorol)T Jia</td>
                            </tr>
                            <tr>
                                <td className='border-dark' style={{ height: '9%' }}>fono)T</td>
                                <td className='border-dark' style={{ height: '9%' }}>doieit</td>
                            </tr>

                        </thead>
                        <tbody>

                        </tbody>
                    </table>

                </div>

                <div style={{ height: '376px', marginLeft: '178px', marginTop: '5px'}} >

                    <table id='table2' className='text-center w-100 d-none' style={{ writingMode: 'vertical-rl', transform: 'scale(-1, 1)', marginBottom: '1px' }}  >
                        <thead>

                            <tr style={{ fontSize: '16px' }} >
                                <td rowSpan={2} className='border-dark' style={{ transform: 'scale(-1, 1)', rotate: '270deg', height: '8%', paddingRight: '5px' }} >№</td>
                                <td rowSpan={2} className='border-dark' style={{ height: '61%', minWidth: "20px", maxWidth: "20px" }} >Sodoloeesea kuciye& oa Ne*T</td>
                                <td rowSpan={2} className='border-dark' style={{ height: '13%' }} >\rwdiDA Ce(</td>
                                <td colSpan={2} className='border-dark' style={{ height: '18%' }} >Sorol)T Jia</td>
                            </tr>
                            <tr>
                                <td className='border-dark' style={{ height: '9%' }}>fono)T</td>
                                <td className='border-dark' style={{ height: '9%' }}>doieit</td>
                            </tr>

                        </thead>
                        <tbody>

                        </tbody>
                    </table>

                </div>

                {
                    isPageBreak
                    &&
                        <div className='text-center vh-100 position-absolute end-0' style={{ writingMode: 'vertical-rl', transform: 'scale(-1, 1)', fontSize: '20px' }} >
                            <span>fna K Hebsorolda - 1 {new Date().getFullYear()} foa O D <span className='font-serif' style={{ writingMode: 'vertical-lr', rotate: '180deg' }} >{printDatas?.student?.group?.degree?.degree_code}</span>{printDatas?.student?.group?.profession?.code} dogerdeI dip;o^ oa HemdO KicoedeI.</span>
                        </div>
                }

            </div>


            <div className={`${!isPageBreak && 'd-none'}`} >
                <div className='vh-100 p-0 d-flex flex-column justify-content-between align-items-start position-relative' style={{ fontFamily: 'CMs Urga dp' }} >

                    <div style={{ height: '373px', marginLeft: '178px' }} >

                        <table id='table3' className='text-center w-100 d-none' style={{ writingMode: 'vertical-rl', transform: 'scale(-1, 1)', marginBottom: '1px' }}  >
                            <thead>

                                <tr style={{ fontSize: '16px' }} >
                                    <td rowSpan={2} className='border-dark' style={{ transform: 'scale(-1, 1)', rotate: '270deg', height: '8%', paddingRight: '5px' }} >№</td>
                                    <td rowSpan={2} className='border-dark' style={{ height: '61%' }} >Sodoloeesea kuciye& oa Ne*T</td>
                                    <td rowSpan={2} className='border-dark' style={{ height: '13%' }} >\rwdiDA Ce(</td>
                                    <td colSpan={2} className='border-dark' style={{ height: '18%' }} >Sorol)T Jia</td>
                                </tr>
                                <tr>
                                    <td className='border-dark' style={{ height: '9%' }}>fono)T</td>
                                    <td className='border-dark' style={{ height: '9%' }}>doieit</td>
                                </tr>

                            </thead>
                            <tbody>

                            </tbody>
                        </table>

                    </div>

                    <div style={{ height: '376px', marginLeft: '210px' }} >

                        <table id='table4' className='text-center w-100 d-none' style={{ writingMode: 'vertical-rl', transform: 'scale(-1, 1)', marginBottom: '1px' }}  >

                            <thead>

                                <tr style={{ fontSize: '16px' }} >
                                    <td rowSpan={2} className='border-dark' style={{ transform: 'scale(-1, 1)', rotate: '270deg', height: '8%', paddingRight: '5px' }} >№</td>
                                    <td rowSpan={2} className='border-dark' style={{ height: '61%' }} >Sodoloeesea kuciye& oa Ne*T</td>
                                    <td rowSpan={2} className='border-dark' style={{ height: '13%' }} >\rwdiDA Ce(</td>
                                    <td colSpan={2} className='border-dark' style={{ height: '18%' }} >Sorol)T Jia</td>
                                </tr>
                                <tr>
                                    <td className='border-dark' style={{ height: '9%' }}>fono)T</td>
                                    <td className='border-dark' style={{ height: '9%' }}>doieit</td>
                                </tr>

                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    </div>
                    {
                        isPageBreak
                        &&
                            <div className='text-center vh-100 position-absolute end-0' style={{ writingMode: 'vertical-rl', transform: 'scale(-1, 1)', fontSize: '20px' }} >
                                <span>fna K Hebsorolda - 2 {new Date().getFullYear()} foa O D <span className='font-serif' style={{ writingMode: 'vertical-lr', rotate: '180deg' }} >{printDatas?.student?.group?.degree?.degree_code}</span>{printDatas?.student?.group?.profession?.code} dogerdeI dip;o^ oa HemdO KicoedeI.</span>
                            </div>
                    }
                </div>
            </div>

            <div className='header d-flex' style={{ fontFamily: 'CMs Urga dp', fontSize: '20px' }} >

                <div className='d-flex flex-column text-center' style={{ writingMode: 'vertical-rl', transform: 'scale(-1, 1)', fontSize: '25px', marginRight: '3px', marginBottom: '75px' }} >
                    <span>Moekgo& oa foiedosoa O YekEt SorgegolI</span>
                    <span>BlbEsore& oa SorgegolI</span>
                    <span><span className='font-serif' style={{ writingMode: 'vertical-lr', rotate: '180deg' }} >{printDatas?.student?.group?.degree?.degree_code}</span>{printDatas?.student?.graduation_work?.diplom_num} dogerdeI dip;o^ oa Hebsorolda</span>
                </div>

                <div className='d-flex flex-column lh-sm'>
                    <div style={{ height: '33.3%', writingMode: 'vertical-rl', transform: 'scale(-1, 1)' }}>
                        <span style={{ fontSize: '18px' }} >
                            fcikEt <span style={{ fontFamily: 'serif' }}>/</span>fkEt<span style={{ fontFamily: 'serif' }}>/</span> Jia Ne*T= {printDatas?.student?.last_name_uig}
                        </span>
                    </div>
                    <div style={{ height: '33.3%', writingMode: 'vertical-rl', transform: 'scale(-1, 1)' }}>
                        <span style={{ fontSize: '18px' }} >
                            Ne*T= {printDatas?.student?.first_name_uig}
                        </span>
                    </div>
                    <div style={{ height: '33.3%', writingMode: 'vertical-rl', transform: 'scale(-1, 1)' }}>
                        <span style={{ fontSize: '18px' }} >
                            RwkusDw*= <span className='font-serif' style={{ writingMode: 'vertical-lr', rotate: '180deg', fontSize: '14px' }} >{printDatas?.student?.register_num}</span>
                        </span>
                    </div>
                </div>

                <div className='d-flex flex-column lh-sm'>
                    <div style={{ height: '33.3%', writingMode: 'vertical-rl', transform: 'scale(-1, 1)' }} >
                        <span style={{ fontSize: '18px' }} >
                            DeKsohsea foa= {printDatas?.student?.graduation_work?.lesson_year?.substring(5, 9)}
                        </span>
                    </div>
                    <div style={{ height: '66.0%', writingMode: 'vertical-rl', transform: 'scale(-1, 1)' }}>
                        <span style={{ fontSize: '18px' }} >
                            MerkEji&= {printDatas?.student?.group?.profession?.name_uig}
                        </span>
                    </div>
                </div>

                <div className='d-flex flex-column lh-sm'>
                    <div style={{ height: '33.3%', writingMode: 'vertical-rl', transform: 'scale(-1, 1)' }}>
                        <span style={{ fontSize: '18px' }} >
                            MerkEji& oa findw\_= <span className='font-serif' style={{ writingMode: 'vertical-lr', rotate: '180deg' }} >{printDatas?.student?.group?.degree?.degree_code}</span>{printDatas?.student?.group?.profession?.code}
                        </span>
                    </div>
                    <div style={{ height: '33.3%', writingMode: 'vertical-rl', transform: 'scale(-1, 1)' }}>
                        <span style={{ fontSize: '18px' }} >
                            folgoeesea foa= {printDatas?.registration_num}
                        </span>
                    </div>
                    <div style={{ height: '33.3%', writingMode: 'vertical-rl', transform: 'scale(-1, 1)' }}>
                        <span style={{ fontSize: '18px' }} >
                        BirioekE& oa doge*= {printDatas?.student?.graduation_work?.registration_num}
                        </span>
                    </div>
                </div>

            </div>

            <div className={`footer ${isPageBreak && 'footer-margin'}`} style={{ fontFamily: 'CMs Urga dp', fontSize: '20px' }} >
                <div className='d-flex'>

                    <div className='d-flex justify-content-evenly lh-sm' style={{ writingMode: 'vertical-rl', transform: 'scale(-1, 1)' }} >
                        <span>Neiida \rwdiDA= {datas?.score?.max_kredit}</span>
                        <span>GoolcI doieit= {datas?.score?.assesment}</span>
                    </div>

                    <div className='lh-sm' style={{ writingMode: 'vertical-rl', transform: 'scale(-1, 1)', marginRight: '8px' }} >
                        {datas?.graduation_work?.lesson_type == 1 ? 'DeKsolda iia feji&' : 'DeKsolda iia Silgelda:'}=
                            {
                                datas?.graduation_work?.lesson?.map((val, idx) =>
                                {
                                    return (
                                        <span key={idx} style={{marginTop: '9px'}}>&nbsp;{idx + 1}, {val?.name_uig} {(val?.score_register?.teach_score || 0) + (val?.score_register?.exam_score || 0)}</span>
                                    )
                                })
                            }
                    </div>

                    {
                        listArr?.length != 0
                        &&
                        listArr.map((val, idx) =>
                        {
                            return (
                                <div className='lh-sm' style={{ writingMode: 'vertical-rl', transform: 'scale(-1, 1)' }} key={idx} >
                                    <span>{val?.position_name_uig}</span> <span>{val?.last_name_uig} {val?.first_name_uig}=</span>
                                </div>
                            )
                        })
                    }

                    {
                        isPageBreak === false
                        &&
                            <div className='text-center vh-100' style={{ writingMode: 'vertical-rl', transform: 'scale(-1, 1)', marginLeft: '9px' }} >
                                <span>fna K Hebsorolda {new Date().getFullYear()} foa O <span className='font-serif' style={{ writingMode: 'vertical-lr', rotate: '180deg' }} >{printDatas?.student?.group?.degree?.degree_code}</span>{printDatas?.student?.group?.profession?.code} dogerdeI dip;o^ oa HemdO KicoedeI.</span>
                            </div>

                    }
                </div>
            </div>
        </>
    )
}
