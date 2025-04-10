import DataTable from "react-data-table-component";
import { Search } from "react-feather";

import {
	Button,
	Card,
	CardHeader,
	CardTitle,
	Col,
	Input
} from "reactstrap";

import { getPagination } from "@utils";
import getColumns from "../../hooks/getColumns";
import React from "react";

export default function StudentListBlock({
	t,
	datas,
	getDatas,
	setSearchValue,
	isLoading,
	currentPage,
	rowsPerPage,
	total_count,
	handlePagination,
	fetchData,
	remoteApi,
	elearnId
}) {
	function handleFilter(e) {
		const value = e.target.value.trimStart();
		setSearchValue(value)
	}

	function handleSearch() {
		getDatas()
	}

	async function handleDelete(id) {
		const { success } = await fetchData(remoteApi.students.delete(elearnId, id));

		if (success) {
			getDatas();
		}
	}

	return (
		<Card md={12} className='bg-white'>
			<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
				<CardTitle tag="h4">{t("Сургалт өгөх оюутнуудын жагсаалт")}</CardTitle>
			</CardHeader>
			<Col className='mt-2 my-1 mx-1 d-flex align-items-center mobile-datatable-search'>
				<Input
					className='dataTable-filter mb-50'
					type='text'
					bsSize='sm'
					id='search-input'
					placeholder={t('Хайх')}
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
			<div className="react-dataTable">
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
						handleDelete,
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
					fixedHeaderScrollHeight="30vh"
				/>
			</div>
		</Card>
	)
}