// ** React Imports
import { Fragment, useState, useEffect, useRef } from 'react'

import {
    Card,
    TabContent,
    Nav,
    NavItem,
    NavLink,
    CardHeader,
    CardTitle,
    Button,
    Label,
    Col
} from 'reactstrap'

import { Printer, FileText, Download, RefreshCcw } from 'react-feather'
import { AlertCircle } from 'react-feather'

import FileModal from '@lms_components/FileModal'
import Select from 'react-select'
import useLoader from '@hooks/useLoader';
import useApi from '@hooks/useApi';
import useModal from "@hooks/useModal";
import classnames from "classnames";

import { useNavigate } from "react-router-dom"
import  useUpdateEffect  from '@hooks/useUpdateEffect'
import { useTranslation } from "react-i18next";
import { ReactSelectStyles } from '@utils'
import { utils, writeFile } from 'xlsx-js-style';

import Class from './Class'
import Lesson from './Lesson'
import Student from './Student'
import DetailModal from './DetailModal';

// import LessonV2 from './LessonV2';
import PrintModal from './PrintModal';

const KIND_ANGI = 1
const KIND_HICHEEL = 2
const KIND_OYUTAN = 3

const AlertComponent = () => {
    return(
        <div className='mt-50'>
            <AlertCircle color="#28bcf7" size={15}/>
            <Label className="ms-1">{`Файл зөвхөн хичээлүүдийн кодыг агуулна.`}</Label>
        </div>
    )
}

const AlertGroupComponent = () => {
    return(
        <div>
            <AlertCircle color="#28bcf7" size={15}/>
            <Label className="ms-1">{`Та заавал ангиа сонгоно уу.`}</Label>
        </div>
    )
}

const AdditionalComponent = (props) => {

    const {
        setChosenGroup,
        select_value,
        setSelectValue,
        groupOption,
        AlertGroupComponent
    } = props

    const { t } = useTranslation()

    return(
        <Col>
            <Label className="form-label" for="group">
                {t('Анги')}
            </Label>
            <Select
                name="group"
                id="group"
                classNamePrefix='select'
                isClearable
                className={classnames('react-select')}
                placeholder={t('-- Сонгоно уу --')}
                options={groupOption || []}
                value={select_value && groupOption.find((c) => c.id === select_value)}
                noOptionsMessage={() => t('Хоосон байна.')}
                onChange={(val) => {
                    if(!val){
                        setSelectValue([])
                    } else {
                        setSelectValue(current => {
                            return {
                                ...current,
                                group: val?.id || '',
                            }
                        });
                        setChosenGroup(val?.id)
                    }
                }}
                styles={ReactSelectStyles}
                getOptionValue={(option) => option.id}
                getOptionLabel={(option) => option.name}
            />
            <AlertGroupComponent/>
        </Col>
    )
}

