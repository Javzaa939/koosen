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

import { ChevronDown, Plus, Search } from 'react-feather'
import { Fragment, useState, useEffect, useContext } from 'react'

import DataTable from 'react-data-table-component'

import { getPagination, get_correspond_type, ReactSelectStyles } from '@utils'
import { useTranslation } from 'react-i18next'

import Select from 'react-select'
import classnames from "classnames";

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import AuthContext from "@context/AuthContext"
import RequestContext from "@context/RequestContext"

import Add from './Add'
import SolvedModal from './Solved'
import ApproveModal from './Approve'

import { getColumns } from './helpers'


const Request = () => {
    const { t } = useTranslation()
    const menu_id = 'complaint3'

    const default_page = [10, 15, 50, 75, 100]

    const { user } = useContext(AuthContext)

    const { setMenuId, roleMenus } = useContext(RequestContext)

    // API
    const correspondApi = useApi().request.correspond

    const { isLoading, fetchData } = useLoader({})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    const [editId, setEditId] = useState('')
    const [solveId, setSolveId] = useState('')
    const [pId, setPId] = useState('')
    const [unitId, setUnitId] = useState('')
    const [solved, setSolved ] = useState('')
    const [approveId, setApproveId] = useState('')

    const [datas, setDatas] = useState([]);
    const [ctypeOption, setTypeOption] = useState([])

    const [editDatas, setEditDatas] = useState({})
    const [openModal, setOpenModal] = useState(false)
    const [solvedModal, setSolvedModal] = useState(false)
    const [isDetail, setIsDetail] = useState(false)
    const [approveModal, setApproveModal] = useState(false)

    const [sortField, setSort] = useState('')

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [searchValue, setSearchValue] = useState("");

    // нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

    const setIDs = () => {
        if (editId ) {
            setEditId('')
        } else if (solveId) {
            setSolveId('')
        } else if (approveId) {
            setApproveId('')
        }
    }
    const handleModal = () => {
        setOpenModal(!openModal)
        setIDs()
    }

    // Шийдвэрлэх модал
    const handleSolvedModal = (id, p_id, unit_id) => {
        setSolveId(id)
        setPId(p_id)
        setUnitId(unit_id)
        solveModal()
    }

    // Шийдвэрлэх модал
    const solveModal = () => {
        setSolvedModal(!solvedModal)
        setIsDetail(false)
        setIDs()
    }

    const detailModal = (id, pId) => {
        setSolveId(id)
        setPId(pId)
        setSolvedModal(!solvedModal)
        setIsDetail(true)
        setIDs()
    }

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        getDatas()
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

    /* Жагсаалт дата авах функц */
    async function getDatas() {
        if (editId || solveId || approveId) {
            const { success, data } = await fetchData(correspondApi.getOne(editId ? editId : solveId ? solveId : approveId))
            if(success) {
                setEditDatas(data)
            }
        }
    }

    async function refreshDatas() {
        const { success, data } = await allFetch(correspondApi.get(rowsPerPage, currentPage, sortField, searchValue, menu_id, solved))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    const handleEditModal = (id) => {
        setEditId(id)
        handleModal()
        setIDs()
    }

    // Батлах хүсэлт
    const handleApproveModal = (id='') => {
        setApproveId(id)
        setApproveModal(!approveModal)
        setIDs()
    }

    // Sort хийх функц
    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    useEffect(
        () =>
        {
            setMenuId(menu_id)
            setTypeOption(get_correspond_type())
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


    useEffect(() => {
        refreshDatas()
    }, [sortField, currentPage, rowsPerPage, solved])

    useEffect(() => {
        getDatas()
    }, [editId, solveId, approveId])

    return (
        <Fragment>
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Дүнгийн дүйцүүлэлт хийлгэх хүсэлт')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
                            disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-request-correspond-create') ? false : true}
                            color='primary'
                            onClick={() => handleModal()}
                        >
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className="mx-0 mt-1">
					<Col md={4} className='mb-1'>
						<Label className= "form-label me-1" for="solved_flag">
							{t('Шийдвэрийн төрөл')}
						</Label>
                        <Select
                            name="solved_flag"
                            id="solved_flag"
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
                        columns={getColumns(currentPage, rowsPerPage, datas, handleEditModal, handleSolvedModal, detailModal, roleMenus, handleApproveModal)}
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
            {openModal && <Add open={openModal} handleModal={handleModal} refreshDatas={refreshDatas} datas={editId ? editDatas : {}} editId={editId}/>}
            {solvedModal && <SolvedModal open={solvedModal} handleModal={solveModal} solveId={solveId} professionId={pId} sdatas={solveId ? editDatas : {}} isDetail={isDetail} refreshDatas={refreshDatas} unitId={unitId}/>}
            {approveModal && <ApproveModal open={approveModal} handleModal={handleApproveModal} approveId={approveId} datas={approveId ? editDatas : {}} refreshDatas={refreshDatas}/>}
        </Fragment>
    )
};

export default Request;
