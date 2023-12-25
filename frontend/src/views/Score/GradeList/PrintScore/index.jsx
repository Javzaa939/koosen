
import React, { useEffect, useState } from "react"

import { Row, Spinner } from 'reactstrap'
import { useLocation } from 'react-router-dom';

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';

// ** Styles

import './style.scss'

import datas from "./sample";

export default function PrintScore()
{


    const LEARNING_TRUE_TYPE = 'def1'

    const location = useLocation()
    const dataz = location.state.mainData
    const groupId = location.state.chosenGroup

    // State
    // const [ datas, setDatas ] = useState({})
    const [ listArr, setListArr ] = useState([])

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})

    // Api
    const getListApi = useApi().print.score

        // /*Жагсаалт дата авах функц */
        // async function getDatas() {
        //     // const department = select_value?.department
        //     // const group = select_value?.group

        //     const { success, data } = await fetchData(getListApi.getListNoLimit( groupId, '', ''))
        //     if (success) {
        //         console.log(data,'DATASSSSS')
        //         setDatas(data?.results)
        //         // setTotalCount(data?.count)
        //     }
        // }

    // useEffect(
    //     () =>
    //     {
    //         getDatas();

    //         window.onafterprint = function()
    //         {
    //             window.history.go(-1);
    //         }
    //     },
    //     []
    // )

    function imageLoaded()
    {
        if (Object.keys(datas).length != 0)
        {
            setTimeout(() => window.print(), 1000)
        }
    }

    /** 1 => 01 болгох Format */
    const zeroFill = n => {
        return ('0' + n).slice(-2);
    }

    return (
        <>
            <div className='ps-1 d-flex flex-column justify-content-center align-items-center fontchange'>
                {isLoading ? <Spinner/> : null}
            </div>
            <table>
                <thead><tr><th>№</th><th>Овог Нэр</th><th>Дүн</th></tr></thead>
                <tbody>
                    <tr>
                        <td>#</td>
                        <td>Кредит</td>
                    </tr>
                    <tr>
                        <td>#</td>
                        <td>Улирал</td>
                    </tr>
                    {dataz.map((row, idx) => (
                    <tr key={`tr${idx}`}>
                        <td>{idx + 1}</td>
                        <td>{row?.student}</td>
                        <td>{row?.score_total}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}
