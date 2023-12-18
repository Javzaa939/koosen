import { useState, useEffect, useMemo } from 'react';

import { Button, Table } from 'reactstrap'

import ReactPaginate from "react-paginate";

import { useTranslation } from 'react-i18next';

import { AlignRight, ChevronDown, ChevronUp } from "react-feather"

import { Previous, Next } from '@utils'

import './style.css'
import { right } from '@popperjs/core';

const CTable = ({ datas, currentPage, rowsPerPage, pageCount, handlePagination, CSum, handleSort }) => {

    const { t } = useTranslation()

    const [sort, setSort] = useState(false);
    const [col_name, setColName] = useState('');

    if (currentPage > pageCount) {
        currentPage = 1
    }

    const iconChange = useMemo(() => {
		return (
            sort
            ?
                <ChevronDown size="15" />
            :
                <ChevronUp size="15" />
		);
	}, [sort]);

    function handleSortChange(column) {
        setSort(!sort)
        setColName(column)
    }

    useEffect(() => {
        if(col_name) {
            if(sort) {
                handleSort(col_name, 'asc')
            } else {
                handleSort(col_name, 'desc')
            }
        }
    }, [sort])

    return (
        <div className="react-dataTable" >
            <div>
                <Table size='sm' responsive>
                    <thead>
                        <tr>
                            <th className='text-center'>№</th>
                            <th className='text-center'>
                                {t('Оюутан')}
                                <a role="button"
                                    onClick={() => handleSortChange('student')}
                                >
                                    {iconChange}
                                </a>
                            </th>
                            <th>
                                {t('Багц цаг')}
                            </th>
                            <th>
                                {t('Эхний.үлд илүү')}
                            </th>
                            <th>{t('Эхний.үлд дутуу')}</th>
                            <th>
                                {t('Төлбөл зохих')}
                            </th>
                            <th>
                                {t('Хөнгөлөлт')}
                            </th>
                            <th>{t('Төлсөн')}</th>
                            <th>{t('Буцаасан')}</th>
                            <th>{t('Эцсийн.үлд илүү')}</th>
                            <th>{t('Эцсийн.үлд дутуу')}</th>
                        </tr>
                    </thead>
                    <tbody >
                        {
                            datas &&
                            datas.map((row, index) => {
                                return (
                                    <tr key={index} style={{textAlign: right}}>
                                        <td style={{textAlign: 'center'}}>{((currentPage-1) * rowsPerPage + index + 1)}</td>
                                        <td style={{textAlign: 'center'}}>{row?.student && row?.student?.code +" "+ row?.student?.last_name +" "+ row?.student?.first_name}</td>
                                        <td style={{textAlign: 'center'}}>{row?.kredit}</td>
                                        <td>{row?.first_balance_iluu}</td>
                                        <td>{Math.abs(row?.first_balance_dutuu)}</td>
                                        <td>{row?.payment}</td>
                                        <td>{row?.discount}</td>
                                        <td>{row?.in_balance}</td>
                                        <td>{row?.out_balance}</td>
                                        <td>{row?.last_balance_iluu}</td>
                                        <td>{Math.abs(row?.last_balance_dutuu)}</td>
                                    </tr>
                                )
                            })
                        }
                        <tr className='fw-bolder' style={{textAlign: right}}>
                            <td style={{textAlign: 'center'}}>{t('Нийт дүн')}</td>
                            <td></td>
                            <td></td>
                            <td>{CSum?.first_balance_iluu}</td>
                            <td>{Math.abs(CSum?.first_balance_dutuu)}</td>
                            <td>{CSum?.payment}</td>
                            <td>{CSum?.discount}</td>
                            <td>{CSum?.in_balance}</td>
                            <td>{CSum?.out_balance}</td>
                            <td>{CSum?.last_balance_iluu}</td>
                            <td>{Math.abs(CSum?.last_balance_dutuu)}</td>
                        </tr>
                    </tbody>
                </Table>
                <ReactPaginate
                    previousLabel={<Previous size={15} />}
                    nextLabel={<Next size={15} />}
                    forcePage={(currentPage > pageCount) ? 0 : (currentPage !== 0 ? currentPage - 1 : 0)}
                    onPageChange={(page) => {
                        handlePagination(page)
                    }}
                    pageCount={pageCount || 1}
                    breakLabel={'...'}
                    pageRangeDisplayed={2}
                    marginPagesDisplayed={2}
                    activeClassName='active'
                    pageClassName='page-item'
                    nextLinkClassName='page-link'
                    nextClassName='page-item next'
                    previousClassName='page-item prev'
                    previousLinkClassName='page-link'
                    pageLinkClassName='page-link'
                    breakClassName='page-item'
                    breakLinkClassName='page-link'
                    containerClassName='pagination react-paginate pagination-sm justify-content-end pe-1 mt-1'
                />
            </div>
        </div>
        )
    }
export default CTable
