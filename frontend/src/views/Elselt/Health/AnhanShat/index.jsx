import React from 'react'
// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner, UncontrolledTooltip, CardBody } from 'reactstrap'

import { ChevronDown, File, FileText, Printer, Search } from 'react-feather'

import DataTable from 'react-data-table-component'

import { MdMailOutline } from "react-icons/md";
import { BiMessageRoundedError } from "react-icons/bi";
import { useTranslation } from 'react-i18next'
import Select from 'react-select'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { getPagination, ReactSelectStyles } from '@utils'

import { getColumns } from './helpers';
import AddModal from './AddModal'
import { excelDownLoad } from './downloadExcel'
import MessageModal from './MessageModal'
import EmailModal from './EmailModal'
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

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    // Translate
    const { t } = useTranslation()

    const default_page = [ 10, 20, 50, 75, 100 ]

	const [searchValue, setSearchValue] = useState("");
	const [datas, setDatas] = useState([]);
    const [chosenState, setChosenState] = useState('')

    var values = {
        admission: '',
        profession: '',
    }

    const [elseltOption, setElseltOption] = useState([])     // элсэлт авах нь
    const [profOption, setProfessionOption] = useState([])   // хөтөлбөр авах нь
    const [select_value, setSelectValue] = useState(values);

    const [descModal, setDescModal] = useState(false)
    const [descModalData ,setDescModalData] = useState(null)

    const [addModal, setAddModal] = useState(false)
    const [addModalData, setAddModalData] = useState(null)

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

    // Нийт хуудасны тоо
    const [pageCount, setPageCount] = useState(1)

	const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false});

	const elseltApi = useApi().elselt.health.anhan
    const professionApi = useApi().elselt.profession
    const admissionYearApi = useApi().elselt

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

    //email Modal
    const [emailModal, setEmailModal] = useState(false)
    //message Modal
    const [messageModal, setMessageModal] = useState(false)

    const [selectedStudents, setSelectedStudents] = useState([])

	/* Жагсаалтын дата авах функц */
	async function getDatas() {
        var elselt = select_value?.admission
        var profession = select_value?.profession

        const {success, data} = await fetchData(elseltApi.get(rowsPerPage, currentPage, sortField, searchValue, chosenState, elselt, profession))
        if(success) {
            setTotalCount(data?.count)
            setDatas(data?.results)
            console.log("-------------->",data)

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
    }, [sortField, currentPage, rowsPerPage, searchValue, chosenState, select_value.admission, select_value.profession])


    // ** Шүүж хайх хэсэг
	const handleFilter = e => {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    function handleSort(column, sort) {
        if(sort === 'asc') {
            setSort(column.header)
        } else {
            setSort('-' + column.header)
        }
    }

    function handleSearch() {
        getDatas()
    }

    // Хуудаслалт
    function handlePerPage(e)
    {
        setRowsPerPage(e.target.value === 'Бүгд' ? e.target.value : parseInt(e.target.value))
    }

    // Хуудас солих үед ажиллах хэсэг
	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

    function descModalHandler(e, data) {
        setDescModal(!descModal)
        setDescModalData(data || null)
    }

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
      //имэйл илгээх функц
    function emailModalHandler() {
        setEmailModal(!emailModal)
    }
      //Мессеж илгээх функц
    function messageModalHandler() {
        setMessageModal(!messageModal)
    }

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
                getDatas = {getDatas}
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
                <Col className='d-flex justify-content-end'>
                    <Button color='primary' className='d-flex align-items-center' onClick={() => excelHandler()}>
                        <FileText className='me-50' size={14}/>
                        <div>
                            Excel татах
                        </div>
                    </Button>
                </Col>
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
                <div className='d-flex justify-content-between my-50 mt-1   '>
                    <div className='d-flex'>
                        <div className='px-0'>
                            <Button color='primary' disabled={selectedStudents.length == 0}  className='d-flex align-items-center px-75' id='email_button' onClick={()=> emailModalHandler()} >
                                <MdMailOutline className='me-25'/>
                                Email илгээх
                            </Button>
                            <UncontrolledTooltip target='email_button'>
                                Сонгосон элсэгчид руу имейл илгээх
                            </UncontrolledTooltip>
                        </div>
                        <div className='px-1'>
                            <Button color='primary' disabled={selectedStudents.length == 0}  className='d-flex align-items-center px-75' id='message_button' onClick={()=>messageModalHandler()}>
                            {/* <Button color='primary' disabled={selectedStudents.length == 0} className='d-flex align-items-center px-75' id='message_button' onClick={() => messageModalHandler()}> */}
                                <BiMessageRoundedError className='me-25'/>
                                Мессеж илгээх
                            </Button>
                            <UncontrolledTooltip target='message_button'>
                                Сонгосон элсэгчид руу мессеж илгээх
                            </UncontrolledTooltip>
                        </div>
                    </div>

                </div>
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
                            onChange={(e) => {handleFilter(e)}}
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
                <div className="react-dataTable react-dataTable-selectable-rows" id='datatableLeftTwoRightOne'>
                    <DataTable
                        noHeader
                        paginationServer
                        pagination
                        className='react-dataTable-header-md'
                        progressPending={isLoading}
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
                        print='true'
                        theme="solarized"
                        onSort={handleSort}
                        columns={getColumns(currentPage, rowsPerPage, total_count, addModalHandler, STATE_LIST)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
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


