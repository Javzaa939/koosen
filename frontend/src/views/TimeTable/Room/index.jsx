// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner } from 'reactstrap'

import { ChevronDown, Plus } from 'react-feather'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from "@context/AuthContext"

import { useTranslation } from "react-i18next"

import { getPagination } from '@utils'

import { getColumns } from './helpers'

import Addmodal from './Add'
import EditModal from './Edit'

import Select from 'react-select'
import {  ReactSelectStyles } from "@utils"

const buildOption = [
	{ value: 'chocolate', label: 'Chocolate' },
	{ value: 'strawberry', label: 'Strawberry' },
	{ value: 'vanilla', label: 'Vanilla' }
]

const Room = () => {

	const { t } = useTranslation()
	const { user } = useContext(AuthContext)

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

	const [searchValue, setSearchValue] = useState("");

	const [filteredData, setFilteredData] = useState([]);
	const [datas, setDatas] = useState([]);

	const [buildOption, setBuildOption] = useState([])
	const [schoolOption, setSchoolOption] =useState([])

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

	// Loader
	const { isLoading, fetchData } = useLoader({});

	// Api
	const roomApi = useApi().timetable.room
	const buildApi = useApi().timetable.building

	// Modal
	const [modal, setModal] = useState(false);
    const [edit_modal, setEditModal] = useState(false)
    const [room_id, setRoomId] = useState('')
	const [school_id, setSchoolId] = useState('')

	const [build_id, setBuild] = useState('')

	const schoolApi = useApi().hrms.subschool

	const editModal = (id) => {
        /** NOTE Засах гэж буй хичээлийн стандартын id-г авна */
        setRoomId(id)
        setEditModal(!edit_modal)
    }

	/* Модал setState функц */
	const handleModal = () => {
		setModal(!modal)
	}

	/* Устгах функц */
	const handleDelete = async(id) => {
		const { success } = await fetchData(roomApi.delete(id))
		if(success) {
			getDatas()
		}
	};

	/* Жагсаалтын дата авах функц */
	async function getDatas() {
		const { success, data } = await fetchData(roomApi.get())
		if(success) {
			setDatas(data)
			setTotalCount(data.length)
		}
	}

	/* Хичээлийн байрны дата авах функц */
	async function getBuild() {
		const { success, data } = await fetchData(buildApi.get())
		if(success) {
			setBuildOption(data)
		}
	}

	async function getSchools() {
        const { success, data } = await fetchData(schoolApi.get())
        if(success) {
            setSchoolOption(data)
        }
    }

	useEffect(() => {
		getDatas()
		getBuild()
		getSchools()
	},[])


	// Хайлт хийх үед ажиллах хэсэг
	const handleFilter = (e) => {
		var updatedData = [];
		const value = e.target.value.trimStart();

		setSearchValue(value);

		if (value.length > 0) {
			updatedData = datas.filter((item) => {
				const startsWith =
					item.code.toString().toLowerCase().startsWith(value.toString().toLowerCase()) ||
					item.name.toString().toLowerCase().startsWith(value.toString().toLowerCase())

				const includes =
					item.code.toString().toLowerCase().includes(value.toString().toLowerCase()) ||
					item.name.toString().toLowerCase().includes(value.toString().toLowerCase())

				if (startsWith) {
					return startsWith;
				}
				else if (!startsWith && includes) {
					return includes;
				}
				else {
					return null;
				}
			});

			setFilteredData(updatedData);
			setSearchValue(value);
		}
	};

	// Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

	const handleBuild = (id, type) => {

		if (type === 'build') {
			setBuild(id)
		} else {
			setSchoolId(id)
		}
	}

	const searchBuild = () => {
		var updatedData = [];

		if (school_id) {
			updatedData = datas.filter((item) => {
				return item.school?.id === school_id
			})
		}

		if (build_id) {
			updatedData = datas.filter((item) => {
				return item.building?.id === build_id
			})
		}

		setFilteredData(updatedData);
	}

	useEffect(
		() =>
		{
			searchBuild()
		},
		[school_id, build_id]
	)

	return (
		<Fragment>
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Өрөөний бүртгэл')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button color='primary' disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-timetable-room-create')  ? false : true} onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className=" d-flex justify-content-between mx-0 mt-1" >
				    <Col md={4} className='mb-1'>
						<Label className="form-label me-1" for="school">
							{t('Сургууль')}
						</Label>
						<Select
							name="school"
							id="school"
							classNamePrefix='select'
							isClearable
							className={'react-select'}
							isLoading={isLoading}
							options={schoolOption || []}
							placeholder={t('-- Сонгоно уу --')}
							noOptionsMessage={() => t('Хоосон байна')}
							styles={ReactSelectStyles}
							value={buildOption.find((c) => c.id === school_id)}
							onChange={(val) => {
								handleBuild(val?.id, 'school' || '', '')
							}}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.name}
						/>
                    </Col>
					<Col md={4} className='mb-1'>
						<Label className="form-label me-1" for="building">
							{t('Хичээлийн байр')}
						</Label>
						<Select
							name="building"
							id="building"
							classNamePrefix='select'
							isClearable
							className={'react-select'}
							isLoading={isLoading}
							options={buildOption || []}
							placeholder={t('-- Сонгоно уу --')}
							noOptionsMessage={() => t('Хоосон байна')}
							styles={ReactSelectStyles}
							value={buildOption.find((c) => c.id === build_id)}
							onChange={(val) => {
								handleBuild(val?.id, 'build' || '')
							}}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.name}
						/>
                    </Col>
                    <Col md={4} className='d-flex justify-content-end me-0'>
						<div>
						    <Label className="form-label me-1" for="search">
							   {t('Хайх')}
						    </Label>
							<Input
								className="dataTable-filter me-0 mb-50"
								type="text"
								bsSize="sm"
								id="search-input"
								value={searchValue}
								onChange={handleFilter}
								placeholder={t('Хайх үг....')}
							/>
						</div>
					</Col>
				</Row>
					<div className="react-dataTable react-dataTable-selectable-rows" id="datatableLeftTwoRightOne">
						<DataTable
                            noHeader
                            pagination
                            className='react-dataTable'
                            progressPending={isLoading}
                            progressComponent={(
                                <div className='my-2'>
                                    <h5>{t('Түр хүлээнэ үү')}...</h5>
                                </div>
                            )}
                            noDataComponent={(
                                <div className="my-2">
                                    <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                </div>
                            )}
                            columns={getColumns(currentPage, rowsPerPage, searchValue.length ? filteredData : datas, handleDelete, editModal, user)}
                            sortIcon={<ChevronDown size={10} />}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            data={searchValue.length > 0 ||( school_id || build_id) ? filteredData : datas}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count, searchValue, filteredData)}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                        />
					</div>
				{modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas}/>}
			    {edit_modal && <EditModal open={edit_modal} handleModal={editModal} room_id={room_id} refreshDatas={getDatas} />}
        	</Card>
        </Fragment>
    )
}

export default Room;
