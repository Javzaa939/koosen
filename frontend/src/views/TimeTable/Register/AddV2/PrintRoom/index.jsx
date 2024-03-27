import React, { useContext, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import './style.scss'
import ActiveYearContext from "@context/ActiveYearContext"

function PrintRoom() {


    /**
         * Өмнөх хуудаснаас датагаа авчирж хэвлэнэ.
         *
         * Өмнөх хуудсан дээр датагүй үед энэ хуудасруу
         * шидэх товч  идэвхгүй байна.
         *
     */
    const location = useLocation()
    const datas = location?.state?.datas || []
    const dynamicFontSize = Number(location?.state?.fontSizeValue) || 0

    const { cyear_name } = useContext(ActiveYearContext)

    useEffect(
        () =>
        {
            setTimeout(() => {
                window.print()
            }, 500);

            window.onafterprint = function()
            {
                window.history.go(-1);
            },
            []
        }
    )


    /**
         * Ирсэн мэдээллээс шүүж хуваарьт таарах мэдээлэл байгаа эсэхийг шалгах функц
         *
         * @param {Integer} day Өдрийн дугаар
         * @param {Integer} time Цаг
         * @returns {Object} object
         *
    */
    function valuefind(day, time) {
        let rdata = datas.filter(val => (val.day === day && val.time === time))

        return rdata[0] || null
    }

    const blankArray = ['', '','']

    const firstThreeLengthFinder = blankArray.flatMap((val, idx) => {
        return[
            ...Array.from({length: 6},(_, vidx) => {
                var data = valuefind(vidx, idx + 1)
                return(
                    `${data ? data?.lesson_name + data?.group.map(val => val) + data?.teacher_name : ''}`.length
                )
            })
        ]
    })


    const lastThreeLengthFinder = blankArray.flatMap((val, idx) => {
        return[
            ...Array.from({length: 6},(_, vidx) => {
                var data = valuefind(vidx, idx + 4)
                return(
                    `${data ? data?.lesson_name + data?.group.map(val => val) + data?.teacher_name : ''}`.length
                )
            })
        ]
    })

    /**
        * Хуваарийг 3 3 аар нь хоёр хувааж байгаа ба тус бүрийн текстийн уртыг тодорхой
        * тоотой жишиж шинэ хуудас үүсгэх үгүйд анхаарна.
     */
    const totalLengthOne = firstThreeLengthFinder.reduce((acc, cvalue) => acc + cvalue, 0);
    const totalLengthTwo = lastThreeLengthFinder.reduce((acc, cvalue) => acc + cvalue, 0);
    const LIMIT = 850

    return (
        <div className='root_parent p-1'>
            <div className='pb-1 d-flex justify-content-between'>
                <h4 style={{ color: 'black' }}>
                    {
                        datas[0]?.room_name
                        ?
                            <span>
                                {datas[0]?.room_name} хичээлийн хуваарь
                            </span>
                        :
                            <span>
                                Хичээлийн хуваарь
                            </span>
                    }
                </h4>
                <div>
                    {
                        cyear_name
                        ?
                            cyear_name
                        :
                            <span>
                                {new Date().getFullYear() - 1}-{new Date().getFullYear()}
                            </span>
                    }
                </div>
            </div>

            <div>
                <table style={{ borderCollapse: 'separate' }}>
                    <thead className='text-center'>
                        <tr>
                            <th></th>
                            <th className='p-0'>
                                Даваа
                            </th>
                            <th className='p-0'>
                                Мягмар
                            </th>
                            <th className='p-0'>
                                Лхагва
                            </th>
                            <th className='p-0'>
                                Пүрэв
                            </th>
                            <th className='p-0'>
                                Баасан
                            </th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: `${dynamicFontSize + 1}px` }}>
                        {/* Цаг */}
                        {Array.from({ length: 6 }, (_, idx) => {return(
                            <tr key={idx} className=''>
                                {/* Өдөр */}
                                {Array.from({length: 6},(_, vidx) => {

                                        /**
                                            * Датаг variable-д оноосноор дуудаж ашиглахад илүү хялбар болж байгаа
                                        */
                                        var data = valuefind(vidx, idx + 1)

                                        /**
                                         * Ангийн жагсаалтын текстийн уртыг цуглуулж нийт уртыг олоод тодорхой уртаас
                                         * их байвал шууд дараагийн хуудасруу шилжүүлэх
                                         */
                                        let stringLength = []

                                        var length = data ? data.group.map(group => group.length) : []

                                        stringLength.push([...length])

                                        const total = length.reduce((acc, cvalue) => acc + cvalue, 0);
                                        const MAX_LIMIT = 150

                                    return(
                                        <td
                                            /**
                                                * Мэдээлэл олдоогүй үед болон эхний баганад ижил стайл үйлчилнэ
                                            */
                                            className={`
                                                p-25
                                                ${vidx === 0 || !data ? 'blank_cell' : 'timetable_report'}
                                                ${
                                                    idx == 2 && (totalLengthOne > LIMIT || totalLengthTwo > LIMIT)
                                                    ?
                                                            // 'pbreak'
                                                            ''
                                                        :
                                                            // 'no-break'
                                                            ''
                                                }
                                                ${
                                                    idx == 3
                                                }
                                            `}
                                            style={{ minheight: 200, width: vidx === 0 ? '2%' : '20%' }}
                                            // style={{ height: '20%', width: vidx === 0 ? '2%' : '10%' }}
                                            key={`${idx}-${vidx}`}
                                        >
                                            {

                                                /**
                                                     * 0 өдөрт ямар ч цаг байх боломжгүй учир үүнийг ашиглаж
                                                     * Хичээлийн цагуудаа статикаар тавьж өгсөн. Хичээлийн цаг
                                                     * болон өдрийг нэмэх шаардлага гарвал доор гараар нэмж
                                                     * өгөхөөс гадна дээр гүйж буй Array-ийн уртыг нэмэх
                                                     * шаардлагатай гэдгийг санаарай.
                                                */
                                                vidx === 0 ?
                                                    idx === 0 ?
                                                        <div>
                                                            <div>08:00</div>
                                                            <div>09:30</div>
                                                        </div>
                                                    :
                                                    idx === 1 ?
                                                        <div>
                                                            <div>09:40</div>
                                                            <div>11:10</div>
                                                        </div>
                                                    :
                                                    idx === 2 ?
                                                        <div>
                                                            <div>11:20</div>
                                                            <div>12:50</div>
                                                        </div>
                                                    :
                                                    idx === 3 ?
                                                        <div>

                                                            <div>13:10</div>
                                                            <div>14:40</div>
                                                        </div>
                                                    :
                                                    idx === 4 ?
                                                        <div>
                                                            <div>14:50</div>
                                                            <div>16:20</div>
                                                        </div>
                                                    :
                                                        <div>
                                                            <div>16:30</div>
                                                            <div>18:00</div>
                                                        </div>
                                                :
                                                    data ?
                                                        <div className='d-flex flex-column justify-content-between' style={{ minHeight: 100 }}>
                                                            <div>
                                                                {data?.lesson_name}
                                                            </div>
                                                            <div id={`group-${vidx}-${idx}`}>
                                                                {data.group.map((group, gidx) => {
                                                                    return(
                                                                        <div className='text-center' key={gidx} style={{ fontSize: dynamicFontSize }}>
                                                                            {group}
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                            <div>{data?.teacher_name}</div>
                                                        </div>
                                                    :
                                                        <div style={{ minHeight: 100 }}></div>
                                            }
                                        </td>
                                    )
                                })}
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default PrintRoom
