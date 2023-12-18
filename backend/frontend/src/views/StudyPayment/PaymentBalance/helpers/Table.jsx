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
        if(Object.keys(user).length > 0 && (user.permissions.includes('lms-payment-balance-delete') || user.permissions.includes('lms-payment-balance-update')) && school_id) {
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
                            <th>
                                {t('Гүйлгээний огноо')}
                            </th>
                            <th>
                                {t('Гүйлгээний дүн')}
                            </th>
                            <th>
                                {t('Гүйлгээний утга')}
                            </th>
                            <th>{t('Tөрөл')}</th>
                            {
                                is_role && !isClosedValue && <th>{t('Үйлдэл')}</th>
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            datas &&
                            datas.map((row, index) => {
                                return (
                                    <tr key={index}>
                                        <td className='text-center'>{((currentPage-1) * rowsPerPage + index + 1)}</td>
                                        <td>{`${row?.student?.code} ${row?.student?.first_name} ${row?.student?.last_name}`}</td>
                                        <td>{row?.balance_date}</td>
                                        <td style={{textAlign: 'right'}}>{row?.balance_amount}</td>
                                        <td>{row?.balance_desc}</td>
                                        <td>
                                            {
                                                row?.flag && (
                                                    row?.flag === 1
                                                    ?
                                                        <Badge color="light-success" pill>
                                                            Төлсөн төлбөр
                                                        </Badge>
                                                    :
                                                        <Badge color="light-info" pill>
                                                            Буцаасан төлбөр
                                                        </Badge>
                                                )
                                            }
                                        </td>
                                        {
                                            is_role && !isClosedValue &&
                                            <td>
                                                {
                                                    <div className="text-center" style={{ width: "auto" }}>
                                                        <a role="button" onClick={() => { handleEditModal(row.id)} }>
                                                            <Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
                                                        </a>
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
                                                        </a>
                                                    </div>
                                                }
                                            </td>
                                        }
                                    </tr>
                                )
                            })
                        }
                        <tr className='fw-bolder'>
                            <td className='text-center'>{t('Нийт дүн')}</td>
                            <td></td>
                            <td></td>
                            <td style={{textAlign: 'right'}}>{CSum?.balance_amount}</td>
                            <td></td>
                            <td></td>
                            {
                                is_role && <td></td>
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
