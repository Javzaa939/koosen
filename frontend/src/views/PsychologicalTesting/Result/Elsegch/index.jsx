import React, {useState, useEffect, Fragment} from 'react';
import {useTranslation} from 'react-i18next';
import {getPagination} from '@utils';
import {getColumns} from './helpers';
import {useForm} from 'react-hook-form';

import Select from 'react-select'
import classnames from "classnames";
import {
    Row,
    Col,
    Card,
    Label,
    Input,
    Button,
    Spinner,
    CardBody,
    CardTitle,
    CardHeader,
} from 'reactstrap';

import {
    Search,
    ChevronDown,
} from 'react-feather';

import DataTable from 'react-data-table-component';
import useLoader from '@hooks/useLoader';
import useApi from '@hooks/useApi';
import { ReactSelectStyles } from '@utils'

function Elsegch({scope, adm, setAdm}){

    // Translation
    const {t} = useTranslation();

    // Hook
    const {control, formState: {errors}, watch} = useForm({});
    const {Loader, isLoading, fetchData} = useLoader({isFullScreen: true});

    // Pagination and Sort states
    const defaultPage = [10, 15, 50, 75, 100];
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState();
    const [sortField, setSortField] = useState('');

    // Search states
    const [searchValue, setSearchValue] = useState('');

    // Data States
    const [datas, setDatas] = useState([]);
    
    const [admop, setAdmop] = useState([])

    // Api
    const examApi = useApi().challenge.psychologicalTestResult
    const admissionYearApi = useApi().elselt

    async function getAdmissionYear() {
        const { success, data } = await fetchData(admissionYearApi.getAll())
        if (success) {
            setAdmop(data)
        }
	}

    //----------Backend-тэй харьцах функцууд----------//
    async function getDatas(){
        const {success, data} = await fetchData(examApi.get(rowsPerPage, currentPage, sortField, searchValue, scope))
        if(success){
            setDatas(data?.results);
            setTotalCount(data?.count)
        }
    }
    //----------END----------//

    //----------Хайлтын функцууд----------//
    function handleFilter(e){
        const value = e.target.value.trimStart();
        setSearchValue(value);
    }

    async function handleSearch(){
        if(searchValue.length > 0) getDatas();
    }

    useEffect(() => { // Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
        if (searchValue.length == 0) {
            getDatas();
        } else {
            const timeoutId = setTimeout(() => {
                getDatas();
            }, 600);

            return () => clearTimeout(timeoutId);
        }
    }, [searchValue]);
    //----------END----------//

    //----------Хуудаслалт болон sort-ийн функцууд----------//
    function handleSort(column, sort){
        if(sort === 'asc'){
            setSortField(column.header);
        } else {
            setSortField('-' + column.header);
        }
    }

    function handlePagination(page){
        setCurrentPage(page.selected + 1);
    }

    function handlePerPage(e){
        setRowsPerPage(parseInt(e.target.value));
    }
    //----------END----------//

    //----------UseEffect----------//
    useEffect(() => {
        getDatas()
    },[rowsPerPage, currentPage])
    //----------END----------//

    useEffect(
        () =>
        {
            getAdmissionYear()
        },
        [scope]
    )

    return(
        <Fragment>
            <Card>
                {isLoading && Loader}
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom align-items-center py-1">
                    <CardTitle tag="h4">{t("Сэтгэл зүйн сорил үр дүн")}</CardTitle>
                </CardHeader>
                <CardBody>
                    <Row>
                        <Col md={4}>
                            <Label className="form-label" for="lesson_year">
                                {t('Элсэлт')}
                            </Label>
                            <Select
                                name="lesson_year"
                                id="lesson_year"
                                classNamePrefix='select'
                                isClearable
                                className={classnames('react-select')}
                                isLoading={isLoading}
                                placeholder={t('-- Сонгоно уу --')}
                                options={admop || []}
                                value={admop.find((c) => c.id === adm)}
                                noOptionsMessage={() => t('Хоосон байна.')}
                                onChange={(val) => {
                                    setAdm(val?.id || '')
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => option.lesson_year + ' ' + option.name}
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
                                        defaultPage.map((page, idx) => (
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
                    <div className="react-dataTable react-dataTable-selectable-rows">
                        <DataTable
                            noHeader
                            paginationServer
                            pagination
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
                            columns={getColumns(currentPage, rowsPerPage, totalCount)}
                            sortIcon={<ChevronDown size={10} />}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            data={datas}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, totalCount)}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                        />
                    </div>
                </CardBody>
            </Card>
        </Fragment>
    )
};
export default Elsegch