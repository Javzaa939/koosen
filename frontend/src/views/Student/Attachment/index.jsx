
import { Fragment, useState, useEffect, useContext} from 'react';

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, ListGroupItem, Spinner } from 'reactstrap';
import { ChevronDown, Search, Plus, Menu, Edit, Trash2 } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ReactSortable } from 'react-sortablejs'
import Select from 'react-select'
import DataTable from 'react-data-table-component'
import { useNavigate } from 'react-router-dom'

import { getPagination, ReactSelectStyles } from '@utils'

import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import useModal from '@hooks/useModal';
import useUpdateEffect from '@hooks/useUpdateEffect'

import SignatureModal from '@views/Student/Attachment/Signature/index.jsx'
import { getColumns } from '@views/Student/Attachment/helpers/index.jsx'

import '@styles/react/libs/drag-and-drop/drag-and-drop.scss'
import './style.css'

export default function Attachment()
{
    var values = {
        department: '',
        degree: '',
        group: ''
    }

    const navigate = useNavigate()

    // Нийт датаны тоо
    const default_page = [10, 15, 50, 75, 100]

    // Translate
    const { t } = useTranslation()

    // Modal
    const { showWarning } = useModal()

    //Context
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    // State
    const [datas, setDatas] = useState([])

    const [ select_value, setSelectValue ] = useState(values)
    const [ depOption, setDepOption ] = useState([])
    const [ degreeOption, setDegreeOption ] = useState([])
    const [ groupOption, setGroupOption ] = useState([])

    const [ currentPage, setCurrentPage ] = useState(1);
    const [ rowsPerPage, setRowsPerPage ] = useState(10)
    const [ searchValue, setSearchValue ] = useState("");
    const [ total_count, setTotalCount ] = useState(1)
    const [ sortField, setSort ] = useState('')

    const [ signatureUpdateData, setSignatureUpdateData ] = useState({})
    const [ signatureFormModal, setSignatureFormModal ] = useState(false)
    const [ signatureList, setSignatureList ] = useState([])
    // Loader
	const { isLoading, fetchData, Loader } = useLoader({ isFullScreen: false })
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    // Api
    const depApi = useApi().hrms.department
    const degreeApi = useApi().settings.professionaldegree
    const graduateApi = useApi().student.graduate
    const groupApi = useApi().student.group
    const signatureApi = useApi().signature

    async function getDatas()
    {
        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        const { success, data } = await allFetch(graduateApi.get(rowsPerPage, currentPage, sortField, searchValue, select_value.department, select_value.degree, select_value.group))
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

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch()
    {
        if (searchValue.length > 0) getDatas()
    }

    function handleSort(column, sort)
    {
        if(sort === 'asc')
        {
            setSort(column.header)
        }
        else
        {
            setSort('-' + column.header)
        }
    }

    function handlePagination(page)
    {
		setCurrentPage(page.selected + 1);
	};

    /** Гарын үсэг зурах хүмүүсийн зэрэглэл өөрчлөх */
    async function changeOrder(order)
    {
        let from_id = signatureList[order.oldIndex].id
        let to_id = signatureList[order.newIndex].id

        let data = { from_id, to_id }

        const { success } = await fetchData(signatureApi.changeorder(data, 3))
        if (success)
        {
            getSignatureDatas()
        }
    }

    /* Гарын үсэг зурах хүн устгах */
	const deleteSignature = async(sigId) =>
    {
		const { success } = await fetchData(signatureApi.delete(sigId))
		if(success)
        {
			let removeVal = signatureList.findIndex(({ id }) => id === sigId)
            signatureList.splice(removeVal, 1)
		}
	};

    /** Гарын үсэг зурах хүмүүсийн Modal */
    function toggleModalSignature()
    {
        setSignatureUpdateData({})
        setSignatureFormModal(!signatureFormModal)
    }

    /** Гарын үсэг зурах дата-г авах */
    async function getSignatureDatas()
    {
        const { success, data } = await fetchData(signatureApi.get(3))
        if (success)
        {
            setSignatureList(data)
        }
    }

    /** Гарын үсэг зурах засах функц */
    function signatureUpdateModal(id, data)
    {
        setSignatureFormModal(!signatureFormModal)
        setSignatureUpdateData(data)
    }

    // Салбарын жагсаалт авах
    async function getDepartment()
    {
        const { success, data } = await fetchData(depApi.get(school_id))
        if (success) {
            setDepOption(data)
        }
	}

    //Боловсролын зэргийн жагсаалт авах
    async function getDegree ()
    {
        const { success, data } = await fetchData(degreeApi.get())
        if (success)
        {
            setDegreeOption(data)
        }
	}

    const getGroup = async() => {
        const { success, data } = await fetchData(groupApi.getList(select_value.department, select_value.degree))
        if(success)
        {
            setGroupOption(data)
        }
    }

    useEffect(
        () =>
        {
            getDatas()
        },
        [sortField, currentPage, rowsPerPage, select_value, school_id]
    )

    useEffect(() => {
        getDegree()
        getDepartment()
    }, [school_id])

    useEffect(() => {
        getGroup()
    }, [select_value.department, select_value.degree, school_id])

    useUpdateEffect(
        () =>
        {
            if (!searchValue) getDatas()
        },
        [searchValue]
    )

    useEffect(
        () =>
        {
            getSignatureDatas()
        },
        []
    )

    const handleRowClicked = row => {
        navigate('/student/attachment/attachment-student/', { state: row?.student?.id })
    };

    const handlePerPage = (e) => {
        setRowsPerPage(e.target.value)
    }

    return (
        <Fragment>

            <Card>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom align-items-center py-1">
                    <CardTitle tag="h4">{t('Гарын үсэг зурах хүмүүс')}&nbsp;<small>(&nbsp;Хавсралт&nbsp;)</small></CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
                            color='primary'
                            onClick={toggleModalSignature}
                        >
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                {
                    signatureList.length > 0
                    ?
                        <ReactSortable
                            tag='ul'
                            className='list-group'
                            list={signatureList}
                            setList={setSignatureList}
                            onSort={changeOrder}
                        >
                        {
                            signatureList.map((val, idx) => {
                                return (
                                    <ListGroupItem className='draggable' key={idx} value={val.id} >
                                        <div className='d-flex align-items-center justify-content-between'>
                                            <div className="d-flex align-items-center">
                                                <div>
                                                    <Menu size={16} className="me-2" />
                                                </div>
                                                <div>
                                                    <h5 className='form-label my-0'>{val?.last_name} {val?.first_name}</h5>
                                                    <span className='form-label'>{val?.position_name}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <a role="button"
                                                    onClick={() => signatureUpdateModal(val?.id, val)}
                                                    className="ms-1"
                                                >
                                                    <Edit color="gray" width={"18px"} />
                                                </a>
                                                <a role="button"
                                                    onClick={() => showWarning({
                                                        header: {
                                                            title: t(`Устгах үйлдэл`),
                                                        },
                                                        question: t(`Та энэхүү тохиргоог устгахдаа итгэлтэй байна уу?`),
                                                        onClick: () => deleteSignature(val?.id),
                                                        btnText: t('Устгах'),
                                                    })}
                                                    className="ms-1"
                                                >
                                                    <Trash2 color="red" width={"18px"} />
                                                </a>
                                            </div>
                                        </div>
                                    </ListGroupItem>
                                )
                            })
                        }
                        </ReactSortable>
                    :
                        <p className="text-center my-2">Өгөгдөл байхгүй байна.</p>
                        // <div className='my-2 d-flex align-items-center justify-content-center'>
                        //     <Spinner className='me-1' color="" size='sm'/><h5>Түр хүлээнэ үү...</h5>
                        // </div>
                }
            </Card>

            <Card>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                    <CardTitle tag="h4">{t('Төгсөлтийн ажил')}<small>&nbsp;(&nbsp;төгсөлтөнд хамрагдсан хүмүүс&nbsp;)</small> </CardTitle>
                </CardHeader>
                <Row className="justify-content-between mx-0 mt-1 mb-1" sm={12}>
                    <Col md={4}>
                        <Label className="form-label" for="department">
                            {t('Тэнхим')}
                        </Label>
                        <Select
                            name="department"
                            id="department"
                            classNamePrefix='select'
                            isClearable
                            className={'react-select'}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={depOption || []}
                            value={depOption.find((c) => c.id === select_value.department)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        department: val?.id || '',
                                    }
                                })
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col md={4}>
                        <Label className="form-label" for="degree">
                            {t('Боловсролын зэрэг')}
                        </Label>
                        <Select
                            name="degree"
                            id="degree"
                            classNamePrefix='select'
                            isClearable
                            className={'react-select'}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={degreeOption || []}
                            value={degreeOption.find((c) => c.id === select_value.degree)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        degree: val?.id || '',
                                    }
                                })
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.degree_name}
                        />
                    </Col>
                    <Col md={4}>
                        <Label className="form-label" for="group">
                            {t('Анги')}
                        </Label>
                        <Select
                            name="group"
                            id="group"
                            classNamePrefix='select'
                            isClearable
                            className={'react-select'}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={groupOption || []}
                            value={groupOption.find((c) => c.id === select_value.group)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        group: val?.id || '',
                                    }
                                })
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                </Row>
                <Row className='mt-1 d-flex justify-content-between mx-0'>
                    <Col className='d-flex align-items-center justify-content-start ' >
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
                <div className="react-dataTable react-dataTable-selectable-rows" id='datatableLeftTwo' >
                    <DataTable
                        noHeader
                        paginationServer
                        pagination
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
                        columns={getColumns(currentPage, rowsPerPage, total_count, user)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                        onRowClicked={handleRowClicked}
                        highlightOnHover
                        pointerOnHover={true}
                    />
                </div>
            </Card>

            { signatureFormModal && <SignatureModal open={signatureFormModal} handleModal={toggleModalSignature} refreshDatas={getSignatureDatas} defaultDatas={signatureUpdateData} /> }

        </Fragment>
    )
}
