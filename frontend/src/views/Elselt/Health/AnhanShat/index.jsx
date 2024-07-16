import React from 'react'
import { useState, useEffect, useContext } from 'react'
import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner, UncontrolledTooltip, CardBody } from 'reactstrap'
import { ChevronDown, FileText, Search } from 'react-feather'
import DataTable from 'react-data-table-component'
import { MdMailOutline } from "react-icons/md";
import { BiMessageRoundedError } from "react-icons/bi";
import { useTranslation } from 'react-i18next'
import { utils, writeFile } from 'xlsx-js-style';
import Select from 'react-select'
import Flatpickr from 'react-flatpickr'
import '@styles/react/libs/flatpickr/flatpickr.scss'
import moment from 'moment';
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from "@context/AuthContext"

import { getPagination, ReactSelectStyles } from '@utils'
import { getColumns } from './helpers';
import AddModal from './AddModal'
import { excelDownLoad } from './downloadExcel'
import MessageModal from '../../User/MessageModal'
import EmailModal from '../../User/EmailModal'

import classnames from "classnames";

const STATE_LIST = [
    {
        name: 'Хүлээгдэж буй',
        id: 1
    },
    {
        name: 'Тэнцсэн',
        id: 2
    },
    {
        name: 'Тэнцээгүй',
        id: 3
    },
]

