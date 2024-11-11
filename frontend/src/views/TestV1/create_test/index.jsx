import React, { Fragment, useState, useEffect, useContext } from "react";

import { Plus} from "react-feather";

import {
	Row,
	CardHeader,
	Card,
	CardTitle,
	Button,
	Col,
	Input,
	Label,
	Spinner,
} from "reactstrap";

import DataTable from "react-data-table-component";
import Select from 'react-select'
import { ReactSelectStyles } from "@utils"

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { useTranslation } from "react-i18next";
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'

import { getPagination, get_questiontimetype } from "@utils";

import { getColumns } from "./helpers";

import Addmodal from "./Add";
import Show from "./Show";

const CreateTest = () => {

	const { t } = useTranslation();

	const default_page = [10, 15, 50, 75, 100];

	const [datas, setDatas] = useState([]);
	const { user } = useContext(AuthContext)
	const { school_id } = useContext(SchoolContext)

	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);

    // Өөрийгөө сорих тест хичээлээр хайх
    const [selectedLesson, setSelectedLesson] = useState('')
    const [selectedTime, setSelectedTime] = useState('')
    const [lessonOption, setLessonOption] = useState([])
	const [editData, setEditRowData] = useState({})
	const [showData, setShowRowData] = useState({})
	const [isEdit, setIsEdit] = useState(false)

	// Нийт датаны тоо
	const [total_count, setTotalCount] = useState(1);

	// Loader
	const { isLoading, fetchData } = useLoader({});

	// Modal
	const [modal, setModal] = useState(false);
	const [showModal, setShowModal] = useState(false);

	// API
	const challengeAPI = useApi().challenge
    const teacherLessonApi = useApi().study.lesson

	async function getDatas() {
		const { success, data } = await fetchData(challengeAPI.get(currentPage, rowsPerPage, selectedLesson, selectedTime));

		if (success) {
			setDatas(data?.results);
			setTotalCount(data?.count);
		}
	}

    async function getLesson()
    {
        const { success, data } = await fetchData(teacherLessonApi.get('all'))
        if(success) {
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
        handleModal()
		setIsEdit(!isEdit)
    }

	// Засах товч дарах үед ажиллах функц
    const handleShow = (row) => {
        setShowRowData(row)
		handleShowModal()
    }

	// Нэмэх функц
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
			setEditRowData({})
		}
		setIsEdit(false)
	};

	// Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value));
    }

	const handleSend = async(id) => {
		const { success, data } = await fetchData(challengeAPI.send(id));
		if (success) {
		}
	}

	useEffect(() => {
		getDatas();
	}, [currentPage, rowsPerPage, selectedLesson, selectedTime]);

    useEffect(
        () =>
        {
            getLesson()
			getDatas()
        },
        []
    )

	return (
		<Fragment>
			{isLoading && (
				<div className="suspense-loader">
					<Spinner size="bg" />
					<span className="ms-50">{t("Түр хүлээнэ үү...")}</span>
				</div>
			)}
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t("Шалгалтын жагсаалт")}</CardTitle>
					<div className="d-flex flex-wrap mt-md-0 mt-1">
						<Button
							color="primary"
                            disabled={Object.keys(user).length > 0 && (user.permissions.includes('lms-exam-create') && school_id) ? false : true}
							onClick={() => handleModal()}
						>
							<Plus size={15} />
							<span className="align-middle ms-50">
								{t("Нэмэх")}
							</span>
						</Button>
					</div>
				</CardHeader>
				<Row >
					<Col md={4} sm={12} className="m-1">
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
					<Col md={4} sm={12} className="m-1">
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
							handleSend
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
				{modal && (
					<Addmodal
						open={modal}
						handleModal={handleModal}
						refreshDatas={getDatas}
						editData={editData}
						isEdit={isEdit}
						setEditRowData={setEditRowData}
					/>
				)}
				{
					showModal &&
						<Show
							open={showModal}
							handleModal={handleShowModal}
							datas={showData}
						/>
				}
			</Card>
		</Fragment>
	);
};

export default CreateTest;

