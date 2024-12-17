import React, { Fragment, useState, useEffect,  } from "react";
import { useTranslation } from "react-i18next";
import { getPagination } from "@utils";
import { getColumns, customStyles } from "./helpers";
import { useNavigate } from "react-router-dom";
import {
	CardHeader,
	Card,
	CardTitle,
	Button,
	Spinner,
	CardBody,
	Dropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
	Col,
	Label,
	Row
} from "reactstrap";

import classnames from 'classnames'
import Select from "react-select"

import {PenTool, UploadCloud, ChevronsLeft,Download} from 'react-feather'
import { useSkin } from '@src/utility/hooks/useSkin'
import DataTable from "react-data-table-component";
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import AddQuestion from "./AddQuestion";

import { ReactSelectStyles, get_questionype, get_leveltype, get_levelseasons } from "@utils"

import EditModal from "./EditModal";
import FileModal from "./FileModal"

const QuestionsList = ({ filterId, season=false, teacher_id }) => {

	const { t } = useTranslation();
	const { skin } = useSkin()
	const navigate = useNavigate()

	const { isLoading, fetchData } = useLoader({});

	const [datas, setDatas] = useState([]);
	const [questionDetail, setQuestionDetail] = useState({})

	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [searchValue, setSearchValue] = useState('');
	const [total_count, setTotalCount] = useState(1);

	const [modal, setModal] = useState(false);
	const [editModal, setEditModal] = useState(false);
	const [fileModal , setFileModal] = useState(false);
	const [stype, setType] = useState('')
	const [level, setLevel] = useState('')

    const [dropdownOpen, setDropdownOpen] = useState(false);

	// Нэмэх функц
	const handleModal = () => { setModal(!modal); };

	const handleEditModal = () => { setEditModal(!editModal); };

	const handleFileModal = () => { setFileModal(!fileModal); };

	const toggle = () => setDropdownOpen((prevState) => !prevState);

	// API
	const questionAPI = useApi().challenge.question

	async function getDatas() {
		const { success, data } = await fetchData(questionAPI.getByTitle(currentPage, rowsPerPage, searchValue, filterId, teacher_id, stype, level));
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
	}, [currentPage, rowsPerPage, filterId, level, stype]);


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

	function staticExcelHandler() {

        var excelUrl = season ? '/assets/asuult_zagwar.xlsx' : '/assets/asuult_zagwar_2.xlsx'

        const link = document.createElement('a');
        link.href = excelUrl;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
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
					<div role="a"  onClick={() => navigate(-1) } color='primary'>
						<ChevronsLeft/>Буцах
					</div>
					<CardTitle tag={'h5'}>
						Асуултын жагсаалт
					</CardTitle>
					<div className="d-flex gap-2">
						{
							!season
							&&
							<>
								<Dropdown isOpen={dropdownOpen} toggle={toggle}>
									<DropdownToggle color={skin === 'light' ? 'dark' : 'light'} className='' caret outline>
										<PenTool size={15} />
										<span className='align-middle ms-50'>Загвар</span>
									</DropdownToggle>
									<DropdownMenu >
										<DropdownItem header className='text-wrap'>
											Эксэл файлаар асуулт оруулах хэсэг
										</DropdownItem>
										<DropdownItem divider />
										<DropdownItem
											className='w-100'
											onClick={() => staticExcelHandler()}
										>
											<Download size={15} />
											<span className='align-middle ms-50'>Татах</span>
										</DropdownItem>
										<DropdownItem className='w-100' onClick={() => handleFileModal()}>
											<UploadCloud size={15} />
											<span className='align-middle ms-50' >Оруулах</span>
										</DropdownItem>
									</DropdownMenu>
								</Dropdown>
								<Button
									color="primary"
									size="sm"
									onClick={() => { setModal(true) }}
								>
									Нэмэх
								</Button>
							</>
						}
					</div>
				</CardHeader>
				<CardBody className="p-0 px-1">
					<Row className={'mb-1'}>
						<Col md={3}>
							<Label>Асуултын төрөл</Label>
							<Select
								classNamePrefix='select'
								className={classnames('react-select',)}
								options={get_questionype()}
								placeholder={'-- Сонгоно уу --'}
								noOptionsMessage={() => 'Хоосон байна.'}
								isClearable
								onChange={(val) => {
									setType(val?.id || '')
								}}
								styles={ReactSelectStyles}
								getOptionValue={(option) => option.id}
								getOptionLabel={(option) => option.name}
							/>
						</Col>
						<Col md={3}>
							<Label>Асуултын түвшин</Label>
							<Select
								classNamePrefix='select'
								className={classnames('react-select',)}
								options={season == true ? get_leveltype() : get_levelseasons() }
								placeholder={'-- Сонгоно уу --'}
								noOptionsMessage={() => 'Хоосон байна.'}
								onChange={(val) => {
									setLevel(val?.id || '')
								}}
								isClearable
								styles={ReactSelectStyles}
								getOptionValue={(option) => option.id}
								getOptionLabel={(option) => option.name}
							/>
						</Col>
					</Row>
					<div className="">
						<DataTable
							noHeader
							pagination
							className=""
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
								handleDelete,
								handleQuestionEdit,
								season
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
						title={filterId}
						season={season}
					/>
				)}
				{editModal && (
					<EditModal
						open={editModal}
						handleModal={handleEditModal}
						questionDetail={questionDetail}
						getDatas={getDatas}
						season={season}
					/>
				)}
				{fileModal && (
					<FileModal
						isOpen={fileModal}
						handleModal={handleFileModal}
						refreshData={getDatas}
						title={filterId}
						season={season}
					/>
				)}
			</Card>

		</Fragment>
	);
};

export default QuestionsList;


