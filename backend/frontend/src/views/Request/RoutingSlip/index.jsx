import {
    Row,
    Col,
    Card,
    Input,
    Label,
    Button,
    CardTitle,
    CardHeader,
    Spinner
} from 'reactstrap'

import { ChevronDown, Search } from 'react-feather'
import { Fragment, useState, useEffect, useContext } from 'react'

import DataTable from 'react-data-table-component'

import { getPagination, get_routingslip_list, ReactSelectStyles } from '@utils'
import { useTranslation } from 'react-i18next'

import Select from 'react-select'
import classnames from "classnames";

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import AuthContext from "@context/AuthContext"
import RequestContext from "@context/RequestContext"

import SolvedModal from './Solved'

import Detail from './Detail'

import { getColumns } from './helpers'


const RoutingSlip = () => {
    const { t } = useTranslation()
    const menu_id = 'complaint5'

    const default_page = [10, 15, 50, 75, 100]

    const { user } = useContext(AuthContext)

    const { setMenuId, roleMenus } = useContext(RequestContext)

    // API
    const croutingdApi = useApi().request.routing

    const { isLoading, fetchData } = useLoader({})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: true})

    const [datas, setDatas] = useState([]);
    const [solved, setSolved] = useState('')
    const [ctypeOption, setTypeOption] = useState([])

    /** UseState modal */
    const [ solveModalOpen, setSolveModalOpen ] = useState(false)
	const [ solveUnit, setSolveUnit ] = useState(0);

    const [ detailModalOpen, setDetailModalOpen ] = useState(false)
    const [ detailModalData, setDetailModalData ] = useState({})

    // Datatable хайлт
    const [sortField, setSort] = useState('')

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [searchValue, setSearchValue] = useState("");
    const [total_count, setTotalCount] = useState(datas.length || 1)


    // Шиидвэрлэх харах хэсэг
	function handleRequestSolve(data, unit)
	{
		setSolveModalOpen(!solveModalOpen)
		setSolveUnit(unit)
		setDetailModalData(data)
	}

    // Дэлгэрэнгүй харах хэсэг
	async function handleRequestDetail(data)
    {
		setDetailModalOpen(!detailModalOpen)
		setDetailModalData(data)
	}


    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        refreshDatas()
    }

    // Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

    // ** Function to handle filter
    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    // Sort хийх функц
    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    async function refreshDatas() {
        const { success, data } = await allFetch(croutingdApi.get(rowsPerPage, currentPage, sortField, searchValue, menu_id, solved))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(
        () =>
        {
            setMenuId(menu_id)
            setTypeOption(get_routingslip_list())
        },
        []
    )

	useEffect(() => {
		if (searchValue.length == 0) {
			refreshDatas();
		} else {
			const timeoutId = setTimeout(() => {
				refreshDatas();
			}, 600);

			return () => clearTimeout(timeoutId);
		}
	}, [searchValue]);

    return (
        <Fragment>
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Тойрох хуудас хүсэлт')}</CardTitle>
                </CardHeader>
                <Row className="mx-0 mt-1">
					<Col md={4} className='mb-1'>
						<Label className= "form-label me-1" for="routingslip_type">
							{t('Тойрох хуудасны төрөл')}
						</Label>
                        <Select
                            name="routingslip_type"
                            id="routingslip_type"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t(`-- Сонгоно уу --`)}
                            options={ctypeOption || []}
                            value={ctypeOption.find((c) => c.id === solved)}
                            noOptionsMessage={() => t('Хоосон байна')}
                            styles={ReactSelectStyles}
                            onChange={(val) => {
                                setSolved(val?.id || '')
                            }}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
					</Col>
                </Row>
                <Row className='justify-content-between mx-0 mt-1'>
                    <Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
                        <Col md={2} sm={3} className='pe-1'>
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
                            <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                        </Col>
                    </Col>
                    <Col className='d-flex align-items-center mobile-datatable-search' md={6} sm={12}>
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
                            className='ms-50 mb-50'
                            color='primary'
                            onClick={handleSearch}
                        >
                            <Search size={15} />
                            <span className='align-middle ms-50'></span>
                        </Button>
                    </Col>
                </Row>
                <div className="react-dataTable react-dataTable-selectable-rows" id='datatableLeftTwoRightOne'>
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
                        columns={getColumns(currentPage, rowsPerPage, datas, handleRequestSolve, handleRequestDetail, roleMenus)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count, searchValue, datas)}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>

            { detailModalOpen && <Detail isOpen={detailModalOpen} handleModal={handleRequestDetail} datas={detailModalData} /> }
            { solveModalOpen && <SolvedModal isOpen={solveModalOpen} handleModal={handleRequestSolve} datas={detailModalData} getDatas={refreshDatas} unit={solveUnit} /> }

        </Fragment>
    )
};

export default RoutingSlip;
