import React, { Fragment, useContext, useEffect, useState } from "react";
import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";
import { Button, Spinner } from "reactstrap";
import { FileText } from 'react-feather'

import { utils, writeFile } from 'xlsx-js-style';
import './style.scss'
import ActiveYearContext from "@context/ActiveYearContext"

import { sampledata } from "./sample";

function ADB9(){

    const infoApi = useApi().status.db4
    const { cyear_name } = useContext(ActiveYearContext)

	// // Loader
	const { Loader, isLoading, fetchData } = useLoader({isSmall: true});
    const [localLoaderDB3, setLocalLoaderDB3] = useState(false)

    const [datas, setDatas] = useState([])

    async function getDatas() {
        const {success, data} = await fetchData(infoApi.get())
        if(success) {
            setDatas(data)
            setLocalLoaderDB3(false)
        }
    }

    useEffect(() => {
        getDatas()
    },[])

    // const datas = sampledata

    function convert() {
        console.log(datas)
    }

    return(
        <div className="overflow-auto" style={{ minHeight: 200 }}>
            {/* <Button color="primary" className="mb-2 p-75" disabled={false} onClick={() => {convert()}}> */}
            <Button color="primary" className="mb-2 p-75" disabled={isLoading} onClick={() => {convert()}}>
                <FileText size={18} /> Excel татах
            </Button>
            {(isLoading || localLoaderDB3) ?
                Loader
                :
            <table>
                <thead>
                    <tr>
                        <th rowSpan={3}>Өмчийн хэлбэр</th>
                        <th rowSpan={3} className="th-rotate-border">Нийт суралцагчид</th>
                            <th colSpan={20} style={{ borderLeft: 0, height: 15 }}></th>
                    </tr>
                    <tr>
                        <th rowSpan={2} className="th-rotate">Эрэгтэй</th>
                        <th rowSpan={2} className="th-rotate">Эмэгтэй</th>
                        <th rowSpan={2} className="th-rotate-border">Дипломын боловсрол</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Бакалаврын боловсрол</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Магистрын боловсрол</th>
                            <th colSpan={2} style={{ borderLeft: 0, height: 15 }}></th>
                        <th rowSpan={2} className="th-rotate-border">Докторын боловсрол</th>
                    </tr>
                    <tr>
                        <th className="th-rotate">Эрэгтэй</th>
                        <th className="th-rotate">Эмэгтэй</th>
                        <th className="th-rotate">Эрэгтэй</th>
                        <th className="th-rotate">Эмэгтэй</th>
                        <th className="th-rotate">Эрэгтэй</th>
                        <th className="th-rotate">Эмэгтэй</th>
                        <th className="th-rotate">Эрэгтэй</th>
                        <th className="th-rotate">Эмэгтэй</th>

                    </tr>
                </thead>
                {/* <tbody>
                    {datas.map((data, idx) => {
                        return(

                        <Fragment>
                            <tr>
                                <th>
                                    {data?.name}
                                </th>
                            </tr>
                            {data?.aimag.map((aimag, aidx) => (
                                <tr>
                                    <td className="ps-2">
                                        {aimag?.name}
                                    </td>
                                </tr>
                            ))}
                        </Fragment>
                        )
                    })}

                </tbody> */}
            </table>
            }
            </div>
    )
}

export default ADB9