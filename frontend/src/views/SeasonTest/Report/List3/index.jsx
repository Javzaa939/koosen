// ** React Imports
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'

import { getPagination } from "@utils";
import { getColumns } from "./helpers";

import { Col, Label, Row, Button, Input } from 'reactstrap'
import { ReactSelectStyles } from '@src/utility/Utils'
import { File, Search } from 'react-feather'

import DataTable from "react-data-table-component";
import classnames from "classnames";
import ResultModal from '@src/views/Test/DetailShow/Modal'
import Chart from './Chart'


const List3 = () => {
    const { t } = useTranslation()
    const [datas, setDatas] = useState([])
    const { isLoading, Loader, fetchData: allFetch } = useLoader({ isFullScreen: true })
    const default_page = ['Бүгд', 10, 15, 50, 75, 100];

    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total_count, setTotalCount] = useState(1);
    const [resultModal, setResultModal] = useState(false)
    const [resultData, setResultData] = useState([]);

    const challengeApi = useApi().challenge
    const departmentApi = useApi().hrms.department
    const groupApi = useApi().student.group


    var values = {
        test: '',
        department: '',
        group: '',
        student: '',
    }

    const [select_value, setSelectValue] = useState(values);
    const [dashBoardOpen, setDashBoardOpen] = useState(false);
    const [departmentOption, setDepartmentOption] = useState([])
    const [groupOption, setGroup] = useState([])


    const toggleDashboard = () => setDashBoardOpen((prevState) => !prevState)

    async function getDatas() {
        const { success, data } = await allFetch(challengeApi.getDetailTable(currentPage, rowsPerPage, searchValue, select_value.department, select_value.group, select_value.test, select_value.student))
        if (success) {
            setDatas(data?.results);
            setTotalCount(data?.count);
        }
    }

    async function getDepartmentOption() {
        const { success, data } = await allFetch(departmentApi.get())
        if (success) {
            setDepartmentOption(data)
        }
    }

    async function getGroup() {
        const { success, data } = await allFetch(groupApi.getExam(select_value?.test))
        if (success) {
            setGroup(data)
        }
    }

    useEffect(() => {
        getDepartmentOption()
        getExams()
    }, [])

    useEffect(() => {
        if (select_value?.test) {
            getGroup()
        }
    }, [select_value?.test])

    useEffect(() => {
        if (select_value?.test) {
            getDatas()
        }
    }, [select_value, currentPage, rowsPerPage])

    // #region exam selection code
    const [examOption, setExamOption] = useState([])

    async function getExams() {
        const { success, data } = await allFetch(challengeApi.get(1, 10000000, '', '', '', '', true))

        if (success) {
            setExamOption(data?.results)
        }
    }
    // #endregion

    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    };

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value));
    }

    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    async function handleSearch() {
        if (searchValue.length > 0) getDatas()
    }

    function handleResultModal(data) {
        setResultData(data)
        setResultModal(!resultModal)
    }

    return (
        <div className='px-1'>
            {
                dashBoardOpen &&
                <Chart test_id={select_value.test} department={select_value?.department} group={select_value?.group}/>
            }
            <div className='d-flex justify-content-end me-2' style={{ fontWeight: 900, fontSize: 16 }}>
                <Button
                    color='primary'
                    size='sm'
                    onClick={() => toggleDashboard()}
                >
                    <File size={15} />
                    <span className='align-middle ms-50'>{t('Тайлан')}</span>
                </Button>
            </div>
            {isLoading && Loader}
            <Row>
                <Col md={3} sm={10}>
                    <Label className="form-label" for="exam">
                        {t('Шалгалт')}
                    </Label>
                    <Select
                        id="exam"
                        name="exam"
                        isClearable
                        classNamePrefix='select'
                        className='react-select'
                        placeholder={`-- Сонгоно уу --`}
                        options={examOption || []}
                        noOptionsMessage={() => 'Хоосон байна'}
                        onChange={(val) => {
                            setSelectValue(current => {
                                return {
                                    ...current,
                                    test: val?.id || '',
                                }
                            })
                        }}
                        styles={ReactSelectStyles}
                        getOptionValue={(option) => option.id}
                        getOptionLabel={(option) => option.title}
                    />
                </Col>
                {/* <Col md={3} sm={10}>
                    <Label className="form-label" for="department">
                        {t('Хөтөлбөрийн баг')}
                    </Label>
                    <Select
                        name="department"
                        id="department"
                        classNamePrefix='select'
                        isClearable
                        className='react-select'
                        placeholder={t('-- Сонгоно уу --')}
                        options={departmentOption || []}
                        value={departmentOption.find((c) => c.id === select_value.department)}
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
                </Col> */}
                <Col md={3} sm={10}>
                    <Label className="form-label" for="group">
                        {t("Анги")}
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
            </Row>
            <Row className="justify-content-between mx-0 mt-3 mb-1" sm={9}>
                <Col
                    className="d-flex align-items-center justify-content-start"
                    md={6}
                    sm={12}
                >
                    <Col lg={2} md={3} sm={4} xs={5} className="pe-1">
                        <Input
                            className='dataTable-select me-1 mb-50'
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
                        <Label for="sort-select">
                            {t("Хуудсанд харуулах тоо")}
                        </Label>
                    </Col>
                </Col>
                <Col className='d-flex align-items-end mobile-datatable-search '>
                    <Input
                        className='dataTable-filter mb-50'
                        type='text'
                        bsSize='sm'
                        id='search-input'
                        placeholder={t("Хайх")}
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
                    pagination
                    className="react-dataTable"
                    progressPending={isLoading}
                    progressComponent={
                        <div className="my-2">
                            <h5>{t("Түр хүлээнэ үү")}...</h5>
                        </div>
                    }
                    noDataComponent={
                        <div className="my-2">
                            <h5>{t("Өгөгдөл байхгүй байна")}</h5>
                        </div>
                    }
                    columns={getColumns(
                        currentPage,
                        rowsPerPage,
                        datas,
                        handleResultModal
                    )}
                    paginationPerPage={rowsPerPage}
                    paginationDefaultPage={currentPage}
                    data={datas}
                    paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count, searchValue, datas)}
                    fixedHeader
                    fixedHeaderScrollHeight="62vh"
                />
            </div>
            {resultModal && <ResultModal open={resultModal} handleModal={handleResultModal} datas={resultData} />}
        </div>
    )
}

export default memo(List3);
