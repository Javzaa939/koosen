import React, {useState, useEffect, Fragment, useContext} from 'react';
import {getPagination, ReactSelectStyles} from '@utils';
import {useForm, Controller} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {getColumns} from './helpers';

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
    Plus,
    Search,
    ChevronDown,
} from 'react-feather';

import DataTable from 'react-data-table-component';
import AuthContext from '@context/AuthContext'
import useLoader from '@hooks/useLoader';
import classnames from 'classnames';
import useApi from '@hooks/useApi';
import Select from 'react-select';
import Addmodal from './Add';


const Exam = () => {

    // select values
    var values = {
        scope: '',
    };

    // Translation
    const {t} = useTranslation();

    // User
    const {user} = useContext(AuthContext)

    // Hook
    const {control, formState: {errors}, watch} = useForm({});
    const {Loader, isLoading, fetchData} = useLoader({isFullScreen: true});

    // Pagination and Sort states
    const defaultPage = [10, 15, 50, 75, 100];
    const [selectValue, setSelectValue] = useState(values);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState();
    const [sortField, setSortField] = useState('');

    // Search states
    const [searchValue, setSearchValue] = useState('');

    // Data States
    const [datas, setDatas] = useState([]);
    const [scope, setScope] = useState([]);
    const [type, setType] = useState([]);
    const [examId, setExamId] = useState();

    // Modals
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [editData, setEditData] = useState({})

    // Api
    const examApi = useApi().challenge.psychologicalTest

    //----------Backend-тэй харьцах функцууд----------//
    async function getDatas(){
        const {success, data} = await fetchData(examApi.get(rowsPerPage, currentPage, sortField, searchValue, selectValue?.scope))
        if(success){
            setDatas(data?.results);
            setTotalCount(data?.count)
        }
    }

    async function getOptionDatas(){
        const {success, data} = await fetchData(examApi.getOptions())
        if(success){
            setScope(data?.scope_options)
            setType(data?.type_options)
        }
    }

    async function handleDelete(id){
        const {success, data} = await fetchData(examApi.delete(id))
        if(success){
            getDatas();
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

    //----------Modal болон editModal-ийг ажиллуулах функцууд----------//
    function handleAddModal(){
        setAddModal(!addModal);
    }

    const handleEditModal = (row={}) => {
        setEditModal(!editModal)
        setEditData(row)
    }
    //----------END----------//

    useEffect(() => {
        getDatas()
        getOptionDatas()
    },[rowsPerPage, currentPage])

    useEffect(() => {
        getDatas()
    },[selectValue])

    return(
        <Fragment>
            <Card>
                {isLoading && Loader}
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom align-items-center py-1">
                    <CardTitle tag="h4">{t("Сэтгэл зүйн сорил")}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1 gap-1'>
                        <Button
                            color='primary'
                            onClick={() => handleAddModal()}
                        >
                            <Plus size={15}/>
                            <span className='align-middle ms-50'>{t("Нэмэх")}</span>
                        </Button>

                    </div>
                </CardHeader>
                <CardBody>
                    <Row className='justify-content-start mx-0 my-1' sm={12}>
                        <Col sm={6} md={6} lg={3}>
                            <Label className='form-label' for='scope'>
                                {t('Хамрах хүрээ')}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="scope"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="scope"
                                            id="scope"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.scope })}
                                            isLoading={isLoading}
                                            placeholder={t('-- Сонгоно уу --')}
                                            options={scope || []}
                                            value={scope.find((c) => c.id === value)}
                                            noOptionsMessage={() => t('Хоосон байна.')}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        scope: val?.id || '',
                                                    }
                                                })
                                            }}
                                            styles={ReactSelectStyles}
                                            getOptionValue={(option) => option.id}
                                            getOptionLabel={(option) => option.name}
                                        />
                                    )
                                }}
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
                            columns={getColumns(currentPage, rowsPerPage, totalCount, handleEditModal, handleDelete, user)}
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
            {addModal && <Addmodal
                open={addModal}
                handleModal={handleAddModal}
                refreshDatas={getDatas}
                editData={{}}
            />}
            {editModal && <Addmodal
                open={editModal}
                handleModal={handleEditModal}
                refreshDatas={getDatas}
                editData={editData}
            />}
        </Fragment>
    )
}
export default Exam