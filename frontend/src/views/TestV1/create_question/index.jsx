import React, { Fragment, useState, useEffect, useContext } from "react";

import { Plus, Search} from "react-feather";

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
import useModal from "@hooks/useModal"
import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'
import { useTranslation } from "react-i18next";

import { getPagination } from "@utils";

import { getColumns } from "./helpers";

import AddQuestion from "./AddQuestion";

const CreateQuestion = () => {

	const { t } = useTranslation();

	const default_page = [10, 15, 50, 75, 100];

	const { showWarning } = useModal()
	const { user } = useContext(AuthContext)
	const { school_id } = useContext(SchoolContext)
	const [datas, setDatas] = useState([]);

	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);

    // Өөрийгөө сорих тест хичээлээр хайх
	const [searchValue, setSearchValue] = useState('');
    const [selectedLesson, setSelectedLesson] = useState('')
	const [subjectId, setSubjectId] = useState('')
    const [lessonOption, setLessonOption] = useState([])
	const [lessonSedevOption, setLessonSedevOption] = useState([])

    const [selectedRow, setSelectedRows] = useState([])
    const [editData, setEditRowData] = useState({})

	// Нийт датаны тоо
	const [total_count, setTotalCount] = useState(1);

	// Loader
	const { isLoading, fetchData } = useLoader({});

	// Modal
	const [modal, setModal] = useState(false);

	// API
	const questionAPI = useApi().challenge.question
    const teacherLessonApi = useApi().study.lesson

	async function getDatas() {
		const { success, data } = await fetchData(questionAPI.get(currentPage, rowsPerPage, selectedLesson, subjectId, searchValue));

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

    // Select хийж устгана
	async function handleDelete() {

		var delete_ids = selectedRow.map(li => li.id)

		const { success, data } = await fetchData(questionAPI.delete(delete_ids));
		if (success) {
			getDatas();
			selectedRow([])
		}
	}

	// Нэмэх функц
	const handleModal = () => {
		setModal(!modal);
	};

	// Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

    // Засах товч дарах үед ажиллах функц
    const handleEdit = (row) => {
        setEditRowData(row)
        handleModal()
    }

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value));
    }

	async function getLessonSedev()
    {
        if(selectedLesson) {
            const { success, data } = await fetchData(teacherLessonApi.getSedevAll(selectedLesson))
            if(success) {
                setLessonSedevOption(data)
            }
        }
    }


	useEffect(() => {
		getDatas();
	}, [currentPage, rowsPerPage, selectedLesson, subjectId]);

    useEffect(
        () =>
        {
            getLesson()
			getDatas()
        },
        []
    )

	useEffect(
		() =>
		{
			getLessonSedev()
		},
		[selectedLesson]
	)

	function onSelectedRowsChange(state) {
        var selectedRows = state.selectedRows

		setSelectedRows(selectedRows);
    }

	// Хайлт хийх үед ажиллах хэсэг
	const handleFilter = (e) => {
        const value = e.target.value.trimStart();
        setSearchValue(value);
    };

	// Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        if (searchValue.length > 2 || !searchValue) {
			getDatas()
		}
    }

	useEffect(
		() =>
		{
			if (searchValue.length > 2 || !searchValue) {
				getDatas()
			}

		}, [searchValue]
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
					<CardTitle tag="h4">{t("Асуултын жагсаалт")}</CardTitle>
					<div className="d-flex flex-wrap mt-md-0 mt-1">
						<Button
							disabled={Object.keys(user).length > 0 && (user.permissions.includes('lms-exam-question-create') && school_id ) ? false : true}
							color="primary"
							onClick={() => { handleModal(), setEditRowData({})}}
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
						<Label className="form-label" for="subject">
							{t('Хичээлийн сэдэв')}
						</Label>
						<Select
							id="subject"
							name="subject"
							isClearable
							classNamePrefix='select'
							className='react-select'
							placeholder={`-- Сонгоно уу --`}
							options={lessonSedevOption || []}
							noOptionsMessage={() => 'Хоосон байна'}
							onChange={(val) => {
								setSubjectId(val?.id || '')
							}}
							styles={ReactSelectStyles}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.title}
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
				<Row className="d-flex justify-content-between">

					<Col className='mt-1'  md={6} sm={12}>
					{
						selectedRow.length > 0 &&
							<Button
								size="sm"
								color="danger"
								className="ms-1"
								outline
								onClick={() => showWarning({
									header: {
										title: `Асуултууд устгах`,
									},
									question: `Та сонгосон асуултуудыг устгахдаа итгэлтэй байна уу?`,
									onClick: () => handleDelete(),
									btnText: 'Устгах',
								})}
							 >Устгах</Button>
					}
					</Col>

					<Col className='d-flex align-items-center mobile-datatable-search mt-1' md={6} sm={12}>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder={t('Хайх')}
                            value={searchValue}
                            onChange={handleFilter}
                            onKeyPress={e => e.key === 'Enter' && handleSearch()}
                        />
                        <Button
                            size='sm'
                            className='ms-50 mb-50 me-1'
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
						)}
						paginationPerPage={rowsPerPage}
						paginationDefaultPage={currentPage}
						data={datas}
						paginationComponent={getPagination(
							handlePagination,
							currentPage,
							rowsPerPage,
							total_count,
						)}
						fixedHeader
						fixedHeaderScrollHeight="62vh"
						selectableRows
						onSelectedRowsChange={(state) => onSelectedRowsChange(state)}
					/>
				</div>
				{modal && (
					<AddQuestion
						open={modal}
						handleModal={handleModal}
                        editData={editData}
						refreshDatas={getDatas}
					/>
				)}
			</Card>
		</Fragment>
	);
};

export default CreateQuestion;


