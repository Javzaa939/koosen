import React, {useState, useEffect, Fragment} from 'react';
import {useTranslation} from 'react-i18next';
import {getPagination} from '@utils';
import {getColumns} from '../Elsegch/helpers';
import {useForm} from 'react-hook-form';

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


function Student({scope}){

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

    // Api
    const examApi = useApi().challenge.psychologicalTestResult

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

    const excelApi = useApi().challenge.psychologicalTestResult

    return(
        <Fragment>
            <Card>
                {isLoading && Loader}
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom align-items-center py-1">
                    <CardTitle tag="h4">{t("Сэтгэл зүйн сорил үр дүн")}</CardTitle>
                </CardHeader>
                <CardBody>
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
                            columns={getColumns(currentPage, rowsPerPage, totalCount, '', scope, excelApi, fetchData)}
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
export default Student