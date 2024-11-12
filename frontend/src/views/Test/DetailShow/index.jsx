import React, { Fragment, useState, useEffect } from "react";
import { Download, Search } from "react-feather";
import { useTranslation } from "react-i18next";
import { getPagination } from "@utils";
import { getColumns } from "./helpers";
import { useParams, Link } from 'react-router-dom';
import { utils, writeFile } from 'xlsx-js-style';

import {
	Row,
	CardHeader,
	Card,
	CardTitle,
	Button,
	Col,
	Input,
	Label,
} from "reactstrap";

import DataTable from "react-data-table-component";
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import DetailModal from './Detail';
import ResultModal from "./Modal";

export function excelDownLoad(datas, STATE_LIST) {
	const mainData = datas.map((data, idx) => {
		return(
			{
				'№': idx + 1,
				'Оюутны код': data?.code || '',
				'Овог': data?.last_name,
				'Нэр': data?.first_name || '',
				'Нийт оноо': data?.challenge[0]?.take_score || '',
				'Авсан оноо': data?.challenge[0]?.score
			}
		)}
	)

	const combo = [
		...mainData,
	]

	const worksheet = utils.json_to_sheet(combo);

	const workbook = utils.book_new();
	utils.book_append_sheet(workbook, worksheet, "Шалгалтын үр дүн")
	const staticCells = [
			'№',
			'Оюутны код',
			'Овог',
			'Нэр',
			'Нийт оноо',
			'Авсан оноо',
		];

	utils.sheet_add_aoa(worksheet, [staticCells], { origin: "A1" });

	const numberCellStyle = {
		border: {
			top: { style: "thin", color: { rgb: "000000" } },
			bottom: { style: "thin", color: { rgb: "000000" } },
			left: { style: "thin", color: { rgb: "000000" } },
			right: { style: "thin", color: { rgb: "000000" } }
		},
		alignment: {
			horizontal: 'left',
			vertical: 'center',
			wrapText: true
		},
		font:{
			sz:10
		}
	};

	const tableHeader = {
		border: {
			top: { style: "thin", color: { rgb: "000000" } },
			bottom: { style: "thin", color: { rgb: "0000000" } },
			left: { style: "thin", color: { rgb: "000000" } },
			right: { style: "thin", color: { rgb: "000000" } },
			wrapText: true
		},
		alignment: {
			vertical: 'center',
			wrapText: true
		},
		font:{
			sz: 12,
			bold: true
		}

	};

	const styleRow = 0;
	const sendRow = mainData.length;
	const styleCol = 0;
	const sendCol = 22;

	for (let row = styleRow; row <= sendRow; row++) {
		for (let col = styleCol; col <= sendCol; col++) {
		const cellNum = utils.encode_cell({ r: row, c: col });

			if (!worksheet[cellNum]) {
				worksheet[cellNum] = {};
			}

			worksheet[cellNum].s =
				(row === styleRow)
					? tableHeader
						: numberCellStyle;
		}
	}

	const phaseTwoCells = Array.from({length: 8}, (_) => {return({wch: 15})})

	worksheet["!cols"] = [
		{ wch: 5 },
		...phaseTwoCells,
		{ wch: 20 }
	];

	const tableRow = Array.from({length: mainData.length}, (_) => {return({hpx: 20})})

	worksheet["!rows"] = [
		{ hpx: 40 },
		...tableRow
	];

	writeFile(workbook, "ur_dun.xlsx");

}

