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

import { ChevronDown, Plus, Search, Circle, Printer } from 'react-feather'
import { useTranslation } from 'react-i18next'
import DataTable from 'react-data-table-component'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'

import classnames from 'classnames'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { useSkin } from "@hooks/useSkin"

import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'
import ActiveYearContext from '@context/ActiveYearContext'

import { getPagination, ReactSelectStyles, generateLessonYear } from '@utils'

import { getColumns, getDetailColumns } from './helpers'
import Addmodal from './Add'
import EditModal from './Edit'

export function ExpandedComponent({ data, season_id })
{

    const navigate = useNavigate();

    const [edit_modal, setEditModal] = useState(false)
    const [editId, setEditId] = useState('')
    const { user } = useContext(AuthContext)
    const [editData, setEditData] = useState({})

    const creditVolumeApi = useApi().credit.volume
    const { Loader, isLoading, fetchData } = useLoader({})

    const addModal = (id) => {
        setEditModal(!edit_modal)
        setEditId(id)
    }

    const { skin } = useSkin()
    const tableCustomStyles = {
        headCells: {
          style: {
            backgroundColor: skin == 'dark' ? '#343d5500' : "#9CD9F3"
          },
        },
    }

     /* Устгах функц */
	const handleDelete = async(id) => {
		const { success } = await fetchData(creditVolumeApi.delete(id))
		if(success) {
			getDatas()
		}
	};

    const editModal = (row) => {
        /** NOTE Засах гэж буй хичээлийн стандартын id-г авна */
        setEditData(row)
        setEditModal(!edit_modal)
    }


    return (
        <Card className='mb-0 rounded-0 border-bottom p-2 pt-0'>
            {/* <div className='d-flex justify-content-start mx-0'>
                <h5 className='mt-1'>Хичээлүүдийн жагсаалт</h5>
                <Button color='primary' size='sm' className='mt-1 ms-1' onClick={() => navigate('/credit/a_estimation/lessons/print', { state: data })} >
                    {'хэвлэх'}
                </Button>
            </div> */}
            <div className='react-dataTable react-dataTable-selectable-rows mt-1'>
                <DataTable
                    noHeader
                    className='react-dataTable'
                    noDataComponent={(
                        <div className="my-2">
                            <h5>{'Өгөгдөл байхгүй байна'}</h5>
                        </div>
                    )}
                    sortIcon={<ChevronDown size={10} />}
                    columns={getDetailColumns(editModal, handleDelete, user)}
                    data={data ? data?.estimations : []}
                    customStyles={tableCustomStyles}
                    fixedHeader
                    fixedHeaderScrollHeight='62vh'
                />
            </div>
            {edit_modal && <EditModal open={edit_modal} handleEdit={editModal} editData={editData} season={season_id}/>}
        </Card>
    )
}

