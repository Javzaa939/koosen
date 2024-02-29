// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner } from 'reactstrap'

import { ChevronDown, Plus, Search } from 'react-feather'

import DataTable from 'react-data-table-component'

import classnames from "classnames";

import { useTranslation } from 'react-i18next'

import Select from 'react-select'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import AuthContext from "@context/AuthContext"

import { getPagination, ReactSelectStyles, generateLessonYear } from '@utils'

import { getColumns } from './helpers';

// import Addmodal from './Add'

const ElseltUser = () => {

	const { user } = useContext(AuthContext)

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    // Translate
    const { t } = useTranslation()

    const default_page = [10, 20, 50, 75, 100]

	const [searchValue, setSearchValue] = useState("");
    const [join_year, setJoinYear] = useState('')

	const [datas, setDatas] = useState([]);
    const [ yearOption, setYear] = useState([])

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

    // Нийт хуудасны тоо
    const [pageCount, setPageCount] = useState(1)

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false});
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

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
    const [gender, setGender] = useState('')

	const elseltApi = useApi().elselt.admissionuserdata
    const admissionYearApi = useApi().elselt
    const unit1Api = useApi().hrms.unit1
    const professionApi = useApi().study.professionDefinition

    // Хөтөлбөрийн жагсаалт авах
    async function getProfession() {
        const { success, data } = await fetchData(professionApi.getList('', ''))
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

	/* Модал setState функц */
	const handleModal = () => {
		setModal(!modal)
	}

	/* Устгах функц */
	const handleDelete = async(id) => {
        const {success} = await fetchData(elseltApi.delete(id))
		if(success) {
            getDatas()
		}
	};

	/* Жагсаалтын дата авах функц */
	async function getDatas() {

        const {success, data} = await allFetch(elseltApi.get(rowsPerPage, currentPage, sortField, searchValue, adm, profession_id, unit1, gender))
        if(success) {
            setTotalCount(data?.count)
            setDatas(data?.results)

            // Нийт хуудасны тоо
            var cpage_count = Math.ceil(data?.count / rowsPerPage)
            setPageCount(cpage_count)
        }
	}

	const editModal = (row={}) => {
        /** NOTE Засах гэж буй хичээлийн стандартын id-г авна */
        setEditModal(!edit_modal)
        setEditData(row)
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

    function handleSearch() {
        getDatas()
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
    }, [sortField, currentPage, rowsPerPage, searchValue, adm, profession_id, unit1, gender])

    useEffect(() => {
        getAdmissionYear()
        getProfession()
        getUnit1()
    }, [])

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

	return (
		<Fragment>
            {isLoading && Loader}
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Элсэгчдийн жагсаалт')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
                            color='primary'
                            // disabled={Object.keys(user).length > 0 && (user.permissions.includes('lms-elselt-create'))? false : true}
                            onClick={() => handleModal()}
                        >
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className='justify-content-start mx-0 my-1'>
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
                                value={profOption.find((c) => c.id === profession_id)}
                                noOptionsMessage={() => t('Хоосон байна.')}
                                onChange={(val) => {
                                    setProfession_id(val?.id || '')
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
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
                    {/* <Col md={3} sm={6} xs={12} className='mt-1'>
                        <Label className="form-label" for="start_date">
                            {t('Эхлэх хугацаа')}
                        </Label>
                        <Controller
                            defaultValue=''
                            name='start_date'
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    bsSize='sm'
                                    id='start_date'
                                    placeholder='Сонгох'
                                    type="date"
                                    disabled={true}
                                    readOnly={true}
                                    invalid={errors.start_date && true}
                                />
                            )}
                        />
                    </Col>
                    <Col md={3} sm={6} xs={12} className='mt-1'>
                        <Label className="form-label" for="end_date">
                            {t('Дуусах хугацаа')}
                        </Label>
                        <Input
                            bsSize='sm'
                            id='end_date'
                            placeholder='Сонгох'
                            type="date"
                        />
                    </Col> */}
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
					<div className="react-dataTable react-dataTable-selectable-rows">
						<DataTable
                            noHeader
							paginationServer
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
                            columns={getColumns(currentPage, rowsPerPage, pageCount, editModal, handleDelete, user)}
                            sortIcon={<ChevronDown size={10} />}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            data={datas}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                        />
					</div>
				{/* {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} editData={{}}/>}
				{edit_modal && <Addmodal open={edit_modal} handleModal={editModal} refreshDatas={getDatas} editData={editData}/>} */}
        	</Card>
        </Fragment>
    )
}

export default ElseltUser;