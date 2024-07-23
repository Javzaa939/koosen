import React from 'react'
// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Row, Col, Card, Input, Label, Button, CardHeader, Spinner, UncontrolledTooltip, CardBody } from 'reactstrap'

import { ChevronDown, Search } from 'react-feather'

import DataTable from 'react-data-table-component'

import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from "@context/AuthContext"
import { MdMailOutline } from "react-icons/md";
import { BiMessageRoundedError } from "react-icons/bi";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { getPagination, ReactSelectStyles } from '@utils'
import { utils, writeFile } from 'xlsx-js-style';
import { getColumns } from './helpers';
import AddModal from './AddModal'
import EmailModal from '../../User/EmailModal'
import MessageModal from '../../User/MessageModal'

import classnames from "classnames";
import { RiEditFill } from 'react-icons/ri'
import { SortModal } from './SortModal'

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

function Physical() {
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
    const [gender, setGender] = useState("")

    const { user } = useContext(AuthContext)
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('order_no')

    // Translate
    const { t } = useTranslation()

    const default_page = ['Бүгд', 10, 20, 50, 75, 100]

	const [searchValue, setSearchValue] = useState("");
	const [datas, setDatas] = useState([]);
    const [chosenState, setChosenState] = useState('')
    const [elseltOption, setElseltOption] = useState([])     // элсэлт авах нь
    const [profOption, setProfessionOption] = useState([])   // хөтөлбөр авах нь
    const [admId, setAdmId] = useState('');                  // элсэлт id
    const [profId, setProfId] = useState('')                 // хөтөлбөр id

    const [addModal, setAddModal] = useState(false)
    const [addModalData, setAddModalData] = useState(null)

    const [modal, setModal] = useState(false)
    const [type, setType] = useState('')
	const [editData, setEditData] = useState([])

    const [emailModal, setEmailModal] = useState(false)      // email modal
    const [messageModal, setMessageModal] = useState(false)  // message modal
    const [selectedStudents, setSelectedStudents] = useState([])

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

    // Нийт хуудасны тоо
    const [pageCount, setPageCount] = useState(1)

	const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false});
	const elseltApi = useApi().elselt.health.physical
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
        [admId]
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
        const { success, data } = await fetchData(professionApi.getList(admId))

        if (success) {
            setProfessionOption(data)
        }
	}

	/* Жагсаалтын дата авах функц */
	async function getDatas() {

        const {success, data} = await fetchData(elseltApi.get(rowsPerPage, currentPage, sortField, searchValue, chosenState, admId, profId, gender))
        if(success) {
            setTotalCount(data?.count)
            setDatas(data?.results)
            // Нийт хуудасны тоо
            var cpage_count = Math.ceil(data?.count / rowsPerPage === 'Бүгд' ? 1 : rowsPerPage)
            setPageCount(cpage_count)

            // order_no-р эрэмбэлсэн байдал
            const sortedData = (data) => data.sort((a, b) => a.health_up_user_data?.order_no - b.health_up_user_data?.order_no);
            setDatas(sortedData)
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
    }, [sortField, currentPage, rowsPerPage, searchValue, chosenState, admId, profId, gender])

       // excel татах
       function convert(){
        const mainData = datas.map((data, idx) => {
            return(
                {
                    '№': idx + 1,
                    'Овог': data?.user?.last_name || '',
                    'Нэр': data?.user?.first_name || '',
                    'Хүйс': data?.gender_name || '',
                    'РД': data?.user_register || '',
                    'Нас': data?.user_age || 0,
                    'Үзлэгийн төлөв':STATE_LIST.find(val => val.id === data?.health_up_user_data?.state).name|| '',
                    'Тайлбар': data?.health_up_user_data?.description  || '',
                    'Хэмжээст оноо' : data?.health_up_user_data?.physice_score || '',
                    'Савлуурт суниах':data?.health_up_user_data?.turnik || '',
                    'Гэдэсний даралт': data?.health_up_user_data?.belly_draught || '',
                    'Тэсвэр 1000М': data?.health_up_user_data?.patience_1000m || '',
                    'Хурд 100М': data?.health_up_user_data?.speed_100m || '',
                    'Авхаалж самбаа ': data?.health_up_user_data?.quickness|| '',
                    'Уян хатан': data?.health_up_user_data?.flexible || '',
                    'Нийт оноо': data?.health_up_user_data?.total_score  || '',
                    'Төгссөн сургууль': data?.userinfo?.graduate_school || '',
                    'Хөтөлбөр': data?.userinfo?.graduate_profession || '',
                    'Төгссөн он': data?.userinfo?.graduate_school_year || '',
                    'Голч': data?.userinfo?.gpa || '',
                    'Ажиллаж байгаа байгууллагын нэр': data?.userinfo?.work_organization || '',
                    'Албан тушаал': data?.userinfo?.position_name || '',
                    'Цол': data?.userinfo?.tsol_name || '',

                }
            )
        })

        const combo = [
            // ...header,
            ...mainData
        ]

        const worksheet = utils.json_to_sheet(combo);

        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Бие бялдарын үзүүлэлт");

        const staticCells = [
            '№',
            'Овог',
            'Нэр',
            'Хүйс',
            'РД',
            'Нас',
            'Үзлэгийн төлөв',
            'Тайлбар',
            'Хэмжээст оноо',
            'Савлуурт суниах',
            'Гэдэсний даралт',
            'Тэсвэр 1000М',
            'Хурд 100М',
            'Авхаалж самбаа',
            'Уян хатан',
            'Нийт оноо',
            'Төгссөн сургууль',
            'Хөтөлбөр',
            'Төгссөн он',
            'Голч',
            'Ажиллаж байгаа байгууллагын нэр',
            'Албан тушаал',
            'Цол',
        ];

        utils.sheet_add_aoa(worksheet, [staticCells], { origin: "A1" });


        const headerCell = {
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            },
            alignment: {
                horizontal: 'center',
                vertical: 'center',
                wrapText: true
            },
            font:{
                sz:10,
                bold:true
            }
        };

        const defaultCell = {
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

        const defaultCenteredCell = {
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            },
            alignment: {
                horizontal: 'center',
                vertical: 'center',
                wrapText: true
            },
            font:{
                sz:10
            }
        };

        const styleRow = 0;
        const sendRow = datas?.length + 1;
        const styleCol = 0;
        const sendCol = 21;

        for (let row = styleRow; row <= sendRow; row++) {
            for (let col = styleCol; col <= sendCol; col++) {
            const cellNum = utils.encode_cell({ r: row, c: col });

                if (!worksheet[cellNum]) {
                    worksheet[cellNum] = {};
                }

                worksheet[cellNum].s = row === 0 ? headerCell : col === 0 ? defaultCenteredCell : defaultCell

            }
        }

        const phaseZeroCells = Array.from({length: 4}, (_) => {return({wch: 10})})

        worksheet["!cols"] = [
            { wch: 3 },
            ...phaseZeroCells,
            { wch: 20 }

        ];

        const phaseOneRow = Array.from({length: datas.length}, (_) => {return({hpx: 30})})

        worksheet["!rows"] = [
            { hpx: 40 },
            ...phaseOneRow
        ]

        writeFile(workbook, "Элсэгчдийн бие бялдарын үзүүлэлт.xlsx", { compression: true });
    }

    function onSelectedRowsChange(state) {
        setSelectedStudents(state?.selectedRows)
    }
    // ** Function to handle filter
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

    // ** Function to handle per page
    function handlePerPage(e)
    {
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


    function emailModalHandler() {
        setEmailModal(!emailModal)
    }

    function messageModalHandler() {
        setMessageModal(!messageModal)
    }

    function handleModal() {
        setModal(!modal)
    }
    return (
        <Fragment>
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
        <Card>
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
                    Элсэгчдийн бие бялдарын үзүүлэлт
                </h5>
                <div className='d-flex flex-wrap mt-md-0 mt-1'>
					<Button
						color='primary'
						className='d-flex align-items-center px-75 ms-1'
						id='sort_button'
                        disabled={Object.keys(user).length > 0 && (user.permissions.includes('lms-elselt-admission-create')) ? false : true}
						onClick={() => handleModal()}
					>
						<RiEditFill className='me-25' />
						Оноо эрэмбэлэх
					</Button>
				</div>
            </CardHeader>
            <CardBody>
                {/* <Row>
                    <Col>
                    </Col>
                    <Col className='d-flex justify-content-end'>
                        <Button color='primary' className='d-flex align-items-center' onClick={() => excelHandler()}>
                            <FileText className='me-50' size={14}/>
                            <div>
                                Excel татах
                            </div>
                        </Button>
                    </Col>
                </Row> */}
                <Row className='justify-content-start mt-1'>
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
                            value={elseltOption.find((c) => c.id === admId)}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {
                                setAdmId(val?.id || '')
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
                            value={profOption.find((c) => c.id === profId)}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {
                                setProfId(val?.prof_id || '')

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
                <div className='d-flex justify-content-between my-50 mt-1'>
                    <div className='d-flex'>
                        <div className=''>
                            <Button
                                color="primary"
                                disabled={(selectedStudents.length != 0 && user?.permissions.includes('lms-elselt-mail-create')) ? false : true}
                                className="d-flex align-items-center px-75"
                                id="email_button"
                                onClick={() => emailModalHandler()}
                            >
                            <MdMailOutline className="me-25" />
                                Email илгээх
                            </Button>
                            <UncontrolledTooltip target="email_button">
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
                                <BiMessageRoundedError className='me-25'/>
                                Мессеж илгээх
                            </Button>
                            <UncontrolledTooltip target='message_button'>
                                Сонгосон элсэгчид руу мессеж илгээх
                            </UncontrolledTooltip>
                        </div>
                    </div>
                    <div className='px-0'>
                        <Button color='primary' className='d-flex align-items-center px-75' id='excel_button' onClick={() => convert()}>
                            <HiOutlineDocumentReport className='me-25'/>
                            Excel татах
                        </Button>
                        <UncontrolledTooltip target='excel_button'>
                            Доорхи хүснэгтэнд харагдаж байгаа мэдээллийн жагсаалтаар эксел файл үүсгэнэ
                        </UncontrolledTooltip>
                    </div>
                </div>
                <Row className="justify-content-between " >
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
                <div className="react-dataTable react-dataTable-selectable-rows" id='datatableLeftOneRightOne'>
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
                        columns={getColumns(currentPage, rowsPerPage === 'Бүгд' ? 1 : rowsPerPage, total_count, addModalHandler, STATE_LIST, user)}
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
                        style={{ border: '1px solid red' }}
                        defaultSortFieldId={'order_no'}
                    />
                </div>
            </CardBody>
        </Card>
        {modal && <SortModal open={modal} handleModal={handleModal} refreshDatas={getDatas} type={type} editData={editData} />}
    </Fragment>
    )
}

export default Physical

