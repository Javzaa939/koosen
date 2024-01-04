import React, { Fragment, useState, useEffect } from "react";

import { ChevronDown, Search } from "react-feather";

import {
	Row,
	CardHeader,
	Card,
	CardTitle,
	Button,
	Col,
	Label,
	Input,
	Spinner,
} from "reactstrap";

import DataTable from "react-data-table-component";
import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import { Controller, useForm } from "react-hook-form";

import { useTranslation } from "react-i18next";
import { useSkin } from "@hooks/useSkin"

import { getPagination ,generateYear,ReactSelectStyles } from "@utils";

import { getColumns, getExpandedColumns } from "./helpers";

export function ExpandedComponent({ data })
{
    const { skin } = useSkin()
    const tableCustomStyles = {
        headCells: {
          style: {
            backgroundColor: skin == 'dark' ? '#343d5500' : "#9CD9F3"
          },
        },
    }

    return (
        <Card className='mb-0 rounded-0 border-bottom px-2'>
            <div className='react-dataTable react-dataTable-selectable-rows mt-1'>
                <DataTable
                    noHeader
                    className='react-dataTable'
                    noDataComponent={(
                        <div className="my-2">
                            <h5>{'Өгөгдөл байхгүй байна'}</h5>
                        </div>
                    )}
                    data={data?.datas}
                    columns={getExpandedColumns()}
                    customStyles={tableCustomStyles}
                    fixedHeader
                    fixedHeaderScrollHeight='62vh'
                />
            </div>
        </Card>
    )
}

const Invention = () => {

	var values = {
        department: '',
		category:'',
		quotation_year:'',
    }

	const { t } = useTranslation();
	const [select_value, setSelectValue] = useState(values);

	const default_page = [10, 15, 50, 75, 100];

	const [datas, setDatas] = useState([]);

	// Одоогийн хуудас
	const [currentPage, setCurrentPage] = useState(1);

	const [departmentOption, setDepartmentOption] = useState([])
	const [categoryOption, setCategoryOption] = useState([])
	const [quotation_yearOption, setQuotation_yearOption] = useState(generateYear(1))


	// 1 хуудсанд харуулах датаны тоо
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const [searchValue, setSearchValue] = useState("");

	const [sortField, setSortField] = useState("");

	// Нийт датаны тоо
	const [total_count, setTotalCount] = useState(1);

	// Loader
	const { isLoading, fetchData } = useLoader({isFullScreen: false});
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

	// Api
	const departmentApi = useApi().hrms.department
	const scienceApi = useApi().science

	const { control } = useForm();

	async function getDatas() {
		const department = select_value.department
		const category = select_value.category
		const quotation_year = select_value.quotation_year

		const { success, data } = await allFetch(scienceApi.quotation.get(	rowsPerPage,currentPage,sortField,searchValue,department,category,quotation_year));
		if (success) {
			setDatas(data?.results);
			setTotalCount(data?.count);
		}
	}

	function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

	 /* Тэнхим жагсаалт */
	async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get())
        if(success) {
            setDepartmentOption(data)
        }
    }
	  /* Төслийн англал */
	async function getCategoryOption() {
		const { success, data } = await fetchData(scienceApi.project.category.getList())
		if(success) {
			setCategoryOption(data)
		}
	}

	// Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

	// Хайлт хийх үед ажиллах хэсэг
	const handleFilter = (e) => {
		const value = e.target.value.trimStart();
		setSearchValue(value);
	};

	function handleSearch() {
		getDatas();
	}

	useEffect(() =>{
		getDepartmentOption()
		getCategoryOption()
    }, [])

	useEffect(() => {
		getDatas();
	}, [currentPage, rowsPerPage, sortField,select_value]);


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

	function handleSort(column, sort) {
		if (sort === "asc") {
			setSortField(column.sortField);
		} else {
			setSortField("-" + column.sortField);
		}
	}

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
					<CardTitle tag="h4">{t("Эшлэлийн жагсаалт")}</CardTitle>
				</CardHeader>
				<Row className="justify-content-between mx-0 mt-1 mb-1" sm={12}>
                    <Col md={4}>
                        <Label className="form-label" for="department">
                            {t('Хөтөлбөрийн баг')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="department"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="department"
                                        id="department"
                                        classNamePrefix='select'
                                        isClearable
                                        className='react-select'
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={departmentOption || []}
                                        value={departmentOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue(current => {
                                                return {
                                                    ...current,
                                                    department: val?.id || '',
                                                }
                                            })
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        />
                    	</Col>
						<Col md={4}>
							<Label className="form-label" for="category">
								{t('Төслийн ангилал')}
							</Label>
							<Controller
								control={control}
								defaultValue=''
								name="category"
								render={({ field: { value, onChange} }) => {
									return (
										<Select
											name="category"
											id="category"
											classNamePrefix='select'
											isClearable
											className='react-select'
											placeholder={t('-- Сонгоно уу --')}
											options={categoryOption || []}
											value={categoryOption.find((c) => c.id === value)}
											noOptionsMessage={() => t('Хоосон байна.')}
											onChange={(val) => {
												onChange(val?.id || '')
												setSelectValue(current => {
													return {
														...current,
														category: val?.id || '',
													}
												})
											}}
											styles={ReactSelectStyles}
											getOptionValue={(option) => option.id}
											getOptionLabel={(option) => option.name}
										/>
									)
								}}
                        />
                    	</Col>
						<Col md={4}>
							<Label className="form-label me-1" for="quotation_year">
								{t('Эшлэлд татагдсан он')}
							</Label>
							<Controller
								control={control}
								defaultValue=''
								name="quotation_year"
								render={({ field: { value, onChange} }) => {
									return (
										<Select
											name="quotation_year"
											id="quotation_year"
											classNamePrefix='select'
											isClearable
											className='react-select'
											placeholder={t('-- Сонгоно уу --')}
											options={quotation_yearOption || []}
											value={quotation_yearOption.find((c) => c.id === value)}
											noOptionsMessage={() => t('Хоосон байна.')}
											onChange={(val) => {
												onChange(val?.id || '')
												setSelectValue(current => {
													return {
														...current,
														quotation_year: val?.id || '',
													}
												})
											}}
											styles={ReactSelectStyles}
											getOptionValue={(option) => option.id}
											getOptionLabel={(option) => option.name}
										/>
									)
								}}
                        />
                    	</Col>
						<Col
							className="d-flex align-items-center mobile-datatable-search mt-1"
							md={5}
							sm={2}
						>
						<Col lg={2} md={3} sm={4} xs={5} className='pe-1'>
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
						<Col md={10} sm={10}>
							<Label for="sort-select">
								{t("Хуудсанд харуулах тоо")}
							</Label>
						</Col>
					</Col>
					<Col
						className="d-flex align-items-center mobile-datatable-search mt-1"
						md={6}
						sm={12}
					>
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
				<div className="react-dataTable react-dataTable-selectable-rows mx-1">
					<DataTable
						noHeader
						pagination
						className="react-dataTable"
                        progressPending={isTableLoading}
                        progressComponent={
                            <div className='my-2 d-flex align-items-center justify-content-center'>
                                <Spinner className='me-1' color="" size='sm'/><h5>Түр хүлээнэ үү...</h5>
                            </div>
                        }
                        noDataComponent={(
                            <div className="my-2">
                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                            </div>
                        )}
						columns={getColumns(
							currentPage,
							rowsPerPage,
							total_count,
						)}
						onSort={handleSort}
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
						expandableRows
						expandableRowsComponent={ExpandedComponent}
					/>
				</div>
			</Card>
		</Fragment>
	);
};

export default Invention;
