import React, { useEffect, useState } from 'react';

import { Button, Card, Row, Col, Form, Spinner, CardHeader, CardBody, CardFooter } from 'reactstrap';

import { useTranslation } from 'react-i18next';

import { useParams } from 'react-router-dom';

import useApi from "@hooks/useApi";
import useModal from '@hooks/useModal'
import useLoader from "@hooks/useLoader";

import Lecture from './Lecture';
import { number } from 'prop-types';

const TitlePlan = ({ getNavigateData }) => {

    const { t } = useTranslation()
    const { standart_Id } = useParams()
    
    const [datas, setDatas] = useState([])
    const [credit_data, setCreditData] = useState([])
    const [cdelete_ids, setCDeleteIds] = useState([])
    const [all_data, setAllData] = useState([])

    const [lec_data, setLectureData] = useState([])
    const [sem_data, setSeminarData] = useState([])
    const [lab_data, setLaboratorData] = useState([])
    const [prac_data, setPracticeData] = useState([])
    const [work_data, setHomeworkData] = useState([])
    const [ test, setTest ] = useState(0)

    const [ is_loading, setLoading ] = useState(false)
    
    // Loader
	const { isLoading, fetchData } = useLoader({});
    
    // Api
    const lessonStandartTitleApi = useApi().study.lessonStandart.titleplan
    
    const lessonStandartApi = useApi().study.lessonStandart
    const isTrue = !credit_data?.lecture_kr && !credit_data?.seminar_kr_kr && !credit_data?.laborator_kr && !credit_data?.practic_kr && !credit_data?.biedaalt_kr

    async function getDatas() {
        if(standart_Id) {
            const { success, data } = await fetchData(lessonStandartTitleApi.get(standart_Id))
            if(success) {

                setDatas(data)
            }
        }
    }

    async function getLessonCredit() {
        if(standart_Id) {
            const { success, data } = await fetchData(lessonStandartApi.getOne(standart_Id))
            if(success) {
                // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
                setCreditData(data)
            }
        }
    }

    async function onSubmit() {
        const cdatas = {}
        cdatas.delete_plan_ids = cdelete_ids
        cdatas.lesson_id = standart_Id
        cdatas.all_datas = all_data
        setLoading(true)
        const { success } = await fetchData(lessonStandartTitleApi.post(cdatas))
        if(success) {
            getDatas()
            setLoading(false)
            getNavigateData()
        }
    }

    function LectureValue(title_data) {
        setLectureData(title_data)
    }
    function SeminarValue(title_data) {
        setSeminarData(title_data)
    }
    function LaboratorValue(title_data) {
        setLaboratorData(title_data)
    }
    function PracticeValue(title_data) {
        setPracticeData(title_data)
    }
    function HomeWorkValue(title_data) {
        setHomeworkData(title_data)
    }

    function handleDelete(delete_ids) {
        setCDeleteIds([])
        var del_ids = cdelete_ids
        if(delete_ids && delete_ids.length > 0) {
            for(var idx in delete_ids) {
                var id = delete_ids[idx]
                if(!del_ids.includes(id)) {
                    del_ids.push(id)
                }
            }
            setCDeleteIds(del_ids)
        }
    }

    useEffect(()=>{
        getLessonCredit()
        getDatas()

    },[])

    useEffect(()=>{

        var all_data = lec_data.concat(sem_data).concat(lab_data).concat(prac_data).concat(work_data)
        setAllData(all_data)

    }, [lec_data,sem_data,lab_data,prac_data,work_data])


    return (
        < Card
            className="modal-dialog-lg"
        >
            <CardHeader className='bg-transparent pb-0' ><h4 className='text-center mb-3'>Хичээлийн сэдэвчилсэн төлөвлөгөө</h4></CardHeader>
            <CardBody className="flex-grow-1">
                <Card body>
                    <Row tag={Form} md={12} className="gy-1">
                        {
                            isTrue && (<label style={{color: 'red', textAlign: 'center'}}>Та багц цагийн задаргааг оруулснаар сэдэвчилсэн төлөвлөгөө рүү орох боломжтойг анхаарна уу!!!</label>)
                        }
                        {
                            credit_data?.lecture_kr && credit_data?.lecture_kr !== 0 ?
                            <Lecture  handleValue={LectureValue}  handleDeleteValue={handleDelete} datas={datas} type={1} />
                            : null
                        }
                        {
                            (credit_data?.seminar_kr && credit_data?.seminar_kr !== 0) ?
                            <Lecture  handleValue={SeminarValue}  handleDeleteValue={handleDelete} datas={datas} type={2}  />
                            : null
                        }
                        {
                            credit_data?.laborator_kr && credit_data?.laborator_kr !== 0 ?
                            <Lecture handleValue={LaboratorValue}  handleDeleteValue={handleDelete} datas={datas} type={3} />
                            : null
                        }
                        {
                            credit_data?.practic_kr && credit_data?.practic_kr !== 0 ?
                            <Lecture  handleValue={PracticeValue}  handleDeleteValue={handleDelete} datas={datas} type={4} />
                            : null
                        }
                        {
                            credit_data?.biedaalt_kr && credit_data?.biedaalt_kr !== 0 ?
                            <Lecture handleValue={HomeWorkValue}  handleDeleteValue={handleDelete} datas={datas} type={5} />
                            : null
                        }
                    </Row>
                </Card>
            </CardBody>
            <CardFooter>
                <Col className='text-center mt-2'>
                    <Button  className='me-2' color="primary" type="submit" size='sm' disabled={ (isLoading && is_loading) || isTrue} onClick={() => onSubmit()}>
                        {
                            isLoading && is_loading && (
                                <Spinner animation="border" size="sm" className='me-50'/>
                            )
                        }
                        {t('Хадгалах')}
                    </Button>
                </Col>
            </CardFooter>
        </Card>
    );
};

export default TitlePlan;
