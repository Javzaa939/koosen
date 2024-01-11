import React from "react";
import { Fragment, useState, useEffect, useContext } from 'react'
import {
    Row,
    Col,
    Card,
    Input,
    Label,
    Button,
    CardTitle,
    CardHeader,
    Spinner
} from 'reactstrap'

import { ChevronDown, Plus, Search } from 'react-feather'
import DataTable from 'react-data-table-component'
import useApi from '@hooks/useApi';
import useModal from '@hooks/useModal'
import Select from 'react-select'

import useLoader from '@hooks/useLoader';
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'

import useUpdateEffect from '@hooks/useUpdateEffect'

import { getPagination } from '@utils'
import { getColumns } from './helpers'

import { useTranslation } from "react-i18next";

import Createmodal from './Add'


const Yvsan  = () => {

    var values = {
        student: '',
        school: '',
        statement: '',
    }

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const default_page = [10, 15, 50, 75, 100]
    const { t } = useTranslation()
    const [is_check, setCheck] = useState(false)
    const [datas, setDatas] = useState([])
    const [edit_modal, setEditModal] = useState(false)
    const [modal, setModal] = useState(false)
    const [student_id, setStudentId] = useState('')

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
     const [rowsPerPage, setRowsPerPage] = useState(10)

    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
    const [select_value, setSelectValue] = useState(values)
    const studentmovementApi = useApi().student.movement

    useEffect(() => {
        getDatas()
    }, [sortField, currentPage, rowsPerPage, is_check, school_id])

    async function getDatas() {

        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        const { success, data } = await fetchData(studentmovementApi.get(rowsPerPage, currentPage, sortField, searchValue, is_check))
        if(success)
        {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    // ** Function to handle filter
    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    // Хуудас солих үед ажиллах хэсэг
	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

    /* Устгах функц */
	const handleDelete = async(id) => {
        const { success } = await fetchData(studentmovementApi.delete(id))
        if(success)
        {
            getDatas()
        }
	};

    // ** Function to handle perPage
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // ** Function to handle Modal toggle
    const handleModal = (student_id) => {
        setStudentId(student_id)
        setModal(!modal)
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        if (searchValue.length > 0) getDatas()

    }
    // Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
	useUpdateEffect(() => {
		if (searchValue.length == 0) {
			getDatas();
		} else {
			const timeoutId = setTimeout(() => {
				getDatas();
			}, 600);

			return () => clearTimeout(timeoutId);
		}
	}, [searchValue]);


    return (
        <Fragment>
            <Card>
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom pt-0'>
                    <CardTitle tag='h4'>{t('Шилжиж явсан оюутны бүртгэл')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
                            color='primary'
                            disabled={Object.keys(user).length > 0 && (user.permissions.includes('lms-student-movement-create'))  ? false : true}
                            onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className='justify-content-between mx-0 mt-1'>
                    <Col className='d-flex align-items-center justify-content-start' md={4} sm={12} style={{ width: "470px" }}  >
                        <Col md={2} sm={6} className='pe-1'>
                            <Input
                                className='dataTable-select me-1 mb-50'
                                type='select'
                                bsSize='sm'
                                style={{ height: "30px"}}
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
                        <Col md={10} sm={3} className="">
                            <Label for='sort-select'>{t("Хуудсанд харуулах тоо")}</Label>
                        </Col>
                    </Col>
                    <Col className='d-flex align-items-center justify-content-start mt-1' md={4} sm={12} lg={3}>
                       <Input
                            type='checkbox'
                            className="dataTable-check mb-50 me-1"
                            defaultValue={is_check}
                            checked={is_check}
                            onChange={(e) => setCheck(e.target.checked)}
                        >
                       </Input>
                       <Label className="checkbox-wrapper">{t('Дотоод шилжилт')}</Label>
                    </Col>
                    <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={4} sm={12} lg={3}>
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
                <div className='react-dataTable react-dataTable-selectable-rows' id='datatableLeftTwoRightOne'>
                    <DataTable
                        noHeader
                        pagination
                        paginationServer
                        className='react-dataTable'
                        progressPending={isLoading}
                        progressComponent={
                            <div className='my-2 d-flex align-items-center justify-content-center'>
                                <Spinner className='me-1' color="" size='sm'/><h5>Түр хүлээнэ үү...</h5>
                            </div>
                        }
                        noDataComponent={(
                            <div className="my-2">
                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                            </div>
                        )}
                        onSort={handleSort}
                        sortIcon={<ChevronDown size={10} />}
                        columns={getColumns(currentPage, rowsPerPage, total_count, handleModal, handleDelete, user)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
            {modal && <Createmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} edit_id={student_id}/>}
        </Fragment>
    )
}
export default Yvsan;
