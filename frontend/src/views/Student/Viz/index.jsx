// ** React Imports
import { Fragment, useState, useEffect, useContext, useMemo } from 'react'

import {
    Row,
    Col,
    Card,
    Label,
    Button,
    CardTitle,
    CardHeader,
    Spinner,
} from 'reactstrap'

import { ChevronDown, Plus, Search } from 'react-feather'

import Select from 'react-select'
import classnames from "classnames";

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { useForm, Controller } from "react-hook-form";

import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'

import { getPagination, ReactSelectStyles, get_status} from '@utils'

import { getColumns, customStyles } from './helpers'

import Addmodal from './Add'
import Editmodal from './Edit'

import { useTranslation } from 'react-i18next'


const Viz = () => {

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)

    const { t } = useTranslation()

    // ** Hook
    const { control } = useForm();

    var values = {
        department: '',
        profession: '',
        group: '',
        status: '',
        year:'',
    }
    const [select_value, setSelectValue] = useState(values)
    const [modal, setModal] = useState(false)
    const [edit_modal, setEditModal] = useState(false)

    const [datas, setDatas] = useState([])
    const [department_option, setDepartmentOption] = useState([])
    const [profession_option, setProfessionOption] = useState([])
    const [status_option, setStatusOption] = useState(get_status())
    const [group_option, setGroupOption] = useState([])

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

    // Оюутан
    const [student_ids, setStudentIds] = useState(0)
    const [is_change, setIsChange] = useState(false);
    const [check, setCheck] = useState(false)
    // Laoder
    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

    // API
    const studentApi = useApi().student.viz
    const departmentApi = useApi().hrms.department
    const professionApi = useApi().study.professionDefinition
    const groupApi = useApi().student.group


    // Тэнхимаар жагсаалт авна.
    async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get(school_id))

        if(success) {
            setDepartmentOption(data)
        }
    }
    // Хөтөлбөрийн жагсаалтын getList функц хөтөлбөрийн багаар жагсаалт авна.
    async function getProfession() {
        var department = select_value.department
        const { success, data } = await fetchData(professionApi.getList("", department))
        if(success) {
            setProfessionOption(data)
        }
    }
    // оюутны визний мэдээлэл сургууль, хөтөлбөрийн баг, Хөтөлбөр,анги, төлвөөр шүүж жагсаалт авна.
    async function getDatas() {
        var school = school_id
        var departId = select_value.department
        var profId = select_value.profession
        var groupId = select_value.group
        var status = select_value.status

        const { success, data } = await allFetch(studentApi.get(rowsPerPage, currentPage,school, departId, profId, groupId, status))
        if(success)
        {
            setDatas(data.results)
            setTotalCount(data.count)
        }

    }

    //  Ангийн жагсаалт авна.
    async function getGroup(){
        var departId = select_value.department
        var profession = select_value.profession

        const { success, data } = await fetchData(groupApi.getList(departId, "", profession))
        if(success) {
            setGroupOption(data)
        }
    }

    useEffect(() => {
        if(Object.keys(user).length > 0 && user.permissions.includes('lms-foreign-student-viz-read')? true: false){
            getDatas()
        }
    }, [rowsPerPage, currentPage, school_id, select_value.department, select_value.profession,select_value.group, select_value.status, school_id])

    useEffect(
        () =>
        {
            getDepartmentOption()
        },
        [school_id]
    )

     useEffect(() => {
        getProfession()
    }, [select_value.department])

    useEffect(() => {
        getGroup()
    }, [select_value.department, select_value.profession])

     /** Хуудас солих үед ажиллах хэсэг */
	const handlePagination = page => {
		setCurrentPage(page.selected + 1);
	};

    // ** Function to handle Modal toggle
    const handleModal = () => {
        setModal(!modal)
    }

    const handleEditModal = () => {
    /** NOTE Засах гэж буй жагсаалт-н id-г авна */
        setEditModal(!edit_modal)
    }

    function onSelectedRowsChange(state) {
        var selected_rows = []
        var selectedRows = state.selectedRows
        setCheck(selectedRows.length > 0)

        setIsChange(true)

        for (let i in datas) {
            if(!selectedRows.includes(datas[i])) {
                datas[i].is_selected = false
            }
            else {
                datas[i].is_selected = true
                if(!selected_rows.includes(datas[i].id)) {
                    selected_rows.push(datas[i].id)
                }
            }
        }
        setStudentIds(selected_rows.length)

    }

    const studentCountMemo = useMemo(() => {
        const count = datas.filter(data => is_change ?  data.is_selected : data.selected).length
        return count
    }, [ is_change, datas, student_ids])


    const searchComponent = useMemo(() => {
        return(
            check &&
                <Col className= "d-flex justify-content-end datatable-button mt-1 mb-0" lg={12} md={12}>
                    <Button
                        color='primary'
                        onClick={() => handleEditModal()}
                    >
                        <span className='align-middle ms-50'>{t('Засах')}</span>
                    </Button>
                </Col>
            )
    }, [check])

    return (
        <Fragment>
            <Card>
            {isLoading && Loader}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Гадаад оюутны визний бүртгэл')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
                            color='primary'
                            onClick={() => handleModal()}
                            disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-student-register-create')  && school_id? false : true}
                        >
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className="justify-content-between mx-0 mt-1 mb-1" sm={12}>
                    <Col sm={6} lg={3} >
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
                                        className={classnames('react-select')}
                                        isLoading={isLoading}
                                        placeholder={`-- Сонгоно уу --`}
                                        options={department_option || []}
                                        value={department_option.find((c) => c.id === select_value.department)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            if (val?.id) {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        department: val?.id
                                                    }
                                                })
                                            } else {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        department: ''
                                                    }
                                                })
                                            }
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col sm={6} lg={3}>
                        <Label className="form-label" for="profession">
                            {t('Хөтөлбөр')}
                        </Label>
                         <Controller
                            control={control}
                            defaultValue=''
                            name="profession"
                            render={({ field: { val, onChange} }) => {
                                return (
                                <Select
                                    name="profession"
                                    id="profession"
                                    classNamePrefix='select'
                                    isClearable
                                    className={classnames('react-select')}
                                    isLoading={isLoading}
                                    placeholder={`-- Сонгоно уу --`}
                                    options={profession_option || []}
                                    value={profession_option.find((c) => c.id === select_value.profession)}
                                    noOptionsMessage={() => 'Хоосон байна'}
                                    onChange={(val) => {
                                        onChange(val?.id || '')
                                        if (val?.id) {
                                            setSelectValue(current => {
                                                return {
                                                    ...current,
                                                    profession: val?.id,
                                                }
                                            })
                                        } else {
                                            setSelectValue(current => {
                                                return {
                                                    ...current,
                                                    profession: ''
                                                }
                                            })
                                        }
                                    }}
                                    styles={ReactSelectStyles}
                                    getOptionValue={(option) => option.id}
                                    getOptionLabel={(option) => option.name}
                                />
                            )
                        }}
                        ></Controller>
                    </Col>
                    <Col sm={6} lg={3}>
                        <Label className="form-label" for="group">
                            {t('Анги')}
                        </Label>
                        <Select
                            name="group"
                            id="group"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={`-- Сонгоно уу --`}
                            options={group_option || []}
                            value={group_option.find((c) => c.id === select_value.group)}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {
                                if (val?.id) {
                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            group: val?.id
                                        }
                                    })
                                } else {
                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            group: ''
                                        }
                                    })
                                }
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col sm={6} lg={3} >
                        <Label className="form-label" for="status">
                            {t("Төлөв")}
                        </Label>
                        <Select
                            name="status"
                            id="status"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={`-- Сонгоно уу --`}
                            options={status_option || []}
                            value={status_option.find((c) => c.id === select_value.status)}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {
                                if (val?.id) {
                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            status: val?.id
                                        }
                                    })
                                } else {
                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            status: ''
                                        }
                                    })
                                }
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    {/* {
                        check  &&
                        <Col className= "d-flex justify-content-end datatable-button mt-1 mb-0" lg={12} md={12}>
                            <Button
                                color='primary'
                                onClick={() => handleEditModal()}
                            >
                                <span className='align-middle ms-50'>{t('Засах')}</span>
                            </Button>
                        </Col>
                    } */}
                </Row>
                <div className="react-dataTable react-dataTable-selectable-rows">
                    <DataTable
                        title={datas && datas.length > 0 && datas.filter(data => is_change ? data.is_selected : data.selected).length > 0 ? "Оюутны жагсаалт" : ''}
                        responsive
                        pagination
                        noHeader
                        progressComponent={(
                            <div className='my-2'>
                                <Spinner size='sm' />
                                <span className='ms-50'>Түр хүлээнэ үү...</span>
                            </div>
                        )}
                        className="react-dataTable"
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        noDataComponent={(
                            <h5 className="mb-2">Өгөгдөл байхгүй байна.</h5>
                        )}
                        sortIcon={<ChevronDown size={10} />}
                        pointerOnHover
                        customStyles={customStyles}
                        contextMessage={
                            {
                                singular: '',
                                plural: '',
                                message: 'оюутан сонгосон байна.'
                            }
                        }
                        data={datas}
                        columns={getColumns(currentPage, rowsPerPage, datas)}
                        selectableRows
                        subHeader
                        subHeaderComponent={searchComponent}
                        onSelectedRowsChange={(state) => onSelectedRowsChange(state)}
                        selectableRowSelected={row => is_change ? row?.is_selected && row?.is_selected : true}
                    />
                    {
                        datas &&
                        <h6 className="fw-bolder ms-1 mb-1">{t('Сонгогдсон оюутны тоо:')} {`${studentCountMemo}`}</h6>
                    }
                </div>
            </Card>
            {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas}/>}
            {edit_modal && <Editmodal open={edit_modal} handleModal={handleEditModal} refreshDatas={getDatas} studentVizData={datas} />}
        </Fragment>
    )
}

export default Viz;
