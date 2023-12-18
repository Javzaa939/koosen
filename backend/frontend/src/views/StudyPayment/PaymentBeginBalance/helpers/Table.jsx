import { useState, useEffect, useMemo, useContext } from 'react';

import { Table, Badge } from 'reactstrap'

import ReactPaginate from "react-paginate";

import { useTranslation } from 'react-i18next';

import { ChevronDown, ChevronUp, X, Edit } from "react-feather"

import useModal from '@hooks/useModal'
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'

import { Previous, Next } from '@utils'

import css from '@mstyle/style.module.css'

import './style.css'

const CTable = ({ datas, currentPage, rowsPerPage, pageCount, handlePagination, CSum, handleSort, handleDelete, handleEditModal, isClosedValue }) => {

    const { t } = useTranslation()
    const { showWarning } = useModal()
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    const [sort, setSort] = useState(false);
    const [col_name, setColName] = useState('');

    const [ is_role, setIsRole ] = useState(false);

    if (currentPage > pageCount) {
        currentPage = 1
    }

    useEffect(() => {
        if(Object.keys(user).length > 0 && school_id) {
            setIsRole(true)
        }
    },[])

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
                            <th>
                                {t('Оюутан')}
                                <a role="button"
                                    onClick={() => handleSortChange('student')}
                                >
                                    {iconChange}
                                </a>
                            </th>
                            <th style={{textAlign: 'right'}}>
                                {t('Эхний үлдэгдэл илүү')}
                            </th>
                            <th style={{textAlign: 'right'}}>
                                {t('Эхний үлдэгдэл дутуу')}
                            </th>
                            {
                                is_role && <th></th>
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            datas &&
                            datas.map((row, index) => {
                                return (
                                    <tr key={index}>
                                        <td className='text-center bg-transparent'>{((currentPage-1) * rowsPerPage + index + 1)}</td>
                                        <td className='bg-transparent'>{`${row?.student?.code} ${row?.student?.first_name} ${row?.student?.last_name}`}</td>
                                        <td className='bg-transparent' style={{textAlign: 'right'}}>{row?.first_balance_iluu}</td>
                                        <td className='bg-transparent' style={{textAlign: 'right'}}>{Math.abs(row?.first_balance_dutuu)}</td>
                                        {
                                            is_role && !isClosedValue &&
                                            <td>
                                                {
                                                    <div className="text-center" style={{ width: "auto" }}>
                                                        {
                                                            (user.permissions.includes('lms-payment-beginbalance-update'))&&
                                                            <a role="button" onClick={() => { handleEditModal(row.id)} }>
                                                                <Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
                                                            </a>
                                                        }
                                                        {
                                                            (user.permissions.includes('lms-payment-beginbalance-delete'))&&
                                                            <a role="button"
                                                                onClick={() => showWarning({
                                                                    header: {
                                                                        title: t(`Сургалтын төлбөрийн гүйлгээ устгах`),
                                                                    },
                                                                    question: t(`Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?`),
                                                                    onClick: () => handleDelete(row.id),
                                                                    btnText: t('Устгах'),
                                                                })}
                                                            >
                                                                <Badge color="light-danger" pill><X width={"100px"} /></Badge>
                                                                {/* <Trash2 color="red" width={"15px"} /> */}
                                                            </a>
                                                        }
                                                    </div>
                                                }
                                            </td>
                                        }
                                    </tr>
                                )
                            })
                        }
                        <tr className='fw-bolder bg-transparent'>
                            <td colSpan={2} className='text-center bg-transparent'>{t('Нийт дүн')}</td>
                            <td className='bg-transparent' style={{textAlign: 'right'}}>{CSum?.first_balance_iluu}</td>
                            <td className='bg-transparent' style={{textAlign: 'right'}}>{Math.abs(CSum?.first_balance_dutuu)}</td>
                            {
                                is_role && <td className='bg-transparent'></td>
                            }
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