function DetailShow(){

	const { t } = useTranslation();
    const { detid } = useParams();
    const { isLoading, fetchData } = useLoader({});
	const { fetchData : fetchDetailData } = useLoader({});

	const [datas, setDatas] = useState([]);
	const [detailOneDatas, setDetailDatas] = useState([]);
	const [helpers_data, setHelpersData] = useState([]);
	const [modal_data, setModalData] = useState([]);
	const [resultData, setResultData] = useState([]);


    const default_page = ['Бүгд', 10, 15, 50, 75, 100];
    const [searchValue, setSearchValue ] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [total_count, setTotalCount] = useState(1);

	const [detail_modal, setDetailModal] = useState(false)
	const [resultModal, setResultModal] = useState(false)

    const detailApi = useApi().challenge
    async function getDatas() {
        if(detid) {
            const { success, data } = await fetchData(detailApi.getDetail(currentPage, rowsPerPage, searchValue, detid));
            if(success) {
                setDatas(data);
                setTotalCount(data?.length);
				setHelpersData(data[0]?.test_detail[0])
            }
        }
    }

	async function getDetailData(){
		if(detid) {
			const { success, data } = await fetchDetailData(detailApi.getDetailOne(detid));
			if(success) {
				setDetailDatas(data);
			}
		}
	}

    useEffect(() => {
        getDatas()
		getDetailData()
    }, [currentPage, rowsPerPage])

    const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value));
    }

    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

	async function handleSearch() {
        if (searchValue.length > 0) getDatas()
    }

    function handleDetailModal(data){
		setModalData(data)
        setDetailModal(!detail_modal)
    }

	function handleResultModal(data){
		setResultData(data)
		setResultModal(!resultModal)
	}

	useEffect(
        () =>
        {
            if (!searchValue || searchValue.length > 3) {
                getDatas()
            }
        },
        [searchValue]
	)

	return (
		<Fragment>
			<Card>
                <CardHeader className="border-bottom d-flex flex-row-reverse">
					<Button
						color="primary"
						outline
						className="btn-sm-block"
						onClick={() => excelDownLoad(datas)}
					>
						<Download size={15} className="me-50"/> Үр дүн татах
					</Button>
                    <CardTitle tag="h4" className="mx-2">
						{t("Шалгалт өгсөн оюутнуудын дэлгэрэнгүй мэдээлэл")}
					</CardTitle>
					<Button
						tag={Link}
						to="/challenge/test"
						color="primary"
						className="btn-sm-block"
					>
						Буцах
					</Button>
                </CardHeader>
				<Row sm={4} className="mt-2">
					<Col sm={2}>
						<Col className="mb-1 mx-2" tag="h6" sm={12}>
							Шалгалтын нэр :
						</Col>
						<Col  className="mb-1 mx-2" tag="h6" sm={12}>
							Шалгалт эхлэх цаг :<br/>
						</Col>
						<Col  className="mb-1 mx-2" tag="h6" sm={12}>
							Шалгалт дуусах цаг :<br/>
						</Col>
						<Col  className="mb-1 mx-2" tag="h6" sm={12}>
							Шалгалт үргэлжлэх хугацаа:
						</Col>
						<Col  className="mb-1 mx-2" tag="h6" sm={12}>
							Үнэлэх арга:
						</Col>
					</Col>
					<Col sm={10}>
						<Col className="mb-1 mx-2" tag="h6" sm={12}>
							{detailOneDatas.title}<br/>
						</Col>
						<Col  className="mb-1 mx-2" tag="h6" sm={12}>
							{detailOneDatas.start_date?.substring(0,10)}<br/>
						</Col>
						<Col  className="mb-1 mx-2" tag="h6" sm={12}>
							{detailOneDatas.end_date?.substring(0,10)}<br/>
						</Col>
						<Col  className="mb-1 mx-2" tag="h6" sm={12}>
							{detailOneDatas.duration} минут
						</Col>
						<Col  className="mb-1 mx-2" tag="h6" sm={12}>
							{detailOneDatas.assess === 1 ? 'Хамгийн өндөр оноо' : 'Дундаж оноо'}
						</Col>
					</Col>
				</Row>
                <Row className="justify-content-between mx-0 mt-1 mb-1" sm={9}>
					<Col
						className="d-flex align-items-center justify-content-start"
						md={6}
						sm={12}
					>
						<Col lg={2} md={3} sm={4} xs={5} className="pe-1">
							<Input
                                className='dataTable-select me-1 mb-50'
                                type='select'
                                bsSize='sm'
                                style={{ height: "30px" }}
                                value={rowsPerPage}
                                onChange={e => handlePerPage(e)}
                            >
                                {
                                    default_page.map((page, idx) => (
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
							<Label for="sort-select">
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
				<div className="react-dataTable react-dataTable-selectable-rows">
					<DataTable
						noHeader
						pagination
						className="react-dataTable"
						progressPending={isLoading}
						progressComponent={
							<div className="my-2">
								<h5>{t("Түр хүлээнэ үү")}...</h5>
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
							datas,
							helpers_data,
							handleDetailModal,
							handleResultModal
						)}
						paginationPerPage={rowsPerPage}
						paginationDefaultPage={currentPage}
						data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count, searchValue, datas)}
						fixedHeader
						fixedHeaderScrollHeight="62vh"
					/>
				</div>
			</Card>
            {detail_modal && <DetailModal open={detail_modal} handleModal={handleDetailModal} data={modal_data}/>}
            {resultModal && <ResultModal open={resultModal} handleModal={handleResultModal} datas={resultData}/>}
		</Fragment>
	);
};

export default DetailShow;