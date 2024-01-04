import React, { useContext, useEffect, useMemo, useState } from 'react';

import { Button, Card, Table, Spinner, Collapse } from 'reactstrap';

import { useTranslation } from 'react-i18next';

import { Plus } from 'react-feather'

import useApi from "@hooks/useApi";
import useModal from "@hooks/useModal"
import useLoader from "@hooks/useLoader";
import AuthContext from "@context/AuthContext"

import classnames from "classnames";

import TableRows from "../TableRows"

const BasicLesson = ({ datas, isOpen, mergejil_id, degree }) => {

    const { t } = useTranslation()

    const { user } = useContext(AuthContext)
    const { showWarning } = useModal()

    const [zaaval, initZaavalRow] = useState([]);
    const [songon, initSongonRow] = useState([]);
    const [is_submit, setSubmit] = useState(true)

    // Loader
	const { isLoading, Loader, fetchData } = useLoader({ isFullScreen: false });

    // Api
    const planApi = useApi().study.plan

    function addField(type) {
        if(type === 'row_zaawal') {
            const cvalues = {
                lesson: '',
                previous_lesson: '',
                group_lesson: '',
                season: '',
                lesson_level: 1,
                lesson_type: 1,
                is_check_score: false,
            }
            initZaavalRow([...zaaval, cvalues]);
        }
        if(type === 'row_songon') {
            const cvalues = {
                lesson: '',
                previous_lesson: '',
                group_lesson: '',
                season: '',
                lesson_level: 1,
                lesson_type: 2,
                is_check_score: false,
            }
            initSongonRow([...songon, cvalues]);
        }
    }

    useEffect(() => {
        if(zaaval && zaaval.length < 1) setSubmit(true)
        zaaval.find((value) => {
            if(!value.lesson) {
               setSubmit(true)
            }
            else {
                setSubmit(false)
            }
        })
    },[zaaval])

    async function getDatas(clesson_type='') {
        if(datas && Object.keys(datas).length > 0) {
            const department = datas?.department?.id || ''
            const school = datas?.school || ''
            const profession = datas?.id || ''
            const lesson_level = 1
            const { success, data } = await fetchData(planApi.getPlan(department, school, profession, lesson_level, ''))
            if(success) {
                var zaaval_data = []
                var songon_data = []
                if(data && data.length > 0) {
                    if(clesson_type === 1) {
                        zaaval_data = data.filter(cdata => cdata.lesson_type == clesson_type)
                        initZaavalRow(zaaval_data)
                    }
                    else if(clesson_type === 2) {
                        songon_data = data.filter(cdata => cdata.lesson_type == clesson_type)
                        initSongonRow(songon_data)
                    } else {
                        zaaval_data = data.filter(cdata => cdata.lesson_type == 1)
                        songon_data = data.filter(cdata => cdata.lesson_type == 2)
                        initZaavalRow(zaaval_data)
                        initSongonRow(songon_data)
                    }
                }
            }
        }
    }

    useEffect(() => {
        getDatas()
    },[datas])

    function onZaavalValUpdate(name, index, value, cvalues='') {
        const data = [...zaaval];
        var cseason_ids = []
        if(data && data.length > 0) {
            data[index][name] = value
            if(name === 'season') {
                if(cvalues && cvalues.length > 0) {
                    cvalues.map((value) => {
                        if(!cseason_ids.includes(value.id)) {
                            cseason_ids.push(value.id)
                        }
                    })
                }
                if(cseason_ids.length > 0) {
                    data[index][name] = cseason_ids
                } else {
                    data[index][name] = null
                }
            }
        }
        initZaavalRow(data);
    }

    function onSongonValUpdate(name, index, value, cvalues='') {
        const data = [...songon];
        var cseason_ids = []
        if(data && data.length > 0) {
            data[index][name] = value
            if(name === 'season') {
                if(cvalues && cvalues.length > 0) {
                    cvalues.map((value) => {
                        if(!cseason_ids.includes(value.id)) {
                            cseason_ids.push(value.id)
                        }
                    })
                }
                if(cseason_ids.length > 0) {
                    data[index][name] = cseason_ids
                } else {
                    data[index][name] = null
                }
            }
        }
        initSongonRow(data);
    }

    function removeZaavalField(index, id) {
        const dataRow = [...zaaval];
        dataRow.splice(index, 1);
        initZaavalRow(dataRow);

        if(id) {
            handleDelete(id)
        }
    }

    function removeSongonField(index, id) {
        const dataRow = [...songon];
        dataRow.splice(index, 1);
        initSongonRow(dataRow);

        if(id) {
            handleDelete(id)
        }
    }

    async function handleDelete(del_id) {
        const { success } = await fetchData(planApi.delete(del_id))
        if(success) {
            // Устгах үйлдэл амжилттай болсны дараа ямар нэгэн үйлдэл хийхгүй
        }
    }

    async function handleOnSubmit(check_type) {
        var cdatas = {}
        cdatas.school = datas?.school || ''
        cdatas.profession = datas?.id || ''
        cdatas.department = datas?.department?.id || ''

        if(check_type === 'zaaval') {
            cdatas.all_datas = zaaval
            const { success } = await fetchData(planApi.postPlan(cdatas))
            if(success) {
                getDatas(1)
            }
        } else {
            cdatas.all_datas = songon
            const { success } = await fetchData(planApi.postPlan(cdatas))
            if(success) {
                getDatas(2)
            }
        }
    }

    function toggleClosed() {
        showWarning({
            question: `Та хаахдаа итгэлтэй байна уу? Хадгалахгүй хааснаар таны хийсэн өөрчлөлтүүд хадгалагдахгүй болохыг анхаарна уу !!!`,
            onClick: () => document.getElementById('toggler').click(),
            btnText: 'Тийм',
        })
    }

    const tableHeader = useMemo(() => {
        return (
            <tr>
                <th className='text-center'>№</th>
                <th>
                    {t('Хичээл')}
                </th>
                <th>
                    {t('Өмнөх холбоо хичээл')}
                </th>
                <th>
                    {t('Багц хичээл')}
                </th>
                <th>{t('Хичээл үзэх улирал')}</th>
                <th>{t('74-с дээш тэнцэх эсэх')}</th>
                {
                    user && Object.keys(user).length > 0 && user.permissions.includes('lms-study-learningplan-delete') &&
                    <th className='text-center'>{t('Үйлдэл')}</th>
                }
            </tr>
        )
    }, [])

    return (
        <Card className='mt-1 m-0'>
            {isLoading && Loader}
            <Collapse toggler="#toggler" isOpen={isOpen} >
                <div className='added-cards'>
                    <div className={classnames('cardMaster rounded border p-1')}>
                        <h5 className='text-center pb-50'>1.1. Заавал судлах хичээл</h5>
                        <Table size='sm' bordered>
                            <thead>
                                {tableHeader}
                            </thead>
                            <tbody>
                                <TableRows
                                    rows={zaaval}
                                    tableRowRemove={removeZaavalField}
                                    onValUpdate={onZaavalValUpdate}
                                    profession={mergejil_id}
                                />
                            </tbody>
                        </Table>
                        {
                            user && Object.keys(user).length > 0 && user.permissions.includes('lms-study-learningplan-create') &&
                            <>
                                <div className='text-center mt-50'>
                                    <Button outline size='sm' color="primary" onClick={() => addField('row_zaawal')}>
                                        <Plus size={15} />{t('Шинээр нэмэх')}
                                    </Button>
                                </div>
                                <div className='text-end mt-1'>
                                    <Button className="ms-2" color="primary" disabled={is_submit || isLoading} onClick={() => handleOnSubmit('zaaval')}>
                                        {
                                            isLoading && (
                                                <Spinner animation="border" size="sm" className='me-50'/>
                                            )
                                        }
                                        {t('Хадгалах')}
                                    </Button>
                                </div>
                            </>
                        }
                        <hr />
                        <h5 className='text-center pb-50 mt-2'>1.2. Сонгон судлах хичээл</h5>
                        <Table size='sm' bordered>
                            <thead>
                                {tableHeader}
                            </thead>
                            <tbody>
                                <TableRows
                                    rows={songon}
                                    tableRowRemove={removeSongonField}
                                    onValUpdate={onSongonValUpdate}
                                    profession={mergejil_id}
                                />
                            </tbody>
                        </Table>
                        {
                            user && Object.keys(user).length > 0 && user.permissions.includes('lms-study-learningplan-create') &&
                            <>
                                <div className='text-center mt-50'>
                                    <Button outline size='sm' color="primary" onClick={() => addField('row_songon')}>
                                        <Plus size={15} />{t('Шинээр нэмэх')}
                                    </Button>
                                </div>
                                <div className='text-end'>
                                    <Button outline onClick={() => toggleClosed()} >
                                        Хаах
                                    </Button>
                                    <Button className="ms-2" color="primary"
                                        disabled={
                                            songon && songon.length < 1 ||
                                            songon.find((value) => value.lesson === '') ? true : false ||
                                            isLoading
                                        }
                                        onClick={() => handleOnSubmit('songon')}>
                                        {
                                            isLoading && (
                                                <Spinner animation="border" size="sm" className='me-50'/>
                                            )
                                        }
                                        {t('Хадгалах')}
                                    </Button>
                                </div>
                            </>
                        }
                    </div>
                </div>

            </Collapse>
        </Card>
    );
};

export default BasicLesson;
