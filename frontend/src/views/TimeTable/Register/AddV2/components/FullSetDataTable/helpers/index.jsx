import {
	Badge,
	Button,
	Card,
	Col,
	Input,
	Label,
	UncontrolledTooltip
} from 'reactstrap';

import DataTable from 'react-data-table-component';
import moment from 'moment';
import { CheckSquare, LogOut, Search, XSquare } from 'react-feather';

export function handleSort(column, sort, setSort) {
	if (sort === 'asc') {
		setSort(column.header)
	} else {
		setSort('-' + column.header)
	}
}

export function getColumns(currentPage, rowsPerPage, total_count, t) {
	const page_count = Math.ceil(total_count / rowsPerPage)

	if (currentPage > page_count) {
		currentPage = 1
	}

	const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
			center: true,
			maxWidth: "100px",
		},
		{
			name: `${t('Оюутны код')}`,
			selector: (row) => (<span>{row.student.code}</span>),
			center: true,
			header: 'student__student__code',
			sortable: true,
			maxWidth: "150px",
		},
		{
			name: `${t('Оюутан')}`,
			selector: (row) => (<span>{row.student.name}</span>),
			center: true,
			header: 'student__student__first_name',
			sortable: true,
			maxWidth: "150px",
		},
		{
			name: `${t('Нэвтэрсэн төхөөрөмжийн төрөл')}`,
			selector: (row) => (<span>{row.device_type.name}</span>),
			center: true,
			header: 'device_type',
			sortable: true,
		},
		{
			name: `${t('Нэвтэрсэн төхөөрөмжийн нэр')}`,
			selector: (row) => (<span>{row.device_name}</span>),
			center: true,
			header: 'device_name',
			sortable: true,
		},
		{
			name: `${t('Нэвтэрсэн хэрэглэгчийн вэб хөтөч')}`,
			selector: (row) => (<span>{row.browser}</span>),
			center: true,
			header: 'browser',
			sortable: true,
		},
		{
			name: `${t('Нэвтэрсэн төхөөрөмжийн үйлдлийн систем')}`,
			selector: (row) => (<span>{row.os_type}</span>),
			center: true,
			header: 'os_type',
			sortable: true,
		},
		{
			name: `${t('Нэвтэрсэн хэрэглэгчийн IP хаяг')}`,
			selector: (row) => (<span>{row.ip}</span>),
			center: true,
			header: 'ip',
			sortable: true,
		},
		{
			name: `${t('Нэвтрэлт амжилттай болсон эсэх')}`,
			selector: (row) => (<span>{
				row.is_logged
					?
					<CheckSquare width={"15px"} />
					:
					<XSquare width={"15px"} />
			}</span>),
			center: true,
			header: 'is_logged',
			sortable: true,
		},
		{
			name: `${t('Нэвтрэлт огноо')}`,
			selector: (row) => (<span>{row.in_time ? moment(row.in_time).format('YYYY-MM-DD HH-mm-ss') : ''}</span>),
			center: true,
			header: 'in_time',
			sortable: true,
			maxWidth: "190px",
		},
		{
			name: `${t('Гаралт огноо')}`,
			selector: (row) => (<span>{row.out_time ? moment(row.out_time).format('YYYY-MM-DD HH-mm-ss') : ''}</span>),
			center: true,
			header: 'out_time',
			sortable: true,
			maxWidth: "190px",
		},
	]

	return columns
}

export function ExpandedComponent(props) {
	const { data, t, closeSessions } = props

	const tableCustomStyles = {
		headCells: {
			style: {
				backgroundColor: '#9CD9F3'
			},
		},
	}

	function getColumnsDetail() {
		const columns = [
			{
				name: `${'Үйлдэл'}`,
				selector: (row) => {
					return <div>
						{t('Үйлдэл')}: <a role="button" onClick={() => { closeSessions(row) }} id={`closeSessions${row?.id}`} className="me-1">
							<Badge color="light-secondary" pill><LogOut width={"15px"} /></Badge>
						</a>
						<UncontrolledTooltip placement='top' target={`closeSessions${row.id}`} >{t('Сонгосон сессийг хаах')}</UncontrolledTooltip>
					</div>
				},
			},
		]

		return columns
	}

	return (
		<Card className='mb-0 rounded-0 border-bottom px-2 pb-1'>
			<div className='react-dataTable react-dataTable-selectable-rows mt-1'>
				<DataTable
					noTableHead
					noHeader
					responsive
					className='react-dataTable'
					noDataComponent={(
						<div className="my-2">
							<h5>{t('Өгөгдөл байхгүй байна')}</h5>
						</div>
					)}
					// highlightOnHover={true}
					data={[data.data]}
					columns={getColumnsDetail()}
					customStyles={tableCustomStyles}
					fixedHeader
					fixedHeaderScrollHeight='62vh'
				/>
			</div>
		</Card>
	)
}

export const handlePagination = (page, setCurrentPage) => {
	setCurrentPage(page.selected + 1);
};

export const searchComponent = (searchValue, setSearchValue, rowsPerPage, setRowsPerPage, defaultPage, t) => {
	const handleFilter = e => {
		const value = e.target.value.trimStart();
		setSearchValue(value)
	}

	function handleSearch() {
		setSearchValue(current => current)
	}

	function handlePerPage(e) {
        setRowsPerPage(e.target.value === 'Бүгд' ? e.target.value : parseInt(e.target.value))
	}

	return (
		<>
			<Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
				<Col md={3} sm={4} xs={5} className='pe-1'>
					<Input
						type='select'
						bsSize='sm'
						style={{ height: "30px" }}
						value={rowsPerPage}
						onChange={e => handlePerPage(e)}
						id='rowsPerPage'
					>
						{
							defaultPage.map((page, idx) => (
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
					<Label for='rowsPerPage'>{t('Хуудсанд харуулах тоо')}</Label>
				</Col>
			</Col>
			<Col className='d-flex align-items-center mobile-datatable-search mt-1' md={6} sm={12}>
				<Label className="me-1 search-filter-title pt-50" for="search-input">
					{t('Хайлт')}
				</Label>
				<Input
					className='dataTable-filter mb-50'
					type='text'
					bsSize='sm'
					id='search-input'
					placeholder={t('Хайх үг....')}
					value={searchValue ?? ''}
					onChange={handleFilter}
					onKeyDown={e => e.key === 'Enter' && handleSearch()}
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
		</>
	)
}

export function onSelectedRowsChange(state, setSelectedRows, selectedRows) {
	const newState = state?.selectedRows
	setSelectedRows(newState)
}

export const clearSelected = (setToggleCleared, setSelectedRows) => {
	setToggleCleared(current => !current)
	setSelectedRows([])
};
