
import React, { Fragment, useState, useEffect } from "react"

import { useParams } from 'react-router-dom'
import { Clock } from "react-feather"

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import {
    Card
} from 'reactstrap'

function ShowAd() {
    const { newsid } = useParams()

    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false })

    /** State */
    const [ datas, setDatas ] = useState({})

    /** Api */
    const serviceNewsApi = useApi().service.news

    useEffect(
        () =>
        {
            getDatas()
        },
        [newsid]
    )

    async function getDatas()
    {
        if(newsid)
        {
            const { success, data } = await fetchData(serviceNewsApi.getOneAd(newsid))
            if(success)
            {
                setDatas(data)
            }
        }
    }

    return (
        <Fragment>
            <Card>
                {isLoading && Loader}

                {
                    Object.keys(datas).length == 0
                    ?
                    <div className="p-3">
                        <p>Уучлаарай мэдээлэл олдсонгүй.</p>
                    </div>
                    :
                    <>
                        <div className="p-3">
                            {/* <div className={`${css.newspost}`} > */}
                            <div>
                                <div className='text-center'>
                                    <h3>{datas?.title}</h3>
                                </div>

                                <div className="pb-2 pt-1">
                                    <Clock size={10} />
                                    <small className='ms-1' >Нийтэлсэн хугацаа: {datas?.created_at}</small>
                                </div>

                                <div className={`width-auto`} id="news" dangerouslySetInnerHTML={{ __html: datas?.body }} >
                                </div>

                            </div>
                        </div>
                    </>
                }

            </Card>
        </Fragment>
    )
}
export default ShowAd