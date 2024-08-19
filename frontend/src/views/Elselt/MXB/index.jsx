import { Fragment, useState, useEffect, useContext } from 'react'

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner, UncontrolledTooltip } from 'reactstrap'

import { ChevronDown, Plus, Search } from 'react-feather'
import { MdMailOutline } from "react-icons/md";
import { BiMessageRoundedError } from "react-icons/bi";
import { HiOutlineDocumentReport } from "react-icons/hi";
import moment from 'moment';
import { utils, writeFile } from 'xlsx-js-style';

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
import EmailModal from '../User/EmailModal';
import MessageModal from '../User/MessageModal';

import AuthContext from "@context/AuthContext"

import { SortModal } from './SortModal'
import useUpdateEffect from '@hooks/useUpdateEffect';
import AddModal from './AddModal';


const MXB = () => {
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

	//төлөв state
	const [state, setState] = useState('')
	const [emailModal, setEmailModal] = useState(false)
	const [messageModal, setMessageModal] = useState(false)
	const [selectedStudents, setSelectedStudents] = useState([])

	//босго оноо state
	const tentssenEsehOp = [
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
	const [yesh_state, setEyeshState] = useState()
	const [yesh_mhb_state, setEyeshMhbState] = useState()
	//Жагсаалт дата
	const [datas, setDatas] = useState([])
	const [total_count, setTotalCount] = useState('')
	// ЭЕШ дата
	const [eyeshData, setEyeshData] = useState([])

	const [selectedAdmission, setSelectedAdmission] = useState(null);
	const [selectedProfession, setSelectedProfession] = useState(null);
	const [modal, setModal] = useState(false)
	const [type, setType] = useState('')
	const [editData, setEditData] = useState([])

	//Modal
	const [orderModal, setOrderModal] = useState(false)
	const [addModal, setAddModal] = useState(false)
	const [addModalData, setAddModalData] = useState(null)

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
			orderModalHandler()
		}
	}

	/* Жагсаалтын дата авах функц */
	async function getDatas() {
		const { success, data } = await allFetch(elseltApi.get(rowsPerPage, currentPage, searchValue, adm, profession_id, gender, state, yesh_state, yesh_mhb_state))
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
	}, [sortField, currentPage, rowsPerPage, searchValue, adm, profession_id, gender, state, yesh_state, yesh_mhb_state])

	useUpdateEffect(() => {
		getProfession()
	}, [adm])

	const getStateName = (stateId) => {
		const state = stateop.find(item => item.id === stateId);
		return state ? state.name : '';
	};

	function convert() {
		const mainData = datas.map((data, idx) => {
			return (
				{
					'№': idx + 1,
					'Овог': data?.user?.last_name || '',
					'Нэр': data?.user?.first_name || '',
					'РД': data?.user?.register || '',
					'Нас': data?.age || '',
					'Хүйс': data?.gender || '',
					'ЭЕШ шалгуур': getStateName(data?.yesh_state) || '',
					'ЭЕШ оноо': data?.score_avg || '',
					'ЭЕШ Эрэмбэ': data?.order_no || '',
					'ЭЕШ тайлбар': data?.yesh_description || '',
					'МХБ шалгуур': getStateName(data?.yesh_mhb_state) || '',
					'МХБ тайлбар': data?.yesh_mhb_description || '',
					'Имейл': data?.user?.email || '',
					'Утасны дугаар': data?.user?.mobile || '',
					'Яаралтай холбогдох': data?.user?.parent_mobile || '',
					'Хөтөлбөр': data?.profession || '',
					'Бүртгүүлсэн огноо': moment(data?.created_at).format('YYYY-MM-DD HH:SS:MM') || '',
				}
			)
		})
		const combo = [
			// ...header,
			...mainData
		]

		const worksheet = utils.json_to_sheet(combo);

		const workbook = utils.book_new();
		utils.book_append_sheet(workbook, worksheet, "Элсэгчдийн мэдээлэл");

		const staticCells = [
			'№',
			'Овог',
			'Нэр',
			'РД',
			'Нас',
			'Хүйс',
			'ЭЕШ шалгуур',
			'ЭЕШ оноо',
			'ЭЕШ Эрэмбэ',
			'ЭЕШ тайлбар',
			'МХБ шалгуур',
			'МХБ тайлбар',
			'Имейл',
			'Утасны дугаар',
			'Яаралтай холбогдох',
			'Хөтөлбөр',
			'Бүртгүүлсэн огноо',


		];

		utils.sheet_add_aoa(worksheet, [staticCells], { origin: "A1" });


		const headerCell = {
			border: {
				top: { style: "thin", color: { rgb: "000000" } },
				bottom: { style: "thin", color: { rgb: "000000" } },
				left: { style: "thin", color: { rgb: "000000" } },
				right: { style: "thin", color: { rgb: "000000" } }
			},
			alignment: {
				horizontal: 'center',
				vertical: 'center',
				wrapText: true
			},
			font: {
				sz: 10,
				bold: true
			}
		};

		const defaultCell = {
			border: {
				top: { style: "thin", color: { rgb: "000000" } },
				bottom: { style: "thin", color: { rgb: "000000" } },
				left: { style: "thin", color: { rgb: "000000" } },
				right: { style: "thin", color: { rgb: "000000" } }
			},
			alignment: {
				horizontal: 'left',
				vertical: 'center',
				wrapText: true
			},
			font: {
				sz: 10
			}
		};

		const defaultCenteredCell = {
			border: {
				top: { style: "thin", color: { rgb: "000000" } },
				bottom: { style: "thin", color: { rgb: "000000" } },
				left: { style: "thin", color: { rgb: "000000" } },
				right: { style: "thin", color: { rgb: "000000" } }
			},
			alignment: {
				horizontal: 'center',
				vertical: 'center',
				wrapText: true
			},
			font: {
				sz: 10
			}
		};

		const styleRow = 0;
		const sendRow = datas?.length + 1;
		const styleCol = 0;
		const sendCol = 20;

		for (let row = styleRow; row <= sendRow; row++) {
			for (let col = styleCol; col <= sendCol; col++) {
				const cellNum = utils.encode_cell({ r: row, c: col });

				if (!worksheet[cellNum]) {
					worksheet[cellNum] = {};
				}

				worksheet[cellNum].s = row === 0 ? headerCell : col === 0 ? defaultCenteredCell : defaultCell

			}
		}

		const phaseZeroCells = Array.from({ length: 4 }, (_) => { return ({ wch: 10 }) })

		worksheet["!cols"] = [
			{ wch: 3 },
			...phaseZeroCells,
			{ wch: 25 },
			{ wch: 10 },
			{ wch: 10 },
			{ wch: 25 },
			{ wch: 10 },
			{ wch: 25 },
			{ wch: 25 },
			{ wch: 10 },
			{ wch: 5 },
			{ wch: 25 },
			{ wch: 25 },
			{ wch: 25 },
			{ wch: 15 },
		];

		const phaseOneRow = Array.from({ length: datas.length }, (_) => { return ({ hpx: 30 }) })

		worksheet["!rows"] = [
			{ hpx: 40 },
			...phaseOneRow
		]

		writeFile(workbook, "Элсэгчдийн мэдээлэл.xlsx", { compression: true });
	}

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

	function handleSearch() {
		getDatas()
	}

	function onSelectedRowsChange(state) {
		setSelectedStudents(state?.selectedRows)
	}

	// Order modal toggle function
	function orderModalHandler() {
		setOrderModal(!orderModal);
	}

	//EMail modal toggle function
	function emailModalHandler() {
		setEmailModal(!emailModal)
	}

	//Message Modal toggle function
	function messageModalHandler() {
		setMessageModal(!messageModal)
	}


	const handleModal = () => {
		setModal(!modal)
	}

    function addModalHandler(e, data) {
        setAddModal(!addModal)
        setAddModalData(data || null)
    }

	// User details button handler
	function handleRowClicked(row) {
        window.open(`elselt/user/${row.id}`)
    }

	return (
		<Fragment>
			<OrderModal
				gpaModalHandler={orderModalHandler}
				gpaModal={orderModal}
				data={eyeshData}
				gplesson_year={selectedAdmission?.name || ''}
				profession_name={selectedProfession?.name || ''}
			/>
			<EmailModal
				emailModalHandler={emailModalHandler}
				emailModal={emailModal}
				selectedStudents={selectedStudents}
				getDatas={getDatas}
			/>
			<MessageModal
				messageModalHandler={messageModalHandler}
				messageModal={messageModal}
				selectedStudents={selectedStudents}
				getDatas={getDatas}
			/>
			{
				addModal &&
				<AddModal
					addModal={addModal}
					addModalHandler={addModalHandler}
					addModalData={addModalData}
					getDatas={getDatas}
					stateop={stateop}
				/>
			}
			{isLoading && Loader}
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4" className='mt-50'>{t('Элсэгчдийн МХ оноо жагсаалт')}</CardTitle>
					<div className='d-flex flex-wrap mt-md-0 mt-1'>
						<Button
							color='primary'
							className='d-flex align-items-center px-75 ms-1'
							id='sort_button'
                            disabled={Object.keys(user).length > 0 && (user.permissions.includes('lms-elselt-admission-create')) ? false : true}
							onClick={() => handleModal()}
						>
							<RiEditFill className='me-25' />
							Оноо эрэмбэлэх
						</Button>
					</div>
				</CardHeader>
				{isTableLoading && TableLoader}
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
					<Col md={3} sm={6} xs={12} >
						<Label className="form-label" for="tentssenEsehOp">
							{t('MX шалгалт онооны төлөв')}
						</Label>
						<Select
							name="tentssenEsehOp"
							id="tentssenEsehOp"
							classNamePrefix='select'
							isClearable
							className={classnames('react-select')}
							isLoading={isLoading}
							placeholder={t('-- Сонгоно уу --')}
							options={tentssenEsehOp || []}
							value={tentssenEsehOp.find((c) => c.id === yesh_state)}
							noOptionsMessage={() => t('Хоосон байна.')}
							onChange={(val) => {
								setEyeshState(val?.id || '')
							}}
							styles={ReactSelectStyles}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.name}
						/>
					</Col>
				</Row>
				<div className='d-flex justify-content-between my-50 mt-1'>
					<div className='d-flex'>
						<div className='px-1'>
							<Button
								color='primary'
								disabled={(selectedStudents.length != 0 && user?.permissions?.includes('lms-elselt-message-create')) ? false : true}
								className='d-flex align-items-center px-75'
								id='message_button'
								onClick={() => messageModalHandler()}
							>
								<BiMessageRoundedError className='me-25' />
								Мессеж илгээх
							</Button>
							<UncontrolledTooltip target='message_button'>
								Сонгосон элсэгчид руу мессеж илгээх
							</UncontrolledTooltip>
						</div>
					</div>
					<div className='px-1'>
						<Button color='primary' className='d-flex align-items-center px-75' id='excel_button' onClick={() => convert()}>
							<HiOutlineDocumentReport className='me-25' />
							Excel
						</Button>
						<UncontrolledTooltip target='excel_button'>
							Доорхи хүснэгтэнд харагдаж байгаа мэдээллийн жагсаалтаар эксел файл үүсгэнэ
						</UncontrolledTooltip>
					</div>
				</div>
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
				<div className="react-dataTable react-dataTable-selectable-rows" id='datatableLeftTwoRightTwo'>
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
						columns={getColumns(currentPage, rowsPerPage === 'Бүгд' ? 1 : rowsPerPage, total_count, addModalHandler, handleRowClicked)}
						sortIcon={<ChevronDown size={10} />}
						paginationPerPage={rowsPerPage === 'Бүгд' ? 1 : rowsPerPage}
						paginationDefaultPage={currentPage}
						data={datas}
						paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage === 'Бүгд' ? total_count : rowsPerPage, total_count)}
						fixedHeader
						fixedHeaderScrollHeight='62vh'
						selectableRows
						onSelectedRowsChange={(state) => onSelectedRowsChange(state)}
						direction="auto"
						// defaultSortFieldId={'order_no'}
						style={{ border: '1px solid red' }}
					/>
				</div>
			</Card>
			{modal && <SortModal open={modal} handleModal={handleModal} refreshDatas={getDatas} type={type} editData={editData} />}
		</Fragment>
	)
}


export default MXB
