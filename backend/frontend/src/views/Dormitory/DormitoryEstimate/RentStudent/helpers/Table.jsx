import { useState, useEffect, useContext } from 'react';

import ReactPaginate from "react-paginate";

import { useTranslation } from 'react-i18next';

import { ChevronDown, ChevronUp, Save, Edit } from "react-feather"

import AuthContext from '@context/AuthContext'

import { Previous, Next, isObjEmpty, getFormatedCurrency } from '@utils'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { Input, InputGroup, InputGroupText, Table, Spinner } from 'reactstrap'

import '../../style.css'

const CTable = ({ datas, currentPage, rowsPerPage, page_count, handlePagination, CSum, handleSort, refreshDatas, is_teacher }) => {

    const { isLoading, Loader, fetchData } = useLoader({ isSmall: false, hasBackground: false })

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)

    const [is_permission, setIsPermission] = useState(false);
    const [cdatas, setCDatas] = useState({})
    const [is_edit, setEdit] = useState(false)
    const [index_name, setIndexName] = useState('')
    const [sorting, setSorting] = useState({ field: "contract", ascending: true })

    // Api
    const familyEstimateApi = useApi().dormitory.estimate.family

    if (currentPage > page_count) {
        currentPage = 1
    }

    async function handleChangeInputValue(e, pay_type, idx) {
        const value = e.target.value
        datas[idx][pay_type] = value
        setCDatas(datas[idx])
    }

    async function handleChange(edit_id) {
        setEdit(false)
        if(!isObjEmpty(cdatas) && edit_id) {
            cdatas['id'] = edit_id
            cdatas['is_teacher'] = is_teacher
            const { success } = await fetchData(familyEstimateApi.post(cdatas))
            if(success) {
                setTimeout(() => {
                    refreshDatas()
                }, 100);
            }
        }
    }

    function handleEdit(name, idx) {
        setEdit(true)
        setIndexName(name + '-' + idx)
    }

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-dormitory-estimate-update')) {
            setIsPermission(true)
        }
    },[])

    function iconChange(field) {
        if(sorting.field === field && sorting.ascending) {
            return <ChevronUp size="15" />
        } else {
            return <ChevronDown size="15" />
        }
    }

    function handleSortChange(column, ascending) {
        setSorting({ field: column, ascending: ascending });
        if(ascending) handleSort(column, 'asc')
        else handleSort(column, 'esc')
    }

    return (
        <div className="react-dataTable">
            {
                isLoading &&
                <div className='suspense-loader'>
                    <Spinner size='bg'/>
                    <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                </div>
            }
            <div>
                <Table size='sm' responsive>
                    <thead>
                        <tr>
                            <th className='text-center'>№</th>
                            <th>
                                {t('Овог, Нэр')}
                                <a role="button"
                                    onClick={() => handleSortChange('contract', !sorting.ascending)}
                                >
                                    {iconChange('contract')}
                                </a>
                            </th>
                            <th>
                                {t('Регистр')}
                            </th>
                            <th>
                                {t('Он')}
                                <a role="button"
                                    onClick={() => handleSortChange('year', !sorting.ascending)}
                                >
                                    {iconChange('year')}
                                </a>
                            </th>
                            <th>
                                {t('Сар')}
                                <a role="button"
                                    onClick={() => handleSortChange('month', !sorting.ascending)}
                                >
                                    {iconChange('month')}
                                </a>
                            </th>
                            <th>{t('Хоног')}</th>
                            <th>
                                {t('Эхний үлдэгдэл')}
                            </th>
                            <th>{t('Төлөх төлбөр')}</th>
                            <th>{t('Барьцаа төлбөр')}</th>
                            <th>{t('Буцаах төлбөр')}</th>
                            <th>{t('Төлсөн төлбөр')}</th>
                            <th>{t('Буцаасан төлбөр')}</th>
                            <th>{t('Эцсийн үлдэгдэл')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            datas &&
                            datas.map((row, idx) => {
                                return (
                                    <tr key={idx}>
                                        <td className='text-center'>{((currentPage-1) * rowsPerPage + idx + 1)}</td>
                                        <td>{row?.contract?.teacher?.full_name}</td>
                                        <td>{row?.contract?.teacher?.register}</td>
                                        <td>{row?.year}</td>
                                        <td>{row?.month}</td>
                                        <td>{row?.days}</td>
                                        <td className='text-end'>{getFormatedCurrency(row?.first_uld)}</td>
                                        <td className='text-end'>{getFormatedCurrency(row?.payment)}</td>
                                        <td className='text-end'>{getFormatedCurrency(row?.ransom)}</td>
                                        {
                                            is_permission
                                            ?
                                                <td>
                                                    <InputGroup style={{ minWidth: '180px'}}>
                                                        <Input
                                                            name={`out_payment-${idx}`}
                                                            id={`out_payment-${idx}`}
                                                            key={`out_payment-${idx}`}
                                                            data-idx={idx}
                                                            type="number"
                                                            bsSize='sm'
                                                            disabled={(is_edit && `out_payment-${idx}` === index_name) ? false : true}
                                                            readOnly={(is_edit && `out_payment-${idx}` === index_name) ? false : true}
                                                            defaultValue={row?.out_payment || 0}
                                                            onChange={e => handleChangeInputValue(e, 'out_payment', idx)}
                                                        />
                                                        <InputGroupText>
                                                            {
                                                                is_edit && `out_payment-${idx}` === index_name
                                                                ?
                                                                    <Save key={idx} size={15} onClick={() => handleChange(row?.id)} />
                                                                :
                                                                    <Edit key={idx} size={15} onClick={() => handleEdit('out_payment', idx)} />
                                                            }

                                                        </InputGroupText>
                                                    </InputGroup>
                                                </td>
                                            :
                                                <td className='text-end'>{getFormatedCurrency(row?.out_payment)}</td>
                                        }
                                        <td className='text-end'>{getFormatedCurrency(row?.in_balance)}</td>
                                        {
                                            is_permission
                                            ?
                                                <td>
                                                    <InputGroup style={{ minWidth: '180px'}}>
                                                        <Input
                                                            name={`out_balance-${idx}`}
                                                            id={`out_balance-${idx}`}
                                                            key={`out_balance-${idx}`}
                                                            data-idx={idx}
                                                            defaultValue={row?.out_balance || 0}
                                                            bsSize="sm"
                                                            type="number"
                                                            placeholder={t('0')}
                                                            disabled={`out_balance-${idx}` !== index_name}
                                                            readOnly={`out_balance-${idx}` !== index_name}
                                                            onChange={e => handleChangeInputValue(e, 'out_balance', idx)}
                                                        />
                                                        <InputGroupText>
                                                            {
                                                                is_edit && `out_balance-${idx}` === index_name
                                                                ?
                                                                    <Save key={idx} size={15} onClick={() => handleChange(row?.id)} />
                                                                :
                                                                    <Edit key={idx} size={15} onClick={() => handleEdit('out_balance', idx)} />
                                                            }
                                                        </InputGroupText>
                                                    </InputGroup>
                                                </td>
                                            :
                                                <td className='text-end'>{getFormatedCurrency(row?.out_balance)}</td>
                                        }
                                        <td className='text-end'>{getFormatedCurrency(row?.lastuld)}</td>
                                    </tr>
                                )
                            })
                        }
                        <tr className='fw-bolder text-end'>
                            <td style={{textAlign: 'center'}}>{t('Нийт дүн')}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>{getFormatedCurrency(CSum?.payment)}</td>
                            <td>{getFormatedCurrency(CSum?.ransom)}</td>
                            <td>{getFormatedCurrency(CSum?.out_payment)}</td>
                            <td>{getFormatedCurrency(CSum?.in_balance)}</td>
                            <td>{getFormatedCurrency(CSum?.out_balance)}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </Table>
                <ReactPaginate
                    previousLabel={<Previous size={15} />}
                    nextLabel={<Next size={15} />}
                    forcePage={(currentPage > page_count) ? 0 : (currentPage !== 0 ? currentPage - 1 : 0)}
                    onPageChange={(page) => {
                        handlePagination(page)
                    }}
                    pageCount={page_count || 1}
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
