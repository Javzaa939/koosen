import React from 'react'
// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner, UncontrolledTooltip, CardBody } from 'reactstrap'

import { ChevronDown, File, FileText, Printer, Search } from 'react-feather'

import DataTable from 'react-data-table-component'

import { useTranslation } from 'react-i18next'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { getPagination, ReactSelectStyles } from '@utils'

import { getColumns } from './helpers';
import { useNavigate } from 'react-router-dom';
import { FaFileExcel } from 'react-icons/fa'
import AddModal from './AddModal'


function AnhanShat() {

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const navigate = useNavigate()

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    // Translate
    const { t } = useTranslation()

    const default_page = [ 10, 20, 50, 75, 100 ]

	const [searchValue, setSearchValue] = useState("");
	const [datas, setDatas] = useState([]);

    const [descModal, setDescModal] = useState(false)
    const [descModalData ,setDescModalData] = useState(null)

    const [addModal, setAddModal] = useState(false)
    const [addModalData, setAddModalData] = useState(null)

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

    // Нийт хуудасны тоо
    const [pageCount, setPageCount] = useState(1)

	const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false});
	const elseltApi = useApi().elselt.health.anhan

	/* Жагсаалтын дата авах функц */
	async function getDatas() {

        const {success, data} = await fetchData(elseltApi.get(rowsPerPage, currentPage, sortField, searchValue, '', '', '', '', '', ''))
        if(success) {
            console.log(data,'data')
            setTotalCount(data?.count)
            setDatas(data?.results)

            // Нийт хуудасны тоо
            var cpage_count = Math.ceil(data?.count / rowsPerPage === 'Бүгд' ? 1 : rowsPerPage)
            setPageCount(cpage_count)
        }
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
    }, [sortField, currentPage, rowsPerPage, searchValue])


    // ** Function to handle filter
	const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    function handleSearch() {
        getDatas()
    }


    // ** Function to handle per page
    function handlePerPage(e)
    {
        setRowsPerPage(e.target.value === 'Бүгд' ? e.target.value : parseInt(e.target.value))
    }

    // Хуудас солих үед ажиллах хэсэг
	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

    function descModalHandler(e, data) {

        setDescModal(!descModal)
        setDescModalData(data || null)

    }

    function addModalHandler(e, data) {

        setAddModal(!addModal)
        setAddModalData(data || null)

    }

    return (
        <Card>
            <AddModal addModal={addModal} addModalHandler={addModalHandler} addModalData={addModalData} getDatas={getDatas}/>
            <CardHeader>
                <h5>
                    Эрүүл мэндийн анхан шатны үзлэг
                </h5>
            </CardHeader>
            <CardBody>
                <Row>
                    <Col>
                    </Col>
                    <Col className='d-flex justify-content-end'>
                        <Button color='primary' className='d-flex align-items-center'>
                            <FileText className='me-50' size={14}/>
                            <div>
                                Excel татах
                            </div>
                        </Button>
                    </Col>
                </Row>
                <Row className="justify-content-between mx-0" >
                    <Col className='d-flex align-items-center justify-content-start' md={4}>
                        <Col md={3} sm={2} className='pe-1'>
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
                        <Col md={9} sm={3}>
                            <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                        </Col>
                    </Col>
                    <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={4} sm={12}>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder={t("Хайх үг....")}
                            value={searchValue}
                            onChange={(e) => {handleFilter(e)}}
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
                        paginationServer
                        pagination
                        className='react-dataTable-header-md'
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
                        print='true'
                        theme="solarized"
                        onSort={handleSort}
                        columns={getColumns(currentPage, rowsPerPage, total_count, addModalHandler)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                        // selectableRows
                        // onSelectedRowsChange={(state) => onSelectedRowsChange(state)}
                        // direction="auto"
                        // style={{ border: '1px solid red' }}
                        defaultSortFieldId={'created_at'}
                    />
                </div>
            </CardBody>
        </Card>
    )
}

export default AnhanShat


