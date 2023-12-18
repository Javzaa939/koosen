import React, { Fragment, useState, useEffect, useContext } from 'react'

import { Col, Button, Input, Card, CardHeader, CardTitle, Row, Spinner,Label } from 'reactstrap'

import { useTranslation } from "react-i18next"

import { ChevronDown, Plus, Search } from "react-feather"

import Select from 'react-select'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"

import DataTable from 'react-data-table-component'

import { getPagination, get_EXAM_STATUS, ReactSelectStyles } from '@utils'

import { getColumns } from "./helpers"

import Addmodal from './Add'
import Editmodal from "./Edit"

export default function ExamRepeat() {

    const { t } = useTranslation()
	const { user } = useContext(AuthContext)
	const { school_id } = useContext(SchoolContext)

	// Эрэмбэлэлт
	const [sortField, setSort] = useState('')

	const default_page = [10, 15, 50, 75, 100]

	const [rowsPerPage, setRowsPerPage] = useState(10)

	const [currentPage, setCurrentPage] = useState(1);

	const [edit_id, setEditId] = useState('')

	const [datas, setDatas] = useState([]);
	const [status_id, setStatusId] = useState('')

	const [searchValue, setSearchValue] = useState("");

    const { isLoading, fetchData } = useLoader({});
	const [statusOption, setStatusOption] = useState(get_EXAM_STATUS())

	// нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

	// Modal
	const [modal, setModal] = useState(false);
	const [edit_modal, setEditModal] = useState(false);

	// Api
    const reExamApi = useApi().timetable.re_exam

	// Хуудас солих үед ажиллах хэсэг
    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    };

	/* Нэмэх модал setState функц */
	const handleModal = () =>{
		setModal(!modal)
	}

	/** Засах модал */
    function handleEditModal(edit_id) {
        setEditId(edit_id)
        setEditModal(!edit_modal)
    }

	async function handleDelete(id) {
		const { success } = await fetchData(reExamApi.delete(id))
		if(success) {
			getDatas()
		}
	}

	// ** Function to handle per page
	function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

	/* Жагсаалт сорт хийж байгаа функц */
	function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

	// API Холбож дата авчирна
	async function getDatas() {
        const { success, data } = await fetchData(reExamApi.get(rowsPerPage, currentPage, sortField, searchValue, status_id))
        if(success) {
            setDatas(data?.results)
			setTotalCount(data?.count)
        }
    }

	useEffect(() => {
        getDatas()
    }, [rowsPerPage, currentPage, sortField, searchValue, status_id])


	function handleSearch() {
        getDatas()
    }

	const handleFilter = (e) => {
		const value = e.target.value.trimStart();
		setSearchValue(value);
	};

    return (
        <Fragment>
            <Card>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                    <CardTitle tag="h4">{t('Дахин шалгалт')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button color='primary' disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-timetable-examrepeat-create') && school_id ? false : true} onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className=" d-flex justify-content-between mx-0 mt-1">
                    <Col md={4} className='mb-1'>
                        <Label className="form-label me-1" for="status">
                        	{t('Шалгалтын төлөв')}
                        </Label>
                        <Select
                            name="status"
							id="status"
							classNamePrefix='select'
							isClearable
							className={'react-select'}
							isLoading={isLoading}
							options={statusOption || []}
							placeholder={t('-- Сонгоно уу --')}
							noOptionsMessage={() => t('Хоосон байна')}
							styles={ReactSelectStyles}
							value={status_id && statusOption.find((c) => c.id === status_id)}
							onChange={(val) => {
								setStatusId(val?.id || '')
							}}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.name}
						/>
                    </Col>
				</Row>
				<Row className='justify-content-between mx-0 mb-1'>
					<Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
                        <Col md={2} sm={3} className='pe-1'>
                            <Input
                                type='select'
                                bsSize='sm'
                                style={{ height: "30px" }}
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
					<Col className='d-flex align-items-center mobile-datatable-search mt-1' md={4} sm={12}>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder={t('Хайх')}
                            value={searchValue}
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
				{
					isLoading
                    ?
                        <div className="my-2 text-center" sm={12}>
                            <Spinner size='sm' />
                            <span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
                        </div>
                    :
					<div className='react-dataTable react-dataTable-selectable-rows'>
						<DataTable
							noHeader
							pagination
							className='react-dataTable'
							progressPending={isLoading}
							progressComponent={(
								<div className='my-2'>
									<h5>{t('Түр хүлээнэ үү')}...</h5>
								</div>
							)}
							noDataComponent={(
								<div className="my-2">
									<h5>{t('Өгөгдөл байхгүй байна')}</h5>
								</div>
							)}
							onSort={handleSort}
							columns={getColumns(currentPage, rowsPerPage, total_count, user, handleEditModal, handleDelete)}
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
				{modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} />}
				{edit_modal && <Editmodal editId={edit_id} open={edit_modal} handleModal={handleEditModal} refreshDatas={getDatas}/>}
            </Card>
        </Fragment>
    )
};

