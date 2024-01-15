
import { Fragment, useState, useEffect, useContext} from 'react'

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, ListGroupItem, Spinner } from 'reactstrap'
import { ChevronDown, Search, Plus, Menu, Edit, Trash2 } from 'react-feather'
import DataTable from 'react-data-table-component'
import { useTranslation } from 'react-i18next'
import { useForm, Controller } from "react-hook-form";
import Select from 'react-select'
import { ReactSortable } from 'react-sortablejs'
import { Link } from 'react-router-dom'

import classnames from "classnames";

import { getPagination, ReactSelectStyles } from '@utils'

import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'

import { getColumns } from './helpers'
import Addmodal from './Add'
import EditModal from './Edit'
import SignatureModal from './Signature'
import CreateModal from './Graduate'
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import useModal from '@hooks/useModal'
import useUpdateEffect from '@hooks/useUpdateEffect'

// drag-and-drop.scss
import '@styles/react/libs/drag-and-drop/drag-and-drop.scss'

const Graduation = () => {

    var values = {
        department: '',
        degree: '',
        group: ''
    }

    const { showWarning } = useModal()

    // ** Hook
    const { control, formState: { errors } } = useForm({});

    //Context
    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    //useState
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchValue, setSearchValue] = useState("");
    const [total_count, setTotalCount] = useState(1)
    const [depOption, setDepartment] = useState([])
    const [modal, setModal] = useState(false);
    const [edit_modal, setEditModal] = useState(false)
    const [graduate_id, setGraduateId] = useState('')
    const [degreeOption, setDegree] = useState([])
    const [groupOption, setGroupOption] = useState([])
    const [select_value, setSelectValue] = useState(values)
    const [datas, setDatas] = useState([])
    const [createModal, setCreateModal] = useState(false);


    const [ listArr, setListArr ] = useState([])
    const [ formModal, setFormModal ] = useState(false)
    const [ updateData, setUpdateData ] = useState({})

    //Api
    const depApi = useApi().hrms.department
    const degreeApi = useApi().settings.professionaldegree
    const graduateApi = useApi().student.graduate
    const groupApi = useApi().student.group
    const signatureApi = useApi().signature

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    // Translate
    const { t } = useTranslation()

    // Нийт датаны тоо
    const default_page = [10, 15, 50, 75, 100]

	/* Модал setState функц */
	const handleModal = () => {
		setModal(!modal)
	}

    // Loader
	const {
        isLoading,
        fetchData,
        Loader
    } = useLoader({  })

    const {
        Loader: tableLoader,
        isLoading: isTableLoading,
        fetchData: allFetch
    } = useLoader({isFullScreen: false})

	/* Устгах функц */
	const handleDelete = async(id) => {
        const { success } = await allFetch(graduateApi.delete(id))
        if(success)
        {
            getDatas()
        }
	};

    /* Устгах функц */
	const handleDeleteSig = async(sigId) =>
    {
		const { success } = await allFetch(signatureApi.delete(sigId))
		if(success) {
			let removeVal = listArr.findIndex(({ id }) => id === sigId)
            listArr.splice(removeVal, 1)
		}
	};

	const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    // Салбарын жагсаалт авах
    async function getDepartment ()
    {
        const { success, data } = await allFetch(depApi.get(school_id))
        if (success) {
            setDepartment(data)
        }
	}

    //Боловсролын зэргийн жагсаалт авах
    async function getDegree () {
        const { success, data } = await allFetch(degreeApi.get())
        if (success) {
            setDegree(data)
        }
	}

    const getGroup = async() => {
        const { success, data } = await allFetch(groupApi.getList(select_value.department, select_value.degree))
        if(success)
        {
            setGroupOption(data)
        }
    }

    useEffect(() => {
        getDatas()
    }, [sortField, currentPage, rowsPerPage, select_value])

    useEffect(() => {
        getDepartment()
    }, [school_id])

    useEffect(() => {
        getGroup()
    }, [select_value.department, select_value.degree, school_id])

	useUpdateEffect(() => {
		if (searchValue.length == 0) {
			getDatas();
		} else {
			const timeoutId = setTimeout(() => {
				getDatas();
			}, 600);

			return () => clearTimeout(timeoutId);
		}
	}, [searchValue]);

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    async function getDatas()
    {
        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        const { success, data } = await fetchData(graduateApi.get(rowsPerPage, currentPage, sortField, searchValue, select_value.department, select_value.degree, select_value.group))
        if(success)
        {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    /** NOTE Засах гэж буй төгсөлтийн ажлын id-г авна */
    const editModal = (id) => {
        setGraduateId(id)
        setEditModal(!edit_modal)
    }

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

     // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        getDatas()
    }

    async function getSignatureDatas()
    {
        const { success, data } = await allFetch(signatureApi.get(2))
        if (success)
        {
            setListArr(data)
        }
    }

    async function changeOrder(order)
    {
        let from_id = listArr[order.oldIndex].id
        let to_id = listArr[order.newIndex].id

        let data = { from_id, to_id }

        const { success } = await allFetch(signatureApi.changeorder(data, 2))
        if (success)
        {
            getSignatureDatas()
        }
    }

    useEffect(
        () =>
        {
            getDegree()
            getSignatureDatas()
        },
        []
    )

    // Нэмэх функц
    function handleModalSig()
    {
        setUpdateData({})
        setFormModal(!formModal)
    }

    // Засах функц
    function handleUpdateModal(id, data)
    {
        setFormModal(!formModal)
        setUpdateData(data)
    }

    function handleCreateModal() {
        setCreateModal(!createModal)
    }

	return (
		<Fragment>
            <Card>
                {/* {isLoading && Loader} */}
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom align-items-center py-1">
                    <CardTitle tag="h4">{t('Гарын үсэг зурах хүмүүс')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
                            color='primary'
                            onClick={() => handleModalSig()}
                        >
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                {
                    listArr.length != 0
                    ?
                        <ReactSortable
                            tag='ul'
                            className='list-group'
                            list={listArr}
                            setList={setListArr}
                            onSort={changeOrder}
                        >
                        {
                            listArr.map((val, idx) => {
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
                                                    onClick={() => handleUpdateModal(val?.id, val)}
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
                                                        onClick: () => handleDeleteSig(val?.id),
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
                }
            </Card>

			<Card>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                    <CardTitle tag="h4">{t('Төгсөлтийн ажил')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
                            color='primary'
                            onClick={() => handleModal()}
                            disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-student-graduate-create') && school_id ? false : true}
                        >
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className="justify-content-between mx-0 mt-1 mb-1" sm={12}>
                    <Col md={3}>
                        <Label className="form-label" for="department">
                            {t('Тэнхим')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="department"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="department"
                                        id="department"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.department })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={depOption || []}
                                        value={depOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
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
                                )
                            }}
                        />
                    </Col>
                    <Col md={3}>
                        <Label className="form-label" for="degree">
                            {t('Боловсролын зэрэг')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="degree"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="degree"
                                        id="degree"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.degree })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={degreeOption || []}
                                        value={degreeOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
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
                                )
                            }}
                        />
                    </Col>
                    <Col md={3}>
                        <Label className="form-label" for="group">
                            {t('Анги')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="group"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="group"
                                        id="group"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.group })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={groupOption || []}
                                        value={groupOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
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
                                )
                            }}
                        />
                    </Col>
                    <Col md={3} className='mt-2'>
                        <Button size='sm' color='primary' disabled={select_value.group ? false : true} onClick={handleCreateModal}>Төгсөгчид үүсгэх</Button>
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
                <div className="react-dataTable react-dataTable-selectable-rows" id="datatableLeftTwoRightOne">
                    <DataTable
                        noHeader
                        paginationServer
                        pagination
                        className='react-dataTable'
                        progressPending={isTableLoading}
                        progressComponent={
                            <div className='my-2 d-flex align-items-center justify-content-center position-relative'>
                                {Loader}
                            </div>
                        }
                        noDataComponent={(
                            <div className="my-2">
                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                            </div>
                        )}
                        onSort={handleSort}
                        columns={getColumns(currentPage, rowsPerPage, total_count, editModal, handleDelete, user)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
        	</Card>
            {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} select_value={select_value}/>}
            {edit_modal && <EditModal open={edit_modal} handleModal={editModal} graduate_id={graduate_id} refreshDatas={getDatas}/>}
            {createModal && <CreateModal open={createModal} handleModal={handleCreateModal} group={select_value?.group} refreshDatas={getDatas}/>}

            { formModal && <SignatureModal open={formModal} handleModal={handleModalSig} refreshDatas={getSignatureDatas} defaultDatas={updateData} /> }

            {/* Шинэ хуудас руу үсэргэх товч */}
            <Link className='d-none' to='/' id='clickBtn' target='_blank' ></Link>
        </Fragment>
    )
}
export default Graduation
