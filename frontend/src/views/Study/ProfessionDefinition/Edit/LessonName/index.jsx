// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { Plus  } from 'react-feather'
import { useForm } from "react-hook-form";
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import DataTable from 'react-data-table-component'

import {
    Col,
	Button,
	Card,
    CardHeader,
    Spinner
} from "reactstrap";

import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"

import { validate } from "@utils"
import { validateSchema } from './validateSchema';
import { getColumns } from './helpers';

import Addmodal from './Add'

const MainInformation = ({ }) => {

    const { definition_Id } = useParams()
    const { t } = useTranslation()
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total_count, setTotalCount] = useState(1);
    // UseState
    const [is_valid, setValid] = useState(true)
    const [lesson_option, setLessonOption] = useState([])
    const [admission_lessons, setAdmissionLesson] = useState([])
    const [datas, setDatas] = useState([])
    const [modal, setModal] = useState(false)
    const { Loader, isLoading, fetchData } = useLoader({});
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: true})

    // ** Hook
    const { control, handleSubmit, reset, setValue, setError, formState: { errors } } = useForm(validate(validateSchema));

    // Api
    const definationApi = useApi().study.professionDefinition
    const AdmissionlessonApi = useApi().settings.admissionlesson

    const [test, setTest] = useState([])

    // ЭЕШ хичээлийн жагсаалт
    async function getLessonOption() {
        const { success, data } = await fetchData(AdmissionlessonApi.get())
        if (success) {
            setLessonOption(data)
        }
    }

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-study-profession-update') &&school_id) {
            setValid(false)
        }
    },[user])

    async function getDatas() {
        if(definition_Id) {

            const { success, data } = await fetchData(definationApi.getOne(definition_Id))
            if(success) {

                setDatas(data)
                setTotalCount(data.admission_lesson.length)
                setTest(data.admission_lesson)

                setValue('profession', data?.name)
                setValue('bottom_score', data?.admission_lesson[0]?.bottom_score)
                var admission_lesson_id = []
                data?.admission_lesson?.map((lesson, idx) => {
                    var admission_ids = lesson_option.find((e) => e.id === parseInt(lesson?.admission_lesson_id))
                    if (admission_ids != undefined){
                        admission_lesson_id.push(admission_ids)
                    }
                })
                setAdmissionLesson(admission_lesson_id)
            }
        }
    }

    const handleDelete = async(id) => {
        const { success, data } = await fetchData(definationApi.deleteScore(id))
        if(success)
        {
            getDatas()
        }
    };

    const handleModal = () => {
        setModal(!modal)
    }

    useEffect(() => {
        getDatas()
        getLessonOption()
    },[])


    useEffect(() => {
        if (Object.keys(datas).length > 0) {
            var admission_ids = []
            datas['admission_lesson'].map((lesson, idx) => {
                var selected = lesson_option.find((e) => e.id === lesson?.admission_lesson_id)
                if (selected != undefined) {
                    admission_ids.push(selected)
                }
                setAdmissionLesson(admission_ids)
            })
        }
    },[lesson_option,datas])

    const lesson_datas = admission_lessons.map(data => {
        const newDatas = test.find(test => test.admission_lesson_id === data.id);
        return {
            ...data,
            bottom_score: newDatas ? newDatas.bottom_score : null
        };
    });

	return (
        <Fragment>
            <Card className="modal-dialog-left modal-lg">
            {isLoading && <div className='suspense-loader'><Spinner size='xl'/></div>}
                <CardHeader className='bg-transparent pgetColumb-0'>
                    <Col>
                        <div className='text-center'>
                            <h4>{t('ЭЕШ-ийн хичээл, босго оноо')}</h4>
                        </div>
                        <div className='text-center'>
                            <h5>Мэргэжил "{datas.name}"</h5>
                        </div>
                    </Col>
                </CardHeader>
                <div className='d-flex flex-wrap justify-content-end mb-1'>
                    <Button
                        color='primary'
                        onClick={() => handleModal()}
                        >
                        <Plus size={15} />
                        <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                    </Button>
                </div>
                {isTableLoading ?
					<div className=" text-center" sm={12}>
						<Spinner size='sm' />
						<span className='ms-50'>{t("Түр хүлээнэ үү...")}</span>
					</div>
				:
					<div className="react-dataTable react-dataTable-selectable-rows">
						<DataTable
                            noHeader
                            className='react-dataTable'
                            noDataComponent={(
                                <div className="my-2">
                                    <h5>Өгөгдөл байхгүй байна.</h5>
                                </div>
                            )}
                            columns={getColumns(currentPage, rowsPerPage, handleDelete, user)}
                            data={lesson_datas}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                        />
					</div>
				}
            </Card>
            {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} admission_lessons={admission_lessons}/>}
        </Fragment>
	);
};
export default MainInformation;