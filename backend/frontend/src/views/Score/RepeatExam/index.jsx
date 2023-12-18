import React, { Fragment, useState, useEffect, useContext } from 'react'

import { Col, Button, Input, Card, CardHeader, CardTitle, Row, Spinner,Label } from 'reactstrap'

import { useTranslation } from "react-i18next"

import { ChevronDown, Search } from "react-feather"

import { useForm, Controller } from "react-hook-form";

import Select from 'react-select'

import useApi from '@hooks/useApi';

import useLoader from '@hooks/useLoader';

import DataTable from 'react-data-table-component'

import classnames from 'classnames'

import SchoolContext from '@context/SchoolContext'

import { getPagination, get_EXAM_STATUS, ReactSelectStyles } from '@utils'

import { getColumns } from "./helpers"

import Editmodal from "./Edit"

export default function ExamRepeat() {

    const { t } = useTranslation()
    const { school_id } = useContext(SchoolContext)

	// Эрэмбэлэлт
	const [sortField, setSortField] = useState('')

	const default_page = [10, 15, 50, 75, 100]

	const [rowsPerPage, setRowsPerPage] = useState(10)

	const [currentPage, setCurrentPage] = useState(1);

	const [edit_id, setEditId] = useState('')

	const [datas, setDatas] = useState([]);

	const [status_id, setStatusId] = useState('')

	const [searchValue, setSearchValue] = useState("");

    const [lesson_id, setLessonId] = useState('')

    const [student_id, setStudentId] = useState('')

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: true})

	const [statusOption] = useState(get_EXAM_STATUS())

    const [lessonOption, setLesson] = useState([])

    // ** Hook
    const { control, formState: { errors } } = useForm({});

	// нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

	// Modal
	const [edit_modal, setEditModal] = useState(false);

	// Api
    const lessonApi = useApi().study.lessonStandart
    const scoreApi = useApi().score.rescore

    const handleEdit = () => {
        setEditModal(!edit_modal)
    }

	/** Засах модал */
    async function handleEditModal(edit_id, student_id) {
        handleEdit()
        setEditId(edit_id)
        setStudentId(student_id)
    }

    // Хичээлийн жагсаалт
    async function getLesson() {
        const { success, data } = await fetchData(lessonApi.getList())
        if(success) {
            setLesson(data)
        }
    }

    /* Жагсаалт сорт хийж байгаа функц */
    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSortField(column.header)
        } else {
            setSortField('-' + column.header)
        }
    }

	async function getDatas() {
        if(lesson_id && school_id )
        {
            const { success, data } = await allFetch(scoreApi.get( searchValue, status_id, lesson_id, sortField))
            if(success) {
                setDatas(data)
                setTotalCount(data?.count)
            }
        }
    }

    useEffect(() => {
        if (school_id){
            if (searchValue.length == 0) {
                getDatas();
                getLesson()
            } else {
                const timeoutId = setTimeout(() => {
                    getDatas();
                    getLesson()
                }, 600);

                return () => clearTimeout(timeoutId);
            }
        }
    }, [ school_id, searchValue, status_id, lesson_id, sortField])


    function refreshDatas(){
        getDatas()
    }
	function handleSearch() {
        getDatas()
    }

    // Хайлт хийх үед ажиллах хэсэг
	const handleFilter = (e) => {
		const value = e.target.value.trimStart();
		setSearchValue(value);
	};

    // Хуудас солих үед ажиллах хэсэг
    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    };

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    return (
        <Fragment>
            <Card>
                {isLoading && Loader}
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                    <CardTitle tag="h4">{t('Дахин шалгалтын дүн')}</CardTitle>
                </CardHeader>
                <Row className='mx-0 mt-50'>
                <Col sm={4} lg={4} md={4} className='mb-1'>
                        <Label className="form-label" for="lesson">
                            {t('Хичээл')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="lesson"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="lesson"
                                        id="lesson"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                        isLoading={isLoading}
                                        placeholder={t(`-- Сонгоно уу --`)}
                                        options={lessonOption || []}
                                        value={lessonOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setLessonId(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.full_name}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col sm={4} lg={4} md={4} className='mb-1'>
                        <Label className="form-label" for="status">
                        	{t('Шалгалтын төлөв')}
                        </Label>
                        <Select
                            name="status"
                            id="status"
                            classNamePrefix='select'
                            isClearable
                            className={'react-select'}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={statusOption || []}
                            value={status_id && statusOption.find((c) => c.id === status_id)}
                            noOptionsMessage={() => t('Хоосон байна')}
                            onChange={(val) => {
                                setStatusId(val?.id || '')
                            }}
                            styles={ReactSelectStyles}
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
							progressPending={isTableLoading}
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
							columns={getColumns(currentPage, rowsPerPage, total_count, handleEditModal)}
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
				{edit_modal && <Editmodal editId={edit_id} open={edit_modal} handleEdit={handleEdit} refreshDatas={refreshDatas} datas={datas} lesson_id={lesson_id} student_id={student_id}/>}
            </Card>
        </Fragment>
    )
};

