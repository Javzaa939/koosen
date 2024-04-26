import React, { useContext, useEffect, useMemo, useState } from 'react';

import { Button, Card, Table, Spinner, Collapse } from 'reactstrap';

import { useTranslation } from 'react-i18next';

import { Plus } from 'react-feather'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import useModal from "@hooks/useModal"
import AuthContext from "@context/AuthContext"

import classnames from "classnames";

import TableRows from "../TableRows"

const Qualification = ({ datas, isOpen, profession, degree }) => {

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)
    const { showWarning } = useModal()

    const cvalues = {
        lesson: '',
        previous_lesson: '',
        group_lesson: '',
        season: '',
        lesson_level: 5,
        lesson_type: 1,
        is_check_score: false,
    }

    const [zaaval, initZaavalRow] = useState([]);

    // Loader
	const { isLoading, Loader, fetchData } = useLoader({ isFullScreen: false });

    // Api
    const planApi = useApi().study.plan

    function addField() {
        initZaavalRow([...zaaval, cvalues]);
    }

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

    async function removeZaavalField(index, id) {
        const dataRow = [...zaaval];
        dataRow.splice(index, 1);
        initZaavalRow(dataRow);
        if(id) {
            const { success } = await fetchData(planApi.delete(id))
            if(success) {
                // Устгах үйлдэл амжилттай болсны дараа ямар нэгэн үйлдэл хийхгүй
            }
        }
    }

    async function getDatas() {
        if(datas && Object.keys(datas).length > 0) {
            const department = datas?.department?.id || ''
            const school = datas?.school || ''
            const profession = datas?.id || ''
            const lesson_level = 5
            const { success, data } = await fetchData(planApi.getPlan(department, school, profession, lesson_level, ''))
            if(success) {
                initZaavalRow(data)
            }
        }
    }

    useEffect(() => {
        getDatas()
    },[datas])

    async function handleOnSubmit() {
        var cdatas = {}
        cdatas.school = datas?.school || ''
        cdatas.profession = datas?.id || ''
        cdatas.department = datas?.department?.id || ''

        cdatas.all_datas = zaaval

        const { success } = await fetchData(planApi.postPlan(cdatas))
        if(success) {
            getDatas()
        }
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

    function toggleClosed() {
        showWarning({
            question: `Та хаахдаа итгэлтэй байна уу? Хадгалахгүй хааснаар таны хийсэн өөрчлөлтүүд хадгалагдахгүй болохыг анхаарна уу !!!`,
            onClick: () => document.getElementById('toggler5').click(),
            btnText: 'Тийм',
        })
    }

    return (
        <Card className='mt-1 m-0'>
            {isLoading && Loader}
            <Collapse toggler="#toggler5" isOpen={isOpen}>
                <div className='added-cards'>
                    <div className={classnames('cardMaster rounded border p-1')}>
                        <h5 className='text-center pb-50'>
                            4.1. Заавал судлах
                        </h5>
                        <Table size='sm' bordered>
                            <thead>
                                {tableHeader}
                            </thead>
                            <tbody className='bg-transparent'>
                                <TableRows
                                    rows={zaaval}
                                    tableRowRemove={removeZaavalField}
                                    onValUpdate={onZaavalValUpdate}
                                    profession={profession}
                                />
                            </tbody>
                        </Table>
                        {
                            user && Object.keys(user).length > 0 && user.permissions.includes('lms-study-learningplan-create') &&
                            <>
                                <div className='text-center mt-50'>
                                    <Button outline size='sm' color="primary" onClick={() => addField()}>
                                        <Plus size={15} />{t('Шинээр нэмэх')}
                                    </Button>
                                </div>
                                <div className='text-end'>
                                    <Button outline onClick={() => toggleClosed() } >
                                        Хаах
                                    </Button>
                                    <Button
                                        className="ms-2"
                                        color="primary"
                                        disabled={zaaval && zaaval.length < 1 || zaaval.find((value) => value.lesson === '') ? true : false || isLoading}
                                        onClick={() => handleOnSubmit()}
                                    >
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

export default Qualification;
