// ** React Imports
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

import { ChevronDown, Plus, Search } from 'react-feather'

import Select from 'react-select'
import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'

import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom'

import { useForm, Controller } from "react-hook-form";

import { getPagination, ReactSelectStyles } from '@utils'

import { getColumns } from './helpers'

import classnames from "classnames";

import Addmodal from './Add'
import EditModal from './Edit'
import StudyPlanAdd from '../StudyPlan/Add_v1'
import excelDownload from '@src/utility/excelDownload'

const ProfessionDefinition = () => {

    var values = {
        degree: '',
        department: '',
    }

    // ** Hook
    const { control, setValue, formState: { errors } } = useForm({});

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { t } = useTranslation()

    const navigate = useNavigate()

    const default_page = [10, 15, 50, 75, 100]
    const [modal, setModal] = useState(false)
    const [studyPlanmodal, setStudyPlanmodal] = useState(false)
    const [datas, setDatas] = useState([])

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
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    const [edit_modal, setEditModal] = useState(false)
    const [def_id, setDefinationId] = useState('')
    const [degree_option, setDegreeOption] = useState([])
    const [dep_option, setDepOption] = useState([])
    const [select_value, setSelectValue] = useState(values)
    const [mergejil_id, setMergejilId] = useState('')

    // Api
    const definationApi = useApi().study.professionDefinition
    const degreeApi = useApi().settings.professionaldegree
    const departmentApi = useApi().hrms.department

    useEffect(() => {
        if (searchValue.length == 0) {
            getDatas();
        } else {
            const timeoutId = setTimeout(() => {
                getDatas();
            }, 600);
            return () => clearTimeout(timeoutId);
        }
    }, [sortField, currentPage, rowsPerPage, searchValue, select_value, school_id])

    async function getDatas() {
        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        var degree = select_value.degree
        var department = select_value.department

        const { success, data } = await allFetch(definationApi.get(rowsPerPage, currentPage, sortField, searchValue, degree, department, school_id))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    /** Боловсролын зэргийн жагсаалт */
    async function getDegree() {
        const { success, data } = await fetchData(degreeApi.get())
        if(success) {
            setDegreeOption(data)
        }
    }

    /**Тэнхимын жагсаалт */
    async function getDepartment() {
        const { success, data } = await fetchData(departmentApi.get(school_id))
        if(success) {
            setDepOption(data)
        }
    }

    useEffect(() => {
        getDegree()
    },[])

    useEffect(() => {
        getDepartment()
    },[school_id])

    // Устгах функц
    async function handleDelete(id) {
        const { success } = await fetchData(definationApi.deleteIntro(id))
        if(success) {
            getDatas()
        }
    }

    // ** Function to handle Modal toggle
    const handleModal = () => {
        setModal(!modal)
    }

    const editModal = (id) => {
        /** NOTE Засах гэж буй хичээлийн стандартын id-г авна */
        navigate(`/study/profession-definition/${id}/`)
    }

    // ** Function to handle filter
    const handleFilter = e => {
        const value = e.target.value.trimStart()
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

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        if (searchValue.length > 0) getDatas()
    }

    // Сургалтын төлөвлөгөө харуулах
    const planhandleModal = (id) => {
        setMergejilId(id)
        setStudyPlanmodal(!studyPlanmodal)
    }

    function excelHandler() {

        const rowInfo = {

            headers: [
                '№',
                'Код',
                'Хөтөлбөр',
                'Боловсролын зэрэг',
                'Хөтөлбөрийн ерөнхий чиглэл',
                'Хөтөлбөрийн төрөлжсөн чиглэл',
                'Батлагдсан он ',
            ],

            datas: [
                'index',
                'code',
                'name',
                'degree.degree_name',
                'gen_direct_type_name',
                'dep_name',
                'confirm_year',
            ],
            height: {
                body: 30
            },
            width: 25

        }

        excelDownload(datas, rowInfo, `Хөтөлбөр`)

    }


    return (
        <Fragment>
            <Card>
                {isLoading && Loader}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Хөтөлбөр')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
                            color='primary'
                            onClick={() => {excelHandler()}}
                        >
                            Excel татах
                        </Button>
                        <Button
                            color='primary'
                            disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-study-profession-create') &&  school_id? false : true}
                            onClick={() => handleModal()}
                        >
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className='my-1 p-2'>
                    <Col md={4} sm={12} className=''>
                        <Label className="form-label" for="department">
                            {t('Тэнхим')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="department"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="department"
                                        id="department"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select ', { 'is-invalid': errors.department })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={dep_option || []}
                                        value={dep_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue({
                                                degree: select_value.degree,
                                                department: val?.id || '',
                                            })
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col md={4} sm={12} className=''>
                        <Label className="form-label" for="degree">
                            {t('Боловсролын зэрэг')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="degree"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="degree"
                                        id="degree"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select ms', { 'is-invalid': errors.degree })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={degree_option || []}
                                        value={degree_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue({
                                                degree: val?.id || '',
                                                department: select_value.department,
                                            })
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.degree_name}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                </Row>
                <Row className='justify-content-between mx-0'>
                    <Col className='d-flex align-items-center justify-content-start mt-1' md={6} sm={12}>
                        <Col md={2} sm={3} className='pe-1'>
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
                    <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={6} sm={12}>
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
                        columns={getColumns(currentPage, rowsPerPage, total_count, editModal, handleDelete, planhandleModal, user)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
            {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} />}
            {edit_modal && <EditModal open={edit_modal} handleModal={editModal} def_id={def_id} refreshDatas={getDatas} />}
            {studyPlanmodal && <StudyPlanAdd open={studyPlanmodal} handleModal={planhandleModal} mergejil_id={mergejil_id} />}
        </Fragment>
    )
}

export default ProfessionDefinition;

