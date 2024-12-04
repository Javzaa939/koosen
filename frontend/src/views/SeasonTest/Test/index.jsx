import React, { Fragment, useState, useEffect, useContext } from "react";
import { getPagination, get_questiontimetype, ReactSelectStyles } from "@utils";
import { useTranslation } from "react-i18next";
import { getColumns } from "./helpers";
import { Plus, HelpCircle, Search } from "react-feather";
import SchoolContext from '@context/SchoolContext'

import {
	Row,
	CardHeader,
	Card,
	CardTitle,
	Button,
	Col,
	Input,
	Label,
	CardBody,
	Alert
} from "reactstrap";

import DataTable from "react-data-table-component";
import Select from 'react-select'
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import Addmodal from "./Add";
// import Show from "../Show";
// import Exam from "./Exam"
import classNames from "classnames"

const Test = () => {
    const { school_id } = useContext(SchoolContext)

	const { t } = useTranslation();

	const default_page = [10, 15, 50, 75, 100];

	const [datas, setDatas] = useState([]);

	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [total_count, setTotalCount] = useState(1);
    const [searchValue, setSearchValue] = useState('');

	const [selectedLesson, setSelectedLesson] = useState('')
	const [selectedTime, setSelectedTime] = useState('progressing')
	const [selectedTeacher, setSelectedTeacher] = useState('')
    const [teachers, setTeachers] = useState([]);

	const [lessonOption, setLessonOption] = useState([])
	const [editData, setEditRowData] = useState()
	const [examId, setExamModalId] = useState()
	const [showData, setShowRowData] = useState({})
	const [isEdit, setIsEdit] = useState(false)

	const { isLoading, fetchData } = useLoader({});
	const { fetchData: getLessonFetchData } = useLoader({});
    const { isLoading: teacherLoading, fetchData: teacherFetch } = useLoader({})


	const [modal, setModal] = useState(false);
	const [edit_modal, setEditModal] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [examModal, setExamModal] = useState(false)

	const challengeAPI = useApi().challenge
	const teacherLessonApi = useApi().study.lesson
	const teacherListApi = useApi().hrms.teacher

	async function getDatas() {
		const { success, data } = await fetchData(challengeAPI.get(currentPage, rowsPerPage, selectedLesson, selectedTime, selectedTeacher, searchValue));

		if (success) {
			setDatas(data?.results);
			setTotalCount(data?.count);
		}
	}

	async function getTeachers()
    {
        const { success, data } = await teacherFetch(teacherListApi.getSchoolFilter(school_id))
        if(success) {
            setTeachers(data)
        }
    }
	async function getLesson() {
		const { success, data } = await getLessonFetchData(teacherLessonApi.getAll(''))
		if (success) {
			setLessonOption(data)
		}
	}

	async function handleDelete(id) {
		const { success, data } = await fetchData(challengeAPI.delete(id));
		if (success) {
			getDatas();
		}
	}

	// Засах товч дарах үед ажиллах функц
	const handleEdit = (row) => {
		setEditRowData(row)
		handleEditModal()
		setIsEdit(!isEdit)
	}

	// Дэлгэрэнгүй товч дарах үед ажиллах функц
	const handleShow = (row) => {
		setShowRowData(row)
		handleShowModal()
	}

	const handleShowModal = () => {
		setShowModal(!showModal);
		if (showModal) {
			setShowRowData({})
		}
	};

	// Нэмэх функц
	const handleModal = () => {
		setModal(!modal);
		if (modal) {
			setEditRowData()
		}
		setIsEdit(false)
	};

	const handleEditModal = (row) => {
		setEditRowData(row)
		setModal(!modal);
		// setIsEdit(false)
	};

	const handleExamModal = (id) => {
		setExamModalId(id)
		setExamModal(!examModal);
	};

	// Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

	function handlePerPage(e) {
		setRowsPerPage(parseInt(e.target.value));
	}

	const handleSend = async (id) => {
		const { success, data } = await fetchData(challengeAPI.send(id));
		if (success) {
		}
	}

	useEffect(() => {
		getDatas();
	}, [currentPage, rowsPerPage, selectedLesson, selectedTime, selectedTeacher]);

	useEffect(
		() => {
			getLesson()
			getTeachers()
		},
		[]
	)

	function handleSearch() {
        setTimeout(() => {
            getDatas()
        }, 100)
    }

	useEffect(() => {
        if(searchValue.length < 1) getDatas()
    },[searchValue])

	const handleFilter = e => {
        const value = e.target.value.trimStart();
		setSearchValue(value)
	}

	return (
		<Fragment>
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4" className="mt-50">{t("Шалгалтын жагсаалт")}</CardTitle>
					<div className="d-flex flex-wrap mt-md-0 mt-1">
						<Button
							color="primary"
							onClick={() => handleModal()}
						>
							<Plus size={15} />
							<span className="align-middle ms-50">
								{t("Нэмэх")}
							</span>
						</Button>
					</div>
				</CardHeader>
				<Row>
                    <Col md={3} sm={10} className="m-1">
						<Label className="form-label" for="lesson">
							{t('Хичээл')}
						</Label>
						<Select
							id="lesson"
							name="lesson"
							isClearable
							classNamePrefix='select'
							className='react-select'
							placeholder={`-- Сонгоно уу --`}
							options={lessonOption || []}
							noOptionsMessage={() => 'Хоосон байна'}
							onChange={(val) => {
								setSelectedLesson(val?.id || '')
							}}
							styles={ReactSelectStyles}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.name}
						/>
					</Col>
				    <Col md={3} sm={10} className="m-1">
						<Label>Багш</Label>
						<Select
							classNamePrefix='select'
							isClearable
							className={classNames('react-select')}
							isLoading={teacherLoading}
							placeholder={t('-- Сонгоно уу --')}
							options={teachers || []}
							value={teachers.find((c) => c.id === selectedTeacher)}
							noOptionsMessage={() => t('Хоосон байна')}
							onChange={(val) => {
								setSelectedTeacher(val ? val.id : '')
							}}
							styles={ReactSelectStyles}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.full_name}
						/>
					</Col>
					
					<Col md={3} sm={10} className="m-1">
						<Label className="form-label" for="time">
							{t('Хугацаагаар')}
						</Label>
						<Select
							id="time"
							name="time"
							isClearable
							classNamePrefix='select'
							className='react-select'
							placeholder={`-- Сонгоно уу --`}
							value={get_questiontimetype()?.find((e) => e.id == selectedTime)}
							options={get_questiontimetype() || []}
							noOptionsMessage={() => 'Хоосон байна'}
							onChange={(val) => {
								setSelectedTime(val?.id || '')
							}}
							styles={ReactSelectStyles}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.name}
						/>
					</Col>
				</Row>
				<Row className="justify-content-between mx-0 mt-1 mb-1" sm={12}>
					<Col
						className="d-flex align-items-center justify-content-start"
						md={6}
						sm={12}
					>
						<Col lg={2} md={3} sm={4} xs={5} className="pe-1">
							<Input
								type="select"
								bsSize="sm"
								style={{ height: "30px" }}
								value={rowsPerPage}
								onChange={(e) => handlePerPage(e)}
							>
								{default_page.map((page, idx) => (
									<option key={idx} value={page}>
										{page}
									</option>
								))}
							</Input>
						</Col>
						<Col md={10} sm={3}>
							<Label for="sort-select">
								{t("Хуудсанд харуулах тоо")}
							</Label>
						</Col>
					</Col>
					<Col className='d-flex align-items-end mobile-datatable-search mt-50'>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder={t("Хайх")}
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
						pagination
						className="react-dataTable"
						progressPending={isLoading}
						progressComponent={
							<div className="my-2">
								<h5>{t("Түр хүлээнэ үү...")}</h5>
							</div>
						}
						noDataComponent={
							<div className="my-2">
								<h5>{t("Өгөгдөл байхгүй байна")}</h5>
							</div>
						}
						columns={getColumns(
							currentPage,
							rowsPerPage,
							total_count,
							handleEdit,
							handleDelete,
							handleShow,
							handleSend,
							handleEditModal,
							handleExamModal
						)}
						paginationPerPage={rowsPerPage}
						paginationDefaultPage={currentPage}
						data={datas}
						paginationComponent={getPagination(
							handlePagination,
							currentPage,
							rowsPerPage,
							total_count
						)}
						fixedHeader
						fixedHeaderScrollHeight="62vh"
					/>
				</div>
				{
					modal && (
						<Addmodal
							open={modal}
							handleModal={handleModal}
							refreshDatas={getDatas}
							select_datas={lessonOption}
							editData={editData}
						/>
                )}
				{/* {
					showModal &&
					<Show
						open={showModal}
						handleModal={handleShowModal}
						datas={showData}
					/>
				}
				{
					examModal &&
					<Exam
						testId={examId}
						handleModal={handleExamModal} />
				} */}
			</Card>
			{/* <Card className={'mt-2'}>
				<CardHeader><div className="d-flex"><HelpCircle size={20} /><h5 className="ms-25 fw-bolder">Тусламж хэсэг</h5></div></CardHeader>
				<CardBody>
					<Alert color='primary' className={'p-1 тме1'}>
						Онлайн шалгалт үүсгэх заавар мэдээлэл хүргэж байна.
					</Alert>
					<iframe
						width="100%"
						height="500"
						title='Шалгалт'
						src={'https://www.youtube.com/embed/mvF55C892uY'}
						sandbox='allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
					/>
				</CardBody>
			</Card> */}
		</Fragment>
	);
};

export default Test;