const CreditVolume = () => {

    const navigate = useNavigate();

    const { user } = useContext(AuthContext)
    const { school_id, schoolName } = useContext(SchoolContext)
    const { cyear_name } = useContext(ActiveYearContext)
    const { t } = useTranslation()

    const default_page = [10, 15, 50, 75, 100]
    const [modal, setModal] = useState(false)
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

    //option data авах үед
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})

    //datatable-д утга авах
	const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: true})

    // const [edit_modal, setEditModal] = useState(false)
    // const [editData, setEditData] = useState({})
    const [dep_option, setDepOption] = useState([])
    const [yearOption] = useState(generateLessonYear(5))
    const [seasonOption, setSeasonOption] = useState([])
    const [dep_id, setDepId] = useState('')
    const [season_id, setSeasonId] = useState([])
    const [year, setYear] = useState(cyear_name)
    const [dep_name, setDepName] = useState('')

    const [ teacherOption, setTeacherOption ] = useState([])
    const [ teacherId, setTeacherId ] = useState('')

    // Api
    const creditVolumeApi = useApi().credit.volume
    const departmentApi = useApi().hrms.department
    const seasonApi = useApi().settings.season

    /* Жагсаалтын дата авах функц */
	async function getSeasons() {
		const { success, data } = await fetchData(seasonApi.get())
		if(success) {
			setSeasonOption(data)
		}
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
    }, [sortField, currentPage, rowsPerPage, dep_id, year, searchValue, teacherId])

    async function getDatas() {

        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        const { success, data } = await allFetch(creditVolumeApi.get(rowsPerPage, currentPage, sortField, searchValue, dep_id, year, teacherId))
        if (success) {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    /* Устгах функц */
	const handleEstimate = async() => {
        if(dep_id && year){
            const { success } = await fetchData(creditVolumeApi.estimate(dep_id, year, season_id, teacherId))
            if(success) {
                getDatas()
            }
        }
	};

    /**Хөтөлбөрийн багын жагсаалт */
    async function getDepartment() {
        const { success, data } = await fetchData(departmentApi.get())
        if(success) {
            setDepOption(data)
        }
    }

    /**Багшийн жагсаалт */
    async function getTeachers(dep_id)
    {
        const { success, data } = await fetchData(departmentApi.getTeachers(dep_id))
        if(success)
        {
            setTeacherOption(data)
        }
    }

    useEffect(
        () =>
        {
            if (dep_id)
            {
                getTeachers(dep_id)
            }
            else
            {
                getTeachers(0)
            }
        },
        [dep_id]
    )

    useEffect(() => {
        getDepartment()
        getSeasons()
    },[])

    // ** Function to handle Modal toggle
    const handleModal = () => {
        setModal(!modal)
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

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        if (searchValue.length > 0) getDatas()
    }

    // Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
    useEffect(
        () =>
        {
            if (!searchValue) {
                getDatas()
            }
        },
        [searchValue]
    )

    function printNavigate()
    {
        let printDatas = {
            subSchool: schoolName,
            department: dep_name,
            departmentId: dep_id,
            year: year,
            teacherId: teacherId,
        }

        navigate('/credit/volume/print', { state: printDatas });
    }

    function chooseDep(){
        if (!dep_id) { return(<div>Хөтөлбөрийн баг сонгоно уу.</div>) }
        else { return(<div>Хоосон байна</div>)}
    }

    return (
        <Fragment>
            <Card>
                {isLoading && Loader}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                <CardTitle tag='h4'>{t('Цагийн ачаалал')}</CardTitle>
                </CardHeader>
                <Row className='mx-0 mt-50'>
                    <Col md={3} className='mb-1'>
                        <Label className="form-label" for="lesson_year">
                            {t('Хичээлийн жил')}
                        </Label>
                        <Select
                            name="lesson_year"
                            id="lesson_year"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={yearOption || []}
                            value={yearOption.find((c) => c.id === year)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setYear(val?.id || '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col md={3} className='mb-1'>
                        <Label className="form-label" for="season">
                            {t('Улирал')}
                        </Label>
                        <Select
                            name="season"
                            id="season"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={seasonOption || []}
                            value={seasonOption.find((c) => c.id === season_id)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setSeasonId(val?.id || '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.season_name}
                        />
                    </Col>
                    <Col md={3} className='mb-1'>
                        <Label className="form-label" for="department">
                            {t('Хөтөлбөрийн баг')}
                        </Label>
                        <Select
                            name="department"
                            id="department"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={dep_option || []}
                            value={dep_option.find((c) => c.id === dep_id)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setDepId(val?.id || '')
                                setDepName(val?.name || '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col md={3} className='mb-1'>
                        <Label className="form-label" for="teacher">
                            {t('Заах багш')}
                        </Label>
                        <Select
                            name="teacher"
                            id="teacher"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={teacherOption || []}
                            value={teacherOption.find((c) => c.id === teacherId)}
                            noOptionsMessage={chooseDep}
                            onChange={(val) => {
                                setTeacherId(val?.id || '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => `${option?.last_name[0]}.${option?.first_name}`}
                        />
                    </Col>
                    <div className='d-flex align-items-center justify-content-start flex-wrap mt-1 mb-2'>
                        <Button
                            color='primary'
                            size='sm'
                            disabled={Object.keys(user).length > 0 && (user.permissions.includes('lms-credit-volume-create') && school_id && dep_id && year && season_id) ? false : true}
                            onClick={() => handleEstimate()}
                            className='mb-1 ms-1 mb-sm-0'
                        >
                            <Circle size={15} />
                            <span className='align-middle ms-50'>{t('Тооцох')}</span>
                        </Button>
                        <Button
                            color='primary'
                            size='sm'
                            disabled={Object.keys(user).length > 0 && (user.permissions.includes('lms-credit-volume-create') && school_id && dep_id && year && season_id) ? false : true}
                            onClick={() => handleModal()}
                            className='mb-1 ms-1 mb-sm-0'
                        >
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                        <Button
                            color='primary'
                            size='sm'
                            onClick={printNavigate}
                            className='mb-1 ms-1 mb-sm-0'
                        >
                            <Printer size={15} />
                            <span className='align-middle ms-50'>{t('Хэвлэх')}</span>
                        </Button>
                    </div>
                </Row>
                <Row className='justify-content-between mx-0 mb-1'>
                    <Col className='d-flex align-items-center justify-content-start mt-2' md={6} sm={12}>
                        <Col md={4} xl={3} className='pe-1'>
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
                        columns={getColumns(currentPage, rowsPerPage, total_count)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                        expandableRows
                        expandableRowsComponent={(state) => ExpandedComponent(state, season_id)}
                    />
                </div>
            </Card>
            {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas}  year ={year} dep_id={dep_id} season={season_id}/>}
        </Fragment>
    )
}

export default CreditVolume;
