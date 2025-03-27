import React, { useEffect } from 'react'
import { Plus } from 'react-feather'
import { Badge, Button, Card, CardBody, CardTitle } from 'reactstrap'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import './style.scss'
import { sample } from './asd'
import { CiUser } from "react-icons/ci";
import { FaAngleDoubleRight } from "react-icons/fa";
import Add from './Add'

function RemoteLesson() {
    const datas = sample

    const [addModal, setAddModal] = React.useState(false)

    function toggleAddModal() {
        setAddModal(!addModal)
    }

    const { isLoading, fetchData } = useLoader({});

    const remoteApi = useApi().remote

    async function getDatas() {
        const { success, data } = await fetchData(remoteApi.get());
        if (success) {
            console.log(data,'data')
        }
    }

    useEffect(() => {
        getDatas();
    }, []);

    return (
        <div>
            <Add isOpen={addModal} handleModal={toggleAddModal} refreshDatas={console.log('refresh2')}/>
            <Card className='p-1 mb-1'>
                <CardTitle>Зайн сургалт</CardTitle>
                <CardBody className='d-flex justify-content-between align-items-center'>
                    <div>
                        {/* filters */}
                    </div>
                    <Button color='primary' onClick={() => toggleAddModal()}><Plus size={14}/> Үүсгэх</Button>
                </CardBody>
            </Card>
            <div className='d-flex flex-wrap gap-1 justify-content-center'>
                {datas.map((data, idx) => (
                    <div className='lesson_card d-inline-block p-2 shadow-sm' key={idx} style={{ overflow:'hidden' }}>
                        <div className='fw-bold text-center'>
                            {data?.title || ''}
                        </div>
                        <div className='d-flex justify-content-between mt-1'>
                            <div>
                                Багш: <a href='/' className='text-decoration-underline'>{data?.teacher}</a>
                            </div>
                            <div>
                                <Badge color='primary' pill>
                                    <CiUser/> {data?.students}
                                </Badge>
                            </div>
                        </div>
                        <img
                            src={data?.image}
                            alt='image'
                            className='w-100 h-auto mt-1'
                        />
                        <div className='d-flex justify-content-between mt-1'>
                            <div></div>
                            <Button color='primary' size='sm' className='d-flex align-items-center gap-25 pe-50'>Дэлгэрэнгүй <FaAngleDoubleRight/></Button>
                        </div>
                    </div>
                ))}
            </div>
            {/* zainaas lesson uzne */}
        </div>
    )
}

export default RemoteLesson
