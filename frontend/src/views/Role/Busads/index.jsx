import { Fragment, useState, useEffect ,useContext} from "react"

import {
    Col,
    Row,
    Card,
    Input,
    Label,
    Button,
    CardTitle,
    CardHeader,
    Spinner
} from 'reactstrap'

import Select from 'react-select'
import classnames from 'classnames'
import { useTranslation } from 'react-i18next'
import DataTable from 'react-data-table-component'
import { Controller, useForm } from "react-hook-form";
import { ChevronDown ,Search,Plus} from "react-feather"
import { getPagination, ReactSelectStyles, permission_type_option } from '@utils'
// import AuthContext from "@context/AuthContext"
// import SchoolContext from "@context/SchoolContext"
// import ActiveYearContext from "@context/ActiveYearContext"

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import  AddModal  from "./Add"
import UpdateModal from "./Update"
import DetailModal from "./Detail"
import { getColumns } from "./helpers"


const Busad = () => {
    const { control, handleSubmit, reset, setError, formState: { errors } } = useForm();

    const { Loader, isLoading, fetchData } = useLoader({})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    const { t } = useTranslation()

    // Modal
    const [update_modal, setUpdateModal] = useState(false)
    const [modal_open, setModalOpen] = useState(false)
    const [detail_modal, setDetailModal]=useState(false)
    const [detailModalData, setDetailModalData]= useState({})


    // useState
    const [sortField, setSortField] = useState('')
    const [datas, setDatas] = useState([])
    const [searchValue, setSearchValue] = useState('');
	const [edit_id, setEditId ] = useState('')
    const [select_other, setOtherOption] = useState(permission_type_option())
    const [other_id , setOtherId] = useState('')

    const default_page = [10, 15, 50, 75, 100]

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)


    // Api
    const permissionOtherApi = useApi().role.other

    // Бусад хандах эрх жагсаалт
    async function getDatas() {
        const { success, data } = await allFetch(permissionOtherApi.get(rowsPerPage, currentPage, sortField, searchValue, other_id))
        if(success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    async function handleDelete(id) {
        if (id){
            const { success } = await fetchData(permissionOtherApi.delete(id))
            if(success) {
                getDatas()
            }

        }
    }

    useEffect(() => {
        getDatas()
    }, [rowsPerPage, currentPage, sortField])

    useEffect(() => {
            getDatas()
    }, [other_id])

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

    const handleFilter = e => {
    const value = e.target.value.trimStart();
    setSearchValue(value)
    }

    function handleSearch() {
            getDatas()
    }

    // нэмэх функц
    function handleAddModal(){
        setModalOpen(!modal_open)
    }

    // Засах функц
    function handleUpdateModal(id) {
        setEditId(id)
        setUpdateModal(!update_modal)
    }
    // Дэлгэрэнгүй функц
    function handleDetailModal(data){
        setDetailModal(!detail_modal)
        setDetailModalData(data)
    }

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }
    // Хуудас солих үед ажиллах хэсэг
	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

    function handleSort(column, sorting) {
        if(sorting === 'asc') {
            setSortField(column.sortField)
        } else {
            setSortField('-' + column.sortField)
        }
    }

    return(
        <Fragment>
            <Card>
                {isLoading && Loader}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Бусад хандах эрхийн жагсаалт')}</CardTitle>
                     <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button color='primary' onClick={() => handleAddModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>Нэмэх</span>
                        </Button>
                    </div>
                </CardHeader>
				<Row className="mx-0 mt-1">
                    <Col md={4} className='mb-1'>
                        <Label className='form-label me-1' for='permission_type'>
                            {t('Хандах эрх')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="permission_type"
                            render={({ field: { onChange } }) => {
                                return (
                                    <Select
                                        name="permission_type"
                                        id="permission_type"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', {'is-invalid': errors.permission_type})}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={select_other || []}
                                        noOptionsMessage={() => t('Хоосон байна')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setOtherId(val?.id || '')
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        />
                        {errors.permission_type && <FormFeedback className='d-block'>{t(errors.permission_type.message)}</FormFeedback>}
                    </Col>
				</Row>
                <Row className="mt-1 d-flex justify-content-between mx-0 mb-1">
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
                        <Col className='d-flex align-items-end mobile-datatable-search mt-1'>
                            <Input
                                className='dataTable-filter mb-50'
                                type='text'
                                bsSize='sm'
                                id='search-input'
                                placeholder={t("хайх")}
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
                <div className='react-dataTable react-dataTable-selectTable-rows' id="datatableLeftTwoRightOne">
                    <DataTable
                        noHeader
                        pagination
                        paginationServer
                        className='react-table'
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
                        sortIcon={<ChevronDown size={10} />}
                        columns={getColumns(currentPage, rowsPerPage, total_count, handleUpdateModal, handleDetailModal, handleDelete)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        data={datas}
                        onSort={handleSort}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
            { update_modal && <UpdateModal editId={edit_id} open={update_modal} handleModal={handleUpdateModal} refreshDatas={getDatas}/> }
            { modal_open && <AddModal isOpen={modal_open} handleAddModal={handleAddModal} refreshDatas={getDatas} /> }
            { detail_modal && <DetailModal  open={detail_modal} handleModal={handleDetailModal} datas={detailModalData} /> }
        </Fragment>
    )
}
export default Busad
