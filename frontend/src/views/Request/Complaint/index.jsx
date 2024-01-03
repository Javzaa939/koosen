
// ** React imports
import React, { Fragment, useState, useEffect, useContext } from 'react'

import { Card, CardHeader, CardTitle, Row, Col, Label, FormFeedback, Input, Button, Spinner } from 'reactstrap';

import { useTranslation } from 'react-i18next'
import { useForm, Controller } from 'react-hook-form'
import Select from 'react-select'
import { ChevronDown, Search } from 'react-feather'
import DataTable from 'react-data-table-component';

import classnames from 'classnames'

import RequestContext from "@context/RequestContext"

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';

import { getPagination, SOLVED_TYPES, ReactSelectStyles, get_complaint_type } from '@utils'


import { getColumns } from './helpers';

import Detail from './detail'
import Solve from './solve';


export default function Request()
{
    const { t } = useTranslation()
	const menu_id = 'complaint2'

	const { setMenuId, roleMenus } = useContext(RequestContext)

	// Нийт датаны тоо
	const default_page = [10, 15, 50, 75, 100]

	// ** Hook
    const { control, formState: { errors } } = useForm({});

    /**UseState */
    const [ rowsPerPage, setRowsPerPage ] = useState(10)
    const [ total_count, setTotalCount ] = useState(1)
    const [ currentPage, setCurrentPage ] = useState(1)
    const [ sortField, setSort ] = useState('')
    const [ searchValue, setSearchValue ] = useState('')

    const [ solved, setSolved ] = useState('')
    const [ datas, setDatas ] = useState([])
    const [ stipend_option, setStipendOption ] = useState([])
    const [ solved_type, setSolvedType ] = useState(SOLVED_TYPES(0))
    const [ complaintType, setComplaintType ] = useState(get_complaint_type())
    const [ complaintTypeId, setComplaintTypeId ] = useState('')

    const [ detailModalOpen, setDetailModalOpen ] = useState(false)
    const [ detailModalData, setDetailModalData ] = useState({})

	const [ solveModalOpen, setSolveModalOpen ] = useState(false)
	const [ solveUnit, setSolveUnit ] = useState(0);


	// Loader
	const{ Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    const complaintApi = useApi().request.complaint

    /** Datatable-ийн утгаа авах */
    async function getDatas()
    {
        const { success, data } = await allFetch(complaintApi.get(rowsPerPage, currentPage, sortField, searchValue, solved, complaintTypeId, menu_id))
        if (success)
        {
            setDatas(data?.results)
			setTotalCount(data?.count)
        }
    }

	useEffect(
        () =>
        {
            setMenuId(menu_id)
        },
        []
    )

    useEffect(
        () =>
        {
            getDatas()
        },
        [rowsPerPage, currentPage, sortField, solved, complaintTypeId]
    )

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

    function handleFilter(e)
    {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    // Хайх товч дарсан үед ажиллах функц
	function handleSearch()
    {
		getDatas()
	}

    function handlePerPage(e)
    {
		setRowsPerPage(parseInt(e.target.value))
	}

    function handleSort(column, sort)
    {
        if(sort === 'asc')
        {
            setSort(column.header)
        }
        else
        {
            setSort('-' + column.header)
        }
    }

    // Дэлгэрэнгүй харах хэсэг
	async function handleRequestDetail(id, data)
    {
		setDetailModalOpen(!detailModalOpen)
		setDetailModalData(data)
	}

	// Шиидвэрлэх харах хэсэг
	function handleRequestSolve(data, unit)
	{
		setSolveModalOpen(!solveModalOpen)
		setSolveUnit(unit)
		setDetailModalData(data)
	}

    // Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

    return (
        <Fragment>
            <Card>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Өргөдөл гаргаж буй оюутны мэдээлэл')}</CardTitle>
				</CardHeader>

                <Row className="mx-0 mt-1">
					<Col md={4} className='mb-1'>
						<Label className= "form-label me-1" for="stipend">
							{t('Өргөдөлийн төрөл')}
						</Label>
						<Select
							name="stipend"
							id="stipend"
							classNamePrefix='select'
							isClearable
							className={classnames('react-select')}
							isLoading={isLoading}
							placeholder={t(`-- Сонгоно уу --`)}
							options={complaintType || []}
							value={complaintType.find((c) => c.id === complaintTypeId)}
							noOptionsMessage={() => t('Хоосон байна')}
							styles={ReactSelectStyles}
							onChange={
                                (val) => setComplaintTypeId(val?.id || '')
                            }
							getOptionValue={(option) => option.id}
							getOptionLabel={(option) => option.name}
						/>
					</Col>
				</Row>

                <Row className='mt-1 d-flex justify-content-between mx-0'>
					<Col className='d-flex align-items-center justify-content-start '>
						<Col md={2} sm={3} className='pe-1'>
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
						<Col md={10} sm={3}>
							<Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
						</Col>
					</Col>
					<Col className='d-flex align-items-center mobile-datatable-search'>
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
				</Row>

                {
					isLoading
                    ?
                        <div className="my-2 text-center" sm={12}>
                            <Spinner size='sm' />
                            <span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
                        </div>
                    :
					<div className='react-dataTable react-dataTable-selectable-rows' id='datatableLeftTwoRightOne' >
						<DataTable
							noHeader
							pagination
							className='react-dataTable'
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
							onSort={handleSort}
							sortIcon={<ChevronDown size={10} />}
							columns={getColumns(currentPage, rowsPerPage, total_count, roleMenus, handleRequestDetail, handleRequestSolve)}
							paginationPerPage={rowsPerPage}
							paginationDefaultPage={currentPage}
							data={datas}
							paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
							fixedHeader
							fixedHeaderScrollHeight='62vh'
						/>
					</div>
				}

                { detailModalOpen && <Detail isOpen={detailModalOpen} handleModal={handleRequestDetail} datas={detailModalData} /> }
				{ solveModalOpen && <Solve isOpen={solveModalOpen} handleModal={handleRequestSolve} datas={detailModalData} getDatas={getDatas} unit={solveUnit} /> }

            </Card>
        </Fragment>
    )
}
