import React, { Fragment, useState, useContext, useEffect } from "react";

import { Col, Row, Card, Button, Input, Label, Spinner } from 'reactstrap'

import { useTranslation } from 'react-i18next'

import { ChevronDown, Search, FileText } from 'react-feather'

import { getColumnState } from "../helpers";

import { getPagination, ReactSelectStyles } from '@utils'

import DataTable from "react-data-table-component";
import classnames from "classnames";
import Select from 'react-select'

import AuthContext from '@context/AuthContext'

import useLoader from '@hooks/useLoader'

import useApi from "@hooks/useApi"

import moment from 'moment'

import { utils, writeFile } from 'xlsx-js-style'

const States = () => {

    const { user } = useContext(AuthContext)

    const { t } = useTranslation()

    const stateop = [
        {
            id: '1',
            name: 'Бүртгүүлсэн'
        },
        {
            id: '2',
            name: 'Тэнцсэн'
        },
        {
            id: '3',
            name: 'Тэнцээгүй'
        }
    ]

    const default_page = [10, 15, 50, 75, 100]
    const [datas, setDatas] = useState([])
    const [admop, setAdmop] = useState([])

    const [adm, setAdm] = useState('')

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Эрэмбэлэлт
    const [sortField, setSortField] = useState('')

    const [profOption, setProfession] = useState([])

    // Хөтөлбөрөөр хайлт хийх
    const [profession_id, setProfession_id] = useState('')

    // Loader
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false })
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({ isFullScreen: false })

    // Хуудас солих үед ажиллах хэсэг
    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    };

    // Хайлт хийх үед ажиллах хэсэг
    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    // API
    const newsApi = useApi().elselt.log
    const professionApi = useApi().elselt.profession
    const admissionYearApi = useApi().elselt

    // Цэсний утгууд PROFESSION = 1, STATE = 2
    const menuOptions =  [1, 2]
    async function getDatas() {
        const { success, data } = await allFetch(newsApi.get(rowsPerPage, currentPage, sortField, searchValue, adm, profession_id, menuOptions[1]))
        if (success) {
            setDatas(data?.results)
            setTotalCount(data?.count)
        }
    }

    async function getProfession() {
        const { success, data } = await allFetch(professionApi.getList(adm))
        if (success) {
            setProfession(data)
        }
    }

    async function getAdmissionYear() {
        const { success, data } = await fetchData(admissionYearApi.getAll())
        if (success) {
            setAdmop(data)
        }
    }
    useEffect(() => {
            getProfession(),
            getAdmissionYear()
    }, [])

    useEffect(() => {
        getDatas()
    }, [currentPage, rowsPerPage])


    useEffect(() => {
        if (searchValue.length == 0) {
            getDatas();
        } else {
            const timeoutId = setTimeout(() => {
                getDatas();
            }, 600);

            return () => clearTimeout(timeoutId);
        }
    }, [searchValue, adm, profession_id]);

    // Excel button handler
    function convert() {
        const mainData = datas.map((data, idx) => {
            return(
                {
                    '№': idx + 1,
                    'Овог': data?.last_name || '',
                    'Нэр': data?.first_name || '',
                    'Шалгуур': data?.indicator_name || '',
                    'Одоогийн төлөв': data?.now_state_name || '',
                    'Сольсон төлөв': data?.change_state_name || '',
                    'Сольсон хэрэглэгч': data?.admin_name || '',
                    'Бүрт/огноо': data?.updated_at ? moment(data?.updated_at).format("YYYY-MM-DD h:mm") || '' : '',
                }
            )}
        )

        const combo = [
            ...mainData,
        ]

        const worksheet = utils.json_to_sheet(combo);

        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Төлөв лог")
        const staticCells = [
                '№',
                'Овог',
                'Нэр',
                'Шалгуур',
                'Одоогийн төлөв',
                'Сольсон төлөв',
                'Сольсон хэрэглэгч',
                'Бүрт/огноо',
            ];

        utils.sheet_add_aoa(worksheet, [staticCells], { origin: "A1" });

        const numberCellStyle = {
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            },
            alignment: {
                horizontal: 'left',
                vertical: 'center',
                wrapText: true
            },
            font:{
                sz:10
            }
        };

        const tableHeader = {
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "0000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } },
                wrapText: true
            },
            alignment: {
                vertical: 'center',
                wrapText: true
            },
            font:{
                sz: 12,
                bold: true
            }

        };

        const styleRow = 0;
        const sendRow = mainData.length;
        const styleCol = 0;
        const sendCol = 15;

        for (let row = styleRow; row <= sendRow; row++) {
            for (let col = styleCol; col <= sendCol; col++) {
            const cellNum = utils.encode_cell({ r: row, c: col });

                if (!worksheet[cellNum]) {
                    worksheet[cellNum] = {};
                }

                worksheet[cellNum].s =
                    (row === styleRow)
                        ? tableHeader
                            : numberCellStyle;
            }
        }

        const phaseTwoCells = Array.from({length: 15}, (_) => {return({wch: 15})})

        worksheet["!cols"] = [
            { wch: 5 },
            ...phaseTwoCells,
            { wch: 20 }
        ];

        const tableRow = Array.from({length: mainData.length}, (_) => {return({hpx: 20})})

        worksheet["!rows"] = [
            { hpx: 40 },
            ...tableRow
        ];

        writeFile(workbook, "Төлөв лог.xlsx");

    }

    function handleSearch() {
        getDatas()
    }

    function handleSort(column, sort) {
        if (sort === 'asc') {
            setSortField(column.header)
        } else {
            setSortField('-' + column.header)
        }
    }

    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    return (
        <Fragment>
            {Loader && isLoading}
            <Card>
                <div className='d-flex flex-wrap justify-content-end mt-md-0 mt-1'>
                    <Button
                        color='primary'
                        onClick={convert}
                    >
                    <FileText size={14}/>
                        Excel
                    </Button>
                </div>
                <Row>
                    <Col sm={6} lg={3} >
                        <Label className="form-label" for="lesson_year">
                            {t('Элсэлт')}
                        </Label>
                        <Select
                            name="lesson_year"
                            id="lesson_year"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={admop || []}
                            value={admop.find((c) => c.id === adm)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setAdm(val?.id || '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.lesson_year + ' ' + option.name}
                        />
                    </Col>
                    <Col sm={6} lg={3} >
                        <Label className="form-label" for="profession">
                            {t('Хөтөлбөр')}
                        </Label>
                        <Select
                            name="profession"
                            id="profession"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={t('-- Сонгоно уу --')}
                            options={profOption || []}
                            value={profOption.find((c) => c?.prof_id === profession_id)}
                            noOptionsMessage={() => t('Хоосон байна.')}
                            onChange={(val) => {
                                setProfession_id(val?.prof_id || '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option?.prof_id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                </Row>
                <Row className="justify-content-between mx-0 my-1" sm={12}>
                    <Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
                        <Col md={3} sm={4} xs={5} className='pe-1'>
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
                <div className='react-dataTable react-dataTable-selectable-rows mt-0'>
                    <DataTable
                        noHeader
                        pagination
                        className='react-dataTable'
                        progressPending={isTableLoading}
                        progressComponent={
                            <div className='my-1 d-flex align-items-center justify-content-center'>
                                <Spinner className='me-1' color="" size='sm' /><h5>Түр хүлээнэ үү...</h5>
                            </div>
                        }
                        noDataComponent={(
                            <div className="my-2">
                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                            </div>
                        )}
                        columns={getColumnState(currentPage, rowsPerPage, total_count, stateop)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        onSort={handleSort}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
        </Fragment>
    )
}

export default States
