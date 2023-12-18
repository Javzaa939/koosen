
import { useState, useEffect } from 'react'

import { t } from 'i18next'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { useForm, Controller } from "react-hook-form";

import { Button, Badge, Input, InputGroup, InputGroupText } from 'reactstrap'

import { Save, Edit } from 'react-feather';

import { isObjEmpty } from '@utils'

import css from '@mstyle/style.module.css'

export function getColumns (currentPage, rowsPerPage, total_count, datas, refreshDatas, handleRequestSolved, handleViewModal) {
    const page_count = Math.ceil(total_count / rowsPerPage)

    const { isLoading, Loader, fetchData } = useLoader({ isSmall: false, hasBackground: false })

    // Api
    const familyEstimateApi = useApi().dormitory.estimate.family

    if (currentPage > page_count) {
        currentPage =1
    }

    // State
    const [cdatas, setCDatas] = useState({})
    const [is_edit, setEdit] = useState(false)
    const [is_disabled, setIsDisabled] = useState(false)
    const [index_name, setIndexName] = useState('')

    async function handleChangeInputValue(e, pay_type, idx) {
        const value = e.target.value
        datas[idx][pay_type] = value
        setCDatas(datas[idx])
    }

    async function handleChange(edit_id) {
        setEdit(false)
        if(!isObjEmpty(cdatas) && edit_id) {
            const { success, data } = await fetchData(familyEstimateApi.put(cdatas, edit_id))
            if(success) {
                setIsDisabled(true)
                refreshDatas()
            }
        }
    }

    function handleEdit(name, idx) {
        setEdit(true)
        setIndexName(name + '-' + idx)
    }

    const columns = [
        {
            name: "№",
            selector: (row, index) => (currentPage-1) * rowsPerPage + 1 + index,
            maxWidth: "30px",
            center: "true"
        },
        {
            sortField: "contract",
            name: `${t('Овог, Нэр')}`,
            selector: (row) => row?.contract?.teacher?.full_name,
            minWidth: "220px",
            center: "true",
            wrap: true,
            sortable: true,
        },
        {
            sortField: "contract",
            name: `${t('Регистр')}`,
            selector: (row) => row?.contract?.teacher?.register,
            minWidth: "150px",
            center: "true",
            wrap: true,
            sortable: true,
        },
        {
            sortField: "year",
            name: `${t('Он')}`,
            selector: (row) => row?.year,
            minWidth: "50px",
            center: "true",
            wrap: true,
        },
        {
            sortField: "month",
            name: `${t('Сар')}`,
            selector: (row) => row?.month,
            minWidth: "150px",
            center: "true",
        },
        {
            sortField: "first_uld",
            name: `${t('Эхний үлдэгдэл')}`,
            selector: (row) => row?.first_uld,
            minWidth: "150px",
            center: "true",
            wrap: true,
        },
        {
            sortField: "payment",
            name: `${t('Төлөх төлбөр')}`,
            selector: (row) => row?.payment,
            minWidth: "150px",
            center: "true",
        },
        {
            sortField: "ransom",
            name: `${t('Барьцаа төлбөр')}`,
            selector: (row) => row?.ransom,
            minWidth: "150px",
            center: "true",
        },
        {
            sortField: "in_balance",
            name: `${t('Төлсөн төлбөр')}`,
            selector: (row) => row?.in_balance,
            minWidth: "150px",
            center: "true",
        },
        {
            sortField: "lastuld",
            name: `${t('Эцсийн үлдэгдэл')}`,
            selector: (row) => row?.lastuld || 0,
            minWidth: "150px",
            sortable: true,
            center: "true",
        },
        {
            sortField: "out_payment",
            name: `${t('Буцаах төлбөр')}`,
            selector: (row, idx) => (
                <InputGroup>
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
            ),
            minWidth: "250px",
            center: "true",
        },
        {
            sortField: "out_balance",
            name: `${t('Буцаасан төлбөр')}`,
            selector: (row, idx) => (
                <InputGroup>
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
            ),
            minWidth: "200px",
            center: "true",
        },
    ]
    return columns
}
