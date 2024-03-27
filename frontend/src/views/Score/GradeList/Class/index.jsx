import React, { Fragment, useState, useEffect, useContext } from "react";
import Select from 'react-select'
import { useForm, Controller } from "react-hook-form";
import {ChevronDown, Search} from "react-feather"

import {
    Row,
    Col,
    Card,
    Input,
	Label,
    Button,
    Spinner,
    Form,
    Modal,
    ModalHeader,
    ModalBody,
    FormFeedback,
} from "reactstrap";
import DataTable from 'react-data-table-component'
import { useTranslation } from 'react-i18next'

import classnames from "classnames";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import SchoolContext from "@context/SchoolContext"

import { getPagination, ReactSelectStyles } from '@utils'

import { getColumns } from './helpers'
import './style.scss'


const Class = ({ setMainData, setChosenGroup, setFileName, yearAndSeason, printValues }) =>
{
    // ** Hook
    const { handleSubmit, setError, reset, control, formState: { errors } } = useForm({});

    const [depOption, setDepartment] = useState([])
    const [groupOption, setGroup] = useState([])
    const [lessonOption, setLesson] = useState([])

    const [radio, setRadio] = useState(false)
    const [datas, setDatas] = useState([]);
    const [pmodal, setPmodal] = useState(false)

    var values = {
        group: '',
        department: '',
        lesson: ''
    }
    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(15)
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1)
    const [total_count, setTotalCount] = useState(1)
    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    const [select_value, setSelectValue] = useState(values)

    const [chosenYear, setChosenYear] = useState(null)
    const [chosenSeason, setChosenSeason] = useState(null)

    const { school_id } = useContext(SchoolContext)

    // Api
    const depApi = useApi().hrms.department
    const groupApi = useApi().student.group
    const getListApi = useApi().print.score
    const lessonApi = useApi().study.lessonStandart

    // Translate
    const { t } = useTranslation()

    // Нийт датаны тоо
    const default_page = [10, 20, 50, 75, 100]

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({})

    // Хичээлийн жагсаалт
    async function getLesson() {
        const { success, data } = await fetchData(lessonApi.getList())
        if(success) {
            setLesson(data)
        }
    }

    /* Жагсаалт дата авах функц */
    async function getDatas()
    {
        const department = select_value?.department
        const group = select_value?.group

        const { success, data } = await allFetch(getListApi.getList(rowsPerPage, currentPage, sortField, searchValue, department, group, radio, chosenYear, chosenSeason, select_value.lesson))
        if (success)
        {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    // Салбарын жагсаалт авах
    async function getDepartment () {

        const { success, data } = await fetchData(depApi.get(school_id))
        if (success) {
            setDepartment(data)
        }
	}

    // Ангийн жагсаалт
    async function getGroup()
    {
        const department = select_value.department
        const { success, data } = await fetchData(groupApi.getList(department))
        if(success) {
            setGroup(data)
        }
    }

	useEffect(
        () =>
        {
            if (!radio)
            {
                if (searchValue.length == 0)
                {
                    getDatas();
                }
                else
                {
                    const timeoutId = setTimeout(
                        () =>
                        {
                            getDatas();
                        },
                        600
                    );

                    return () => clearTimeout(timeoutId);
                }
            }
            else
            {
                if (chosenYear && chosenSeason)
                {
                    getDatas();
                }
            }
        },
        [rowsPerPage, currentPage, sortField, searchValue, select_value, school_id, radio, chosenYear, chosenSeason]
    )

    useEffect(
        () =>
        {
            if (!radio)
            {
                printValues.current = {
                    'chosenYear': null,
                    'chosenSeason': null,
                    'group': false,
                }

                setChosenYear(null)
                setChosenSeason(null)
            }
        },
        [radio]
    )


    useEffect(() => {
        getDepartment()
        getLesson()
        setChosenGroup()
    },[])

    useEffect(
        () =>
        {
            getGroup()
        },
        [select_value?.department]
    )

    useEffect(
        () => {
            setMainData(datas);
        },[]
    )
    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    function handlePrintModal() {
        if(select_value.group){
            setPmodal(!pmodal)
        } else {
            setError('group', { type: 'custom', message: 'Хэвлэхээс өмнө ангиа сонгоно уу.'});
        }

    }

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

    return (
        <Fragment>
            <Modal isOpen={pmodal} toggle={() => handlePrintModal()} centered>
                <ModalHeader toggle={() => handlePrintModal()}>
                    Ангийн жагсаалтаар хэвлэх
                </ModalHeader>
                <ModalBody className="print">
                    <div>
                        <table>
                            <thead><th>№</th><th>Овог Нэр</th><th>Дүн</th></thead>
                            <tbody>
                                <tr>
                                    <td>#</td>
                                    <th>Кредит</th>
                                </tr>
                                <tr>
                                    <td>#</td>
                                    <th>Улирал</th>
                                </tr>
                                {datas.map((row, idx) => (
                                    <tr key={`tr${idx}`}>
                                        <td>{idx + 1}</td>
                                        <td>{row?.student?.first_name}</td>
                                        <td>{row.score_total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ModalBody>
            </Modal>
            <Card className="main">

                {isLoading && Loader}

                <Row className="mx-0 align-items-start mb-1" tag={Form} onSubmit={handleSubmit(handlePrintModal)}>
                    <Col md={3}>
                        <Label className="form-label" for="department">
                            {t('Тэнхим')}
                        </Label>
                        <Select
                            name="department"
                            id="department"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={depOption || []}
                            value={depOption.find((c) => c.id === select_value.department)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        group: '',
                                        department: val?.id || '',
                                    }
                                })
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
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
                            value={select_value.group && groupOption.find((c) => c.id === select_value.group)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        group: val?.id || '',
                                    }
                                });
                                setChosenGroup(val?.id)
                                setFileName(val?.name)
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col md={3}>
                        <Label className="form-label" for="lesson">
                            {t('Хичээл')}
                        </Label>
                        <Select
                            name="lesson"
                            id="lesson"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={lessonOption || []}
                            value={lessonOption.find((c) => c.id === select_value.lesson)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setSelectValue(current => {
                                    return {
                                        ...current,
                                        lesson: val?.id || '',
                                    }
                                });
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col md={3} className="datatable-search-text  d-flex align-items-end mt-2">
                        <Input
                            id="Total_time"
                            className="dataTable-check mb-50 me-50"
                            type="radio"
                            bsSize="sm-5"
                            onChange={(e) => {
                                setRadio(!e.target.checked)
                                printValues.current['group'] = !e.target.checked
                            }}
                            checked={!radio}
                        />
                        <Label className="me-1 checkbox-wrapper " for="Total_time">
                            {t('Нийт суралцсан хугацаа')}
                        </Label>
                        <Input
                            id="Season"
                            className="dataTable-check mb-50 me-50"
                            type="radio"
                            bsSize="sm-5"
                            onChange={(e) => {
                                setRadio(e.target.checked)
                                printValues.current['group'] = e.target.checked
                            }}
                            checked={radio}
                        />
                        <Label className="me-1 checkbox-wrapper " for="Season">
                            {t('Зөвхөн тухайн улирал')}
                        </Label>
                    </Col>
                    {
                        radio
                        ?
                        <Row className="mt-1">
                            <Col md={3}>
                                <Label className="form-label" for="yearList">
                                    {t('Хичээлийн жил')}
                                </Label>
                                <Select
                                    name="yearList"
                                    id="yearList"
                                    classNamePrefix='select'
                                    className={classnames('react-select')}
                                    isLoading={isLoading}
                                    placeholder={t('-- Сонгоно уу --')}
                                    options={yearAndSeason?.year_list ? yearAndSeason?.year_list.map(year => ({ label: year, value: year })) : []}
                                    noOptionsMessage={() => t('Хоосон байна.')}
                                    onChange={(val) => {
                                        setChosenYear(val.value)
                                        printValues.current['chosenYear'] = val.value
                                    }}
                                    styles={ReactSelectStyles}
                                />
                            </Col>
                            <Col md={3}>
                                <Label className="form-label" for="seasonList">
                                    {t('Улирал')}
                                </Label>
                                <Select
                                    name="seasonList"
                                    id="seasonList"
                                    classNamePrefix='select'
                                    className={classnames('react-select')}
                                    isLoading={isLoading}
                                    placeholder={t('-- Сонгоно уу --')}
                                    options={yearAndSeason?.season_list || []}
                                    noOptionsMessage={() => t('Хоосон байна.')}
                                    onChange={(val) => {
                                        setChosenSeason(val.id)
                                        printValues.current['chosenSeason'] = val.id
                                    }}
                                    styles={ReactSelectStyles}
                                    getOptionValue={(option) => option.id}
                                    getOptionLabel={(option) => option.season_name}
                                />
                            </Col>
                        </Row>
                        :
                            null
                    }
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
                    <Col className='d-flex align-items-center mobile-datatable-search' >
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
                        columns={getColumns(currentPage, rowsPerPage, total_count)}
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

export default Class;
