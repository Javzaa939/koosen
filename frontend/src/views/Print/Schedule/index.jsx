
import React, { Fragment, useState, useEffect, useContext } from "react"

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader } from "reactstrap"
import { useForm, Controller } from "react-hook-form"
import DataTable from "react-data-table-component"
import Select from "react-select"
import { Printer, Search} from 'react-feather'

import { t } from "i18next"
import classnames from "classnames"

import { getPagination, ReactSelectStyles, printTableHtml } from '@utils'

import useLoader from '@hooks/useLoader'
import useApi from '@hooks/useApi'

import SchoolContext from '@context/SchoolContext'

import { getColumns } from './helpers';

const Schedule = () => {

    var values = {
        teacher: '',
        room: '',
        group: '',
        student: '',
    }

    // ** Hook
    const { control, formState: { errors } } = useForm({});
	const default_page = [ 10, 15, 50, 75, 100, 'Бүгд' ]

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({})

   	// Хуудаслалтын анхны утга
	const [currentPage, setCurrentPage] = useState(1)

	// Нэг хуудсанд харуулах нийт датаны тоо
	const [rowsPerPage, setRowsPerPage] = useState(10)

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    //Context
    const { school_id } = useContext(SchoolContext)

    //Api
    const teacherApi = useApi().hrms.teacher
    const groupApi = useApi().student.group
    const studentApi = useApi().student
    const roomApi = useApi().timetable.room
    const scheduleApi = useApi().print.schedule

    //useState
	const [sortField, setSort] = useState('')
	const [searchValue, setSearchValue] = useState("");
    const [teacherOption, setTeacherOption] = useState([])
    const [groupOption, setGroupOption] = useState([])
    const [selectValue, setSelectValue] = useState(values)
    const [studentOption, setStudentOption] = useState([])
    const [roomOption, setRoomOption] = useState([])
    const [radio, setRadio] = useState('teacher')
    const [datas, setDatas] = useState([])

    /** useState */
    const [ columnNames, setColumnNames ] = useState(
    [
        {
            name: "Багш",
            keys: [ 'teacher', 'full_name' ]
        },
        {
            name: "Хичээл",
            keys: [ 'lesson', 'name' ]
        },
        {
            name: "Өрөө",
            keys: [ 'room', 'full_name' ]
        },
        {
            name: "Өдөр",
            keys: [ 'day' ]
        },
        {
            name: "Цаг",
            keys: [ 'time' ]
        },
    ])
    const [ printTitle, setPrintTitle ] = useState('')

    // Өрөөний нэр дугаар
    const getOptionLabel = (option) => `${option.name} ${option.code}`;

    // Radio
    const handleChange = (e) => {
        setRadio(e.target.value)
        setSelectValue(values)
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch()
    {
        if (searchValue.length > 0) getDatas()
    }

    // ** Function to handle filter
	const handleFilter = e => {
		const value = e.target.value.trimStart();
		setSearchValue(value)
	}

    const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	}

    function handlePerPage(e)
    {
        if (e.target.value === 'Бүгд')
        {
            setRowsPerPage(e.target.value)
        }
        else
        {
            setRowsPerPage(parseInt(e.target.value))
        }
    }

    //Багшийн жагсаалт
    async function getTeacherList()
    {
        const { success, data } = await fetchData(teacherApi.get())
        if(success)
        {
            setTeacherOption(data)
        }
    }

    //Ангийн жагсаалт
     async function getGroup()
     {
        const teacher_id = selectValue.teacher
        const { success, data } = await fetchData(groupApi.getList('','','','',school_id))
        if(success)
        {
            setGroupOption(data)
        }
    }

    //Оюутаны жагсаалт
    async function getStudent()
    {
        const { success,data } = await fetchData(studentApi.getList())
        if(success)
        {
            setStudentOption(data)
        }
    }

    //Өрөөний жагсаалт
    async function getRoom()
    {
        const { success, data } = await fetchData(roomApi.getList())
        if(success)
        {
            setRoomOption(data)
        }
    }

    async function getDatas()
    {
        const {success, data} = await fetchData(scheduleApi.get(rowsPerPage, currentPage, sortField, searchValue, selectValue.teacher, selectValue.group, selectValue.room, selectValue.student))
        if(success)
        {

            setTotalCount(data?.count)
            setDatas(data?.results)
        }
        else
        {
            setDatas([])
        }
    }

    useEffect(
        () =>
        {
            getRoom()
            getStudent()
            getGroup()
            getTeacherList()
        },
        []
    )

    useEffect(
        () =>
        {
            getDatas()
        },
        [rowsPerPage, currentPage, sortField, searchValue, selectValue]
    )

    useEffect(
        () =>
        {
            switch (radio)
            {
                case 'teacher':
                    setPrintTitle('Бүх багшийн хичээлийн хуваарь')
                    break;

                case 'group':
                    setPrintTitle('Тус ангийн хичээлийн хуваарь')
                    break;

                case 'student':
                    setPrintTitle('Оюутны хичээлийн хуваарь')
                    break;

                case 'room':
                    setPrintTitle('Өрөөний багшийн хичээлийн хуваарь')
                    break;

                default:
                    break;
            }
        },
        [radio]
    )

    function handlerPrint()
    {
        printTableHtml(columnNames, datas, printTitle)
    }

    return(
        <Fragment>
            {isLoading && Loader}

            <Card>
                <CardHeader>
                    <CardTitle tag={"h4"}>{t('Хичээлийн хуваарийн хайх хэсэг')}</CardTitle>
                </CardHeader>

                <hr />

                <Row className="justify-content-start mx-0 mt-1 mb-1">
                    <Col md={6} className="mt-10 mb-1">
                        <div>
                            <Input
                                style={{ marginRight: "5px", marginLeft: "24px" }}
                                type="radio"
                                value="teacher"
                                onChange={handleChange}
                                checked={radio === 'teacher'}
                            />
                            <Label className="form label me-1" for="teacher">
                                {t('Багш')}
                            </Label>

                            <Input
                                style={{marginRight: "5px"}}
                                type="radio"
                                value="group"
                                onChange={handleChange}
                                checked={radio === 'group'}
                            />
                            <Label className="form-label me-1" for="group">
                                {t('Анги')}
                            </Label>

                            <Input
                                style={{marginRight: "5px"}}
                                type="radio"
                                value="student"
                                onChange={handleChange}
                                checked={radio === 'student'}
                            />
                            <Label className="form-label me-1" for="student">
                                {t('Оюутан')}
                            </Label>

                            <Input
                                style={{marginRight: "5px"}}
                                type="radio"
                                value="room"
                                onChange={handleChange}
                                checked={radio === 'room'}
                            />
                            <Label className="form-label me-1" for="room">
                                {t('Өрөө')}
                            </Label>
                        </div>


                        </Col><Col md={6}>
                        {
                            radio == 'teacher'
                            &&
                            <div>
                                <Controller
                                    control={control}
                                    defaultValue=''
                                    name="teacher"
                                    render={({ field: {value, onChange} }) => {
                                        return (
                                            <Select
                                                name="teacher"
                                                id="teacher"
                                                classNamePrefix="select"
                                                isClearable
                                                classNames={classnames('react-select', { 'is-invalid': errors.teacher})}
                                                isLoading={isLoading}
                                                placeholder={t('-- Багш сонгоно ууг --')}
                                                options={teacherOption || []}
                                                value={teacherOption.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                isDisabled={radio !== "teacher"}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                    setSelectValue(current => {
                                                        return{
                                                            ...current,
                                                            teacher: val?.id || '',
                                                        }
                                                    })
                                                    {handleChange}
                                                }}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.full_name}
                                            />
                                        )
                                    }}
                                />
                            </div>
                        }
                        {radio=='group'&&
                            <div>
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
                                                placeholder={t('-- Анги сонгоно уу --')}
                                                options={groupOption || []}
                                                value={groupOption.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                isDisabled={radio !== "group"}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                    setSelectValue(current => {
                                                        return {
                                                            ...current,
                                                            group: val?.id || '',
                                                        }
                                                    })
                                                    {handleChange}
                                                }}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        )
                                    }}
                                />
                            </div>
                        }
                        {radio=='student'&&
                             <div>
                                <Controller
                                    control={control}
                                    defaultValue=''
                                    name="student"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="student"
                                                id="student"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select', { 'is-invalid': errors.student })}
                                                isLoading={isLoading}
                                                placeholder={t('-- Оюутан сонгоно уу --')}
                                                options={studentOption || []}
                                                value={studentOption.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                isDisabled={radio !== "student"}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                    setSelectValue(current => {
                                                        return {
                                                            ...current,
                                                            student: val?.id || '',
                                                        }
                                                    })
                                                    {handleChange}
                                                }}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.full_name}
                                            />
                                        )
                                    }}
                                />
                            </div>
                        }
                        {radio=='room'&&
                             <div>
                                <Controller
                                    control={control}
                                    defaultValue=''
                                    name="room"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="room"
                                                id="room"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select', { 'is-invalid': errors.room })}
                                                isLoading={isLoading}
                                                placeholder={t('-- Өрөө сонгоно уу --')}
                                                options={roomOption || []}
                                                value={roomOption.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                isDisabled={radio !== 'room'}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
                                                    setSelectValue(current => {
                                                        return {
                                                            ...current,
                                                            room: val?.id || '',
                                                        }
                                                    })
                                                    {handleChange}
                                                }}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={getOptionLabel}
                                            />
                                        )
                                    }}
                            />
                            </div>
                        }
                    </Col>
                </Row>

            </Card>

            <Card>

                <CardHeader>
                    <CardTitle tag={"h4"}>{t('Хичээлийн хуваарь')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
                            color='primary'
                            onClick={() => handlerPrint()}
                        >
                            <Printer size={15} />
                            <span className='align-middle ms-50'>{t('Хэвлэх')}</span>
                        </Button>
                    </div>
                </CardHeader>

                <hr />

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

                <div className="react-dataTable react-dataTable-selectable-rows" id="datatableLeftTwoRightOne" >
                    <DataTable
                        noHeader
                        paginationServer
                        pagination
                        className='react-dataTable'
                        progressPending={isLoading}
                        progressComponent={<h5>{t('Түр хүлээнэ үү')}</h5>}
                        noDataComponent={(
                            <div className="my-2">
                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                            </div>
                        )}
                        paginationTotalRows
                        data={datas}
                        columns={getColumns(currentPage, rowsPerPage, total_count)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                    />
                </div>

            </Card>
        </Fragment>
    )
}

export default Schedule
