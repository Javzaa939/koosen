import { Fragment, useState, useEffect, useContext } from 'react'

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner, UncontrolledTooltip } from 'reactstrap'

import { ChevronDown, Plus, Search } from 'react-feather'

import { RiEditFill } from "react-icons/ri";

import DataTable from 'react-data-table-component'

import classnames from "classnames";
import { getColumns } from './helpers';

import { useTranslation } from 'react-i18next'
import { getPagination, ReactSelectStyles } from '@utils'

import Select from 'react-select'

import useApi from '@hooks/useApi';

import useLoader from '@hooks/useLoader';
import OrderModal from './OrderModal';

import AuthContext from "@context/AuthContext"

import { SortModal } from './SortModal'
import useUpdateEffect from '@hooks/useUpdateEffect';


const ElseltEyesh = () => {
	const { user } = useContext(AuthContext)

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });
	const { Loader: TableLoader, isLoading: isTableLoading, fetchData: allFetch } = useLoader({ isFullScreen: false })

	//Search State
	const [searchValue, setSearchValue] = useState("");

	//Page state
	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(20)

	//Элсэлт state
	const [admop, setAdmop] = useState([])
	const [adm, setAdm] = useState('')

	//Хөтөлбөр state
	const [profOption, setProfession] = useState([])
	const [profession_id, setProfession_id] = useState('')

	//gender state
	const [gender, setGender] = useState('')

	//Жагсаалт дата
	const [datas, setDatas] = useState([])
	const [total_count, setTotalCount] = useState('')

	// ЭЕШ дата
	const [eyeshData, setEyeshData] = useState([])

	const [selectedAdmission, setSelectedAdmission] = useState(null);
	const [selectedProfession, setSelectedProfession] = useState(null);

	//Modal
	const [orderModal, setOrderModal] = useState(false)

	// API
	const professionApi = useApi().elselt.profession
	const admissionYearApi = useApi().elselt
	const elseltApi = useApi().elselt.eyesh_order
	const elseltEyeshApi = useApi().elselt.eyesh;

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

	// Эрэмбэлэлт
	const [sortField, setSort] = useState('')

	// Translate
	const { t } = useTranslation()
	const default_page = ['Бүгд', 10, 20, 50, 75, 100]

	// Нийт хуудасны тоо
	const [pageCount, setPageCount] = useState(1)

	// Хуудас солих үед ажиллах хэсэг
	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};
	// ** Function to handle per page
	function handlePerPage(e) {
		setRowsPerPage(e.target.value === 'Бүгд' ? e.target.value : parseInt(e.target.value))
	}

	// Хөтөлбөрийн жагсаалт авах
	async function getProfession() {
		const { success, data } = await fetchData(professionApi.getList(adm))
		if (success) {
			setProfession(data)
		}
	}

	// Элсэлтийн жагсаалт авах
	async function getAdmissionYear() {
		const { success, data } = await fetchData(admissionYearApi.getAll())
		if (success) {
			setAdmop(data)
		}
	}

	// Хөтөлбөрөөр нь эеш оноо татаж авах
	async function getEyeshData() {
		const { success, data } = await fetchData(elseltEyeshApi.get(adm, profession_id));
		if (success) {
			setEyeshData(data)
		}
	}

	/* Жагсаалтын дата авах функц */
	async function getDatas() {
		const { success, data } = await allFetch(elseltApi.get(rowsPerPage, currentPage, searchValue, adm, profession_id, gender))
		if (success) {
			setTotalCount(data?.count)
			setDatas(data?.results)
			// Нийт хуудасны тоо
			var cpage_count = Math.ceil(data?.count / rowsPerPage === 'Бүгд' ? 1 : rowsPerPage)
			setPageCount(cpage_count)
		}
	}

	useEffect(() => {
		getAdmissionYear()
		getProfession()
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
	}, [sortField, currentPage, rowsPerPage, searchValue, adm, profession_id, gender])

	useUpdateEffect(() => {
		getProfession()
	}, [adm])

	// ** Function to handle filter
	const handleFilter = e => {
		const value = e.target.value.trimStart();
		setSearchValue(value)
	}

	function handleSort(column, sort) {
		if (sort === 'asc') {
			setSort(column.header)
		} else {
			setSort('-' + column.header)
		}
	}

	const [modal, setModal] = useState(false)
	const [type, setType] = useState('')
	const [editData, setEditData] = useState([])
	const handleModal = () => {
        setModal(!modal)
    }
	}

	function handleSearch() {
		getDatas()
	}
	// Order modal toggle function
	function OrderModalHandler() {
		setOrderModal(!orderModal);
	}

	//Button дарагдахад ажиллах функц
	function fetchDataAndToggleModal() {
		getEyeshData();
		OrderModalHandler();
	}

	return (
		<Fragment>
			<OrderModal
				gpaModalHandler={OrderModalHandler}
				gpaModal={orderModal}
				data={eyeshData}
				gplesson_year={selectedAdmission?.name || ''}
				profession_name={selectedProfession?.name || ''}
				total_count={total_count}
			/>
			{isLoading && Loader}
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4" className='mt-50'>{t('Элсэлтийн ЭШ жагсаалт')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
						<Button
							color='primary'
							className='d-flex align-items-center px-75'
							id='state_button'
							disabled={profession_id ? false : true}
							onClick={() => handleButton()}
						>
							<RiEditFill className='me-25' />
							Оноо татах
						</Button>
						<UncontrolledTooltip target='state_button'>
							Хөтөлбөр сонгосны дараа ЭШ оноо татах боломжтой.
						</UncontrolledTooltip>
						<Button
							color='primary'
							className='d-flex align-items-center px-75 ms-1'
							id='sort_button'
							onClick={() => handleModal()}
						>
							<RiEditFill className='me-25' />
							Оноо эрэмбэлэх
						</Button>
                    </div>
                </CardHeader>
				{isTableLoading && TableLoader}
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom m-auto">
					<CardTitle tag="h4">{t('Элсэгчдийн ЭЕШ оноо жагсаалт')}</CardTitle>
				</CardHeader>
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
								setSelectedAdmission(val);
							}}
							styles={ReactSelectStyles}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.lesson_year + ' ' + option.name}
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
								setProfession_id(val?.id || '')
								setSelectedProfession(val)
							}}
							styles={ReactSelectStyles}
							getOptionValue={(option) => option?.id}
							getOptionLabel={(option) => option.name}
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
					<Col sm={3} lg={3}>
						<Button
							color='primary'
							className='d-flex align-items-center px-75 mt-2'
							id='state_button'
							size='sm'
							onClick={() => fetchDataAndToggleModal()
							}
						>
							<RiEditFill className='me-25' />
							Оноо татах
						</Button>
						<UncontrolledTooltip target='state_button'>
							Сонгосон элсэгчдийн эеш оноог татах
						</UncontrolledTooltip></Col>
				</Row>
				<Row className="justify-content-between mx-0 mt-1" >
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
							onChange={(e) => { handleFilter(e) }}
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
				<div className="react-dataTable react-dataTable-selectable-rows ">
					<DataTable
						noHeader
						paginationServer
						pagination
						className='react-dataTable'
						progressPending={isTableLoading}
						progressComponent={
							<div className='my-2 d-flex align-items-center justify-content-center'>
								<Spinner className='me-1' color="" size='sm' /><h5>Түр хүлээнэ үү...</h5>
							</div>
						}
						noDataComponent={(
							<div className="my-2">
								<h5>{t('Өгөгдөл байхгүй байна')}</h5>
							</div>
						)}
						print='true'
						theme="solarized"
						onSort={handleSort}
						columns={getColumns(currentPage, rowsPerPage === 'Бүгд' ? 1 : rowsPerPage, total_count)}
						sortIcon={<ChevronDown size={10} />}
						paginationPerPage={rowsPerPage === 'Бүгд' ? 1 : rowsPerPage}
						paginationDefaultPage={currentPage}
						data={datas}
						paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage === 'Бүгд' ? total_count : rowsPerPage, total_count)}
						fixedHeader
						fixedHeaderScrollHeight='62vh'
						// selectableRows
						// // onSelectedRowsChange={(state) => onSelectedRowsChange(state)}
						direction="auto"
						defaultSortFieldId={'created_at'}
						style={{ border: '1px solid red' }}
					/>
				</div>
			</Card>
			{modal && <SortModal open={modal} handleModal={handleModal} refreshDatas={getListDatas} type={type} editData={editData}/>}
		</Fragment>
	)


export default ElseltEyesh;
