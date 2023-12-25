// ** React Import
import { Fragment, useState, useEffect, useContext, useUpdateEffect } from "react"

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner } from "reactstrap"

import { useTranslation } from "react-i18next"

import { ChevronDown, Plus, Search } from "react-feather"

import DataTable from "react-data-table-component"

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from '@context/AuthContext'
import SchoolContext from "@context/SchoolContext"
import ActiveYearContext from "@context/ActiveYearContext"

import classnames from "classnames";
import { useForm, Controller } from "react-hook-form";

import { getPagination, generateLessonYear,ReactSelectStyles} from '@utils'

import { getColumns } from "./helpers"

import Addmodal from './Add'
import Editmodal from "./Edit"
import Select from 'react-select'



const PaymentSettings = () => {
    var values = {
        join_year: '',
        degree: '',
        // season: '',
        // lesson_year: '',
    }

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const { control, setValue, formState: { errors } } = useForm({});

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [searchValue, setSearchValue] = useState("");
    const [select_value, setSelectValue] = useState(values)
    const [edit_pay_id, setEditId] = useState('')
    const [isClosedValue, setIsClosed] = useState('')
    const [degree_option, setDegree] = useState([])
    // const [seasonOption, setSeason] = useState([])
    // const lessonYearOption = generateLessonYear(10)

    const [datas, setDatas] = useState([]);
    const [yearOption, setYear] = useState(generateLessonYear(10))

    // Эрэмбэлэлт
	const [sortField, setSort] = useState('')

    // нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)
    const default_page = [10, 15, 50, 75, 100]

    // Нийт хуудасны тоо
    const [pageCount, setPageCount] = useState(1)

    // loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    // Modal
    const [modal, setModal] = useState(false);
    const [edit_modal, setEditModal] = useState(false);

    // Api
    const paymentsettingsApi = useApi().payment.paymentsetting
    const degreeApi = useApi().settings.professionaldegree
    // const seasonApi = useApi().settings.season
    const isClosedApi = useApi().payment.seasonclosed

    /* Нэмэх модал setState функц */
    const handleModal = () =>{
        setModal(!modal)
    }

    /* Устгах функц */
    const handleDelete = async(id) => {
        const { success } = await fetchData(paymentsettingsApi.delete(id))
        if(success) {
            getDatas()
        }
    }

    /** Жагсаалт дата авах функц */
    async function getDatas() {
        const degree = select_value?.degree
        const join_year = select_value?.join_year
        // const season = select_value?.season
        // const lesson_year = select_value?.lesson_year
        const { success, data } = await allFetch(paymentsettingsApi.get(rowsPerPage, currentPage, sortField, searchValue, degree, join_year))
        if (success) {
            setTotalCount(data?.count)
            setDatas(data?.results)

            // Нийт хуудасны тоо
            var page_count = Math.ceil(data?.count / rowsPerPage)
            setPageCount(page_count)
        }
    }

    async function isClosed() {
        const { success, data } = await fetchData(isClosedApi.getIsClosed())
        if ( success ){
            setIsClosed(data)
        }
    }


    // async function getSeason() {
    //     const { success, data } = await fetchData(seasonApi.get())
    //     if (success){
    //         setSeason(data)
    //     }
    // }

    useEffect(() => {
        getDegreeOption()
        // getSeason()
        isClosed()
    }, [])

    useEffect(() => {
		if (searchValue.length == 0) {
			getDatas();
		} else {
			const timeoutId = setTimeout(() => {
				getDatas();
			}, 600);

			return () => clearTimeout(timeoutId);
		}
	}, [select_value, currentPage, sortField, searchValue, rowsPerPage])


    // Боловсролын зэргийн жагсаалт
    async function getDegreeOption() {
        const { success, data } = await fetchData(degreeApi.get())
        if(success) {
            setDegree(data)
        }
    }

    /// Хайлт хийх үед ажиллах хэсэг
    const handleFilter = (e) => {
        const value = e.target.value.trimStart();
        setSearchValue(value);
    };

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        getDatas()
    }

    // Хуудас солих үед ажиллах хэсэг
    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    };

    /** Засах модал */
    function handleEditModal(edit_id) {
        setEditId(edit_id)
        setEditModal(!edit_modal)
    }

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    return (
        <Fragment>
            <Card>
            {isLoading && Loader}
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Төлбөрийн тохиргоо')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button disabled={Object.keys(user).length > 0 && !isClosedValue && school_id && user.permissions.includes('lms-payment-settings-create') ? false : true } color='primary' onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className="mx-0 mt-1 mb-1" sm={12}>
                <Col sm={12} md={4} >
                        <Label className="form-label" for="degree">
                            {t("Боловсролын зэрэг")}
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
                                        className={classnames('react-select', { 'is-invalid': errors.degree })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={degree_option || []}
                                        value={value && degree_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            if (val?.id) {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        degree: val?.id
                                                    }
                                                })
                                            } else {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        degree: ''
                                                    }
                                                })
                                            }
                                            setValue('group', '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.degree_name_code}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col sm={12} md={4}>
                        <Label className="form-label" for="join_year">
                            {t("Элссэн хичээлийн жил")}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="join_year"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="join_year"
                                        id="join_year"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.join_year })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={yearOption || []}
                                        value={value && yearOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            if (val?.id) {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        join_year: val?.id
                                                    }
                                                })
                                            } else {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        join_year: ''
                                                    }
                                                })
                                            }
                                            setValue('group', '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    {/* <Col sm={12} md={4}>
                        <Label className="form-label" for="lesson_season">
                            {t("Улирал")}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="lesson_season"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="lesson_season"
                                        id="lesson_season"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.lesson_season})}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={seasonOption || []}
                                        value={value && seasonOption.find((c) => c.season_code === value)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            onChange(val?.season_code || '')
                                            if (val?.season_code) {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        season: val?.season_code
                                                    }
                                                })
                                            } else {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        season: ''
                                                    }
                                                })
                                            }
                                            setValue('group', '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.season_code}
                                        getOptionLabel={(option) => option.season_name}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col> */}
                </Row>
                {/* <Row className="mx-0 mt-1 mb-1" sm={12}>
                    <Col sm={12} md={4} >
                        <Label className="form-label" for="degree">
                            {t("Хичээлийн жил")}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="lesson_year"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="lesson_year"
                                        id="lesson_year"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.lesson_year })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={lessonYearOption || []}
                                        value={value && lessonYearOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            if (val?.id) {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        lesson_year: val?.id
                                                    }
                                                })
                                            } else {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        lesson_year: ''
                                                    }
                                                })
                                            }
                                            setValue('group', '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                </Row> */}
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
                {isLoading ?
                    <div className="my-2 text-center" sm={12}>
						<Spinner size='sm' />
						<span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
					</div>
				:
					<div className="react-dataTable react-dataTable-selectable-rows">
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
                            columns={getColumns(currentPage, rowsPerPage, pageCount, handleEditModal, handleDelete, user, isClosedValue)}
                            sortIcon={<ChevronDown size={10} />}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            data={datas}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count, searchValue, datas)}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                        />
					</div>
                }
                {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas}/>}
                {edit_modal && <Editmodal editId={edit_pay_id} open={edit_modal} handleModal={handleEditModal} refreshDatas={getDatas} />}
            </Card>
        </Fragment>
    )
}
export default PaymentSettings;
