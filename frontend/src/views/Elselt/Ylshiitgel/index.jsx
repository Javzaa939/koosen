// ** React Imports
import {
        Row,
        Col,
        Card,
        Input,
        Label,
        Button,
        CardTitle,
        CardHeader,
        Spinner,
        UncontrolledTooltip } from 'reactstrap'

import {
        Fragment,
        useState,
        useEffect,
         useContext } from 'react'

import {
        getPagination,
        ReactSelectStyles } from '@utils'

import { HiOutlineDocumentReport } from "react-icons/hi";
import { BiMessageRoundedError } from "react-icons/bi";
import { ChevronDown, Search } from 'react-feather'
import { utils, writeFile } from 'xlsx-js-style';
import { MdMailOutline } from "react-icons/md";
import { useTranslation } from 'react-i18next'
import { RiEditFill } from "react-icons/ri";
import { getColumns } from './helpers';

import DataTable from 'react-data-table-component'
import moment from 'moment';
import classnames from "classnames";
import Select from 'react-select'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from "@context/AuthContext"
import useUpdateEffect from '@hooks/useUpdateEffect';

import EmailModal from '../User/EmailModal';
import MessageModal from '../User/MessageModal';
import StateModal from './StateModal';

const ElseltYlshiitgel = () => {

	const { user } = useContext(AuthContext)

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20)
    const [searchValue, setSearchValue] = useState("");
	const [datas, setDatas] = useState([]);

    const [profOption, setProfession] = useState([])
    const [profession_id, setProfession_id] = useState('')
    const [admop, setAdmop] = useState([])
    const [adm, setAdm] = useState('')
    const [selectedStudents, setSelectedStudents] = useState([])
    const [state, setState] = useState('')

	const elseltApi = useApi().elselt.justice
    const admissionYearApi = useApi().elselt
    const professionApi = useApi().elselt.profession

    // email modal
    const [emailModal, setEmailModal] = useState(false)
    // message modal
    const [messageModal, setMessageModal] = useState(false)
    // state modal
    const [stateModal,setStateModel] = useState(false);

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    // Translate
    const { t } = useTranslation()

    const default_page = ['Бүгд', 10, 20, 50, 75, 100]

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

    // Нийт хуудасны тоо
    const [pageCount, setPageCount] = useState(1)

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({isFullScreen: false});
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: false})

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

	/* Жагсаалтын дата авах функц */
	async function getDatas() {
        const {success, data} = await allFetch(elseltApi.get(rowsPerPage, currentPage, sortField, searchValue, state, adm, profession_id))
        if(success) {
            setTotalCount(data?.count)
            setDatas(data?.results)
            console.log("profession_data",data)

            // Нийт хуудасны тоо
            var cpage_count = Math.ceil(data?.count / rowsPerPage === 'Бүгд' ? 1 : rowsPerPage)
            setPageCount(cpage_count)
        }
	}

    // Хөтөлбөрийн жагсаалт авах
    async function getProfession() {
        const { success, data } = await fetchData(professionApi.getList(adm))
        if (success) {
            setProfession(data)
        }
    }

    // Элсэлтийн жагсаалт авах
    async function getAdmissionYear() {
        const { success, data } = await fetchData(admissionYearApi.getAll())
        if (success) {
            setAdmop(data)
        }
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
    }, [sortField, currentPage, rowsPerPage, searchValue, adm, profession_id, state])

    useEffect(() => {
        getAdmissionYear()
        getProfession()
    }, [])

    useUpdateEffect(() => {
        getProfession()
    }, [adm])



    // ** Function to handle per page
    function handlePerPage(e)
    {
        setRowsPerPage(e.target.value === 'Бүгд' ? e.target.value : parseInt(e.target.value))
    }

    function onSelectedRowsChange(state) {
        setSelectedStudents(state?.selectedRows)
    }

    // имэйл илгээх функц
    function emailModalHandler() {
        setEmailModal(!emailModal)
    }

    // Мессеж бичих функц
    function messageModalHandler() {
        setMessageModal(!messageModal)
    }

    // Эрүүгийн хариуцлага хүлээж байсан эсэх төлөв солих
    function stateModalHandler() {
        setStateModel(!stateModal)
    }
    function convert(){
        const mainData = datas.map((data, idx) => {
            return(
                {
                    '№': idx + 1,
                    'Овог': data?.user?.last_name || '',
                    'Нэр': data?.user?.first_name || '',
                    'РД': data?.user?.register || '',
                    'Нас': data?.user_age || '',
                    'Голч дүн': data?.userinfo?.gpa || '',
                    'Хүйс': data?.gender_name || '',
                    'Имейл': data?.user?.email || '',
                    'Яаралтай холбогдох': data?.user?.parent_mobile || '',
                    'Бүртгүүлсэн огноо': moment(data?.created_at).format('YYYY-MM-DD HH:SS:MM') || '',
                    'Төлөв': data?.justice_state_name,
                    'Tайлбар': data?.justice_description || '',
                }
            )
        })

        const combo = [
            // ...header,
            ...mainData
        ]

        const worksheet = utils.json_to_sheet(combo);

        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Эрүүгийн хариуцлага");

        const staticCells = [
            '№',
            'Овог',
            'Нэр',
            'РД',
            'Нас',
            'Голч дүн',
            'Хүйс',
            'Имейл',
            'Яаралтай холбогдох',
            'Бүртгүүлсэн огноо',
            'Төлөв',
            'Tайлбар',
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
        const sendCol = 20;

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
            { wch: 10 },
            { wch: 10 },
            { wch: 20 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 25 },
        ];

        const phaseOneRow = Array.from({length: datas.length}, (_) => {return({hpx: 30})})

        worksheet["!rows"] = [
            { hpx: 40 },
            ...phaseOneRow
        ]

        writeFile(workbook, "Эрүүгийн хариуцлага.xlsx", { compression: true });
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
            <StateModal
                stateModalHandler={stateModalHandler}
                stateModal={stateModal}
                selectedStudents={selectedStudents}
                stateop={stateop}
                getDatas={getDatas}
            />
            {isLoading && Loader}
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom ">
					<CardTitle tag="h4">{t('Эрүүгийн хариуцлага хүлээж байсан эсэхийн бүртгэл')}</CardTitle>
                </CardHeader>
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
                                value={stateop.find((c) => c?.id === state)}
                                noOptionsMessage={() => t('Хоосон байна.')}
                                onChange={(val) => {
                                    setState(val?.id || '')
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => option.name}
                            />
                    </Col>
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
                <div className='d-flex justify-content-between my-50 mt-1'>
                    <div className='d-flex justify-content-between' style={{ width: "100%", marginRight: "13px"}}>
                        <div className='d-flex'>
                            <div className='px-1'>
                                <Button
                                    color='primary'
                                    disabled={(selectedStudents.length != 0 && user.permissions.includes('lms-elselt-admission-approve')) ? false : true}
                                    className='d-flex align-items-center px-75'
                                    id='state_button'
                                    onClick={() => stateModalHandler()}
                                >
                                    <RiEditFill className='me-25'/>
                                    Төлөв солих
                                </Button>
                                <UncontrolledTooltip target='state_button'>
                                    Доорхи сонгосон элсэгчдийн төлөвийг нэг дор солих
                                </UncontrolledTooltip>
                            </div>
                            <div className='px-1'>
                                <Button
                                    color='primary'
                                    disabled={(selectedStudents.length != 0 && user.permissions.includes('lms-elselt-mail-create')) ? false : true}
                                    className='d-flex align-items-center px-75'
                                    id='email_button'
                                    onClick={() => emailModalHandler()}
                                >
                                    <MdMailOutline className='me-25'/>
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
                                    <BiMessageRoundedError className='me-25'/>
                                    Мессеж илгээх
                                </Button>
                                <UncontrolledTooltip target='message_button'>
                                    Сонгосон элсэгчид руу мессеж илгээх
                                </UncontrolledTooltip>
                            </div>
                        </div>
                        <div>
                            <Button color='primary' className='d-flex align-items-center px-75' id='excel_button' onClick={() => convert()}>
                                <HiOutlineDocumentReport className='me-25'/>
                                Excel
                            </Button>
                            <UncontrolledTooltip target='excel_button'>
                                Доорхи хүснэгтэнд харагдаж байгаа мэдээллийн жагсаалтаар эксел файл үүсгэнэ
                            </UncontrolledTooltip>
                        </div>
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
                        columns={getColumns(currentPage, rowsPerPage === 'Бүгд' ? 1 : rowsPerPage, total_count, user)}
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
        </Fragment>
    )
}

export default ElseltYlshiitgel;