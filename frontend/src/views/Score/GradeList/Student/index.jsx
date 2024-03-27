import React, { Fragment, useState, useEffect, useContext } from "react";
import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner,} from 'reactstrap'
import useLoader from '@hooks/useLoader';
import useApi from '@hooks/useApi';
import { ChevronDown, Search } from 'react-feather'
import DataTable from 'react-data-table-component'
import Select from 'react-select'
import classnames from "classnames";
import { useTranslation } from 'react-i18next'
import { generateLessonYear, ReactSelectStyles, getPagination } from '@utils'
import { useForm, Controller } from "react-hook-form";
import SchoolContext from "@context/SchoolContext"
import { getColumns } from './helpers'

const Student  = ({ setMainData, printIsAllTimeType, chosenGroupStudent, setChosenGroupStudent, setFileName, setStudentSectionData }) => {

    //Hook
    const { control, formState: { errors } } = useForm({});
    var values = {
        student: '',
        lesson_year: '',
        lesson_season: '',
    }

    //Api
    const seasonNameApi = useApi().settings.season
    const getStudentApi = useApi().print.score
    const scoreApi = useApi().score.register
    const groupApi = useApi().student.group

    //useState
    const [select_value, setSelectValue] = useState(values)
    const [groupOption, setGroup] = useState([])
    const [yearOption, setYear] = useState([])
    const [seasonNameOption, setseasonNameOption] = useState ([])
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchValue, setSearchValue] = useState("");
    const [start_value, setStartValue] = useState("");
    const [end_value, setEndValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [total_count, setTotalCount] = useState(1)
    const [datas, setDatas] = useState([]);
    const { school_id } = useContext(SchoolContext)

    //Loader
    const { Loader, isLoading, fetchData } = useLoader({})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({})

    //Translate
    const { t } = useTranslation()

    // Нийт датаны тоо
    const default_page = [10, 20, 50, 75, 100]

    //Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    //Хайх товч дарсан үед ажиллах функц
     async function handleSearch() {
        getStudentLists()
    }

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    /*Жагсаалт дата авах функц */
    async function getStudentLists() {
        const student = select_value?.student
        const lesson_year = select_value?.lesson_year
        const lesson_season = select_value?.lesson_season

        const { success, data } = await allFetch(getStudentApi.getStudentList(rowsPerPage, currentPage, sortField, searchValue,student, lesson_year, lesson_season, start_value, end_value, chosenGroupStudent))
        if (success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
            setStudentSectionData(data?.results)
        }
    }

    const getseasonName = async() => {
        const { success, data } = await fetchData(seasonNameApi.get(select_value.department, select_value.degree))
        if(success)
        {
            setseasonNameOption(data)
        }
    }

    function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    useEffect(
        () =>
        {
            getseasonName()
            setYear(generateLessonYear(5))
            getGroup()
        },
        []
    )

    useEffect(
        () =>
        {
            if (start_value && end_value) {
                const timeoutId = setTimeout(() => {
                    getStudentLists()
                }, 600);
                return () => clearTimeout(timeoutId);
            }
        },
        [start_value, end_value]
    )

	useEffect(() => {
		if (searchValue.length == 0) {
			getStudentLists()
		} else {
			const timeoutId = setTimeout(() => {
				getStudentLists()
			}, 600);

			return () => clearTimeout(timeoutId);
		}
	}, [rowsPerPage, currentPage, sortField, searchValue, select_value, school_id])

    /* Устгах функц */
	const handleDelete = async(id) => {
        const {success} = await fetchData(scoreApi.delete(id))
		if(success) {
            getStudentLists()
		}
	};


    // Ангийн жагсаалт
    async function getGroup()
    {
        const department = select_value.department
        const { success, data } = await fetchData(groupApi.getList(department))
        if(success) {
            setGroup(data)
        }
    }




    return (
        <Fragment>
            <Card>
            {isLoading && Loader}
                <CardHeader className='lex-md-row flex-column align-md-items-center align-items-start border-bottom pt-0'>
                </CardHeader>
                <Row className="mx-0 mt-1 mb-1" sm={12}>
                    <Col md={3}>
                        <Label className="form-label me-1" for="building">
                            {t('Хичээлийн жил')}
                        </Label>
                        <Select
                            name="lesson_year"
                            id="lesson_year"
                            classNamePrefix='select'
                            isClearable
                            className={'react-select'}
                            isLoading={isLoading}
                            options = {yearOption || []}
                            placeholder={t('-- Сонгоно уу --')}
                            noOptionsMessage={() => t('Хоосон байна')}
                            styles={ReactSelectStyles}
                            value={yearOption.find((e) => e.id === select_value.lesson_year)}
                            onChange={(val) => {
                                if (val?.id) {
                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            lesson_year: val?.id
                                        }
                                    })
                                } else {
                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            lesson_year: ''
                                        }
                                    })
                                }
                            }}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col md={3}>
                        <Label className="form-label" for="lesson_season">
                            {t('Улирал')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="lesson_season"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="lesson_season"
                                        id="lesson_season"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.lesson_season })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={seasonNameOption || []}
                                        value={seasonNameOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            setSelectValue(current => {
                                                return {
                                                    ...current,
                                                    lesson_season: val?.id || '',
                                                }
                                            })
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.season_name}
                                    />
                                )
                            }}
                        />
                    </Col>
                    <Col md={3}>
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
                                });
                                setChosenGroupStudent(val?.id)
                                setFileName(val?.name)
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col md={3} sm={6} xs={12}>
                        <Label for="score">Дүнгийн утгаар хайх</Label>
                        <div className='d-flex'>
                            <Input
                                type="number"
                                bsSize="sm"
                                placeholder="Эхний утга"
                                onChange={(e) => setStartValue(e.target.value)}
                            />
                            <Input
                                type="number"
                                className="ms-1"
                                bsSize="sm"
                                placeholder="Сүүлийн утга"
                                onChange={(e) => setEndValue(e.target.value)}

                            />
                        </div>
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
                        columns={getColumns(currentPage, rowsPerPage, total_count, seasonNameOption, handleDelete)}
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
        </Fragment>
    )
}

export default Student;
