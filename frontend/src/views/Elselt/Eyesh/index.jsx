// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner, UncontrolledTooltip } from 'reactstrap'

import { ChevronDown, Plus, Search } from 'react-feather'

import { useForm, Controller } from "react-hook-form";
import { RiEditFill } from "react-icons/ri";

import DataTable from 'react-data-table-component'

import classnames from "classnames";
import { getColumns } from './helpers';

import { useTranslation } from 'react-i18next'
import { getPagination, ReactSelectStyles } from '@utils'

import Select from 'react-select'

import useApi from '@hooks/useApi';

import useLoader from '@hooks/useLoader';

import AuthContext from "@context/AuthContext"

import { SortModal } from './SortModal'


const ElseltEyesh = () => {
	const { user } = useContext(AuthContext)

	const [searchValue, setSearchValue] = useState("");

	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(20)
	// Loader
	const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });
	const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({ isFullScreen: false })

	const [admop, setAdmop] = useState([])
	const [adm, setAdm] = useState('')
	const [profOption, setProfession] = useState([])
	const [profession_id, setProfession_id] = useState('')
	const [datas, setDatas] = useState([])
	const [total_count, setTotalCount] = useState('')

	const [selectedAdmission, setSelectedAdmission] = useState(null);
	const [selectedProfession, setSelectedProfession] = useState(null);

	const professionApi = useApi().elselt.profession
	const admissionYearApi = useApi().elselt
	const elseltEyeshApi = useApi().elselt.eyesh

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

	async function getAdmissionYear() {
		const { success, data } = await fetchData(admissionYearApi.getAll())
		if (success) {
			setAdmop(data)
		}
	}
	async function getDatas() {
		const { success, data } = await allFetch(elseltEyeshApi.get(rowsPerPage, currentPage, sortField, searchValue, adm, profession_id))
		if (success) {
			console.log(data)
			setTotalCount(data?.count)
			setDatas(data)
			// Нийт хуудасны тоо
            var cpage_count = Math.ceil(data?.count / rowsPerPage === 'Бүгд' ? 1 : rowsPerPage)
            setPageCount(cpage_count)
		}
	}
	useEffect(() => {
		getAdmissionYear()
		getProfession()
	}, [])

	// ** Function to handle filter
	const handleFilter = e => {
		const value = e.target.value.trimStart();
		setSearchValue(value)
	}
	function handleButton(){
		getDatas()
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

	return (
		<Fragment>
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4" className='mt-50'>{t('Элсэлтийн бүртгэл')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
						<Button
							color='primary'
							className='d-flex align-items-center px-75'
							id='state_button'
							onClick={() => handleButton()}
						>
							<RiEditFill className='me-25' />
							Оноо татах
						</Button>
						<UncontrolledTooltip target='state_button'>
							Сонгосон элсэгчдийн эеш оноог татах
						</UncontrolledTooltip>
						<Button
							color='primary'
							className='d-flex align-items-center px-75 ms-1'
							id='state_button'
							onClick={() => handleModal()}
						>
							<RiEditFill className='me-25' />
							Оноо эрэмбэлэх
						</Button>
                    </div>
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
								setProfession_id(val?.prof_id || '')
								setSelectedProfession(val)
							}}
							styles={ReactSelectStyles}
							getOptionValue={(option) => option?.prof_id}
							getOptionLabel={(option) => option.name}
						/>
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
			{modal && <SortModal open={modal} handleModal={handleModal} refreshDatas={getDatas} type={type} editData={editData}/>}
		</Fragment>
	)
}

export default ElseltEyesh;
