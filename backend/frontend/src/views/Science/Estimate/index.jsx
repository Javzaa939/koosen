import { Fragment, useState, useEffect} from "react"

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
import { useTranslation } from 'react-i18next'
import DataTable from 'react-data-table-component'
import { ChevronDown ,Search } from "react-feather"
import { getPagination, ReactSelectStyles } from '@utils'

// ** Styles Imports
import '@styles/react/libs/react-select/_react-select.scss'
import '@styles/react/libs/flatpickr/flatpickr.scss'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { getColumns } from './helpers'

const Estimate = () => {

    const { t } = useTranslation()

    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: true})

    const default_page = [10, 15, 50, 75, 100]

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [sortField, setSortField] = useState('')

    // Эрэмбэлэлт
    const [datas, setDatas] = useState([])
    const [searchValue, setSearchValue] = useState('')
    const [departmentOption, setDepartmentOption] = useState([])
    const [salbar, setSalbar] = useState('')

    // API
    const salbarApi = useApi().hrms.department
    const scienceApi = useApi().science.estimate

    async function getDepartmentDatas() {
        const { success, data } = await fetchData(salbarApi.get())
        if (success && data) {
            setDepartmentOption(data)
        }
    }

    async function getDatas(){
        const { success, data } = await allFetch(scienceApi.get(rowsPerPage, currentPage, sortField, searchValue, salbar))
        if(success){
            setDatas(data)
            setTotalCount(data?.length)
        }
    }

    useEffect(
        () =>
        {
            getDatas()
        },
        [currentPage, rowsPerPage, salbar]
    )

    useEffect(() => {
        getDepartmentDatas()
    }, [])

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

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    function handleSearch() {
        getDatas()
    }

    function handleSort(column, sorting) {
        if(sorting === 'asc'){
            setSortField(column.sortField)
        }
        else {
            setSortField('-' + column.sortField)
        }
    }

    function handlePagination(page) {
        setCurrentPage(page.selected + 1)
    }

    return (
        <Fragment>
            <Card>
                {isTableLoading && Loader}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Б цагийн тооцооны нэгтгэл')}</CardTitle>
                </CardHeader>
                <Row className="mx-0 mt-1">
                    <Col md={3}>
                        <Label className="form-label" for="department">
                            {t('Хөтөлбөрийн баг')}
                        </Label>
                        <Select
                            name="department"
                            id="department"
                            classNamePrefix='select'
                            isClearable
                            className='react-select'
                            placeholder={t('-- Сонгоно уу --')}
                            options={departmentOption || []}
                            value={departmentOption.find((c) => c.id === salbar)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                if (val === null) {
                                    setSalbar('');
                                } else {
                                    setSalbar(val?.id);
                                }
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                </Row>
                <Row className="d-flex justify-content-between mx-0 mt-1 mb-1">
                    <Col md={3}>
                        <Label for='sort-select'>
                            {t('Хуудсанд харуулах тоо')}
                        </Label>
                        <Input
                            type='select'
                            bsSize='sm'
                            style={{
                                height: "30px",
                                width: "60px"
                            }}
                            value={rowsPerPage}
                            onChange={e => handlePerPage(e)}>
                            {
                                default_page.map((page, idx) => (
                                <option
                                    key={idx}
                                    value={page}>
                                    {page}
                                </option>
                            ))}
                        </Input>
                    </Col>
                    <Col className='d-flex align-items-end mobile-datatable-search mt-1'>
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
                <div className='react-dataTable react-dataTable-selectTable-rows mx-1'>
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
                        columns={getColumns(currentPage, rowsPerPage, total_count)}
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
        </Fragment>
    )

}
export default Estimate
