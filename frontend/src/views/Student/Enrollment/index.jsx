import { Fragment, useState, useEffect, useContext } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Row, Col, Card, Input, Label, CardTitle, CardHeader, Spinner, Button, UncontrolledTooltip } from 'reactstrap'
import { ChevronDown , Edit, Edit2, Edit3, Printer, Search} from 'react-feather'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import DataTable from 'react-data-table-component'
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { getColumns } from './helpers';

import { useNavigate } from 'react-router-dom'
import { getPagination, ReactSelectStyles } from '@utils';
import EditModal from './EditModal'
import StateModal from '../../Elselt/User/StateModal'
import AuthContext from '@src/utility/context/AuthContext'
import { RiEditFill } from 'react-icons/ri'

import classnames from "classnames";

const Enrollment = () => {
    const genderOp = [
        {
            id: 1,
            name: 'Эрэгтэй',
        },
        {
            id: 2,
            name: 'Эмэгтэй'
        }
    ]
    const stateop = [
        {
            'id': 1,
            'name': 'БҮРТГҮҮЛСЭН'
        },
        {
            'id': 2,
            'name': 'ТЭНЦСЭН'
        },
        {
            'id': 3,
            'name': 'ТЭНЦЭЭГҮЙ'
        }
    ]

    const { user } = useContext(AuthContext)
    const [stateModal, setStateModal] = useState(false)
    const [gender, setGender] = useState("")

    var values = {
        admission: '',
        profession: '',
    }

    const [sortField, setSort] = useState('')
    const navigate = useNavigate()

    const { Loader, isLoading, fetchData } = useLoader({})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({})

    const [datas, setDatas] = useState([])

    const [currentPage, setCurrentPage] = useState(1)

    const { t } = useTranslation()

    const { control, formState: { errors } } = useForm({});
    const [rowsPerPage, setRowsPerPage] = useState(20)
    const [searchValue, setSearchValue] = useState("");
    const [select_value, setSelectValue] = useState(values);
    const [editModal, setEditModal] = useState(false)

    const [total_count, setTotalCount] = useState(1)

    const default_page = [10, 20, 50, 75, 100]

    // Const Option
    const [admissionOption, setAdmisionOption] = useState([])
    const [professionOption, setProfessionOption] = useState([])
    const [selectedRows, setSelectedRows] = useState([])

    // API
    const professionApi = useApi().elselt.profession
    const admissionYearApi = useApi().elselt
    const elseltApproveApi = useApi().elselt.approve

    // элсэлт
    async function getAdmissionYear() {
        const { success, data } = await fetchData(admissionYearApi.getAll())
        if (success) {
            setAdmisionOption(data)
        }
	}

    // Хөтөлбөрийн жагсаалт авах
    async function getProfession() {
        const { success, data } = await fetchData(professionApi.getList(select_value?.admission))

        if (success) {
            setProfessionOption(data)
        }
	}

    // data avah heseg
    async function getDatas() {
        var profession = select_value?.profession
        var admission = select_value?.admission

        const page_count = Math.ceil(total_count / rowsPerPage)
        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        const { success, data } = await allFetch(elseltApproveApi.get(rowsPerPage, currentPage, sortField, searchValue, admission, profession, gender))
        if(success)
        {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    const handleFilter = e => {
        const value = e.target.value.trimStart();
		setSearchValue(value)
	}

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    async function handleSearch() {
        getDatas()
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

    useEffect(() => {
        getAdmissionYear()
    },[])

    useEffect(
        () =>
        {
            getProfession()
        },
        [select_value.admission]
    )

    useEffect(() => {
        getDatas()
    },[select_value, rowsPerPage, currentPage, sortField])

    useEffect(() => {
		if (searchValue.length == 0) {
			getDatas();
		} else {
			const timeoutId = setTimeout(() => {
				getDatas();
			}, 600);

			return () => clearTimeout(timeoutId);
		}
	}, [rowsPerPage, currentPage, sortField, searchValue, select_value.admission, select_value.profession, gender]);

    function onSelectedRowsChange(state) {
        var selectedRows = state.selectedRows

		setSelectedRows(selectedRows);
    }

    const toggleEditModal = () => {
        setEditModal(!editModal)
    }

    function stateModalHandler() {
        setStateModal(!stateModal)
    }

    return(
        <Fragment>
            <StateModal
                getDatas={getDatas}
                stateModalHandler={stateModalHandler}
                stateModal={stateModal}
                selectedStudents={selectedRows}
                stateop={stateop}
            />
            <Card>
            {isLoading && Loader}
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom pt-0'">
					<CardTitle tag="h4">{t('Тэнцсэн элсэгчидийн элсэлтийн тушаал')}</CardTitle>
					    <div className='d-flex flex-wrap mt-md-0 mt-1'>

                            <Button
                                color='primary'
                                className='m-50'
                                disabled={selectedRows.length === 0}
                                onClick={() => toggleEditModal()}
                            >
                                <Edit3 size={15} />
                                <span className='align-middle ms-50'>{t('Тушаал бүртгэх')}</span>
                            </Button>

                            <Button
                                color='primary'
                                className='m-50'
                                disabled={!select_value?.profession}
                                onClick={() => {navigate(`printlist`,  { state: { 'selectedRows': selectedRows, 'select_value': select_value }, })}}
                            >
                                <Printer size={15} />
                                <span className='align-middle ms-50'>{t('Хэвлэх')}</span>
                            </Button>

                        </div>
                </CardHeader>
                <Row className="justify-content-start mx-0 mt-1">
                    <Col md={3}>
                        <Label className="form-label" for="degree">
                            {t('Элсэлт')}
                        </Label>
                        <Select
                            name="degree"
                            id="degree"
                            classNamePrefix='select'
                            isClearable
                            className='react-select'
                            placeholder={t('-- Сонгоно уу --')}
                            options={admissionOption || []}
                            value={admissionOption.find((c) => c.id === select_value.admission)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        admission: val?.id || '',
                                    }
                                })
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.lesson_year + ' ' + option.name}
                        />
                    </Col>
                    <Col md={3}>
                        <Label className="form-label" for="profession">
                            {t('Хөтөлбөр')}
                        </Label>
                        <Select
                            name="profession"
                            id="profession"
                            classNamePrefix='select'
                            isClearable
                            className='react-select'
                            placeholder={t('-- Сонгоно уу --')}
                            options={professionOption || []}
                            value={professionOption.find((c) => c.id === select_value.profession)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        profession: val?.id || '',
                                    }
                                })
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.prof_id}
                            getOptionLabel={(option) => option.name
                            }
                        />
                    </Col>
                    <Col md={3}>
                        <Label className="form-label" for="genderOp">
                            {t('Хүйс')}
                        </Label>
                        <Select
                            name="genderOp"
                            id="genderOp"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={genderOp || []}
                            value={genderOp.find((c) => c.name === gender)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setGender(val?.name || '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                </Row>
                <div className='d-flex justify-content-between my-50 mt-1'>
                    <div className='px-1'>
                         <Button
                            color='primary'
                            disabled={(selectedRows.length != 0 && user.permissions.includes('lms-elselt-admission-approve')) ? false : true}
                            className='d-flex align-items-center px-75'
                            id='state_button'
                             onClick={() => stateModalHandler()}
                        >
                            <RiEditFill className='me-25'/>
                            Төлөв солих
                            </Button>
                        <UncontrolledTooltip target='state_button'>
                            Доорхи сонгосон элсэгчдийн төлөвийг нэг дор солих
                        </UncontrolledTooltip>
                    </div>
                </div>
                <Row className='justify-content-between mx-0 mb-1'>
                    <Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
                        <Col md={2} sm={3} className='pe-1'>
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
                <div className='react-dataTable react-dataTable-selectable-rows'>
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
                        columns={getColumns(currentPage, rowsPerPage, total_count)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
						selectableRows
						onSelectedRowsChange={(state) => onSelectedRowsChange(state)}
                    />
                </div>
            </Card>

             <EditModal editModal={editModal} toggleEditModal={toggleEditModal} selectedRows={selectedRows} getDatas={getDatas}/>

        </Fragment>
    )
}
export default Enrollment;
