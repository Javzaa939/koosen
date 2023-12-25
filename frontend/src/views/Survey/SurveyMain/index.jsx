import React, { Fragment, useState, useEffect, useContext } from "react";

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

import { Search, Plus } from "react-feather";
import { useTranslation } from "react-i18next";

import DataTable from "react-data-table-component";
import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import AuthContext from "@context/AuthContext"

import { getPagination, get_questiontimetype, ReactSelectStyles } from "@utils";
import { getColumns } from "./helpers";

import Createmodal from "./Add";
import Detail from "./Detail";


const Survey = () => {

	const { t } = useTranslation();

	const default_page = [10, 15, 50, 75, 100];

	const [datas, setDatas] = useState([]);

	const { user } = useContext(AuthContext)

	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [searchValue, setSearchValue ] = useState('');
	const [modal, setModal] = useState(false);

    const [selectedTime, setSelectedTime] = useState('')

	const [editData, setEditRowData] = useState({})
	const [showData, setShowRowData] = useState({})

	const [isEdit, setIsEdit] = useState(false)

	// Нийт датаны тоо
	const [total_count, setTotalCount] = useState(1);

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });

	// Modal
	const [showModal, setShowModal] = useState(false);

	const handleModal = () => {
		setModal(!modal)
	}

	const [modal2, setModal2] = useState(false)
    const [rowData, setRowData] = useState({})

    const openModal = () => setModal2(!modal2);
	function handleSend(data) {
        setRowData(data)
        openModal()
    }

	const surveyAPI = useApi().survey;

	// Search input нэмээд search value дамжуулна
	async function getDatas() {
		const { success, data } = await fetchData(surveyAPI.get(rowsPerPage, currentPage, selectedTime, searchValue));
		if (success) {
			setDatas(data?.results);
			setTotalCount(data?.count);
		}
	}

	async function handleDelete(id) {
		const { success, data } = await fetchData(surveyAPI.delete(id));
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

	// Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value));
    }

	// const handleSend = async(id) => {
	// 	const { success, data } = await fetchData(surveyAPI.send(id));
	// 	if (success) {
	// 	}
	// }

	const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

	useEffect(() => {
		getDatas();
	}, [currentPage, rowsPerPage, selectedTime]);


	async function handleSearch() {
        if (searchValue.length > 0) getDatas()
    }
	useEffect(() => {
		if (searchValue.length == 0) {
			getDatas();
		} else {
			const timeoutId = setTimeout(() => {
				getDatas();
			}, 600);

			return () => clearTimeout(timeoutId);
		}
	}, [searchValue]);

	useEffect(
		() =>
		{
			if (!isEdit) setEditRowData({})
		},
		[isEdit]
	)



    const [nestedModal, setNestedModal] = useState(false);
    const [closeAll, setCloseAll] = useState(false);

    const toggleNested = () => {
        setNestedModal(!nestedModal);
        setCloseAll(false);
    };
    const toggleAll = () => {
        setNestedModal(!nestedModal);
        setCloseAll(true);
		setModal(!modal)
    };


	return (
		<Fragment>
			{isLoading && Loader}
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t("Судалгааны жагсаалт")}</CardTitle>
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
				<Col md={4} sm={12} className="m-1">
					<Label className="form-label" htmlFor="time">
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
				<Row className="justify-content-between mx-0 mt-1" sm={12}>
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
							<Label htmlFor="sort-select">
								{t("Хуудсанд харуулах тоо")}
							</Label>
						</Col>
					</Col>
					<Col className='d-flex align-items-end mobile-datatable-search '>
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
				<div className="react-dataTable react-dataTable-selectable-rows mx-1 mt-1">
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
							handleSend,
							user
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
			</Card>
			{modal && <Createmodal
				open={modal}
				handleModal={handleModal}
				refreshDatas={getDatas}
				editData={editData}
				isEdit={isEdit}
				toggleNested={toggleNested}
				toggleAll={toggleAll}
				closeAll={closeAll}
				nestedModal={nestedModal}
			/>}
			{modal2 && <Detail open={modal2} openModal={openModal} data={rowData} />}

		</Fragment>
	);
};

export default Survey;

