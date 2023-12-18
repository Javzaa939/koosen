import { Fragment, useEffect, useState } from 'react';

import { Col, Row, Card, CardHeader, CardTitle, Input, Label, Button, Spinner } from 'reactstrap'

import { Search, ChevronDown, Plus } from 'react-feather';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { useTranslation } from 'react-i18next';

import DataTable from 'react-data-table-component'

import Select from 'react-select'

import { getPagination, club_type_option, ReactSelectStyles } from '@utils'

import classnames from 'classnames';

import { getColumns } from './helpers';

import Addmodal from './Add';
import EditModal from './Edit';
import CEditModal from './Edit/Modal'
import DetailModal from './Detail';

const ClubRegister = () => {
    const { t } = useTranslation()

    const { isLoading, Loader, fetchData } = useLoader({ })
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: true})

    const default_page = [10, 15, 50, 75, 100]

    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchValue, setSearchValue] = useState('');
    const [datas, setDatas] = useState([])
    const [sortField, setSort] = useState('')
    const [modal_open, setModalOpen] = useState(false)
    const [edit_modal, setEditModal] = useState(false)
    const [edit_id, setEditId] = useState('')
    const [total_count, setTotalCount] = useState(1)
    const [is_edit, setIsEdit] = useState(false)
    const [type_id, setTypeId] = useState('')

    const [ detailModalOpen, setDetailModalOpen ] = useState(false)
    const [ detailModalData, setDetailModalData ] = useState({})

    // Api
    const clubApi = useApi().request.club

    const handleFilter = e => {
        const value = e.target.value.trimStart();
		setSearchValue(value)
	}

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    async function getDatas() {
        const { success, data } = await allFetch(clubApi.get(rowsPerPage, currentPage, sortField, searchValue, type_id))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    useEffect(() => {
        getDatas()
    },[rowsPerPage, currentPage, sortField, type_id])

    function handleSearch() {
            getDatas()
    }

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


    // Дэлгэрэнгүй харах хэсэг
	async function handleRequestDetail(id, data)
    {
        setEditId(id)
		setDetailModalOpen(!detailModalOpen)
		setDetailModalData(data)

	}

    // Засах
    async function handleEditModal(id, state) {
        setEditId(id)
        setIsEdit(state)
        setEditModal(!edit_modal)
    }

    const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    // Нэмэх
    function handleModal() {
        setModalOpen(!modal_open)
    }

    return (
        <Fragment>
            <Card>
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h5'>{t('Клубын жагсаалт')}</CardTitle>
                    <div className='d-flex flex-wrap mt-0'>
                        <Button
                            color='primary'
                            onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className='d-flex justify-content-between mx-0 mb-1 mt-1'>
                    <Col md={4}>
                        <Label className='form-label' for='type'>
                            {t('Үйл ажиллагааны чиглэл')}
                        </Label>
                        <Select
                            name="type"
                            id="type"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={club_type_option || []}
                            value={club_type_option.find((c) => c.id === type_id)}
                            noOptionsMessage={() => t('Хоосон байна')}
                            onChange={(val) => setTypeId(val?.id || '')}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                </Row>
                <Row className='mt-1 d-flex justify-content-between mx-0 mb-1'>
                    <Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
                        <Col lg={2} md={3} sm={4} xs={5} className='pe-1'>
                            <Input
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
                    <Col className='d-flex align-items-end mobile-datatable-search'>
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
                <div className='react-dataTable react-dataTable-selectable-rows' id='datatableLeftTwoRightOne'>
                    <DataTable
                        noHeader
                        pagination
                        paginationServer
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
                        columns={getColumns(currentPage, rowsPerPage, total_count, handleEditModal, handleRequestDetail)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
                { modal_open && <Addmodal isOpen={modal_open} handleModal={handleModal} refreshDatas={getDatas} /> }
                { edit_modal && <EditModal isOpen={edit_modal} editId={edit_id} handleModal={handleEditModal} refreshDatas={getDatas} is_edit={is_edit}/> }
                { detailModalOpen && <DetailModal isOpen={detailModalOpen} editId={edit_id} handleModal={handleRequestDetail} datas={detailModalData} /> }
            </Card>
        </Fragment>
    )
};

export default ClubRegister;
