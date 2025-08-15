// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Controller, useForm } from 'react-hook-form'

import { Row, Col, Card, Input, Label, CardTitle, CardHeader, Spinner, Button } from 'reactstrap'

import { ChevronDown, Plus } from 'react-feather'
import { useTranslation } from 'react-i18next'

import Select from 'react-select'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import useUpdateEffect from '@hooks/useUpdateEffect'

import { getPagination, ReactSelectStyles, get_emp_state } from '@utils';
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'

import { getColumns } from './helpers';
import AddModal from './Add';
import UpdateModal from './Edit'

const Position = () => {

    const { t } = useTranslation()

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')
    const [searchValue, setSearchValue] = useState("");

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    const [datas, setDatas] = useState([]);
    const [add_modal, setAddModal] = useState(false)
    const [update_modal, setUpdateModal] = useState(false)
    const [editData, setEditData] = useState({})
    const [edit_id, setEditId] = useState([]);


    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({});
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({});

    // Api
    const positionApi = useApi().hrms.position

    /* Жагсаалтын дата сургууль, тэнхим авах функц */
    async function getDatas() {
        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }
        const { success, data } = await allFetch(positionApi.get(rowsPerPage, currentPage, school_id, searchValue))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    // addModal
    const handleModal =() =>{
        setAddModal(!add_modal)
    }

    useEffect(() => {
        if (searchValue.length == 0) {
            getDatas();
        } else {
            const timeoutId = setTimeout(() => {
                getDatas();
            }, 600);

            return () => clearTimeout(timeoutId);
        }
    },[rowsPerPage, searchValue, currentPage, school_id])

    useUpdateEffect(() => {
        getDatas();
    },[rowsPerPage, searchValue, currentPage, school_id])

    function handleEdit(data) {
        setUpdateModal(!update_modal)
        setEditData(data)
        setEditId(data?.id)
    }

    // ** Function to handle filter
    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    // Хуудас солих үед ажиллах хэсэг
    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    };

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    async function handleDelete(pk) {
        const { success } = await fetchData(positionApi.delete(pk))
        if (success) {
            getDatas()
        }
    }

    return (
        <Fragment>
            <Card>
                {isLoading && Loader}
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                    <CardTitle tag="h4">{t('Албан тушаалын мэдээлэл')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
                            color='primary'
                            disabled={Object.keys(user).length > 0 && school_id  ? false : true}
                            onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className="justify-content-between mx-0 mb-1 mt-1">
                    <Col md={3}>
                        <Label className="form-label" for="salbar">
                            {t('Хайлт')}
                        </Label>
                        <Input
                            type="text"
                            bsSize="sm"
                            id="search-input"
                            value={searchValue}
                            onChange={handleFilter}
                            placeholder={t("Хайх үг....")}
                        />
                    </Col>
                </Row>
                {isTableLoading ?
                    <div className="my-2 text-center" sm={12}>
                        <Spinner size='sm' />
                        <span className='ms-50'>{t("Түр хүлээнэ үү...")}</span>
                    </div>
                :
                    <div className="react-dataTable react-dataTable-selectable-rows mx-1">
                        <DataTable
                            noHeader
                            pagination
                            className='react-dataTable'
                            noDataComponent={(
                                <div className="my-2">
                                    <h5>Өгөгдөл байхгүй байна.</h5>
                                </div>
                            )}
                            columns={getColumns(currentPage, rowsPerPage, total_count, handleEdit, handleDelete, user, school_id)}
                            onSort={handleSort}
                            sortIcon={<ChevronDown size={10} />}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            data={datas}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                        />
                    </div>
                }
            </Card>
            { add_modal && <AddModal open={add_modal} handleModal={handleModal} refreshDatas={getDatas} editData={editData}/> }
			{ update_modal && <UpdateModal open={update_modal} editId={edit_id}  handleEdit={handleEdit} refreshDatas={getDatas} editData={editData} school_id={school_id}/> }
        </Fragment>
    )
}
export default Position;
