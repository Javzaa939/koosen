// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

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
    DropdownMenu,
    DropdownItem,
    DropdownToggle,
    UncontrolledButtonDropdown,
    Dropdown
} from 'reactstrap'

import { ChevronDown, Plus, Search, FileText, Grid, Download, PenTool, UploadCloud, File } from 'react-feather'

import { useNavigate } from 'react-router-dom'

import Select from 'react-select'
import classnames from "classnames";

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { useForm, Controller } from "react-hook-form";

import AuthContext from '@context/AuthContext'
import SchoolContext from '@context/SchoolContext'

import { getPagination, ReactSelectStyles, generateLessonYear, level_option } from '@utils'

import { getColumns } from './helpers'

import Addmodal from './Add'

import { useTranslation } from 'react-i18next'
import { downloadCSV, downloadExcel } from '@utils'
import { downloadTemplate } from './downLoadExcel'
import FileModal from '@src/components/FileModal'
import DetailModal from './DetailModal'
import { useSkin } from '@src/utility/hooks/useSkin'

const Register = () => {

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
    const navigate = useNavigate()
    const { skin } = useSkin()

    const { t } = useTranslation()

    const excelColumns = {
        'code': 'Оюутны код',
        'last_name': 'Овог',
        'first_name': 'Нэр',
        'register_num': 'Регистрийн дугаар',
        'profession_name': 'Мэргэжил',
        'group_name': 'Анги',
        'group_level': 'Курс',
    }

    // ** Hook
    const { control, formState: { errors } } = useForm({});

    var values = {
        profession: '',
        join_year: '',
        group: '',
        department: '',
        degree: '',
        status: ''
    }
    const [select_value, setSelectValue] = useState(values)
    const default_page = [10, 15, 50, 75, 100]
    const [modal, setModal] = useState(false)

    const [datas, setDatas] = useState([])
    const [department_option, setDepartmentOption] = useState([])
    const [status_option, setStatusOption] = useState([])
    const [degree_option, setDegree] = useState([])
    const [profession_option, setProfessionOption] = useState([])
    const [groupOption, setGroup] = useState([])
    const [yearOption, setYear] = useState(generateLessonYear(10))
    const [level, setLevel] = useState('')
    const [isPayed, setIsPayed] = useState('')

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1)

    // Эрэмбэлэлт
    const [sortField, setSort] = useState('')

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const [dashBoardOpen, setDashBoardOpen] = useState(false);


    const { Loader, isLoading, fetchData } = useLoader({isFullScreen: true})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({isFullScreen: true})

    const studentApi = useApi().student
    const groupApi = useApi().student.group
    const departmentApi = useApi().hrms.department
    const degreeApi = useApi().settings.professionaldegree
    const professionApi = useApi().study.professionDefinition
    const settingsApi = useApi().settings.studentRegisterType
    const studentPassApi = useApi().studentPass
    const studentRightsApi = useApi().studentRights
    const studentImportApi = useApi().student


    // API
    useEffect(() => {
        getDatas()
    }, [sortField, currentPage, rowsPerPage, level, select_value, isPayed])

    useEffect(
        () =>
        {
            getDegreeOption()
            getProfession()
            getGroup()
            getDepartmentOption()
        },
        [select_value, school_id]
    )

    useEffect(
        () =>
        {
            getStatus()
        },
        []
    )

    // Хөтөлбөрийн багын жагсаалт
    async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get())
        if(success) {
            setDepartmentOption(data)
        }
    }

    // Суралцаж буй хэлбэрийн жагсаалт
    async function getStatus() {
        const { success, data } = await fetchData(settingsApi.get())
        if(success) {
            setStatusOption(data)
        }
    }

    // Боловсролын зэргийн жагсаалт
    async function getDegreeOption() {
        const { success, data } = await fetchData(degreeApi.get())
        if(success) {
            setDegree(data)
        }

    }

    // Мэргэжлийн жагсаалтын getList функц боловсролын зэргээс хамаарч жагсаалтаа авна. Шаардлагагүй үед хоосон string явуулна.
    async function getProfession() {
        const { success, data } = await fetchData(professionApi.getList(select_value?.degree, select_value.department,''))
        if(success) {
            setProfessionOption(data)
        }
    }

    // Ангийн жагсаалт
    async function getGroup() {
        const { success, data } = await fetchData(groupApi.getList(select_value.department, select_value.degree, select_value.profession, select_value.join_year))
        if(success) {
            setGroup(data)
        }
    }

    async function getDatas() {

        var department = select_value?.department
        var profession = select_value?.profession
        var degree = select_value?.degree
        var group = select_value?.group
        var join_year = select_value?.join_year

        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count)
        }

        const { success, data } = await allFetch(studentApi.get(rowsPerPage, currentPage, sortField, searchValue, department, degree, profession, group, join_year, select_value?.status, level, isPayed))
        if(success)
        {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    /* Устгах функц */
	const handleDelete = async(id) => {
        const { success, data } = await fetchData(studentApi.delete(id))
        if(success)
        {
            getDatas()
        }
	};

    /* Password сэргээх функц */
    const changePassModal = async(id) => {
        await fetchData(studentPassApi.changePass(id))
    }

    /* Оюутны эрх хаах/нээх функц */
    const toggleRightsActivation = async(id) => {
        const { success } = await fetchData(studentRightsApi.toggleRightsActivation(id))
        if(success)
        {
            getDatas()
        }
    }

    // ** Function to handle Modal toggle
    const handleModal = () => {
        setModal(!modal)
    }

    const editModal = (student_id) => {
        navigate(`/student/register/${student_id}/detail/`)
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

    // Хуудас солих үед ажиллах хэсэг
	function handlePagination(page) {
		setCurrentPage(page.selected + 1);
	};

    // ** Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value))
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        if (searchValue.length > 0) getDatas()
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
	}, [searchValue]);

     /** excel file аар татуулах датаг backend-ээс авах */
     async function excelDownload(type) {
        var keys = Object.keys(excelColumns)

        const { success, data } = await fetchData(studentApi.download(searchValue, select_value.department, select_value.degree, select_value.profession, select_value.group, select_value.join_year, select_value?.status, level))
        if (success) {
            data.forEach((cdata) => {
                for(let key in cdata) {
                    if (!keys.includes(key)) {
                        delete cdata[key]
                    }
                }
            })
            if (type === 'excel') {
                downloadExcel(data, excelColumns, 'Оюутны жагсаалт')
            } else if (type === 'csv') {
                downloadCSV(data, excelColumns, 'Оюутны жагсаалт')
            }
        } else {
            addToast({
                text: "Файл татахад алдаа гарлаа",
                type: "warning"
            })
        }
    }

    const toggle = () => setDropdownOpen((prevState) => !prevState);
    const toggleExport = () => {setExportDropdownOpen((prevState) => !prevState)}
    const toggleDashboard = () => setDashBoardOpen((prevState) => !prevState)

    const [open_file, setFileModal] = useState(false)
    const [file, setFile] = useState(false)
    const [errorDatas, setErrorDatas] = useState({})
    const [detailDatas, setDetailDatas] = useState({})
    const [showModal, setShowModal] = useState(false)
    const [file_name, setFileName] = useState('')

    // Хуучин дүн файл нээх
    function handleFileModal() {
        setFileModal(!open_file)
        setFile('')
    }

    // Оруулах датаны жагсаалт харуулах модал
    const handleShowDetailModal = () => {
        setShowModal(!showModal)
    }

    async function onSubmit() {
        if (file) {
            const formData = new FormData()
            formData.append('file', file)

            const { success, data }  = await fetchData(studentImportApi.postImportStudent(formData))
            console.log(success)
            console.log(data)
            if (success) {

                handleFileModal()
                handleShowDetailModal()
                if (data?.file_name) {
                    setFileName(data?.file_name)
                    delete data['file_name']
                }

                if (data?.all_error_datas) {
                    setErrorDatas(data?.all_error_datas)
                    delete data['all_error_datas']
                }
                setDetailDatas(data)
            }
        }
    }

    function staticExcelHandler() {

        var excelUrl = '/assets/oyutan_zagwar.xlsx'

        const link = document.createElement('a');
        link.href = excelUrl;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
    }

    return (
        <Fragment>
            <Card>
            {open_file &&
                <FileModal
                    isOpen={open_file}
                    handleModal={handleFileModal}
                    isLoading={isLoading}
                    file={file}
                    setFile={setFile}
                    title="Оюутны мэдээлэл оруулах"
                    fileAccept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                    extension={['xlsx']}
                    onSubmit={onSubmit}
                />
            }
            {
                showModal &&
                    <DetailModal
                        isOpen={showModal}
                        handleModal={handleShowDetailModal}
                        datas={detailDatas}
                        file_name={file_name}
                        errorDatas={errorDatas}
                    />

            }
                {isLoading && Loader}
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Оюутны бүртгэл')}</CardTitle>
                    <div className='d-flex flex-wrap gap-1 mt-md-0 mt-1'>
                        <Button
                            color='primary'
                            onClick={() => toggleDashboard()}
                        >
                            <File size={15} />
                            <span className='align-middle ms-50'>{t('Тайлан')}</span>
                        </Button>
                        <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                        {/* <Dropdown isOpen={dropdownOpen} toggle={toggle} disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-student-register-read')  && school_id? false : true}> */}
                            <DropdownToggle color={skin === 'light' ? 'dark' : 'light'} className='' caret outline>
                                <PenTool size={15} />
                                <span className='align-middle ms-50'>Загвар</span>
                            </DropdownToggle>
                            <DropdownMenu >
                                <DropdownItem header className='text-wrap'>
                                    {/* Загвар татаж оюутнуудаа бүртгээд Оруулах товчин дээр дарж оюутнуудын мэдээллийг системд бүртгэнэ үү. */}
                                    Эксэл файлаар оюутан бүртгэх хэсэг
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem
                                    className='w-100'
                                    onClick={() => staticExcelHandler()}
                                    // onClick={() => downloadTemplate(department_option, groupOption)}
                                >
                                    <Download size={15} />
                                    <span className='align-middle ms-50'>Татах</span>
                                </DropdownItem>
                                <DropdownItem className='w-100' onClick={() => handleFileModal()}>
                                    <UploadCloud size={15} />
                                    <span className='align-middle ms-50' >Оруулах</span>
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        {/* <Dropdown isOpen={exportDropdownOpen} toggle={toggleExport}> */}
                        <Dropdown isOpen={exportDropdownOpen} toggle={toggleExport} disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-student-register-read')  && school_id ? false : true}>
                            <DropdownToggle
                                color='secondary'
                                className={``}
                                title='Та оюутны жагсаалт экселээр татахын тулд салбар сургууль сонгох шаардлагатайг анхаарна уу.'
                                style={{ cursor: Object.keys(user).length > 0 && user.permissions.includes('lms-student-register-read')  && school_id ? 'pointer' : 'not-allowed' }} caret outline>
                                <Download size={15} />
                                <span className='align-middle ms-50'>Export</span>
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem className='w-100' onClick={() => excelDownload('csv')}>
                                    <FileText size={15} />
                                    <span className='align-middle ms-50'>CSV</span>
                                </DropdownItem>
                                <DropdownItem className='w-100' onClick={() => excelDownload('excel')}>
                                    <Grid size={15} />
                                    <span className='align-middle ms-50' >Excel</span>
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <Button
                            color='primary'
                            onClick={() => handleModal()}
                            className=""
                            disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-student-register-create')  && school_id? false : true}
                        >
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className="justify-content-start mx-0 mt-1 mb-1" sm={12}>
                    <Col sm={6} lg={3} >
                        <Label className="form-label" for="department">
                            {t('Хөтөлбөрийн баг')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="department"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="department"
                                        id="department"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.department })}
                                        isLoading={isLoading}
                                        placeholder={`-- Сонгоно уу --`}
                                        options={department_option || []}
                                        value={department_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            if (val?.id) {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        department: val?.id
                                                    }
                                                })
                                            } else {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        department: ''
                                                    }
                                                })
                                            }
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col sm={6} lg={3}>
                        <Label className="form-label" for="degree">
                            {t("Боловсролын зэрэг")}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="degree"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="degree"
                                        id="degree"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.degree })}
                                        isLoading={isLoading}
                                        placeholder={`-- Сонгоно уу --`}
                                        options={degree_option || []}
                                        value={degree_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            if (val?.id) {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        degree: val?.id
                                                    }
                                                })
                                            } else {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        degree: ''
                                                    }
                                                })
                                            }
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.degree_name_code}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col sm={6} lg={3}>
                        <Label className="form-label" for="profession">
                            {t('Мэргэжил')}
                        </Label>
                        <Select
                            name="profession"
                            id="profession"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select', { 'is-invalid': errors.profession })}
                            isLoading={isLoading}
                            placeholder={`-- Сонгоно уу --`}
                            options={profession_option || []}
                            value={profession_option.find((c) => c.id === select_value.profession)}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {
                                if (val?.id) {
                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            profession: val?.id
                                        }
                                    })
                                } else {
                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            profession: ''
                                        }
                                    })
                                }
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.full_name}
                        />
                    </Col>
                    <Col sm={6} lg={3}>
                        <Label className="form-label" for="join_year">
                            {t("Элссэн хичээлийн жил")}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=''
                            name="join_year"
                            render={({ field: { value, onChange} }) => {
                                return (
                                    <Select
                                        name="join_year"
                                        id="join_year"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.join_year })}
                                        isLoading={isLoading}
                                        placeholder={`-- Сонгоно уу --`}
                                        options={yearOption || []}
                                        value={yearOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            if (val?.id) {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        join_year: val?.id
                                                    }
                                                })
                                            } else {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        join_year: ''
                                                    }
                                                })
                                            }
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                )
                            }}
                        ></Controller>
                    </Col>
                    <Col sm={6} lg={3} className='mt-1'>
                        <Label className="form-label" for="group">
                            {t("Дамжаа")}
                        </Label>
                        <Select
                            name="group"
                            id="group"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select', { 'is-invalid': errors.group })}
                            isLoading={isLoading}
                            placeholder={`-- Сонгоно уу --`}
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
                    <Col sm={6} md={3} className='mt-1'>
                        <Label className="form-label" for="status">
                            {t("Төлөв")}
                        </Label>
                        <Select
                            name="status"
                            id="status"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={`-- Сонгоно уу --`}
                            options={status_option || []}
                            value={status_option.find((c) => c.id === select_value.status)}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {
                                if (val?.id) {
                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            status: val?.id
                                        }
                                    })
                                } else {
                                    setSelectValue(current => {
                                        return {
                                            ...current,
                                            status: ''
                                        }
                                    })
                                }
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col sm={6} md={3} className='mt-1'>
                        <Label className="form-label" for="level">
                            {t("Курс")}
                        </Label>
                        <Select
                            name="level"
                            id="level"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={`-- Сонгоно уу --`}
                            options={level_option() || []}
                            value={level_option().find((c) => c.id === level)}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {
                                if (val?.id) {
                                    setLevel(val?.id)
                                } else {
                                    setLevel('')
                                }
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col sm={6} md={3} className='mt-1'>
                        <Label className="form-label" for="isPayed">
                            {t("Тухайн хичээлийн жилийн систем ашиглалтын төлбөр төлсөн эсэх")}
                        </Label>
                        <Select
                            name="isPayed"
                            id="isPayed"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={`-- Сонгоно уу --`}
                            options={[
                                {value: 1, label: t('Тийм')},
                                {value: 2, label: t('Үгүй')},
                            ]}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => setIsPayed(val.value)}
                            styles={ReactSelectStyles}
                        />
                    </Col>
                </Row>
                <Row className='justify-content-between mx-0'>
                    <Col className='d-flex align-items-center justify-content-start mt-1' md={6} sm={12}>
                        <Col md={2} sm={3} className='pe-1'>
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
                            <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                        </Col>
                    </Col>
                    <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={6} sm={12}>
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
                <div className='react-dataTable react-dataTable-selectable-rows' id='datatableLeftTwoRightOne' >
                    <DataTable
                        noHeader
                        pagination
                        paginationServer
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
                        sortIcon={<ChevronDown size={10} />}
                        columns={getColumns(currentPage, rowsPerPage, total_count, editModal, handleDelete, user, changePassModal, toggleRightsActivation)}
                        paginationPerPage={rowsPerPage}
                        paginationDefaultPage={currentPage}
                        paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                        data={datas}
                        fixedHeader
                        fixedHeaderScrollHeight='62vh'
                    />
                </div>
            </Card>
            {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} />}
        </Fragment>
    )
}

export default Register;

