import { Fragment, useState, useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'

import useApi from '@hooks/useApi';

import useLoader from '@hooks/useLoader';
import './style.css'

function PrintList() {

    const location = useLocation()

    const admissionApi = useApi().print.admissionprint
    const select_value = location.state.select_value

    const [datas, setDatas] = useState(
        {
            students: [],
            groups: []
        }
    )

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

    // data avah heseg
    async function getDatas() {

        var department = select_value?.department
        var profession = select_value?.profession
        var degree = select_value?.degree
        var group = select_value?.group
        var learning = select_value?.learning

        const { success, data } = await fetchData(admissionApi.get(degree, department, group, profession, learning))
        if(success)
        {
            setDatas(data)
        }
    }

    useEffect(() => {
        getDatas()
    },[])

    useEffect(
        () =>
        {

            window.onafterprint = function()
            {
                window.history.go(-1);
            }
        },
        []
    )

    function student_list(id) {
        let students = datas.students.filter(student => student.group === id)
        return students
    }

    return (
        <>
        {isLoading ? Loader :
            datas.groups.map((group, gindex) => {

                return(
                <div
                    className={`d-flex justify-content-center m-1 reportstyle ${gindex + 1 === datas.groups.length ? '' : 'page-break-always border-0'}`}
                    key={gindex}
                    style={{ fontWeight: 500 }}
                    onLoad={gindex + 1 === datas.groups.length ? setTimeout(() => {
                            window.print()
                        }, 1000)
                    :
                        null
                    }
                >
                    <div>
                        <div className='w-100 d-flex justify-content-end'>
                            <div className='text-wrap' style={{ width: '40%' }}>
                                <div className='text-center pe-1'>
                                    МҮИС-ийн захирлын 2023 оны 11 сарын 08-ны өдрийн ....... дугаар тушаалын хавсралт №{gindex + 1}
                                </div>
                            </div>
                        </div>
                        <div className='w-100 d-flex justify-content-center'>
                            <div className='w-100'>
                                <div className='d-flex my-1 justify-content-center'>
                                    <div >
                                        {group?.group__name}
                                    </div>
                                </div>
                                <div className='w-100'>
                                    <table className='examreport w-100'>
                                        <thead>
                                            <tr>
                                                <th>№</th>
                                                <th>Оюутны код</th>
                                                <th>Овог</th>
                                                <th>Нэр</th>
                                                <th>РД</th>
                                                <th>Тайлбар</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {student_list(group.group).map((data, idx) => {
                                                return(
                                                    <tr key={idx}>
                                                        <td className=''>{idx + 1}</td>
                                                        <td>{data?.code}</td>
                                                        <td>{data?.last_name}</td>
                                                        <td>{data?.first_name}</td>
                                                        <td>{data?.register_num}</td>
                                                        <td></td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )})}
        </>
    )
}

export default PrintList