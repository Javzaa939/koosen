import React from 'react'
// ** React Imports
import { useState, useEffect } from 'react'

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner, CardBody } from 'reactstrap'

import { ChevronDown, Search, Zap } from 'react-feather'

import DataTable from 'react-data-table-component'

import { useTranslation } from 'react-i18next'
import Select from 'react-select'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { getPagination, ReactSelectStyles } from '@utils'

import { getColumns } from './helpers';

const STATE_LIST = [
    {
        name: 'Хүлээгдэж буй',
        id: 1
    },
    {
        name: 'Тэнцсэн',
        id: 2
    },
    {
        name: 'Тэнцээгүй',
        id: 3
    },
]

function Mergejliin() {

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    // Translate
    const { t } = useTranslation()

    const default_page = [ 10, 20, 50, 75, 100 ]

	const [searchValue, setSearchValue] = useState("");
	const [datas, setDatas] = useState([]);
    const [chosenState, setChosenState] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

    // Нийт хуудасны тоо
    const [pageCount, setPageCount] = useState(1)

	const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false});
	const elseltApi = useApi().elselt.health.professional

	/* Жагсаалтын дата авах функц */
	async function getDatas() {

        const {success, data} = await fetchData(elseltApi.get(rowsPerPage, currentPage, sortField, searchValue, chosenState))
        if(success) {
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
    }, [sortField, currentPage, rowsPerPage, searchValue, chosenState])


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

    return (
        <Card>
            <CardHeader>
                <h5>
                    Элсэгчийн нарийн мэргэжлийн шатны эрүүл мэндийн үзлэг
                </h5>
            </CardHeader>
            <CardBody>
                <Row>
                    <Col>
                    </Col>
                    <Col className='d-flex justify-content-end'>
                        <Button color='primary' className='d-flex align-items-center' onClick={() => alert('Сервисийн мэдээлэл ирээгүй байна.')}>
                            <Zap className='me-50' size={14}/>
                            <div>
                                Хүсэлт илгээх
                            </div>
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div className='m-1'>
                            <Col md={6} lg={3}>
                                <Label for='sort-select'>{t('Үзлэгийн төлөвөөр шүүх')}</Label>
                                <Select
                                    classNamePrefix='select'
                                    isClearable
                                    placeholder={`-- Сонгоно уу --`}
                                    options={STATE_LIST || []}
                                    value={STATE_LIST.find((c) => c.id === chosenState)}
                                    noOptionsMessage={() => 'Хоосон байна'}
                                    onChange={(val) => {
                                        setChosenState(val?.id || '')
                                    }}
                                    styles={ReactSelectStyles}
                                    getOptionValue={(option) => option.id}
                                    getOptionLabel={(option) => option.name}
                                />
                            </Col>
                        </div>
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
                        columns={getColumns(currentPage, rowsPerPage, total_count, STATE_LIST)}
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

export default Mergejliin


