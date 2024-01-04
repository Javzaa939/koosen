import { Fragment, useState, useEffect, useContext } from "react"

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner } from "reactstrap"

import { useTranslation } from "react-i18next"

import { Plus, Search } from "react-feather"

import Select from 'react-select'
import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'

import { generateLessonYear, ReactSelectStyles, first_balance } from '@utils'

import Addmodal from './Add'
import Editmodal from "./Edit"

import CTable from "./helpers/Table"

const PaymentBeginBalance = () => {

    // ** Hook
    const { control, setValue, formState: { errors } } = useForm({});

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    var values = {
        profession: '',
        join_year: '',
        group: '',
        department: '',
        degree: '',
        first_balance: '',
    }

    const default_footer = {
        first_balance_iluu: 0,
        first_balance_dutuu: 0,
    }

    const [footer, setTotalValue] = useState(default_footer)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    const default_page = [10, 15, 50, 75, 100]

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [searchValue, setSearchValue] = useState("");

    const [edit_pay_id, setEditId] = useState('')

    const [datas, setDatas] = useState([]);

    const [select_value, setSelectValue] = useState(values)
    const [department_option, setDepartmentOption] = useState([])
    const [degree_option, setDegree] = useState([])
    const [groupOption, setGroup] = useState([])
    const [yearOption, setYear] = useState(generateLessonYear(10))
    const [firstBalanceOption, setfirstBalanceOption] = useState(first_balance)
    const [isClosedValue, setIsClosed] = useState('')

    // Нийт хуудасны тоо
    const [pageCount, setPageCount] = useState(1)

    // нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

    // loader
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    // Modal
    const [modal, setModal] = useState(false);
    const [edit_modal, setEditModal] = useState(false);

    // Api
    const groupApi = useApi().student.group
    const departmentApi = useApi().hrms.department
    const degreeApi = useApi().settings.professionaldegree
    const paymentApi = useApi().payment.beginbalance
    const closedApi = useApi().payment.seasonclosed

    /* Нэмэх модал setState функц */
    const handleModal = () =>{
        setModal(!modal)
    }

    /* Устгах функц */
    const handleDelete = async(id) => {
        const { success } = await fetchData(paymentApi.delete(id))
        if(success) {
            getDatas()
        }
    }

    /* Жагсаалт дата авах функц */
    async function getDatas() {
        const departId = select_value?.department
        const degree = select_value?.degree
        const join_year = select_value?.join_year
        const group = select_value?.group
        const is_iluu = select_value?.first_balance
        const { success, data } = await allFetch(paymentApi.get(rowsPerPage, currentPage, sortField, searchValue, departId, degree, join_year, group, is_iluu))
        if(success) {
            setDatas(data?.return_datas?.results)
            setTotalCount(data?.return_datas?.count)

            // Нийт хуудасны тоо
            var page_count = Math.ceil(data?.return_datas?.count / rowsPerPage)
            setPageCount(page_count)

            var total_pay = data?.total_pay

            if(total_pay) {
                setTotalValue({
                    first_balance_iluu: total_pay?.sum_first_balance_iluu || 0,
                    first_balance_dutuu: total_pay?.sum_first_balance_dutuu || 0,
                })
            }
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
	}, [rowsPerPage, currentPage, sortField, searchValue, select_value, school_id])


    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    // Тэнхимын жагсаалт
    async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get(school_id))
        if(success) {
            setDepartmentOption(data)
        }
    }

    // Боловсролын зэргийн жагсаалт
    async function getDegreeOption() {
        const { success, data } = await fetchData(degreeApi.get())
        if(success) {
            setDegree(data)
        }
    }

    // Ангийн жагсаалт
    async function getGroup() {
        const { success, data } = await fetchData(groupApi.getList(select_value.department, select_value.degree, select_value.profession, select_value.join_year))
        if( success ) {
            setGroup(data)
        }
    }

    // Сургалтын төлбөрийн хаалт хийгдсэн эсэх
    async function isClosed(){
        const { success, data } = await fetchData(closedApi.getIsClosed())
        if ( success ) {
            setIsClosed(data)
        }
    }

    useEffect(() => {
        getGroup()
        getDegreeOption()
        getDepartmentOption()
    },[school_id])

    useEffect(() => {
        getGroup()
    },[select_value])

    useEffect(() =>{
        isClosed()
    }, [])

    // Хайлт хийх үед ажиллах хэсэг
    const handleFilter = (e) => {
        const value = e.target.value.trimStart();
        setSearchValue(value);
    };

    // Хуудас солих үед ажиллах хэсэг
    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    };

    /** Засах модал */
    function handleEditModal(edit_id) {
        setEditId(edit_id)
        setEditModal(!edit_modal)
    }

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        getDatas()
    }

    return (
        <Fragment>
            <Card>
            {/* {isLoading && Loader} */}
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Төлбөрийн эхний үлдэгдэл')}</CardTitle>
                        <div className='d-flex flex-wrap mt-md-0 mt-1'>
                            <Button disabled={Object.keys(user).length > 0 && !isClosedValue && school_id && user.permissions.includes('lms-payment-beginbalance-create') ? false : true} color='primary' onClick={() => handleModal()}>
                                <Plus size={15} />
                                <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                            </Button>
                        </div>
                </CardHeader>
                <Row className="justify-content-between mx-0 mt-1 mb-1" sm={12}>
                    <Col sm={6} lg={3}>
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
                                        className={classnames('react-select', { 'is-invalid': errors.department })}
                                        isLoading={isLoading}
                                        placeholder={t(`-- Сонгоно уу --`)}
                                        options={department_option || []}
                                        value={value && department_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            if (val?.id) {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        department: val?.id
                                                    }
                                                })
                                            } else {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        department: ''
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
                    <Col sm={6} lg={3}>
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
                                        placeholder={t(`-- Сонгоно уу --`)}
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
                    <Col sm={6} lg={3}>
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
                                        placeholder={t(`-- Сонгоно уу --`)}
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
                    <Col sm={6} lg={3}>
                        <Label className="form-label" for="group">
                            {t("Анги")}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="group"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="group"
                                        id="group"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.group })}
                                        isLoading={isLoading}
                                        placeholder={t(`-- Сонгоно уу --`)}
                                        options={groupOption || []}
                                        value={value && groupOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            if (val?.id) {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        group: val?.id
                                                    }
                                                })
                                            } else {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        group: ''
                                                    }
                                                })
                                            }
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col sm={6} lg={3} className="mt-1">
                        <Label className="form-label" for="first_balance">
                            {t("Төлбөрийн төрөл")}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="first_balance"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="first_balance"
                                        id="first_balance"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.first_balance })}
                                        isLoading={isLoading}
                                        placeholder={t(`-- Сонгоно уу --`)}
                                        options={firstBalanceOption || []}
                                        value={value && firstBalanceOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            if (val?.id) {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        first_balance: val?.id
                                                    }
                                                })
                                            } else {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        first_balance: ''
                                                    }
                                                })
                                            }
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                </Row>
                    <>
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
                        {
                            isTableLoading
                            ?
                                <div className="my-2 text-center" sm={12}>
                                    <Spinner size='sm' />
                                    <span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
                                </div>
                            :
                                datas && datas.length > 0
                                ?
                                    <div className="react-dataTable react-dataTable-selectable-rows">
                                        <CTable
                                            datas={datas}
                                            currentPage={currentPage}
                                            rowsPerPage={rowsPerPage}
                                            pageCount={pageCount}
                                            handlePagination={handlePagination}
                                            CSum={footer}
                                            handleSort={handleSort}
                                            handleDelete={handleDelete}
                                            handleEditModal={handleEditModal}
                                            isClosedValue={isClosedValue}
                                        />
                                    </div>
                                :
                                    <div className="sc-dmctIk gLxfFK react-dataTable text-center">
                                        <div className="sc-fLcnxK dApqnJ">
                                            <div className="sc-bcXHqe kVrXuC rdt_Table" role="table">
                                                <div className="sc-iveFHk bzRnkJ">
                                                    <div className="my-2">
                                                        <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                        }
                        {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} selected_value={select_value}/>}
                        {edit_modal && <Editmodal editId={edit_pay_id} open={edit_modal} handleModal={handleEditModal} refreshDatas={getDatas} selected_value={select_value} />}
                    </>
            </Card>
        </Fragment>
    )
}

export default PaymentBeginBalance;
