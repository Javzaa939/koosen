import React from "react";
// ** React Imports
import { useState, useEffect, useContext } from "react";
import { BiMessageRoundedError } from "react-icons/bi";
import { MdMailOutline } from "react-icons/md";

import {
  Row,
  Col,
  Card,
  Input,
  Label,
  Button,
  CardHeader,
  Spinner,
  CardBody,
  UncontrolledTooltip,
} from "reactstrap";

import { ChevronDown, Search, Zap } from "react-feather";
import classnames from "classnames";

import DataTable from "react-data-table-component";

import { useTranslation } from "react-i18next";
import Select from "react-select";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import AuthContext from "@context/AuthContext"

import { getPagination, ReactSelectStyles } from "@utils";

import { getColumns } from "./helpers";
import Detail from "./Detail";
import useUpdateEffect from "@hooks/useUpdateEffect";
import EmailModal from "../../User/EmailModal";
import MessageModal from "../../User/MessageModal";

const STATE_LIST = [
	{
		name: "Хүлээгдэж буй",
		id: 1,
	},
	{
		name: "Тэнцсэн",
		id: 2,
	},
	{
		name: "Тэнцээгүй",
		id: 3,
	},
];

function Mergejliin() {
	const { user } = useContext(AuthContext)
	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	// Эрэмбэлэлт
	const [sortField, setSort] = useState("");

	// Translate
	const { t } = useTranslation();

	const default_page = [10, 20, 50, 75, 100];

	const [searchValue, setSearchValue] = useState("");
	const [datas, setDatas] = useState([]);
	const [chosenState, setChosenState] = useState("");

	const [detail, setDetail] = useState(false);
	const [detailData, setDetailData] = useState(false);

	const [profOption, setProfession] = useState([]);
	const [profession_id, setProfession_id] = useState("");

	const [admop, setAdmop] = useState([]);
	const [adm, setAdm] = useState("");

	const [selectedStudents, setSelectedStudents] = useState([]);

	const [emailModal, setEmailModal] = useState(false);
	const [messageModal, setMessageModal] = useState(false);

	// Нийт датаны тоо
	const [total_count, setTotalCount] = useState(datas.length || 1);

	// Нийт хуудасны тоо
	const [pageCount, setPageCount] = useState(1);

	const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });
	const elseltApi = useApi().elselt.health.professional;
	const admissionYearApi = useApi().elselt;
	const professionApi = useApi().elselt.profession;

  /* Жагсаалтын дата авах функц */
	async function getDatas() {
		const { success, data } = await fetchData(
			elseltApi.get(
				rowsPerPage,
				currentPage,
				sortField,
				searchValue,
				adm,
				profession_id,
				chosenState
			)
		);
		if (success) {
			setTotalCount(data?.count);
			setDatas(data?.results);

			// Нийт хуудасны тоо
			var cpage_count = Math.ceil(
				data?.count / rowsPerPage === "Бүгд" ? 1 : rowsPerPage
			);
			setPageCount(cpage_count);
		}
	}

	// Хөтөлбөрийн жагсаалт авах
	async function getProfession() {
		const { success, data } = await fetchData(professionApi.getList(adm));
		if (success) {
		setProfession(data);
		}
	}

	async function getAdmissionYear() {
		const { success, data } = await fetchData(admissionYearApi.getAll());
		if (success) {
		setAdmop(data);
		}
	}

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
	}, [
		sortField,
		currentPage,
		rowsPerPage,
		searchValue,
		adm,
		profession_id,
		chosenState,
	]);

	useEffect(() => {
		getAdmissionYear();
		getProfession();
	}, []);

	useUpdateEffect(() => {
		getProfession();
	}, [adm]);

	// ** Function to handle filter
	const handleFilter = (e) => {
		const value = e.target.value.trimStart();
		setSearchValue(value);
	};

	function handleSort(column, sort) {
		if (sort === "asc") {
		setSort(column.header);
		} else {
		setSort("-" + column.header);
		}
	}

	function handleSearch() {
		getDatas();
	}

	// ** Function to handle per page
	function handlePerPage(e) {
		setRowsPerPage(
			e.target.value === "Бүгд" ? e.target.value : parseInt(e.target.value)
		);
	}

	// Хуудас солих үед ажиллах хэсэг
	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	}

	function detailHandler(e, data) {
		setDetail(!detail);
		setDetailData(data);
	}

	function onSelectedRowsChange(state) {
		setSelectedStudents(state?.selectedRows);
	}

	function emailModalHandler() {
		setEmailModal(!emailModal);
	}

	function messageModalHandler() {
		setMessageModal(!messageModal);
	}

	return (
		<Card>
			<Detail
				detail={detail}
				detailHandler={detailHandler}
				detailData={detailData}
                getDatas={getDatas}

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
			<CardHeader>
				<h5>Нарийн мэргэжлийн шатны эрүүл мэндийн үзлэг</h5>
				<Col className="d-flex justify-content-end">
				<Button
					color="primary"
					className="d-flex align-items-center"
					onClick={() => alert("Сервисийн мэдээлэл ирээгүй байна.")}
				>
					<Zap className="me-50" size={14} />
					<div>Мэдээлэл татах</div>
				</Button>
				</Col>
			</CardHeader>
			<CardBody>
				<Row>
					<Col sm={6} lg={3}>
						<Label className="form-label" for="lesson_year">
						{t("Элсэлт")}
						</Label>
						<Select
							name="lesson_year"
							id="lesson_year"
							classNamePrefix="select"
							isClearable
							className={classnames("react-select")}
							isLoading={isLoading}
							placeholder={t("-- Сонгоно уу --")}
							options={admop || []}
							value={admop.find((c) => c.id === adm)}
							noOptionsMessage={() => t("Хоосон байна.")}
							onChange={(val) => {
								setAdm(val?.id || "");
							}}
							styles={ReactSelectStyles}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) =>
								option.lesson_year + " " + option.name
							}
						/>
					</Col>
					<Col sm={6} lg={3}>
						<Label className="form-label" for="profession">
							{t("Хөтөлбөр")}
						</Label>
						<Select
							name="profession"
							id="profession"
							classNamePrefix="select"
							isClearable
							className={classnames("react-select")}
							isLoading={isLoading}
							placeholder={t("-- Сонгоно уу --")}
							options={profOption || []}
							value={profOption.find((c) => c?.prof_id === profession_id)}
							noOptionsMessage={() => t("Хоосон байна.")}
							onChange={(val) => {
								setProfession_id(val?.prof_id || "");
							}}
							styles={ReactSelectStyles}
							getOptionValue={(option) => option?.prof_id}
							getOptionLabel={(option) => option.name}
						/>
					</Col>
					<Col md={6} lg={3}>
						<Label for="sort-select">{t("Үзлэгийн төлөвөөр шүүх")}</Label>
						<Select
							classNamePrefix="select"
							isClearable
							placeholder={`-- Сонгоно уу --`}
							options={STATE_LIST || []}
							value={STATE_LIST.find((c) => c.id === chosenState)}
							noOptionsMessage={() => "Хоосон байна"}
							onChange={(val) => {
								setChosenState(val?.id || "");
							}}
							styles={ReactSelectStyles}
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.name}
						/>
					</Col>
					<Col md={9} className="d-flex mt-2 mb-1 justify-content-start">
						<div className="">
							<Button
								color="primary"
								disabled={(selectedStudents.length != 0 && user.permissions.includes('lms-elselt-mail-create')) ? false : true}
								className="d-flex align-items-center px-75"
								id="email_button"
								onClick={() => emailModalHandler()}
							>
							<MdMailOutline className="me-25" />
								Email илгээх
							</Button>
							<UncontrolledTooltip target="email_button">
								Сонгосон элсэгчид руу имейл илгээх
							</UncontrolledTooltip>
						</div>
						<div className="px-1">
							<Button
								color="primary"
								disabled={(selectedStudents.length != 0 && user?.permissions?.includes('lms-elselt-message-create')) ? false : true}
								className="d-flex align-items-center px-75"
								id="message_button"
								onClick={() => messageModalHandler()}
							>
								<BiMessageRoundedError className="me-25" />
								Мессеж илгээх
							</Button>
							<UncontrolledTooltip target="message_button">
								Сонгосон элсэгчид руу мессеж илгээх
							</UncontrolledTooltip>
						</div>
					</Col>
				</Row>
				<Row className="justify-content-between">
					<Col
						className="d-flex align-items-center justify-content-start"
						md={4}
					>
						<Col md={3} sm={2} className="pe-1">
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
						<Col md={9} sm={3}>
							<Label for="sort-select">{t("Хуудсанд харуулах тоо")}</Label>
						</Col>
					</Col>
					<Col
						className="d-flex align-items-center mobile-datatable-search mt-1 justify-content-end"
						md={4}
						sm={12}
					>
						<Input
							className="dataTable-filter mb-50"
							type="text"
							bsSize="sm"
							id="search-input"
							placeholder={t("Хайх үг....")}
							value={searchValue}
							onChange={(e) => {
								handleFilter(e);
							}}
							onKeyPress={(e) => e.key === "Enter" && handleSearch()}
						/>
						<Button
							size="sm"
							className="ms-50 mb-50"
							color="primary"
							onClick={handleSearch}
						>
							<Search size={15} />
							<span className="align-middle ms-50"></span>
						</Button>
					</Col>
				</Row>
				<div className="react-dataTable react-dataTable-selectable-rows" id='datatableLeftOneRightOne'>
					<DataTable
						noHeader
						paginationServer
						pagination
						className="react-dataTable-header-md"
						progressPending={isLoading}
						progressComponent={
						<div className="my-2 d-flex align-items-center justify-content-center">
							<Spinner className="me-1" color="" size="sm" />
							<h5>Түр хүлээнэ үү...</h5>
						</div>
						}
						noDataComponent={
						<div className="my-2">
							<h5>{t("Өгөгдөл байхгүй байна")}</h5>
						</div>
						}
						print="true"
						theme="solarized"
						onSort={handleSort}
						columns={getColumns(
						currentPage,
						rowsPerPage,
						total_count,
						STATE_LIST,
						detailHandler,
						)}
						sortIcon={<ChevronDown size={10} />}
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
						selectableRows
						onSelectedRowsChange={(state) => onSelectedRowsChange(state)}
						// direction="auto"
						// style={{ border: '1px solid red' }}
						defaultSortFieldId={"created_at"}
					/>
				</div>
			</CardBody>
		</Card>
	);
}

export default Mergejliin;