function AnhanShat() {
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

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')
    const { user } = useContext(AuthContext)

    // Translate
    const { t } = useTranslation()

    const default_page = ['Бүгд', 10, 20, 50, 75, 100]

    const [searchValue, setSearchValue] = useState("");
    const [datas, setDatas] = useState([]);
    const [chosenState, setChosenState] = useState('')

    var values = {
        admission: '',
        profession: '',
    }

    const [elseltOption, setElseltOption] = useState([])     // элсэлт авах нь
    const [profOption, setProfessionOption] = useState([])   // хөтөлбөр авах нь
    const [gender, setGender] = useState("")
    const [select_value, setSelectValue] = useState(values);
    const [addModal, setAddModal] = useState(false)
    const [addModalData, setAddModalData] = useState(null)
    const [emailModal, setEmailModal] = useState(false)
    const [messageModal, setMessageModal] = useState(false)
    const [selectedStudents, setSelectedStudents] = useState([])
    const [end_date, setEnd_date] = useState('')
    const [start_date, setStart_date] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

    // Нийт хуудасны тоо
    const [pageCount, setPageCount] = useState(1)

    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });

    const elseltApi = useApi().elselt.health.anhan
    const professionApi = useApi().elselt.profession
    const admissionYearApi = useApi().elselt

    useEffect(() => {
        getAdmissionYear()
    }, [])

    useEffect(
        () => {
            getProfession()
        },
        [select_value.admission]
    )

    // Элсэлтийн жагсаалт авах
    async function getAdmissionYear() {
        const { success, data } = await fetchData(admissionYearApi.getAll())
        if (success) {
            setElseltOption(data)
        }
    }

    // Хөтөлбөрийн жагсаалт авах
    async function getProfession() {
        const { success, data } = await fetchData(professionApi.getList(select_value?.admission))

        if (success) {
            setProfessionOption(data)
        }
    }

    /* Жагсаалтын дата авах функц */
    async function getDatas() {
        var elselt = select_value?.admission
        var profession = select_value?.profession

        const { success, data } = await fetchData(elseltApi.get(rowsPerPage, currentPage, sortField, searchValue, chosenState, elselt, profession, gender, start_date, end_date))
        if (success) {
            setTotalCount(data?.count)
            setDatas(data?.results)

            // Нийт хуудасны тоо
            var cpage_count = Math.ceil(data?.count / rowsPerPage === 'Бүгд' ? 1 : rowsPerPage)
            setPageCount(cpage_count)
        }
    }

    // Хайлтийн хэсэг хоосон болох үед анхны датаг дуудна
    useEffect(() => {
        if (searchValue.length == 0) {
            getDatas();
        } else {
            const timeoutId = setTimeout(() => {
                getDatas();
            }, 600);

            return () => clearTimeout(timeoutId);
        }
    }, [sortField, currentPage, rowsPerPage, searchValue, chosenState, select_value.admission, select_value.profession, gender, start_date, end_date])

    // ** Шүүж хайх хэсэг
    const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    function convert() {

        const mainData = datas.map((data, idx) => {
            return (
                {
                    '№': idx + 1,
                    'Ургийн овог': data?.family_name || '',
                    'Овог': data?.last_name || '',
                    'Нэр': data?.first_name || '',
                    'РД': data?.user_register || '',
                    'ЭМД дугаар': '',
                    'Аймаг/хот': data?.aimag_name || '',
                    'Сум/Дүүрэг': data?.sumDuureg || '',
                    'Хороо': data?.Horoo || '',
                    'Гудамж': '',
                    'Байр/хашаа': '',
                    'Тоот': '',
                    'Ажлын газар': data?.work_organization || '',
                    'Харъяалал': '',
                    'Боловсрол': data?.degree_name || '',
                    'Даатгал': data?.daatgal || '',
                    'Салбарын ангилал': '',
                    'Мэргэжлийн ангилал': '',
                    'Цэргийн цол': data?.tsol_name || '',
                    'Албан тушаал': data?.position_name || '',
                    'Утас': data?.user?.mobile || '',
                    'И-Мэйл': data?.user?.email || '',
                    'Facebook': '',
                    'Twitter': '',

                }
            )
        }
        )

        const combo = [
            ...mainData,
        ]

        const worksheet = utils.json_to_sheet(combo);

        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Aнхан шатны эрүүл мэндийн үзлэг")
        const staticCells = [
            '№',
            'Ургийн овог',
            'Овог',
            'Нэр',
            'Регистрийн дугаар',
            'ЭМД дугаар',
            'Аймаг/хот',
            'Сум/Дүүрэг',
            'Хороо/Баг',
            'Гудамж',
            'Байр/хашаа',
            'Тоот',
            'Ажлын газар',
            'Харъяалал',
            'Боловсрол',
            'Даатгал',
            'Салбарын ангилал',
            'Мэргэжлийн ангилал',
            'Цэргийн цол',
            'Албан тушаал',
            'Утас',
            'И-Мэйл',
            'Facebook',
            'Twitter',
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
            font: {
                sz: 10
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
            font: {
                sz: 12,
                bold: true
            }

        };

        const styleRow = 0;
        const sendRow = mainData.length;
        const styleCol = 0;
        const sendCol = 20;

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

        const phaseTwoCells = Array.from({ length: 8 }, (_) => { return ({ wch: 15 }) })

        worksheet["!cols"] = [
            { wch: 5 },
            ...phaseTwoCells,
            { wch: 20 }
        ];

        const tableRow = Array.from({ length: mainData.length }, (_) => { return ({ hpx: 20 }) })

        worksheet["!rows"] = [
            { hpx: 40 },
            ...tableRow
        ];

        writeFile(workbook, "Нарийн шатны үзлэгийн жагсаалт.xlsx");

    }

    function handleSort(column, sort) {
        if (sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    function handleSearch() {
        getDatas()
    }

    // Хуудаслалт
    function handlePerPage(e) {
        setRowsPerPage(e.target.value === 'Бүгд' ? e.target.value : parseInt(e.target.value))
    }

    // Хуудас солих үед ажиллах хэсэг
    function handlePagination(page) {
        setCurrentPage(page.selected + 1);
    };

    function addModalHandler(e, data) {
        setAddModal(!addModal)
        setAddModalData(data || null)
    }

    function excelHandler() {
        excelDownLoad(datas, STATE_LIST)
    }

    function onSelectedRowsChange(state) {
        setSelectedStudents(state?.selectedRows)
    }

    // имэйл илгээх функц
    function emailModalHandler() {
        setEmailModal(!emailModal)
    }

    // Мессеж илгээх функц
    function messageModalHandler() {
        setMessageModal(!messageModal)
    }

    console.log(datas)

    return (
        <Card>
            <EmailModal
                emailModalHandler={emailModalHandler}
                emailModal={emailModal}
                selectedStudents={selectedStudents}
                getDatas={getDatas}
            />
            <MessageModal
                messageModalHandler={messageModalHandler}
                messageModal={messageModal}
                selectedStudents={selectedStudents}
                getDatas={getDatas}
            />
            {
                addModal &&
                <AddModal
                    addModal={addModal}
                    addModalHandler={addModalHandler}
                    addModalData={addModalData}
                    getDatas={getDatas}
                    STATE_LIST={STATE_LIST}
                />

            }
            <CardHeader>
                <h5>
                    Эрүүл мэндийн анхан шатны үзлэг
                </h5>
                <div className='d-flex justify-content-end mt-1'>
                    <Button color='primary' className='d-flex align-items-center' onClick={() => convert()} style={{}}>
                        <FileText className='me-50' size={14} />
                        <div>
                            Нарийн мэргэжил excel
                        </div>
                    </Button>
                    <Button color='primary' className='d-flex align-items-center ms-1' onClick={() => excelHandler()}>
                        <FileText className='me-50' size={14} />
                        <div>
                            Анхан шат excel татах
                        </div>
                    </Button>
                </div>

            </CardHeader>
            <CardBody>
                <Row className="justify-content-start mt-1">
                    <Col md={3}>
                        <Label for='sort-select'>{t('Үзлэгийн төлөвөөр шүүх')}</Label>
                        <Select
                            classNamePrefix='select'
                            isClearable
                            placeholder={`-- Сонгоно уу --`}
                            options={STATE_LIST || []}
                            value={STATE_LIST.find((c) => c.id === chosenState)}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {
                                setChosenState(val?.id || '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col md={3}>
                        <Label for='form-label'>{t('Элсэлт')}</Label>
                        <Select
                            name="lesson_year"
                            id="lesson_year"
                            classNamePrefix='select'
                            isClearable
                            placeholder={`-- Сонгоно уу --`}
                            options={elseltOption || []}
                            value={elseltOption.find((c) => c.id === select_value.admission)}
                            noOptionsMessage={() => 'Хоосон байна'}
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
                        <Label for='form-label'>{t('Хөтөлбөр')}</Label>
                        <Select
                            id="profession"
                            name="profession"
                            classNamePrefix='select'
                            isClearable
                            placeholder={`-- Сонгоно уу --`}
                            options={profOption || []}
                            value={profOption.find((c) => c.id === select_value.profession)}
                            noOptionsMessage={() => 'Хоосон байна'}
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
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col md={3} >
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
                <Row className='justify-content-start mt-1 '>
                    <Col md={3} className='my-0 py-0 '>
                        <Label className="form-label" for="">
                            {t('Эхлэх огноо')}
                        </Label>
                        <Flatpickr
                            className='form-control form-control-sm  bg-white '
                            style={{ maxWidth: '480px' }}
                            placeholder={`-- Сонгоно уу --`}

                            onChange={(selectedDates, dateStr) => {

                                if (selectedDates.length !== 0) {
                                    const values = {
                                        val: moment(dateStr).format('YYYY-MM-DD HH:mm')
                                    }
                                    setStart_date(values.val || '')
                                }
                            }}
                            value={start_date}
                            options={{
                                time_24hr: true,
                                enableTime: true,
                                dateFormat: "Y-m-d H:i",
                                mode: "single",
                                // locale: Mongolian
                            }}
                        />
                    </Col>
                    <Col md={3} className='my-0 py-0 '>
                        <Label className="form-label" for="">
                            {t('Дуусах огноо')}
                        </Label>
                        <Flatpickr
                            className='form-control form-control-sm  bg-white '
                            style={{ maxWidth: '480px' }}
                            placeholder={`-- Сонгоно уу --`}

                            onChange={(selectedDates, dateStr) => {
                                if (selectedDates.length !== 0) {
                                    const values = {
                                        val: moment(dateStr).format('YYYY-MM-DD HH:mm')
                                    }
                                    setEnd_date(values.val || '')
                                }
                            }}
                            value={end_date}
                            options={{
                                time_24hr: true,
                                enableTime: true,
                                dateFormat: "Y-m-d H:i",
                                mode: "single",
                                // locale: Mongolian
                            }}
                        />
                    </Col>
                </Row>
                <Row>
                    <div className='d-flex justify-content-between my-50 mt-1   '>
                        <div className='d-flex'>
                            <div className='px-0'>
                                <Button
                                    color='primary'
                                    disabled={(selectedStudents.length != 0 && user?.permissions?.includes('lms-elselt-mail-create')) ? false : true}
                                    className='d-flex align-items-center px-75'
                                    id='email_button'
                                    onClick={() => emailModalHandler()}
                                >
                                    <MdMailOutline className='me-25' />
                                    Email илгээх
                                </Button>
                                <UncontrolledTooltip target='email_button'>
                                    Сонгосон элсэгчид руу имейл илгээх
                                </UncontrolledTooltip>
                            </div>
                            <div className='px-1'>
                                <Button
                                    color='primary'
                                    disabled={(selectedStudents.length != 0 && user?.permissions?.includes('lms-elselt-message-create')) ? false : true}
                                    className='d-flex align-items-center px-75'
                                    id='message_button'
                                    onClick={() => messageModalHandler()}
                                >
                                    <BiMessageRoundedError className='me-25' />
                                    Мессеж илгээх
                                </Button>
                                <UncontrolledTooltip target='message_button'>
                                    Сонгосон элсэгчид руу мессеж илгээх
                                </UncontrolledTooltip>
                            </div>
                        </div>

                    </div>
                </Row>
                <Row className="justify-content-between">
                    <Col className='d-flex align-items-center justify-content-start' md={4}>
                        <Col md={3} sm={2} className='pe-1'>
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
                        <Col md={9} sm={3}>
                            <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                        </Col>
                    </Col>
                    <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={4} sm={12}>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder={t("Хайх үг....")}
                            value={searchValue}
                            onChange={(e) => { handleFilter(e) }}
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
                <div className="react-dataTable react-dataTable-selectable-rows" id='datatableLeftTwoRightTwo'>
                    <DataTable
                        noHeader
                        paginationServer
                        pagination
                        className='react-dataTable-header-md'
                        progressPending={isLoading}
                        progressComponent={
                            <div className='my-2 d-flex align-items-center justify-content-center'>
                                <Spinner className='me-1' color="" size='sm' /><h5>Түр хүлээнэ үү...</h5>
                            </div>
                        }
                        noDataComponent={(
                            <div className="my-2">
                                <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                            </div>
                        )}
                        print='true'
                        theme="solarized"
                        onSort={handleSort}
                        columns={getColumns(currentPage, rowsPerPage === 'Бүгд' ? 1 : rowsPerPage, total_count, addModalHandler,  STATE_LIST, user)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage === 'Бүгд' ? total_count : rowsPerPage, total_count)}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                        selectableRows
                        onSelectedRowsChange={(state) => onSelectedRowsChange(state)}
                        direction="auto"
                        // style={{ border: '1px solid red' }}
                        defaultSortFieldId={'created_at'}
                    />
                </div>
            </CardBody>
        </Card>
    )
}

export default AnhanShat


