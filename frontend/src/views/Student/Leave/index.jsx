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
    Spinner,
} from 'reactstrap'

import Addleavemodal from './Add';

import { useTranslation } from "react-i18next";
import { ChevronDown, Edit, FileText, Plus, Printer, Search } from 'react-feather'

import useLoader from '@hooks/useLoader';
import useUpdateEffect from '@hooks/useUpdateEffect'
import DataTable from 'react-data-table-component'

import { getColumns } from './helpers'
import AuthContext from '@context/AuthContext'
import { getPagination } from '@utils'
import SchoolContext from '@context/SchoolContext'
import useApi from '@hooks/useApi';

import EditModal from './Edit'

import Select from 'react-select'
import {  ReactSelectStyles, generateLessonYear } from "@utils"

import TushaalModal from './TushaalModal'
import { useNavigate } from 'react-router-dom';
import excelDownload from '@src/utility/excelDownload';

const Leave = () => {

    var values = {
        'lesson_year': '',
        'leave_state': ''
    }
    const navigate = useNavigate()

    const { t } = useTranslation()
    const default_page = [10, 15, 50, 75, 100]
    const [edit_modal, setEditModal] = useState(false)
    const { user } = useContext(AuthContext)
    const [datas, setDatas] = useState([])
    const [modal, setModal] = useState(false)
    const [select_values, setSelectValues] = useState(values)
    const [yearOption, setYear] = useState([])
    const [stateOption, setStateOption] = useState([])
    const [edit_id, setEditId] = useState('')
    const [selectedRows, setSelectedRows] = useState([])
    const [tushaalModal, setTushaalModal] = useState(false)

    const { school_id } = useContext(SchoolContext)

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState('')

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: true})


    // API
    const leaveApi = useApi().student.leave
    const leaveStateApi = useApi().settings.studentRegisterType

    // ** Function to handle per page
    function handlePerPage(e) {
     setRowsPerPage(parseInt(e.target.value))
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        getDatas()
    }

    // ** Function to handle filter
    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    const handleModal = () => {
        setModal(!modal)
    }

    /* Устгах функц */
	const handleDelete = async(id) => {
        const { success, data } = await fetchData(leaveApi.delete(id))
        if(success)
        {
            getDatas()
        }
	};

    const editModal = (edit_id) => {
        setEditModal(!edit_modal)
        setEditId(edit_id)
    }

    // Хуудас солих үед ажиллах хэсэг
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

    const getDatas = async() => {
        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        const { success, data } = await allFetch(leaveApi.get(rowsPerPage, currentPage, sortField, searchValue, select_values.lesson_year, select_values.leave_state))
        if(success)
        {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    const getLeaveState = async() => {
        const { success, data } = await fetchData(leaveStateApi.get())
        if(success)
        {
            setStateOption(data)
        }
    }

    useUpdateEffect(
        () =>
        {
            if (searchValue.length == 0) {
                getDatas();
            } else {
                const timeoutId = setTimeout(() => {
                    getDatas();
                }, 600);
                return () => clearTimeout(timeoutId);
            }
        },
        [searchValue]
    )

    useEffect(
        () =>
        {
            getDatas()
        },
        [rowsPerPage, currentPage, sortField, select_values]
    )

    useEffect(
        () =>
        {
            setYear(generateLessonYear(5))
            getLeaveState()
        },
        []
    )

    function onSelectedRowsChange(state) {
        var selectedRows = state.selectedRows

		setSelectedRows(selectedRows);
    }

    function tushaalModalHandler() {
        setTushaalModal(!tushaalModal)
    }

    function printHandler() {
        navigate(`/student/leave/print`, {state: selectedRows})
    }

    function excelHandler() {
        const rowInfo = {
            headers: [
                '№',
                'Оюутан',
                '7 хоног',
                'Тушаал',
                'Хичээлийн жил',
                'Чөлөө авсан улирал',
            ],

            datas: [
                'index',
                'student.full_name',
                'learn_week',
                'statement',
                'lesson_year',
                'lesson_season.season_name',
            ],
        }
        excelDownload(datas, rowInfo, `чөлөөний_бүртгэл`)
    }

    return(
        <Fragment>
            <Card>
            {isLoading && Loader}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                <CardTitle tag='h4'>{t('Чөлөөний бүртгэл')}</CardTitle>
                <div className='d-flex flex-wrap mt-md-0 mt-1 gap-1'>
                    <Button
                        color='primary'
                        onClick={() => {excelHandler()}}
                    >
                        <FileText size={16}/> Excel татах
                    </Button>
                    <Button
                        color='primary'
                        disabled={selectedRows.length > 0 ? false : true}
                        onClick={() => printHandler()}
                    >
                        <Printer size={15} />
                        <span className='align-middle ms-50'>{t('Хэвлэх')}</span>
                    </Button>
                    <Button
                        color='primary'
                        disabled={Object.keys(user).length > 0 && (user.permissions.includes('lms-student-leave-create') && selectedRows.length > 0) ? false : true}
                        onClick={() => tushaalModalHandler()}
                    >
                        <Edit size={15} />
                        <span className='align-middle ms-50'>{t('Тушаал бүртгэх')}</span>
                    </Button>
                    <Button
                        color='primary'
                        disabled={Object.keys(user).length > 0 && (user.permissions.includes('lms-student-leave-create') && school_id) ? false : true}
                        onClick={() => handleModal()}
                    >
                        <Plus size={15} />
                        <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                    </Button>
                </div>
                </CardHeader>
                <Row className='mt-1'>
                    <Col md={4} className='mb-1 ms-1'>
						<Label className="form-label me-1" for="building">
							{t('Хичээлийн жил')}
						</Label>
						<Select
							name="lesson_year"
							id="lesson_year"
							classNamePrefix='select'
							isClearable
							className={'react-select'}
							isLoading={isLoading}
							options = {yearOption || []}
							placeholder={t('-- Сонгоно уу --')}
							noOptionsMessage={() => t('Хоосон байна')}
							styles={ReactSelectStyles}
							value={yearOption.find((e) => e.id === select_values.lesson_year)}
							onChange={(val) => {
                                if (val?.id) {
                                    setSelectValues(current => {
                                        return {
                                            ...current,
                                            lesson_year: val?.id
                                        }
                                    })
                                } else {
                                    setSelectValues(current => {
                                        return {
                                            ...current,
                                            lesson_year: ''
                                        }
                                    })
                                }
							}}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.name}
						/>
                    </Col>
                    <Col md={4} className='mb'>
						<Label className="form-label me-1" for="building">
							{t('Бүртгэлийн хассан хэлбэр')}
						</Label>
						<Select
							name="minus"
							id="minus"
							classNamePrefix='select'
							isClearable
							className={'react-select'}
							isLoading={isLoading}
							options={stateOption || []}
							placeholder={t('-- Сонгоно уу --')}
							noOptionsMessage={() => t('Хоосон байна')}
							styles={ReactSelectStyles}
							value={stateOption.find((e) => e.id === select_values.leave_state)}
							onChange={(val) => {
                                if(val?.id) {
                                    setSelectValues(current => {
                                        return {
                                            ...current,
                                            leave_state: val?.id
                                        }
                                    })
                                } else {
                                    setSelectValues(current => {
                                        return {
                                            ...current,
                                            leave_state: ''
                                        }
                                    })
                                }
							}}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.name}
						/>
                    </Col>
                </Row>
                <Row className='justify-content-between mx-0 mb-1'>
                    <Col className='d-flex align-items-center justify-content-start mt-1' md={4} sm={12}>
                        <Col md={2} sm={3} className='pe-1' style={{width:'100px'}}>
                            <Input
                                className='dataTable-select me-1 mb-50'
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
                <div className='react-dataTable react-dataTable-selectable-rows'>
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
                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                            </div>
                        )}
                        onSort={handleSort}
                        sortIcon={<ChevronDown size={10} />}
                        columns={getColumns(currentPage, rowsPerPage, total_count, editModal, handleDelete, user)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
						selectableRows
						onSelectedRowsChange={(state) => onSelectedRowsChange(state)}
                    />
                </div>
            </Card>
            {modal && <Addleavemodal open={modal} handleModal={handleModal} refreshDatas={getDatas} />}
            {edit_modal && <EditModal open={edit_modal} handleModal={editModal} edit_id={edit_id} refreshDatas={getDatas} />}
            {tushaalModal && <TushaalModal tushaalModal={tushaalModal} tushaalModalHandler={tushaalModalHandler} selectedRows={selectedRows} getDatas={getDatas}/>}
            {/* <TushaalModal editModal={editModal} toggleEditModal={toggleEditModal} selectedRows={selectedRows} getDatas={getDatas}/> */}
        </Fragment>
    )
}
export default Leave;
