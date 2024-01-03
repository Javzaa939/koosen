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

import { ChevronDown, Search, Circle, Printer } from 'react-feather'

import { useTranslation } from 'react-i18next'
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from 'react-router-dom'

import Select from 'react-select'
import DataTable from 'react-data-table-component'

import classnames from 'classnames'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import { useSkin } from "@hooks/useSkin"
import useUpdateEffect from '@hooks/useUpdateEffect'

import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'
import ActiveYearContext from '@context/ActiveYearContext'

import { getPagination, ReactSelectStyles } from '@utils'

import { getColumns, getColumnsDetail } from './helpers'

import AddChamber from './AddChamber'

export function ExpandedComponent({ data })
{
    const navigate = useNavigate();

    const [edit_modal, setEditModal] = useState(false)
    const [editId, setEditId] = useState('')

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

    return (
        <Card className='mb-0 rounded-0 border-bottom p-2 pt-0'>
            <div className='d-flex justify-content-start mx-0'>
                <h5 className='mt-1'>Хичээлүүдийн жагсаалт</h5>
                <Button color='primary' size='sm' className='mt-1 ms-1' onClick={() => navigate('/credit/a_estimation/lessons/print', { state: data })} >
                    {'хэвлэх'}
                </Button>
            </div>
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
                    columns={getColumnsDetail(addModal)}
                    data={data ? data?.estimations : []}
                    customStyles={tableCustomStyles}
                    fixedHeader
                    fixedHeaderScrollHeight='62vh'
                />
            </div>
            {edit_modal && <AddChamber isOpen={edit_modal} handleModal={addModal} editId={editId}/>}
        </Card>
    )
}


const Estimation = () => {

    // ** Hook
    const { control, formState: { errors } } = useForm({});

    const navigate = useNavigate();

    const { user } = useContext(AuthContext)
    const { schoolName } = useContext(SchoolContext)
    const { cseason_id, cyear_name } = useContext(ActiveYearContext)

    const { t } = useTranslation()

    const default_page = [10, 15, 50, 75, 100]
    const [datas, setDatas] = useState([])

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    const [dep_option, setDepOption] = useState([])
    const [seasonOption, setSeason] = useState([])

    const [dep_id, setDepId] = useState('')
    const [dep_name, setDepName] = useState('')

    const [season_id, setSeasonId] = useState(cseason_id)

    const [ teacherOption, setTeacherOption ] = useState([])
    const [ teacherId, setTeacherId ] = useState('')

    // Api
    const estimateApi = useApi().credit.estimation
    const departmentApi = useApi().hrms.department
    const seasonApi = useApi().settings.season

    // Улирлын жагсаалт авах
    async function getSeason () {
        const { success, data } = await fetchData(seasonApi.get())
        if (success) {
            setSeason(data)
        }
	}

    async function getDatas() {

        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        const { success, data } = await allFetch(estimateApi.get(rowsPerPage, currentPage, searchValue, season_id,  dep_id, teacherId))
        if (success) {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    /* A цаг тооцох функц */
	const handleEstimate = async() => {
        if(dep_id && season_id){
            const { success } = await fetchData(estimateApi.estimate(dep_id, season_id, teacherId))
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
                setTeacherOption([])
            }
        },
        [dep_id]
    )

    useEffect(() => {
        getDepartment()
        getSeason()
    },[])

    useEffect(() => {
        getDatas()
    }, [currentPage, rowsPerPage, dep_id, teacherId])

    // ** Function to handle filter
    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
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
        getDatas()
    }

    // Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
	useUpdateEffect(() => {
		if (searchValue.length == 0) {
			getDatas();
		}
	}, [searchValue]);

    function printNavigate()
    {
        let printDatas = {
            year: cyear_name,
            datas: datas,
            subSchool: schoolName
        }

        navigate('/credit/estimationa/print', { state: printDatas });
    }

    return (
        <Fragment>
            <Card>
                {isLoading && Loader}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t(' А цагийн тооцоо ')}</CardTitle>
                </CardHeader>
                <Row className='mx-0 mt-50'>
                    <Col md={3} className='mb-1'>
                        <Label className="form-label" for="lesson_season">
                            {t('Хичээлийн улирал')}
                        </Label>
                        <Controller
                           control={control}
                           defaultValue={season_id}
                           name="lesson_season"
                           render={({ field: { value, onChange} }) => {
                               return (
                                   <Select
                                       name="lesson_season"
                                       id="lesson_season"
                                       classNamePrefix='select'
                                       isClearable
                                       className={classnames('react-select', { 'is-invalid': errors.lesson_season })}
                                       isLoading={isLoading}
                                       placeholder={t('-- Сонгоно уу --')}
                                       options={seasonOption || []}
                                       value={seasonOption.find((c) => c.id === value)}
                                       noOptionsMessage={() => t('Хоосон байна.')}
                                       onChange={(val) => {
                                           onChange(val?.id || '')
                                           setSeasonId(val?.id || '')
                                       }}
                                       styles={ReactSelectStyles}
                                       getOptionValue={(option) => option.id}
                                       getOptionLabel={(option) => option.season_name}
                                   />
                               )
                           }}
                        />
                        {errors.lesson_season && <FormFeedback className='d-block'>{t(errors.lesson_season.message)}</FormFeedback>}
                    </Col>
                    <Col md={3} className='mb-1'>
                        <Label className="form-label" for="department">
                            {t('Хөтөлбөрийн баг')}
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
                                        className={classnames('react-select', { 'is-invalid': errors.department })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={dep_option || []}
                                        value={dep_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setDepId(val?.id || '')
                                            setDepName(val?.name || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col md={3} className='mb-1'>
                        <Label className="form-label" for="teacher">
                            {t('Заах багш')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="teacher"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="teacher"
                                        id="teacher"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.teacher })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={teacherOption || []}
                                        value={teacherOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setTeacherId(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => `${option?.last_name[0]}.${option?.first_name}`}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col md={3} className='d-flex align-items-center justify-content-end'>
                        <Button
                            color='primary'
                            size='sm'
                            // disabled={Object.keys(user).length > 0 && (user.permissions.includes('lms-credit-estimate-create') && dep_id && season_id) ? false : true}
                            onClick={() => handleEstimate()}>
                            <Circle size={15} />
                            <span className='align-middle ms-50'>{t('Тооцох')}</span>
                        </Button>
                        <Button
                            className='ms-1'
                            color='primary'
                            size='sm'
                            onClick={printNavigate}
                        >
                            <Printer size={15} />
                            <span className='align-middle ms-50'>{t('Хэвлэх')}</span>
                        </Button>
                    </Col>
                </Row>
                <Row className='justify-content-between mx-0 mb-1'>
                    <Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
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
                <div className='react-dataTable react-dataTable-selectable-rows mx-1'>
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
                        columns={getColumns(currentPage, rowsPerPage, total_count)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                        expandableRows
                        expandableRowsComponent={ExpandedComponent}
                    />
                </div>
            </Card>
        </Fragment>
    )
}

export default Estimation;
