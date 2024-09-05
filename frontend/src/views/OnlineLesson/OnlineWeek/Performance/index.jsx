import React, { Fragment, useEffect, useState } from "react";
import {
    Button,
    Card,
    CardHeader,
    CardTitle,
    Col,
    Input,
    Label,
    Row
} from 'reactstrap';

import Select from 'react-select';

import useApi from '@hooks/useApi';
import useLoader from "@hooks/useLoader";
import {
    Plus,
    Search
} from 'react-feather';
import { useTranslation } from "react-i18next";


import DataTable from "react-data-table-component";

import { getPagination, ReactSelectStyles } from "@utils";
import { getColumns } from "./helpers";

import Add from "./Add";

function Performance({lesson}) {

    const default_page = [10, 15, 50, 75, 100]
	const [datas, setDatas] = useState([])
	const { t } = useTranslation();
	const { isLoading, fetchData } = useLoader({});
	const [currentPage, setCurrentPage] = useState(1);
    const [selectedGroup,setSelectedGroup] = useState([]);
	const [rowsPerPage, setRowsPerPage] = useState(200);
	const [total_count, setTotalCount] = useState(1);
	const [searchValue, setSearchValue ] = useState('');
	const [groups,setGroups ] = useState([])


	const [modal, setModal] = useState(false);

	const handleModal = () => {
		setModal(!modal)
	}

	const studentAPi = useApi().get_lesson_students;
	const groupAPI =  useApi().get_group;

	async function getDatas() {
		const { success, data } = await fetchData(studentAPi.get(rowsPerPage, currentPage, searchValue, selectedGroup, lesson.id));
		if (success) {
			setDatas(data);
			setTotalCount(data?.count);
		}
	}

    async function getGroupList() {
		const {success, data} = await fetchData(groupAPI.get())
		if(success) {
			setGroups(data)
		}
	}

	useEffect(() => {
		getDatas();
	},[rowsPerPage, currentPage, selectedGroup]);

    useEffect(() => {
        getGroupList();
    }, []);

	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};


	const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    function handlePerPage(e)
    {
		setRowsPerPage(parseInt(e.target.value))
	}


	useEffect(
		() =>
		{
			if (searchValue.length == 0 || searchValue.length > 2) getDatas()
		},
		[searchValue]
	)


	async function handleSearch() {
		if (searchValue.length = 0) getDatas()
    }

    return (
		<Fragment>
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t("")}</CardTitle>
				</CardHeader>
				<Row>
                    <Col md={4} sm={12} className="m-1">
                        <Label className="form-label" htmlFor="time">
                            {t('Анги сонгох')}
                        </Label>
                        <Select
                            id="group"
                            name="group"
                            isClearable
                            classNamePrefix='select'
                            className='react-select'
                            placeholder={`-- Сонгоно уу --`}
                            options={groups|| []}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {
                                setSelectedGroup(val?.id || '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                   {/* <Row>
						<Col md={4} sm={12} className="m-1">
							<Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
							<Input
								className='dataTable-select me-1 mb-50'
								type='select'
								bsSize='sm'
								style={{ height: "30px",}}
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
						<Col className='d-flex align-items-end mobile-datatable-search pe-3 pt-2'>
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
				   </Row> */}
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
						{modal && <Add
							open={modal}
							handleModal={handleModal}
							refreshDatas={getDatas}
						/>}
        </Fragment>
    )
}

export default Performance