const GradeList = () => {
    const navigate = useNavigate()

    const { t } = useTranslation()

    const printValues = useRef({
        'chosenYear': null,
        'chosenSeason': null,
        'group': false,
    })

    /**
     * navbar section changing
     */
    const [active, setActive] = useState(1)
    const [component, setComponent] = useState('')

    const [open_file, setFileModal] = useState(false)
    const [open_filev2, setFileModalV2] = useState(false)
    const [file, setFile] = useState(false)
    const [fileV2, setFileV2] = useState(false)
    const [ mainData, setMainData ] = useState([])
    const [ chosenGroup, setChosenGroup ] = useState('')
    const [ lessonOption, setLessonOption ] = useState([])
    const [ studentOption, setStudentOption ] = useState([])

    const [detailDatas, setDetailDatas] = useState({})
    const [pmodal, setPmodal] = useState()
    const [errorDatas, setErrorDatas] = useState({})
    const [file_name, setFileName] = useState('')
    const [group_name, setGroupName] = useState('')

    const [studentSectionData, setStudentSectionData] = useState()
    const [ chosenGroupStudent, setChosenGroupStudent ] = useState('')

    const [showModal, setShowModal] = useState(false)
    const [ yearAndSeason, setYearAndSeason ] = useState(null)

    const [groupOption, setGroup] = useState([])
    const [chosenClass, setChosenClass] = useState()
    const [select_value, setSelectValue] = useState([])

    const { Loader, isLoading, fetchData } = useLoader({})
    const { showWarning } = useModal()

    const scoreApi = useApi().score.register
    const lessonApi = useApi().study.lessonStandart
    const settingsApi = useApi().activeYearAndSeason
    const groupApi = useApi().student.group

    const nav_menus = [
        {
            active_id: KIND_ANGI,
            name: t('Анги'),
            component: <Class setMainData={setMainData} setChosenGroup={setChosenGroup} setFileName={setGroupName} yearAndSeason={yearAndSeason} printValues={printValues} />
        },
        {
            active_id: KIND_HICHEEL,
            name: t('Хичээл'),
            component: <Lesson setMainData={setMainData} setChosenGroup={setChosenGroup}/>
        },
        {
            active_id: KIND_OYUTAN,
            name: t('Оюутан'),
            component: <Student setMainData={setMainData} setChosenGroup={setChosenGroup} chosenGroupStudent={chosenGroupStudent} setChosenGroupStudent={setChosenGroupStudent} setFileName={setGroupName} setStudentSectionData={setStudentSectionData}/>
        },
    ]

    async function getActiveYearAndSeason()
    {
        const { success, data } = await fetchData(settingsApi.get())
        if (success)
        {
            setYearAndSeason(data)
        }
    }

    async function getGroup(){
        const { success, data } = await fetchData(groupApi.getList())
        if(success) {
            setGroup(data)
        }
    }

    useEffect(() => {
        getGroup()
    },[])

    useEffect(
        () =>
        {
            getActiveYearAndSeason()
        },
        []
    )

    useEffect(() => {
        if (yearAndSeason)
        {
            var check = nav_menus.find(menus => menus.active_id == active)
            setComponent(check.component)
        }
    }, [active, yearAndSeason, chosenGroupStudent])

    const toggle = (active_id) => {
        setActive(active_id)
    }

    // Хуучин дүн файл нээх
    function handleFileModal() {
        setFileModal(!open_file)
        setFile('')
    }

    // Хуучин дүн файл нээх version 2
    function handleFileModalV2() {
        setFileModalV2(!open_filev2)
        setFileV2('')
    }

    // Оруулах датаны жагсаалт харуулах модал
    const handleShowDetailModal = () => {
        setShowModal(!showModal)
    }

    async function getGroupLesson() {
        const { success, data } = await fetchData(lessonApi.getLessonsGroup(chosenGroup))
        if(success) {
            setLessonOption(data?.lessons)
            setStudentOption(data?.students)
        }
    }

    async function onSubmit() {
        if (file) {
            const formData = new FormData()
            formData.append('file', file)

            const { success, data }  = await fetchData(scoreApi.postOldScore(formData))
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

    async function onSubmitV2() {
        if (fileV2) {
            const formData = new FormData()
            formData.append('file', fileV2)
            formData.append('group_id', chosenClass)

            const { success, data }  = await fetchData(scoreApi.postOldScoreV2(formData))
            if (success) {
                handleFileModalV2()
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

    function navigatePrint() {
        navigate(`/score/preview-score/print`, {state: {mainData,chosenGroup}})
    }

    const modalToggler = () => {setPmodal(!pmodal)}

    useUpdateEffect(
        () =>
        {
            if(chosenGroup) {
                getGroupLesson()
            }
        },
        [chosenGroup]
    )

    function excelAngi() {
        var lessons = lessonOption.map((c) => c.full_name)

        const staticCells = [
            "№",
            "Оюутны код",
            "Оюутны нэр",
            ...lessons
        ]

        const columns = studentOption.map((col, idx) => {

            const dynamicKey = {
                "№": idx + 1,
                "Оюутны код": col.code,
                "Оюутны нэр": col.full_name,
            };

            lessons.forEach((lesson) =>
                dynamicKey[lesson] = ''
            )

            return dynamicKey;
        });

        const worksheet = utils.json_to_sheet(columns);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Sheet1");


        utils.sheet_add_aoa(worksheet, [staticCells], { origin: "A1" });

        const normalCells = {
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            },
            font:{
                sz:10
            },
            alignment: {
                horizontal: 'center',
                vertical: 'center',
                wrapText: true
            },
        };

        const startRow = 0;
        const endRow = studentOption.length;
        const startCol = 0;
        const endCol = lessons.length + 3;

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
              const cellAddress = utils.encode_cell({ r: row, c: col });

                if (!worksheet[cellAddress]) {
                    worksheet[cellAddress] = {};
                }

              worksheet[cellAddress].s = normalCells
            }
        }

        worksheet["!cols"] = [{ wch: studentOption.length > 100 ? 3 : 2 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, {wch: 11}  ];

        worksheet["!rows"] = [
            { hpx: 100 },
        ];
        return writeFile(workbook,'zagwar.xlsx')
    }


    function excelOyutan() {

        var dataz = studentSectionData.map((data, idx) => {
            return(
                {
                    "№": idx + 1,
                    "Оюутны код": data?.student?.code || '',
                    "Овог": data?.student?.last_name || '',
                    "Нэр": data?.student?.first_name || '',
                    'Хичээлийн нэр': data?.lesson?.name || '',
                    'Багш': data?.teacher?.full_name || '',
                    'Багшийн оноо': data?.teach_score || '',
                    'Шалгалтын оноо': data?.exam_score || '',
                    'Улирал': data?.lesson_season?.season_name || '',
                    'Нийт оноо': data?.score_total || '',
                    'Үнэлгээ': data?.assessment[0] || '',
                }
            )
        })

        const staticCells = [
            "№",
            "Оюутны код",
            "Овог",
            "Нэр",
            'Хичээлийн нэр',
            'Багш',
            'Багшийн оноо',
            'Шалгалтын оноо',
            'Улирал',
            'Нийт оноо',
            'Үнэлгээ',
        ]

        const worksheet = utils.json_to_sheet(dataz);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Sheet1");


        utils.sheet_add_aoa(worksheet, [staticCells], { origin: "A1" });

        const normalCells = {
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            },
            font:{
                sz:10
            },
            alignment: {
                horizontal: 'center',
                vertical: 'center',
                wrapText: true
            },
        };

        const startRow = 0;
        const endRow = studentSectionData.length + 1;
        const startCol = 0;
        const endCol = 11;

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
              const cellAddress = utils.encode_cell({ r: row, c: col });

                if (!worksheet[cellAddress]) {
                    worksheet[cellAddress] = {};
                }

              worksheet[cellAddress].s = normalCells
            }
        }

        worksheet["!cols"] = [{ wch: dataz.length > 100 ? 3 : 2 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, {wch: 40}, {wch: 20}  ];

        worksheet["!rows"] = [
            { hpx: 40 },
        ];
        return writeFile(workbook,'oyutan_dvn.xlsx')
    }


    async function handleRefresh() {
        const { success, data } = await fetchData(scoreApi.refresh(chosenGroup))
        if (success) {
        }
    }

    return (
        <Fragment>
            {pmodal ? <PrintModal pmodal={pmodal} modalToggler={modalToggler} navigatePrint={navigatePrint} groupId={chosenGroup} file_name={group_name} printValues={printValues} /> : ''}
            <Card>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom pt-0'">
					<CardTitle tag="h4">{t('Дүнгийн жагсаалт')}</CardTitle>
					    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                            <Button
                                color='primary'
                                className='m-50'
                                onClick={handleFileModalV2}
                            >
                                <FileText size={15} />
                                <span className='align-middle ms-1'>{t('Өмнөх програм дүн')}</span>
                            </Button>
                            <Button
                                color='primary'
                                className='m-50'
                                onClick={() => showWarning({
                                    header: {
                                        title: `${t('Дүнгийн үнэлгээ дахин унших')}`,
                                    },
                                    question: `Тухайн ангийн үзсэн бүх хичээлийн дүнгийн үнэлгээ дахин шинэчлэхэд итгэлтэй байна уу?`,
                                    onClick: () => handleRefresh(),
                                    btnText: 'Шинэчлэх',
                                })}
                                disabled={!chosenGroup}
                            >
                                <RefreshCcw size={15} />
                                <span className='align-middle ms-50'>{t('Үнэлгээ шинэчлэх')}</span>
                            </Button>
                            <Button
                                color='primary'
                                className='m-50'
                                onClick={() => {
                                    active === KIND_ANGI ? excelAngi()
                                        :
                                    active === KIND_HICHEEL ? console.log('hicheel')
                                        :
                                    active === KIND_OYUTAN && excelOyutan()
                                }}
                                disabled={
                                    active === KIND_ANGI ? !chosenGroup
                                        :
                                    active === KIND_HICHEEL ? true
                                        :
                                    active === KIND_OYUTAN && false
                                }
                            >
                                <Download size={15} />
                                <span className='align-middle ms-1'>{t('Загвар татах')}</span>
                            </Button>
                            <Button
                                color='primary'
                                className='m-50'
                                onClick={handleFileModal}
                            >
                                <FileText size={15} />
                                <span className='align-middle ms-1'>{t('Хуучин дүн')}</span>
                            </Button>
                            <Button
                                color='primary'
                                className='m-50'
                                onClick={() => modalToggler()}
                                disabled={!chosenGroup}
                            >
                                <Printer size={15} />
                                <span className='align-middle ms-50'>{t('Хэвлэх')}</span>
                            </Button>
                        </div>
                </CardHeader>
                {isLoading && Loader}
                <Nav tabs>
                    {
                        nav_menus.map((menu, idx) => {
                            return(
                                <NavItem key={idx}>
                                    <NavLink
                                        active={active == menu.active_id}
                                        onClick={() => {
                                            toggle(menu.active_id)
                                        }}
                                    >
                                        {menu.name}
                                    </NavLink>
                                </NavItem>
                            )
                        })
                    }
                </Nav>
                <TabContent className='py-50' activeTab={active}>
                    {
                        component && component
                    }
                </TabContent>
            </Card>

            {open_file &&
                <FileModal
                    isOpen={open_file}
                    handleModal={handleFileModal}
                    isLoading={isLoading}
                    file={file}
                    setFile={setFile}
                    title="Хичээлийн дүн оруулах"
                    fileAccept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                    extension={['xlsx']}
                    onSubmit={onSubmit}
                />
            }

            {open_filev2 &&
                <FileModal
                    isOpen={open_filev2}
                    handleModal={handleFileModalV2}
                    isLoading={isLoading}
                    file={fileV2}
                    setFile={setFileV2}
                    title="Хичээлийн дүн оруулах"
                    fileAccept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                    extension={['xlsx']}
                    onSubmit={onSubmitV2}
                    setChosenGroup={setChosenClass}
                    select_value={select_value}
                    setSelectValue={setSelectValue}
                    groupOption={groupOption}
                    Component={AdditionalComponent}
                    CustomComponent={AlertComponent}
                    AlertGroupComponent={AlertGroupComponent}
                    disabled={!select_value || Object.keys(select_value).length === 0}
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
        </Fragment>
    )
}

export default GradeList;
