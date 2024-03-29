import { Fragment, useState, useEffect, useContext } from 'react'

import useLoader from '@hooks/useLoader';
import useApi from '@hooks/useApi';
import DataTable from 'react-data-table-component'
import { getPagination, ReactSelectStyles } from '@utils'

// ** React Imports

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner, UncontrolledTooltip } from 'reactstrap'

import { ChevronDown, Search } from 'react-feather'

import classnames from "classnames";

import { useTranslation } from 'react-i18next'

import Select from 'react-select'

import AuthContext from "@context/AuthContext"

import { useNavigate } from 'react-router-dom';

import { utils, writeFile } from 'xlsx-js-style';

import { dataz } from './sampledata'
import { getColumns } from './helpers';
import EmailModal from './EmailModal';

function Email() {

    const [datas, setDatas] = useState(1)

	const { isLoading, fetchData } = useLoader({});

	const elseltApi = useApi().elselt.admissionuserdata.email

	async function getDatas() {
        const {success, data} = await fetchData(elseltApi.get())
        if(success) {
            setDatas(data)
        }
	}

    useEffect(() => {
        getDatas()
    }, [])

    console.log('test')


    console.log(datas,'datas')
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({})

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    // Translate
    const default_page = [10, 20, 50, 75, 100]


	const [searchValue, setSearchValue] = useState("");
    const [join_year, setJoinYear] = useState('')

    const [ yearOption, setYear] = useState([])

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(dataz.length || 1)

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


	const { user } = useContext(AuthContext)


    const navigate = useNavigate()

    // Эрэмбэлэлт

    // Translate
    const { t } = useTranslation()


	// Modal
	const [modal, setModal] = useState(false);
    const [edit_modal, setEditModal] = useState(false)

    const [editData, setEditData] = useState({})

    const [profOption, setProfession] = useState([])
    const [profession_id, setProfession_id] = useState('')

    const [admop, setAdmop] = useState([])
    const [adm, setAdm] = useState('')

    const [unit1op, setUnit1op] = useState([])
    const [unit1, setUnit1] = useState('')

    const [selectedStudents, setSelectedStudents] = useState([])
    const [stateModal, setStateModal] = useState(false)

    const [messageModal, setMessageModal] = useState(false)

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
	// async function getDatas() {

    //     const {success, data} = await allFetch(elseltApi.get(rowsPerPage, currentPage, sortField, searchValue, adm, profession_id, unit1, gender, state, gpa_state))
    //     if(success) {
    //         setTotalCount(data?.count)
    //         setDatas(data?.results)

    //         // Нийт хуудасны тоо
    //         var cpage_count = Math.ceil(data?.count / rowsPerPage === 'Бүгд' ? 1 : rowsPerPage)
    //         setPageCount(cpage_count)
    //     }
	// }

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

	// Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
	useEffect(() => {
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

    useEffect(() => {
        getProfession()
    }, [adm])


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
                                isLoading={isLoading}
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
            <div className="react-dataTable react-dataTable-selectable-rows my-2">
                <DataTable
                    noHeader
                    paginationServer
                    pagination
                    className='react-dataTable'
                    // progressPending={isLoading}
                    // progressComponent={
                    //     <div className='my-2 d-flex align-items-center justify-content-center'>
                    //         <Spinner className='me-1' color="" size='sm'/><h5>Түр хүлээнэ үү...</h5>
                    //     </div>
                    // }
                    noDataComponent={(
                        <div className="my-2">
                            <h5>Өгөгдөл байхгүй байна</h5>
                        </div>
                    )}
                    onSort={handleSort}
                    columns={getColumns(currentPage, rowsPerPage, pageCount, emailModalHandler, setSelectedEmail)}
                    sortIcon={<ChevronDown size={10} />}
                    paginationPerPage={rowsPerPage}
                    paginationDefaultPage={currentPage}
                    data={dataz}
                    paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                    fixedHeader
                    fixedHeaderScrollHeight='62vh'
                />
            </div>
        </div>
    )
}

export default Email
