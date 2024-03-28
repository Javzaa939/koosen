// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner, UncontrolledTooltip } from 'reactstrap'

import { ChevronDown, Search } from 'react-feather'

import DataTable from 'react-data-table-component'

import moment from 'moment';

import classnames from "classnames";

import { useTranslation } from 'react-i18next'

import Select from 'react-select'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import AuthContext from "@context/AuthContext"

import { getPagination, ReactSelectStyles } from '@utils'

import { getColumns } from './helpers';
import { useNavigate } from 'react-router-dom';

import { utils, writeFile } from 'xlsx-js-style';

import { HiOutlineDocumentReport } from "react-icons/hi";
import { BiMessageRoundedError } from "react-icons/bi";
import { CiMail } from "react-icons/ci";
import { MdMailOutline } from "react-icons/md";
import { RiEditFill } from "react-icons/ri";
import EditModal from './Edit';
import StateModal from './StateModal';
import DescModal from './DescModal';
import EmailModal from './EmailModal';
import MessageModal from './MessageModal';

// import Addmodal from './Add'

const ElseltUser = () => {

	const { user } = useContext(AuthContext)

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20)

    const navigate = useNavigate()

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    // Translate
    const { t } = useTranslation()

    const default_page = ['Бүгд', 10, 20, 50, 75, 100]

	const [searchValue, setSearchValue] = useState("");
	const [datas, setDatas] = useState([]);
    const [modalDesc, setDescModal] = useState(false)

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

    // Нийт хуудасны тоо
    const [pageCount, setPageCount] = useState(1)

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false});
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

	// Modal
	const [modal, setModal] = useState(false);
    const [edit_modal, setEditModal] = useState(false)

    const [editData, setEditData] = useState({})

    const [profOption, setProfession] = useState([])
    const [profession_id, setProfession_id] = useState('')

    const [admop, setAdmop] = useState([])
    const [adm, setAdm] = useState('')

    const [unit1op, setUnit1op] = useState([])
    const [unit1, setUnit1] = useState('')

    const [selectedStudents, setSelectedStudents] = useState([])
    const [stateModal, setStateModal] = useState(false)

    const [emailModal, setEmailModal] = useState(false)
    const [messageModal, setMessageModal] = useState(false)

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

    const stateop = [
        {
            'id': 1,
            'name': 'БҮРТГҮҮЛСЭН'
        },
        {
            'id': 2,
            'name': 'ТЭНЦСЭН'
        },
        {
            'id': 3,
            'name': 'ТЭНЦЭЭГҮЙ'
        }
    ]

    const infop = [
        {
            'id': 1,
            'name': 'ЗӨВ ОРУУЛСАН'
        },
        {
            'id': 2,
            'name': 'ЗАСАГДСАН'
        },
    ]
    const [state, setState] = useState('')
    const [gpa_state, setGpaState] = useState('')

    const [gender, setGender] = useState('')

	const elseltApi = useApi().elselt.admissionuserdata
    const admissionYearApi = useApi().elselt
    const unit1Api = useApi().hrms.unit1
    const professionApi = useApi().elselt.profession

    // Хөтөлбөрийн жагсаалт авах
    async function getProfession() {
        const { success, data } = await fetchData(professionApi.getList(adm))
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

    async function getUnit1() {
        const { success, data } = await fetchData(unit1Api.get())
        if (success) {
            setUnit1op(data)
        }
	}

	/* Модал setState функц */
	const handleDescModal = (row) => {
		setDescModal(!modal)
        setEditData(row)
	}

	/* Устгах функц */
	const handleDelete = async(id) => {
        const {success} = await fetchData(elseltApi.delete(id))
		if(success) {
            getDatas()
		}
	};

	/* Жагсаалтын дата авах функц */
	async function getDatas() {

        const {success, data} = await allFetch(elseltApi.get(rowsPerPage, currentPage, sortField, searchValue, adm, profession_id, unit1, gender, state, gpa_state))
        if(success) {
            setTotalCount(data?.count)
            setDatas(data?.results)

            // Нийт хуудасны тоо
            var cpage_count = Math.ceil(data?.count / rowsPerPage === 'Бүгд' ? 1 : rowsPerPage)
            setPageCount(cpage_count)
        }
	}

	const editModal = (row={}) => {
        /** NOTE Засах гэж буй хичээлийн стандартын id-г авна */
        setEditModal(!edit_modal)
        setEditData(row)
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

    // Хуудас солих үед ажиллах хэсэг
	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

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
    }, [sortField, currentPage, rowsPerPage, searchValue, adm, profession_id, unit1, gender, state, gpa_state])

    useEffect(() => {
        getAdmissionYear()
        getProfession()
        getUnit1()
    }, [])

    useEffect(() => {
        getProfession()
    }, [adm])

    // ** Function to handle per page
    function handlePerPage(e)
    {
        setRowsPerPage(e.target.value === 'Бүгд' ? e.target.value : parseInt(e.target.value))
    }

    function handleRowClicked(row) {
        window.open(`elselt/user/${row.id}`)
    }

    function convert(){
        const mainData = datas.map((data, idx) => {
            return(

                {
                    '№': idx + 1,
                    'Овог': data?.user?.last_name || '',
                    'Нэр': data?.user?.first_name || '',
                    'РД': data?.user?.register || '',
                    'Хүйс': data?.gender_name || '',
                    'Имейл': data?.user?.email || '',
                    'Утасны дугаар': data?.user?.mobile || '',
                    'Яаралтай холбогдох': data?.user?.parent_mobile || '',
                    'Хөтөлбөр': data?.profession || '',
                    'Бүртгүүлсэн огноо': moment(data?.created_at).format('YYYY-MM-DD HH:SS:MM') || '',
                    'Төгссөн сургууль': data?.userinfo?.graduate_school || '',
                    'Мэргэжил': data?.userinfo?.graduate_profession || '',
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
        utils.book_append_sheet(workbook, worksheet, "Элсэгчдийн мэдээлэл");

        const staticCells = [
            '№',
            'Овог',
            'Нэр',
            'РД',
            'Хүйс',
            'Имейл',
            'Утасны дугаар',
            'Яаралтай холбогдох',
            'Хөтөлбөр',
            'Бүртгүүлсэн огноо',
            'Төгссөн сургууль',
            'Мэргэжил',
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
        const sendCol = 17;

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
            { wch: 25 },
            { wch: 10 },
            { wch: 10 },
            { wch: 25 },
            { wch: 10 },
            { wch: 25 },
            { wch: 25 },
            { wch: 10 },
            { wch: 5 },
            { wch: 25 },
            { wch: 25 },
            { wch: 25 },
            { wch: 15 },
        ];

        const phaseOneRow = Array.from({length: datas.length}, (_) => {return({hpx: 30})})

        worksheet["!rows"] = [
            { hpx: 40 },
            ...phaseOneRow
        ]

        writeFile(workbook, "Элсэгчдийн мэдээлэл.xlsx", { compression: true });
    }

    function onSelectedRowsChange(state) {
        setSelectedStudents(state?.selectedRows)
    }

    function stateModalHandler() {
        setStateModal(!stateModal)
    }

    function emailModalHandler() {
        setEmailModal(!emailModal)
    }

    function messageModalHandler() {
        setMessageModal(!messageModal)
    }

	return (
		<Fragment>
            <StateModal
                getDatas={getDatas}
                stateModalHandler={stateModalHandler}
                stateModal={stateModal}
                selectedStudents={selectedStudents}
                stateop={stateop}
            />
            <EmailModal
                emailModalHandler={emailModalHandler}
                emailModal={emailModal}
            />
            <MessageModal
                messageModalHandler={messageModalHandler}
                messageModal={messageModal}
            />
            {isLoading && Loader}
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom m-auto">
					<CardTitle tag="h4">{t('Элсэгчдийн жагсаалт')}</CardTitle>
                </CardHeader>
                <Row className='justify-content-start mx-0 mt-1'>
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
                    <Col sm={6} lg={3} >
                        <Label className="form-label" for="unit1">
                            {t('Харьяалал')}
                        </Label>
                            <Select
                                name="unit1"
                                id="unit1"
                                classNamePrefix='select'
                                isClearable
                                className={classnames('react-select')}
                                isLoading={isLoading}
                                placeholder={t('-- Сонгоно уу --')}
                                options={unit1op || []}
                                value={unit1op.find((c) => c.id === unit1)}
                                noOptionsMessage={() => t('Хоосон байна.')}
                                onChange={(val) => {
                                    setUnit1(val?.id || '')
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => option.name}
                            />
                    </Col>
                </Row>
                <Row className='justify-content-start mx-0 mt-1'>
                    <Col md={3} sm={6} xs={12} >
                        <Label className="form-label" for="state">
                            {t('Төлөв')}
                        </Label>
                            <Select
                                name="state"
                                id="state"
                                classNamePrefix='select'
                                isClearable
                                className={classnames('react-select')}
                                isLoading={isLoading}
                                placeholder={t('-- Сонгоно уу --')}
                                options={stateop || []}
                                value={stateop.find((c) => c.id === state)}
                                noOptionsMessage={() => t('Хоосон байна.')}
                                onChange={(val) => {
                                    setState(val?.id || '')
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => option.name}
                            />
                    </Col>
                    <Col md={3} sm={6} xs={12} >
                        <Label className="form-label" for="state">
                            {t('Мэдээллийн төлөв')}
                        </Label>
                            <Select
                                name="state"
                                id="state"
                                classNamePrefix='select'
                                isClearable
                                className={classnames('react-select')}
                                isLoading={isLoading}
                                placeholder={t('-- Сонгоно уу --')}
                                options={infop || []}
                                value={infop.find((c) => c.id === gpa_state)}
                                noOptionsMessage={() => t('Хоосон байна.')}
                                onChange={(val) => {
                                    setGpaState(val?.id || '')
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => option.name}
                            />
                    </Col>
                </Row>
                <div className='d-flex justify-content-between my-50 mt-1'>
                    <div className='d-flex'>
                        <div className='px-1'>
                            <Button color='primary' disabled={selectedStudents.length == 0} className='d-flex align-items-center px-75' id='state_button' onClick={() => stateModalHandler()}>
                                <RiEditFill className='me-25'/>
                                Төлөв солих
                            </Button>
                            <UncontrolledTooltip target='state_button'>
                                Доорхи сонгосон оюутнуудын төлөвийг нэг дор солих
                            </UncontrolledTooltip>
                        </div>
                        <div className='px-1'>
                            <Button color='primary' disabled className='d-flex align-items-center px-75' id='email_button' onClick={() => emailModalHandler()}>
                            {/* <Button color='primary' disabled={selectedStudents.length == 0} className='d-flex align-items-center px-75' id='email_button' onClick={() => emailModalHandler()}> */}
                                <MdMailOutline className='me-25'/>
                                Email илгээх
                            </Button>
                            <UncontrolledTooltip target='email_button'>
                                Сонгосон оюутнууд руу имейл илгээх
                            </UncontrolledTooltip>
                        </div>
                        <div className='px-1'>
                            <Button color='primary' disabled className='d-flex align-items-center px-75' id='message_button' onClick={() => messageModalHandler()}>
                            {/* <Button color='primary' disabled={selectedStudents.length == 0} className='d-flex align-items-center px-75' id='message_button' onClick={() => messageModalHandler()}> */}
                                <BiMessageRoundedError className='me-25'/>
                                Мессеж илгээх
                            </Button>
                            <UncontrolledTooltip target='message_button'>
                                Сонгосон оюутнууд руу мессеж илгээх
                            </UncontrolledTooltip>
                        </div>
                    </div>
                    <div className='px-1'>
                        <Button color='primary' className='d-flex align-items-center px-75' id='excel_button' onClick={() => convert()}>
                            <HiOutlineDocumentReport className='me-25'/>
                            Excel
                        </Button>
                        <UncontrolledTooltip target='excel_button'>
                            Доорхи хүснэгтэнд харагдаж байгаа мэдээллийн жагсаалтаар эксел файл үүсгэнэ
                        </UncontrolledTooltip>
                    </div>
                </div>
                <Row className="justify-content-between mx-0" >
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
                <div className="react-dataTable react-dataTable-selectable-rows">
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
                        print='true'
                        theme="solarized"
                        onSort={handleSort}
                        columns={getColumns(currentPage, rowsPerPage === 'Бүгд' ? 1 : rowsPerPage, total_count, editModal, handleDelete, user, handleRowClicked, handleDescModal)}
                        sortIcon={<ChevronDown size={10} />}
                        paginationPerPage={rowsPerPage === 'Бүгд' ? 1 : rowsPerPage}
                        paginationDefaultPage={currentPage}
                        data={datas}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage === 'Бүгд' ? total_count : rowsPerPage, total_count)}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                        selectableRows
                        onSelectedRowsChange={(state) => onSelectedRowsChange(state)}
                        direction="auto"
                        defaultSortFieldId={'created_at'}
                        style={{ border: '1px solid red' }}
                    />
                </div>
            </Card>
            {
                edit_modal &&
                <EditModal
                    open={edit_modal}
                    rowData={editData}
                    handleModal={() => {
                        setEditModal(!edit_modal)
                        setEditData({})
                    }}
                    refreshDatas={getDatas}
                />
            }
            {
                modalDesc
                &&
                <DescModal
                    open={modalDesc}
                    rowData={editData}
                    handleModal={() => {
                        setDescModal(!modalDesc)
                        setEditData({})
                    }}
                    refreshDatas={getDatas}
                />

            }
        </Fragment>
    )
}

export default ElseltUser;