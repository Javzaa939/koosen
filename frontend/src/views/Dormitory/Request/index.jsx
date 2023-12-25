import { Fragment, useState, useContext, useEffect } from "react"

import { t } from "i18next"

import DataTable from "react-data-table-component"

import { ChevronDown, Search, Plus } from "react-feather"

import { Card, CardHeader, CardTitle, Col, Row, Input, Label, Button, Spinner } from "reactstrap"

import { getPagination, ReactSelectStyles, get_states} from '@utils'
import { useForm, Controller } from "react-hook-form";

import AuthContext from '@context/AuthContext'

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';
import Select from 'react-select'
import classnames from 'classnames'

import { getColumns } from './helpers';
import AddModal from "./Add"
import EditModal from './Edit'

const InventoryRequest = () => {

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})
    const {  formState: { errors }, setError } = useForm()

    //Context
    const { user } = useContext(AuthContext)
    // const { school_id } = useContext(SchoolContext)

    const [datas, setDatas] = useState([])

    //useState
    const [currentPage, setCurrentPage] = useState(1);
    const [total_count, setTotalCount] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [modal, setModal] = useState(false);

    const [search, setSearchValue] = useState("");
    const [edit_id, setEditId] = useState('')

    const [sortField, setSort] = useState('')
    const [edit_modal, setEditModal] = useState(false)
    const [stateId, setStateId] = useState('')
    const state_option = get_states()

    const dormitoryRequestApi = useApi().dormitory.inv_request

    async function getDatas() {
        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }
        const { success, data } = await allFetch(dormitoryRequestApi.get(rowsPerPage, currentPage, sortField, search, stateId))
        if (success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-dormitory-inventory-request-read')? true: false){

            if (search.length == 0) {
                getDatas();
            } else {
                const timeoutId = setTimeout(() => {
                    getDatas();
                }, 600);
    
                return () => clearTimeout(timeoutId);
            }
        }
	}, [rowsPerPage, currentPage, sortField,search, stateId]);

    /* Модал setState функц */
	const handleModal = () => {
		setModal(!modal)
	}

    /* Устгах функц */
	const handleDelete = async(row) => {
        const { success } = await fetchData(dormitoryRequestApi.delete(row))
        if(success)
        {
            getDatas()
        }
	};

     // Засах функц
    const handleEditModal = (id) => {
        setEditId(id)
        setEditModal(!edit_modal)
    }

    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        getDatas()
    }

    // Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // Нийт датаны тоо
    const default_page = [10, 15, 50, 75, 100]

    function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    return (
        <Fragment>
            <Card>
            {isLoading && Loader}
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                    <CardTitle tag="h5">{t('Шаардах хуудасны жагсаалт')}</CardTitle>
                    <div className='d-flex flex-wrap mt-0'>
                        <Button
                            color='primary'
                            onClick={() => handleModal()}
                            disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-dormitory-inventory-request-create') ? false : true}
                        >
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className='mt-1 d-flex justify-content-between mx-0 mb-1 mt-1'>
                    <Col className='d-flex align-items-center justify-content-start '>
                        <Col md={2} sm={3} className='pe-1'>
                            <Input
                                className='dataTable-select me-1 mb-50'
                                type='select'
                                bsSize='sm'
                                style={{ height: "30px",}}
                                value={rowsPerPage}
                                onChange={e => handlePerPage(e)}
                            >
                                {
                                    default_page.map((page, idx) => (
                                    <option
                                        key={idx}
                                        value={page}
                                    >
                                        {page}
                                    </option>
                                ))}
                            </Input>
                        </Col>
                        <Col md={10} sm={3}>
                            <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                        </Col>
                    </Col>
                      <Col md={3} sm={3}>
                            <Label className='form-label'>
                                Төлөвөөр хайх
                            </Label>
                                <Select
                                    name="state"
                                    id="state"
                                    classNamePrefix='select'
                                    isClearable
                                    className={classnames('react-select')}
                                    placeholder={t(`-- Сонгоно уу --`)}
                                    options={state_option || []}
                                    value={state_option.find((c) => c.id === stateId)}
                                    noOptionsMessage={() => t('Хоосон байна.')}
                                    onChange={(val) => {
                                        setStateId(val?.id || '')
                                    }}
                                    styles={ReactSelectStyles}
                                    getOptionValue={(option) => option.id}
                                    getOptionLabel={(option) => option.name}
                                />
                        </Col>
                    <Col className='d-flex align-items-center mobile-datatable-search'>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder={t('Хайх')}
                            value={search}
                            onChange={handleFilter}
                            onKeyPress={e => e.key === 'Enter' && handleSearch()}
                        />
                        <Button
                            size='sm'
                            className='ms-50 mb-50'
                            color='primary'
                            onClick={handleSearch}
                        >
                            <Search size={15} />
                            <span className='align-middle ms-50'></span>
                        </Button>
                    </Col>
                </Row>
                <div className="react-dataTable react-dataTable-selectable-rows " id='datatableLeftTwoRightOne'>
                    <DataTable
                        noHeader
                        pagination
                        paginationServer
                        className='react-dataTable'
                        progressPending={isTableLoading}
                        progressComponent={
                            <div className='my-2 d-flex align-items-center justify-content-center'>
                                <Spinner className='me-1' color="" size='sm'/><h5>Түр хүлээнэ үү...</h5>
                            </div>
                        }
                        noDataComponent={(
                            <div className="my-2">
                                <div className="my-2">
                                    <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                </div>
                            </div>
                        )}
                        onSort={handleSort}
                        sortIcon={<ChevronDown size={10} />}
                        columns={getColumns(currentPage, rowsPerPage, total_count, handleEditModal, handleDelete)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
                {modal && <AddModal open={modal} handleModal={handleModal} refreshDatas={getDatas} />}
                {edit_modal && <EditModal open={edit_modal} handleEdit={handleEditModal} editId={edit_id} refreshDatas={getDatas} />}
            </Card>
        </Fragment>
    )
}
export default InventoryRequest
