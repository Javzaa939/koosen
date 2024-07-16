import React, { Fragment, useState, useEffect,  } from "react";
import { useTranslation } from "react-i18next";
import { getPagination } from "@utils";
import { getColumns, customStyles } from "./helpers";
import {
	CardHeader,
	Card,
	CardTitle,
	Button,
	Spinner,
	CardBody,
} from "reactstrap";

import DataTable from "react-data-table-component";
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import AddQuestion from "./AddQuestion";

import { ReactSelectStyles, get_questionype, get_leveltype } from "@utils"
import EditModal from "./EditModal";
const QuestionsList = ({filterId}) => {

	const { t } = useTranslation();

	const { isLoading, fetchData } = useLoader({});

	const default_page = [10, 15, 50, 75, 100];
	const [datas, setDatas] = useState([]);
	const [questionDetail, setQuestionDetail] = useState({})

	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [searchValue, setSearchValue] = useState('');
	const [total_count, setTotalCount] = useState(1);

	const [modal, setModal] = useState(false);
	const [editModal, setEditModal] = useState(false)

	// Нэмэх функц
	const handleModal = () => { setModal(!modal); };

	const handleEditModal = () => { setEditModal(!editModal); };

	// API
	const questionAPI = useApi().challenge.psychologicalTestQuestion

	async function getDatas() {
		const { success, data } = await fetchData(questionAPI.getByTitle(currentPage, rowsPerPage, searchValue, filterId));
		if (success) {
			setDatas(data?.results);
			setTotalCount(data?.count);
		}
	}

	async function handleDelete(id) {
		const { success, data } = await fetchData(questionAPI.delete(id));
		if (success) {
			getDatas()
		}
	}

	useEffect(() => {
		getDatas();
	}, [currentPage, rowsPerPage, filterId]);


	// Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};


	useEffect(
		() => {
			if (searchValue.length > 2 || !searchValue) {
				getDatas()
			}

		}, [searchValue]
	)

	function handleQuestionEdit(data){
		setQuestionDetail(data)
		setEditModal(true)
	}

	return (
		<Fragment>
			{isLoading && (
				<div className="suspense-loader">
					<Spinner size="bg" />
					<span className="ms-50">{t("Түр хүлээнэ үү...")}</span>
				</div>
			)}
			<Card className="m-0">
				<CardHeader className="py-1">
					<CardTitle tag={'h5'}>
						Асуулт
					</CardTitle>
					<Button
						color="primary"
						size="sm"
						onClick={() => { setModal(true) }}
					>
						Нэмэх
					</Button>
				</CardHeader>
				<CardBody className="p-1">
					<div className="">
						<DataTable
							noHeader
							pagination
							className=""
							progressPending={isLoading}
							progressComponent={
								<div className="mt-2 mb-1">
									<h5>{t("Түр хүлээнэ үү...")}</h5>
								</div>
							}
							noDataComponent={
								<div className="mt-2 mb-1">
									<h5>{t("Өгөгдөл байхгүй байна")}</h5>
								</div>
							}
							columns={getColumns(
								currentPage,
								rowsPerPage,
								total_count,
								handleDelete,
								handleQuestionEdit
							)}
							customStyles={customStyles}
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
						/>
					</div>
				</CardBody>
				{modal && (
					<AddQuestion
						open={modal}
						handleModal={handleModal}
						getDatas={getDatas}
					/>
				)}
				{editModal && (
					<EditModal
						open={editModal}
						handleModal={handleEditModal}
						questionDetail={questionDetail}
						getDatas={getDatas}
					/>
				)}
			</Card>

		</Fragment>
	);
};

export default QuestionsList;


