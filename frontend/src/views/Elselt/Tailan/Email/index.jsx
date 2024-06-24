import { useState, useEffect, useContext } from 'react'

import useLoader from '@hooks/useLoader';
import useApi from '@hooks/useApi';
import DataTable from 'react-data-table-component'
import { getPagination, ReactSelectStyles } from '@utils'

// ** React Imports

import { Row, Col,  Input, Label, Button} from 'reactstrap'

import { ChevronDown, Search } from 'react-feather'

import classnames from "classnames";

import { useTranslation } from 'react-i18next'

import Select from 'react-select'
import AuthContext from "@context/AuthContext"

import useUpdateEffect from '@hooks/useUpdateEffect'

import { getColumns } from './helpers';
import EmailModal from './EmailModal';
import TableLoader from '@src/components/TableLoader';
import TableBlank from '@src/components/TableBlank';

function Email() {

    const [datas, setDatas] = useState(1)

	const { isLoading, fetchData } = useLoader({});

	const elseltApi = useApi().elselt.admissionuserdata.email
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({})

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    // Translate
    const default_page = [10, 20, 50, 75, 100]

	const [searchValue, setSearchValue] = useState("");

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 0)

    // Нийт хуудасны тоо
    const [pageCount, setPageCount] = useState(1)

    const [emailModal, setEmailModal] = useState(false)
    const [selectedEmail, setSelectedEmail] = useState('')

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

    function emailModalHandler(e, data) {
        setEmailModal(!emailModal);
        setSelectedEmail(data)
    }

    // Translate
    const { t } = useTranslation()

	// Modal

    const [profOption, setProfession] = useState([])
    const [profession_id, setProfession_id] = useState('')

    const [admop, setAdmop] = useState([])
    const [adm, setAdm] = useState('')

    const [unit1op, setUnit1op] = useState([])
    const [unit1, setUnit1] = useState('')

    const genderOp = [
        {
            id: 1,
            name: 'Эрэгтэй',
        },
        {
            id: 2,
            name: 'Эмэгтэй'
        }
    ]

    const stateop = [
        {
            'id': 1,
            'name': 'БҮРТГҮҮЛСЭН'
        },
        {
            'id': 2,
            'name': 'ТЭНЦСЭН'
        },
        {
            'id': 3,
            'name': 'ТЭНЦЭЭГҮЙ'
        }
    ]

    const infop = [
        {
            'id': 1,
            'name': 'ЗӨВ ОРУУЛСАН'
        },
        {
            'id': 2,
            'name': 'ЗАСАГДСАН'
        },
    ]

    const [state, setState] = useState('')
    const [gpa_state, setGpaState] = useState('')

    const [gender, setGender] = useState('')

	// const elseltApi = useApi().elselt.admissionuserdata
    const admissionYearApi = useApi().elselt
    const unit1Api = useApi().hrms.unit1
    const professionApi = useApi().elselt.profession

    // Хөтөлбөрийн жагсаалт авах
    async function getProfession() {
        const { success, data } = await fetchData(professionApi.getList(adm))
        if (success) {
            setProfession(data)
        }
	}

    async function getAdmissionYear() {
        const { success, data } = await fetchData(admissionYearApi.getAll())
        if (success) {
            setAdmop(data)
        }
	}

    async function getUnit1() {
        const { success, data } = await fetchData(unit1Api.get())
        if (success) {
            setUnit1op(data)
        }
	}

	// /* Жагсаалтын дата авах функц */
	async function getDatas() {

        const {success, data} = await allFetch(elseltApi.get(rowsPerPage, currentPage, sortField, searchValue, adm, profession_id, unit1, gender, state, gpa_state))
        if(success) {
            setTotalCount(data?.count)
            setDatas(data?.results)

            // Нийт хуудасны тоо
            var cpage_count = Math.ceil(data?.count / rowsPerPage === 'Бүгд' ? 1 : rowsPerPage)
            setPageCount(cpage_count)
        }
	}

    useEffect(() => {
        getDatas()
    }, [])

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
    function handlePerPage(e)
    {
        setRowsPerPage(e.target.value === 'Бүгд' ? e.target.value : parseInt(e.target.value))
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
    }, [sortField, currentPage, rowsPerPage, searchValue, adm, profession_id, unit1, gender, state, gpa_state])

    useEffect(() => {
        getAdmissionYear()
        getProfession()
        getUnit1()
    }, [])

    useUpdateEffect(() => {
        getProfession()
    }, [adm])

    function handleSearch() {
        getDatas()
    }

    return (
        <div>
            <EmailModal emailModal={emailModal} emailModalHandler={emailModalHandler} selectedEmail={selectedEmail}/>
                <Row className='justify-content-start mx-0 mt-1'>
                    <Col sm={6} lg={3} >
                        <Label className="form-label" for="lesson_year">
                            {t('Элсэлт')}
                        </Label>
                            <Select
                                name="lesson_year"
                                id="lesson_year"
                                classNamePrefix='select'
                                isClearable
                                className={classnames('react-select')}
                                isLoading={isLoading}
                                placeholder={t('-- Сонгоно уу --')}
                                options={admop || []}
                                value={admop.find((c) => c.id === adm)}
                                noOptionsMessage={() => t('Хоосон байна.')}
                                onChange={(val) => {
                                    setAdm(val?.id || '')
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => option.lesson_year + ' ' + option.name}
                            />
                    </Col>
                    <Col sm={6} lg={3} >
                        <Label className="form-label" for="genderOp">
                            {t('Хүйс')}
                        </Label>
                            <Select
                                name="genderOp"
                                id="genderOp"
                                classNamePrefix='select'
                                isClearable
                                className={classnames('react-select')}
                                isLoading={isLoading}
                                placeholder={t('-- Сонгоно уу --')}
                                options={genderOp || []}
                                value={genderOp.find((c) => c.name === gender)}
                                noOptionsMessage={() => t('Хоосон байна.')}
                                onChange={(val) => {
                                    setGender(val?.name || '')
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => option.name}
                            />
                    </Col>
                    <Col sm={6} lg={3} >
                        <Label className="form-label" for="profession">
                            {t('Хөтөлбөр')}
                        </Label>
                            <Select
                                name="profession"
                                id="profession"
                                classNamePrefix='select'
                                isClearable
                                className={classnames('react-select')}
                                isLoading={isLoading}
                                placeholder={t('-- Сонгоно уу --')}
                                options={profOption || []}
                                value={profOption.find((c) => c?.prof_id === profession_id)}
                                noOptionsMessage={() => t('Хоосон байна.')}
                                onChange={(val) => {
                                    setProfession_id(val?.prof_id || '')
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option?.prof_id}
                                getOptionLabel={(option) => option.name}
                            />
                    </Col>
                    <Col sm={6} lg={3} >
                        <Label className="form-label" for="unit1">
                            {t('Харьяалал')}
                        </Label>
                            <Select
                                name="unit1"
                                id="unit1"
                                classNamePrefix='select'
                                isClearable
                                className={classnames('react-select')}
                                isLoading={isLoading}
                                placeholder={t('-- Сонгоно уу --')}
                                options={unit1op || []}
                                value={unit1op.find((c) => c.id === unit1)}
                                noOptionsMessage={() => t('Хоосон байна.')}
                                onChange={(val) => {
                                    setUnit1(val?.id || '')
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => option.name}
                            />
                    </Col>
                </Row>
                <Row className='justify-content-start mx-0 mt-1'>
                    <Col md={3} sm={6} xs={12} >
                        <Label className="form-label" for="state">
                            {t('Төлөв')}
                        </Label>
                            <Select
                                name="state"
                                id="state"
                                classNamePrefix='select'
                                isClearable
                                className={classnames('react-select')}
                                isLoading={isLoading}
                                placeholder={t('-- Сонгоно уу --')}
                                options={stateop || []}
                                value={stateop.find((c) => c.id === state)}
                                noOptionsMessage={() => t('Хоосон байна.')}
                                onChange={(val) => {
                                    setState(val?.id || '')
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => option.name}
                            />
                    </Col>
                    <Col md={3} sm={6} xs={12} >
                        <Label className="form-label" for="state">
                            {t('Мэдээллийн төлөв')}
                        </Label>
                            <Select
                                name="state"
                                id="state"
                                classNamePrefix='select'
                                isClearable
                                className={classnames('react-select')}
                                isLoading={isTableLoading}
                                placeholder={t('-- Сонгоно уу --')}
                                options={infop || []}
                                value={infop.find((c) => c.id === gpa_state)}
                                noOptionsMessage={() => t('Хоосон байна.')}
                                onChange={(val) => {
                                    setGpaState(val?.id || '')
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => option.name}
                            />
                    </Col>
                </Row>
                <Row className="justify-content-between mx-0" >
                    <Col className='d-flex align-items-center justify-content-start' md={4}>
                        <Col md={3} sm={2} className='pe-1'>
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
                        <Col md={9} sm={3}>
                            <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                        </Col>
                    </Col>
                    <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={4} sm={12}>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder={t("Хайх үг....")}
                            value={searchValue}
                            onChange={(e) => {handleFilter(e)}}
                            onKeyPress={e => e.key === 'Enter' && handleSearch()}
                        />
                        <Button
                            size='sm'
                            className='ms-50 mb-50'
                            color='primary'
                            onClick={handleSearch}
                            onContextMenu={(e) => {console.log('hi')}}
                        >
                            <Search size={15} />
                            <span className='align-middle ms-50'></span>
                        </Button>
                    </Col>
                </Row>
                <div className="react-dataTable react-dataTable-selectable-rows">
                    <DataTable
                        noHeader
                        paginationServer
                        pagination
                        className='react-dataTable'
                        progressPending={isLoading}
                        progressComponent={
                            <TableLoader/>
                        }
                        noDataComponent={(
                            <TableBlank/>
                        )}
                        onSort={handleSort}
                        columns={getColumns(currentPage, rowsPerPage, pageCount, emailModalHandler, setSelectedEmail)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
        </div>
    )
}

export default Email
