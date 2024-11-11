import React, { useContext, useState, useEffect } from 'react';
import { Table, CardBody, Spinner, Badge } from 'reactstrap'
import { useTranslation } from 'react-i18next';
import AuthContext from '@context/AuthContext'


import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';


const TableComponent = () => {

    const { t } = useTranslation()
    const { userDetail } = useContext(AuthContext)
    const { isLoading, fetchData } = useLoader({ })

    const [datas, setDatas] = useState([])

    const examApi = useApi().challenge

    async function getDatas() {
        const { success, data } = await fetchData(examApi.timetable())
        if(success) {
            console.log(data)
            setDatas(data)
        }
    }

    useEffect(() => {
        getDatas()
    },[])

    return (
        <CardBody className='mt-1'>
            {
                isLoading &&
                <div className='suspense-loader'>
                    <Spinner size='bg'/>
                    <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                </div>
            }
            <Table bordered responsive className='table'>
                <thead>
                    <tr>
                        <th>Д/Д</th>
                        <th>Хичээлийн код</th>
                        <th>Хичээл</th>
                        <th>Шалгалт авах өдөр</th>
                        <th>Эхлэх цаг</th>
                        <th>Дуусах цаг</th>
                        <th>Өрөө</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        datas && datas.length > 0 &&
                        datas.map((data, idx) => {
                            return (
                                <tr key={idx}>
                                    <th>{idx+1}</th>
                                    <td>{data?.lesson?.code}</td>
                                    <td>{data?.lesson?.name}</td>
                                    <td>{data.exam_date}</td>
                                    <td>{data.begin_time}</td>
                                    <td>{data.end_time}</td>
                                    <td>
                                        {
                                            data.is_online
                                                ?
                                                    <Badge color="light-success" pill>
                                                        {t('Онлайн')}
                                                    </Badge>
                                                :
                                                    data?.room?.code
                                            }
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table>
        </CardBody>
    );
};

export default TableComponent;
