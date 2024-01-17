// ** React Imports
import { Fragment, useState, useEffect,} from 'react'

import {
    Card,
    TabContent,
    Nav,
    NavItem,
    NavLink,
    CardHeader,
    CardTitle,
    Button
} from 'reactstrap'

import { Printer, FileText, Download} from 'react-feather'

import FileModal from '@lms_components/FileModal'

import useLoader from '@hooks/useLoader';
import useApi from '@hooks/useApi';

import { useNavigate } from "react-router-dom"
import  useUpdateEffect  from '@hooks/useUpdateEffect'
import { useTranslation } from "react-i18next";

import { utils, writeFile } from 'xlsx-js-style';

import Class from './Class'
import Lesson from './Lesson'
import Student from './Student'
import DetailModal from './DetailModal';

// import LessonV2 from './LessonV2';
import PrintModal from './PrintModal';

const GradeList = () => {
    const navigate = useNavigate()

    const { t } = useTranslation()
    const [component, setComponent] = useState('')

    const [open_file, setFileModal] = useState(false)
    const [file, setFile] = useState(false)
    const [ mainData, setMainData ] = useState([])
    const [ chosenGroup, setChosenGroup ] = useState('')
    const [ lessonOption, setLessonOption ] = useState([])
    const [ studentOption, setStudentOption ] = useState([])

    const [detailDatas, setDetailDatas] = useState({})
    const [pmodal, setPmodal] = useState()
    const [errorDatas, setErrorDatas] = useState({})
    const [file_name, setFileName] = useState('')
    const [group_name, setGroupName] = useState('')

    const [showModal, setShowModal] = useState(false)

    const [active, setActive] = useState(1)
    const { Loader, isLoading, fetchData } = useLoader({})

    const scoreApi = useApi().score.register
    const lessonApi = useApi().study.lessonStandart

    const nav_menus = [
        {
            active_id: 1,
            name: t('Анги'),
            component: <Class setMainData={setMainData} setChosenGroup={setChosenGroup} setFileName={setGroupName}/>
        },
        {
            active_id: 2,
            name: t('Хичээл'),
            component: <Lesson setMainData={setMainData} setChosenGroup={setChosenGroup}/>
        },
        {
            active_id: 3,
            name: t('Оюутан'),
            component: <Student setMainData={setMainData} setChosenGroup={setChosenGroup}/>
        },
    ]

    useEffect(() => {
        var check = nav_menus.find(menus => menus.active_id == active)
        setComponent(check.component)
    }, [active])

    const toggle = (active_id) => {
        setActive(active_id)
    }

    // Хуучин дүн файл нээх
    function handleFileModal() {
        setFileModal(!open_file)
        setFile('')
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

    function convert() {
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

    return (
        <Fragment>
            {pmodal ? <PrintModal pmodal={pmodal} modalToggler={modalToggler} navigatePrint={navigatePrint} groupId={chosenGroup} file_name={group_name}/> : ''}
            <Card>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom pt-0'">
					<CardTitle tag="h4">{t('Дүнгийн жагсаалт')}</CardTitle>
					    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                            <Button
                                color='primary'
                                className='m-50'
                                onClick={() => {convert()}}
                                // href="/files/newtemplate.xlsx"
                                disabled={chosenGroup ? false : true}
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
