import React, { useContext, useEffect, useMemo, useState } from 'react';

import { Button, UncontrolledCollapse, Card, Table } from 'reactstrap';

import { useTranslation } from 'react-i18next';

import { Plus } from 'react-feather'

import AuthContext from "@context/AuthContext"
import useToast from "@hooks/useToast";

import classnames from "classnames";

import TableRows from "../TableRows"

const Laborator = ({ handleValue, handleDeleteValue, datas, type }) => {

    const { t } = useTranslation()

    const { user } = useContext(AuthContext)

    const addToast = useToast()

    const [titledata, initTitleData] = useState([]);
    const [delete_ids, setDeleteIds] = useState([])

    function addField(type) {
        if(type === 'row_zaawal') {
            const cvalues = {
                id: '',
                week: '',
                title: '',
                content: '',
                lesson_type: 1,

            }
            initTitleData([...titledata, cvalues]);
        }
    }

    async function getDatas() {
        var title_data = datas.filter(data=>data.lesson_type===type)
        initTitleData(title_data)
    }

    useEffect(() => {
        getDatas()
    },[datas])

    function onDataUpdate(index, name, value) {

        const data = [...titledata];
        if(data && data.length > 0) {
            if(name === 'week'){
                data.map((wk_data, idx)=>{
                    if(wk_data.week === value && idx !== index)
                    {
                        addToast(
                            {
                                type: 'warning',
                                text: `"Долоо хоног давхардаж байна.`
                            }
                        )
                    }

                })
            }
            data[index][name] = value
        }
        initTitleData(data);
    }

    function removeDataField(index, id) {
        const dataRow = [...titledata];
        dataRow.splice(index, 1);
        initTitleData(dataRow);
        var del_ids = delete_ids
        if(id && !del_ids.includes(id)) {
            del_ids.push(id)
            setDeleteIds(del_ids)
        }
    }

    useEffect(() => {
        handleValue(titledata)
        handleDeleteValue(delete_ids)
    },[titledata])

    const tableHeader = useMemo(() => {
        return (
            <tr>
                <th className='text-center'>№</th>
                <th>
                    {t('Долоо хоног')}
                </th>
                <th>
                    {t('Гарчиг')}
                </th>
                <th>
                    {t('Агуулга')}
                </th>
                {
                    user && Object.keys(user).length > 0 && user.permissions.includes('lms-study-learningplan-delete') &&
                    <th className='text-center'>{t('Үйлдэл')}</th>
                }
            </tr>
        )
    }, [])

    return (
        <Card className='mt-1 m-0' style={{width: "100%"}}>
            <div className='added-cards'>
                <div className={classnames('cardMaster rounded border p-1')} role="button" id={'toggler'+type}>
                    {
                        type === 1 && <div>{type.toString()}. Лекцийн хичээлийн сэдэвчилсэн төлөвлөгөө </div>
                    }{
                        type === 2 && <div>{type.toString()}. Семинарын хичээлийн сэдэвчилсэн төлөвлөгөө </div>
                    }{
                        type === 3 && <div>{type.toString()}. Лабораторын хичээлийн сэдэвчилсэн төлөвлөгөө </div>
                    }{
                        type === 4 && <div>{type.toString()}. Практикийн хичээлийн сэдэвчилсэн төлөвлөгөө </div>
                    }{
                        type === 5 && <div>{type.toString()}. Бие даалтын хичээлийн сэдэвчилсэн төлөвлөгөө </div>
                    }
                </div>
            </div>
            <UncontrolledCollapse toggler={'#toggler'+type}>
                <div className='added-cards mt-1'>
                    <div className={classnames('cardMaster rounded border p-1')}>
                        <Table size='sm' bordered>
                            <thead>
                                {tableHeader}
                            </thead>
                            <tbody>
                                <TableRows
                                    rows={titledata}
                                    tableRowRemove={removeDataField}
                                    onValUpdate={onDataUpdate}
                                />
                            </tbody>
                        </Table>
                        {
                            user && Object.keys(user).length > 0 && user.permissions.includes('lms-study-learningplan-create') &&
                            <div className='text-center mt-50'>
                                <Button outline size='sm' color="primary" onClick={() => addField('row_zaawal')}>
                                    <Plus size={15} />{t('Шинээр нэмэх')}
                                </Button>
                            </div>
                        }
                    </div>
                </div>
            </UncontrolledCollapse>
        </Card>
    );
};

export default Laborator;
