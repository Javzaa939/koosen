import React,{ useContext, useEffect, useState } from 'react';
import { Badge, Card, Spinner, } from 'reactstrap'
import { AuthContext } from "@context/AuthContext"
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader"
import IrtsTable from './IrtsTable';
import './style.scss'

const StudentAttendance = () => {

    const irtsApi = useApi().student.regirts
    const { userDetail } = useContext(AuthContext)
    const { isLoading: mainLoading, fetchData: mainFetch, fetchData } = useLoader({isFullScreen:true, initValue: true})

    const [ datas, setDatas ] = useState({})

    async function getDatas() {
        const { success, data } = await mainFetch(irtsApi.get())
		if (success) {
			if (data.length > 0) {
				for (var i in data) {
					data[i].title =
						data[i]?.lesson?.code + ' ' + data[i]?.lesson?.name;
					data[i].daysOfWeek = [
						`${data[i].day === 7 ? 0 : data[i].day}`,
					];
				}
			}
			setDatas(data);
		}
    }

    useEffect(() => {
        getDatas();
    },[])

    return (
        <Card>
            <div className='p-3 shadow overflow-auto'>
                {mainLoading ?
                    (<div className='d-flex justify-content-center align-items-center' style={{ minHeight: 200}}> <Spinner /> </div>)
                :
                    (
                        <div>
                            <div className='d-flex justify-content-start mb-2'>
                                <Badge className='m-25 rounded-5' color='light-success'>Ирсэн</Badge>
                                <Badge className='m-25 rounded-5' color='light-danger'>Тас</Badge>
                                <Badge className='m-25 rounded-5' color='light-warning'>Чөлөөтэй</Badge>
                                <Badge className='m-25 rounded-5' color='light-info'>Өвчтэй</Badge>
                            </div>
                            <IrtsTable data={datas} student={userDetail}/>
                        </div>
                    )
                }
            </div>
        </Card>
    );
};

export default StudentAttendance;
