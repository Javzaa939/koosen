import React from "react";
import { Fragment, useState, useEffect, useContext, useMemo } from 'react'
import {
    Row,
    Col,
    Card,
    Input,
    Label,
    Button,
    CardTitle,
    CardHeader,
    Spinner,
    InputGroupText,
    InputGroup,
    UncontrolledTooltip,
    Badge
} from 'reactstrap'

import { useNavigate } from "react-router-dom";

import { ChevronDown, Search, Printer, AlertTriangle } from 'react-feather'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
// import AuthContext from '@context/AuthContext'

import { getPagination, formatDate } from '@utils'
import { getColumns } from './helpers'

import { useTranslation } from "react-i18next";
import Flatpickr from 'react-flatpickr'
import { Mongolian } from "flatpickr/dist/l10n/mn.js"

import UpdateModal from './Update'
import Add from "../../../Request/Correspond/Add";
import PrintModal from "./PrintModal";

const Irsen = () => {

    // const { user } = useContext(AuthContext)
    const default_page = [10, 15, 50, 75, 100]
    const { t } = useTranslation()
    const navigate = useNavigate();

    var start_date =  new Date()
    var end_day = new Date().getDate() - 7;
    start_date.setDate(end_day)

    const [startPicker, setStartPicker] = useState(formatDate(start_date))
    const [endPicker, setEndPicker] = useState(formatDate(new Date()))

    const [datas, setDatas] = useState([])
    const [editData, setEditData] = useState({})

    const [update_modal, setUpdateModal] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [editId, setEditId] = useState('')
    const [printModal, setPrintModal] = useState(false)
    const [check, setCheck] = useState(false)

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState('')
    const [stateValue, setStateValue] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')


    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false })

    const studentmovementApi = useApi().student.arrived
    // const studentOneApi = useApi().student

    useEffect(() => {
        getDatas()
    }, [sortField, currentPage, rowsPerPage, endPicker, startPicker])

    async function getDatas() {
        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        const { success, data } = await fetchData(studentmovementApi.get(rowsPerPage, currentPage, sortField, searchValue, startPicker, endPicker, stateValue))
        if(success)
        {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    // ** Function to handle filter
    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    const handleFilterValue = e => {
        const value = e.target.value.trimStart();
        setStateValue(value)
    }

    // ** Function to handle perPage
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    // Хуудас солих үед ажиллах хэсэг
	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

    /* Устгах функц */
	// const handleDelete = async(id) => {
    //     const { success } = await fetchData(studentmovementApi.delete(id))
    //     if(success)
    //     {
    //         getDatas()
    //     }
	// };

    const handleUpdate = (data, id) => {
        setUpdateModal(!update_modal)
        setEditId(id)
        setEditData(data)
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        if (searchValue.length > 0 || stateValue.length >  0) getDatas()
    }


    // Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
	useEffect(() => {
		if (searchValue.length == 0) {
			getDatas();
		} else {
			const timeoutId = setTimeout(() => {
				getDatas();
			}, 600);

			return () => clearTimeout(timeoutId);
		}
	}, [searchValue, stateValue]);

    function handleOpenModal(data){
        setEditId(data?.id)
        setEditData(data)

        setOpenModal(!openModal)
    }

    const handleModal = () => {
        setPrintModal(!printModal)
    }

    function onSelectedRowsChange(state) {
        var selectedRows = state.selectedRows
        setCheck(selectedRows.length > 0)

        for (let i in datas) {
            if(!selectedRows.includes(datas[i])) {
                datas[i].is_selected = false
            }
            else {
                datas[i].is_selected = true
            }
        }
    }

    const searchComponent = useMemo(() => {
        var selecteds = datas.filter(c => c.is_selected == true)
        return(
            (check  && selecteds.length > 0)
            &&
                <Col className= "d-flex justify-content-end datatable-button mb-50" lg={12} md={12}>
                    <Button
                        color='primary'
                        size="sm"
                        className="ms-1"
                        onClick={() => handleModal()}
                    >
                        <span className='align-middle ms-50'>Хавсралт хэвлэх</span>
                    </Button>
                </Col>
        )
    }, [check, datas])


    const handlePrint = () => {
        var cdata = datas.length > 0 ? datas[0] : {}
        var dates = {
            'statement': cdata?.statement,
            'statement_date': cdata?.statement_date
        }

        var printDatas = {
            dates: dates,
            datas: datas
        }
        navigate('/student/shift/print', { state: printDatas });
    }

    return (
        <Fragment>
            <Card>
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom pt-0'>
                    <CardTitle tag='h4'>{t('Шилжиж ирсэн оюутны бүртгэл')}</CardTitle>
                </CardHeader>
                <Row className="d-flex justify-content-start">
                    <Col md={3} className='ms-1 mt-50'>
                        <Label className='form-label' for='inline-picker'>
                            Эхлэх хугацаа
                        </Label>
                        <Flatpickr
                            id='start'
                            name='start'
                            className='form-control'
                            onChange={date => setStartPicker(formatDate(date[0]))}
                            value={startPicker}
                            style={{height: "30px"}}
                            options={{
                                dateFormat: 'Y-m-d',
                                locale: Mongolian,

                            }}
                        />
                    </Col>
                    <Col md={3} className='ms-1 mt-50 me-1'>
                        <Label className='form-label' for='inline-picker'>
                            Дуусах хугацаа
                        </Label>
                        <Flatpickr
                            id='start'
                            name='start'
                            className='form-control'
                            onChange={date => setEndPicker(formatDate(date[0]))}
                            value={endPicker}
                            style={{height: "30px"}}
                            options={{
                                dateFormat: 'Y-m-d',
                                minDate: startPicker,
                                locale: Mongolian,
                            }}
                        />
                    </Col>
                    <Col md={3} className='ms-1 mt-50'>
                        <Label className='form-label' for='inline-picker'>
                            Тушаалын дугаар
                        </Label>
                        <InputGroup>
                            <Input
                                type='text'
                                bsSize='sm'
                                id='search-input'
                                placeholder={t('Хайх')}
                                value={stateValue}
                                onChange={handleFilterValue}
                                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                            />
                            <InputGroupText role={'button'} onClick={() => handlePrint()}>
                                <Printer size={15} id='printer' role={'button'}/>
					            <UncontrolledTooltip placement='top' target={`printer`}>{t('Хавсралт хэвлэх')}</UncontrolledTooltip>
                            </InputGroupText>
                        </InputGroup>
                    </Col>
                </Row>
                <Row className='justify-content-between mx-0 mt-1'>
                    <Col className='d-flex align-items-center justify-content-start' md={4} sm={12} style={{width: "470px"}} >
                        <Col md={2} sm={3} className='pe-1'>
                            <Input
                                className='dataTable-select me-1 mb-50'
                                type='select'
                                bsSize='sm'
                                style={{ height: "30px"}}
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
                            <Label for='sort-select'>{t("Хуудсанд харуулах тоо")}</Label>
                        </Col>
                    </Col>
                    <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={4} sm={12}>
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
                {
                    datas && datas.length > 0 ?

                        <div className='react-dataTable react-dataTable-selectable-rows'>
                            <DataTable
                                noHeader
                                pagination
                                paginationServer
                                className='react-dataTable'
                                progressPending={isLoading}
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
                                columns={getColumns(currentPage, rowsPerPage, total_count, handleUpdate , handleOpenModal)}
                                paginationPerPage={rowsPerPage}
                                paginationDefaultPage={currentPage}
                                paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                                data={datas}
                                fixedHeader
                                fixedHeaderScrollHeight='62vh'
                                subHeader
                                subHeaderComponent={searchComponent}
                                selectableRows
                                onSelectedRowsChange={(state) => onSelectedRowsChange(state)}
                                selectableRowDisabled={(state) => state.statement}
                            />
                        </div>
                    :
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 100 }}><Badge pill color="light-warning" className="p-50"><AlertTriangle/> Өгөгдөл байхгүй байна</Badge></div>
                }
            </Card>
            {update_modal && <UpdateModal open={update_modal} handleUpdate={handleUpdate} refreshDatas={getDatas} editDatas={editData} editId={editId}/>}
            {openModal && <Add open={openModal} handleModal={handleOpenModal} refreshDatas={getDatas} datas={editData} isSolved={editData?.corres_type ? true : false} editId={editData?.corres_id}/>}
            {printModal && <PrintModal open={printModal} handleModal={handleModal} refreshDatas={getDatas} datas={datas.filter(c => c.is_selected == true)}/>}
        </Fragment>
    )
}
export default Irsen;
