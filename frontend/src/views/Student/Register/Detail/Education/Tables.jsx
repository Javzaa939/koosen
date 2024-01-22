import React from 'react';

import { Table } from 'reactstrap';

import { Trash2 } from 'react-feather';

import useModal from '@hooks/useModal'

import css from '@mstyle/style.module.css'

import { t } from 'i18next';

const Tables = (props) => {

    const { datas, handleDelete, handleEdit, is_role, edu_option } = props

    const { showWarning } = useModal()

    const getEduName = (eduId) => {
        var result = edu_option.find(element => element.id == eduId)
        return result.name
    }

    return (
        <Table size='sm' responsive>
            <thead>
                <tr>
                    <th>#</th>
                    <th>{t('Сургуулийн нэр')}</th>
                    <th>{t("Улс")}</th>
                    <th>{t('Боловсролын түвшин')}</th>
                    <th>{t('Элссэн он')}</th>
                    <th>{t("Төгссөн он")}</th>
                    <th>{t('Эзэмшсэн Хөтөлбөр')}</th>
                    <th>{t('Диплом/Сертификатын дугаар')}</th>
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
                                        {data.school_name}
                                    </a>
                                </td>
                                <td>{data.country?.name}</td>
                                <td>{getEduName(data.edu_level)}</td>
                                <td>{data.join_year}</td>
                                <td>{data.graduate_year}</td>
                                <td>{data.profession}</td>
                                <td>{data.certificate_num}</td>
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
