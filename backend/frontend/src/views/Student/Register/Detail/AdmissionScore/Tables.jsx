import React from 'react';

import { Table } from 'reactstrap';

import { Trash2 } from 'react-feather';

import useModal from '@hooks/useModal'

import css from '@mstyle/style.module.css'

import { t } from 'i18next';

const Tables = (props) => {

    const { datas, handleDelete, handleEdit, is_role } = props

    const { showWarning } = useModal()

    return (
        <Table size='sm' responsive>
            <thead>
                <tr>
                    <th>#</th>
                    <th>{t('Хичээл')}</th>
                    <th>{t('Батламжийн дугаар')}</th>
                    <th>{t('Оноо')}</th>
                    <th>{t('Гүйцэтгэлийн хувь')}</th>
                    <th>{t('Шалгалт өгсөн он')}</th>
                    <th>{t('Шалгалт өгсөн газар')}</th>
                    {
                        !is_role && <th>{t('Устгах')}</th>
                    }
                </tr>
            </thead>
            <tbody>
                {
                    datas &&
                    datas.map((data, index) => {
                        return (
                            <tr key={index}>
                                <td>{data.id}</td>
                                <td className={`${css.hrefHover}`} >
                                    <a role="button" onClick={() => handleEdit(data)}>
                                        {data?.admission_lesson?.lesson_name}
                                    </a>
                                </td>
                                <td>{data.confirmation_num}</td>
                                <td>{data.score}</td>
                                <td>{data.perform}</td>
                                <td>{data.exam_year}</td>
                                <td>{data.exam_location}</td>
                                {
                                    !is_role &&
                                    <td>
                                        <div className='d-flex flex-column text-start text-lg-end'>
                                            <div className='d-flex order-sm-0 order-1 mt-1 mt-sm-0 ms-1'>
                                                <Trash2 type="button" color='red' width={'15px'}
                                                    onClick={() => showWarning({
                                                        question: t(`Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?`),
                                                        onClick: () => handleDelete(data.id),
                                                        btnText: t("Устгах")
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                }
                            </tr>
                        )
                    })
                }
            </tbody>
        </Table>
    );
};

export default Tables;
