// ** React Imports
import { Fragment, useState, useEffect, useContext, useMemo } from 'react'

// ** Third Party Components
import classnames from 'classnames'
import {
    Row,
    Col,
    Input,
    Button,
    Label,
    Spinner,
    Collapse,
    Card,
    CardHeader,
    CardTitle,
    UncontrolledTooltip,
} from 'reactstrap'

import Select from "react-select"

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import Calendar from './Calendar'
import KuratsCalendar from './KuratsCalendar'

import ActiveYearContext from '@context/ActiveYearContext'
import SchoolContext from '@context/SchoolContext'

import { useTranslation } from 'react-i18next'

// ** Custom Hooks
import { useRTL } from '@hooks/useRTL'
import  useUpdateEffect  from '@hooks/useUpdateEffect'

import { get_time_date, ReactSelectStyles, get_par_from_strTime, convert_kurats_times } from "@utils"

// import Addmodal from '../Add'
import AddModalV2 from '../AddTimeTableV2';
import EditModal from '../Edit'
import GroupModal from './GroupModal';

// ** Styles
import '@styles/react/apps/app-calendar.scss'
import { Eye, FileText, Printer, AlertCircle } from 'react-feather';

import { excelDownLoad } from './excelDownload';
import { useNavigate } from 'react-router-dom';

const AddTimetableComponent = ({ }) => {

    const blankEvent = {
        start: '',
        end: '',
        resource: ''
    }

    const edit_values = {
        group: '',
        lesson: '',
        day: '',
        time: '',
        room: '',
        teacher: '',
    }

    var eventChangeValues = {
        start: '',
        end: '',
        id: '',
        odd_even: 3,
        is_default: false
    }

    var range_date = {
        start: '',
        end: ''
    }

    const { school_id } = useContext(SchoolContext)
    const { cyear_name, cseason_id } = useContext(ActiveYearContext)

    const navigate = useNavigate()
    const { t } = useTranslation()
    const { fetchData, isLoading, Loader } = useLoader({})
    const [is_loading, setLoader] = useState(false)

    const [isCalendar, setIsCalendar] = useState(false)
    const [isOpen, setIsOpen] = useState(false);

    const [eventValue, setEventValue] = useState(eventChangeValues)
    const [editDatas, setEditDatas] = useState({})
    const [rangeDate, setRangeDate] = useState(range_date)

    const [addmodal, setModal] = useState(false)
    const [groupModal, setGroupModal] = useState(false)
    // const [importModal, setFileModal] = useState(false)
    const [edit_modal, setEditModal] = useState(false)

    const [editValues, setEditValues] = useState(edit_values)
    const [radioName, setRadio] = useState('lesson')
    const [selectedValue, setSelectValue] = useState('')
    const [optionFilter, setOptionFilter] = useState('')

    const [depOption, setDepartmentOption] = useState([])
    const [selectedOption, setSelectedOption] = useState([])
    const [resourceOption, setResourceOption] = useState([])

    const [selectedMntName, setSelectedMntName] = useState('Хичээл')
    const [selectedIconName, setSelectedIconName] = useState('far fa-book')
    const [useMouseOver, setUseMouseOver] = useState(true)

    // ** states
    const [datas, setDatas] = useState([])
    const [dates, setDates] = useState(blankEvent)
    const [resourceGroupField, setResourceGroupField] = useState('lesson')

    // ** Hooks
    const [isRtl] = useRTL()

    // Api
    const calendarListApi = useApi().timetable.register
    const depApi = useApi().hrms.department
    const lessonApi = useApi().study.lessonStandart
    const groupApi = useApi().student.group
    const teacherApi = useApi().hrms.teacher
    const roomApi = useApi().timetable.room

    const handleModal = () => {
        setModal(!addmodal)
    }

    const editModal = () => {
        setEditModal(true)
    }

    const editCloseModal = () => {
        setEditModal(false)
    }

    // const fileModal = () => {
    //     setFileModal(!importModal)
    // }

    // Календариас өдөр сонгоод дарахад сонгогдсон өдрийн хувиргах
    const convertSelectDate = () => {
        var start_date = dates.start
        var resource_id = dates.resource

        var group_id = ''
        var lesson_id = ''
        var teacher_id = ''

        if (start_date) {
            var splitted_array = start_date.split('T')

            var date = new Date(`${splitted_array[0]}`)
            var day = date.getDay()

            var time_str = splitted_array[1].replace('Z','')
            var par = get_par_from_strTime(time_str)

            editValues.day = day
            editValues.time = par
        }

        if (resource_id && radioName === 'group') {
            var splitted_array = resource_id.split('_')
            group_id = parseInt(splitted_array[0])
            lesson_id = parseInt(splitted_array[1])

            editValues.group = group_id
            editValues.lesson = lesson_id
        } else if (resource_id && radioName === 'teacher') {
            editValues.teacher = parseInt(resource_id)

            var item = resourceOption.filter((item) => {
                if (item.id == parseInt(resource_id)) {
                    return item
                }
            })

            editValues.lesson = item ? item[0].lesson_id : ''
        } else if (resource_id && radioName === 'lesson') {
            var splitted_array = resource_id.split('_')
            lesson_id = parseInt(splitted_array[0])
            teacher_id = parseInt(splitted_array[1])
            editValues.lesson = lesson_id
            editValues.teacher = teacher_id
        }

        setEditValues(editValues)
    }

    // Collapse хайлт onchange
    const handleChange = (value) =>
    {
        setRadio(value)
        setSelectValue('')
        setUseMouseOver(false)
        setIsOpen(false)

        if (value == 'teacher')
        {
            setResourceGroupField('')
            setSelectedMntName('Багш')
            setSelectedIconName('fa-chalkboard-teacher')
        }
        else if (value == 'lesson')
        {
            setResourceGroupField('lesson')
            setSelectedMntName('Хичээл')
            setSelectedIconName('fa-book')
        }
        else if (value == 'room')
        {
            setResourceGroupField('')
            setSelectedMntName('Өрөө')
            setSelectedIconName('fa-door-open')
        }
        else if(value == 'group')
        {
            setResourceGroupField('')
            setSelectedMntName('Анги')
            setSelectedIconName('fa-users-class')
        }
    }

    async function getSelectOption() {
        // Хичээл
        if (selectedMntName === 'Хичээл') {
            const { success, data } = await fetchData(lessonApi.getList(school_id, selectedValue))
            if (success) {
                setSelectedOption(data)
            }
        } else if (selectedMntName === 'Анги') {
            const { success, data } = await fetchData(groupApi.getList(selectedValue))
            if (success) {
                setSelectedOption(data)
            }
        }
        if (selectedMntName === 'Багш') {
            const { success, data } = await fetchData(teacherApi.get(selectedValue))
            if (success) {
                setSelectedOption(data)
            }
        }

        if (selectedMntName === 'Өрөө') {
            const { success, data } = await fetchData(roomApi.getList())
            if (success) {
                setSelectedOption(data)
            }
        }
    }

    async function getUpdateEvent(body, event_id) {
        const { success } = await fetchData(calendarListApi.moveEvent(body, event_id))
        if (success) {
            getAll()
        }
    }

    // Нэг хичээлийн хуваарь onchange хийх хэсэг
    const setEventChange = async (body, event_id) => {
        const { success } = await fetchData(calendarListApi.setEvent(body, event_id))
        if (success) {
            getAll()
        }
    }

    function getRefresh() {
        if (isCalendar) {
            getKuratsData()
        } else {
            getAll()
        }
    }

    async function getDepartment() {
        const {success, data} = await fetchData(depApi.getRegister())
        if (success) {
            setDepartmentOption(data)
        }
    }

    function getAll() {
        setLoader(true)
        Promise.all([
            // Хичээлийн хуваарийн дата
            fetchData(calendarListApi.getCalendar(isCalendar, selectedValue, radioName, optionFilter, resourceGroupField === 'lesson' ? true : false)),
            // Resource дата
            fetchData(calendarListApi.selectionDatas(radioName, selectedValue, optionFilter, resourceGroupField === 'lesson' ? true : false)),
        ]).then((values) => {
            if(values[0]?.data) {
                var data = values[0]?.data
                for(var i in data) {
                    const group = data[i]?.group_list
                    const teacher = data[i]?.teacher
                    const room = data[i]?.room
                    const odd_even = data[i].odd_even

                    const stimes = get_time_date(data[i].time, data[i].day)

                    data[i].start= stimes?.start_time
                    data[i].end = stimes?.end_time
                    data[i].title = data[i].title + ' ' + `${data[i].is_optional ? 'сон' : ''}`
                    data[i].textColor = data[i]?.textcolor || 'white'

                    switch (radioName) {
                        case 'group':
                            if (group.length > 0) {
                                // Resource ID
                                data[i].resourceIds = data[i].group_list ? data[i].group_list : []
                            }
                            break;
                        case 'teacher':
                            data[i].resourceId = teacher
                            break;
                        case 'lesson':
                            var lesson_id = data[i]?.lesson
                            var teacher_id = data[i]?.teacher

                            data[i].resourceId = lesson_id.toString() + '_'  + teacher_id.toString()
                            break;
                        case 'room':
                            data[i].resourceId = room
                            break;
                    }

                    if (odd_even == 1) {
                        data[i].classNames = ['box']
                    } else if (odd_even == 2 ) {
                        data[i].classNames = ['box1']
                    }
                    // delete data[i]?.id
                }
                setDatas(data)
            }
            setResourceOption(values[1]?.data)
            setLoader(false)
        })
    }

    async function getKuratsData() {
        setLoader(true)
        const { success, data } = await fetchData(calendarListApi.getCalendarKurats(isCalendar, selectedValue, radioName, rangeDate.start, rangeDate.end, optionFilter))

        if (success) {
            for(var i in data) {

                const kurats_times = data[i]?.times
                const lesson = data[i]?.lesson
                const teacher = data[i]?.teacher
                const room = data[i]?.room

                var short_name = data[i].short_name ? data[i].short_name : ''

                var ktimes = convert_kurats_times(data[i]?.begin_date, data[i]?.end_date, kurats_times)
                data[i].start= ktimes?.start ? ktimes?.start : data[i].begin_date
                data[i].end = ktimes?.end ? ktimes?.end : data[i].end_date
                const sdates = ktimes?.start
                const start_split = sdates.split('T')

                const edates = ktimes?.end
                const end_split = edates.split('T')

                data[i].title = lesson?.name  + ' ' + '(' + short_name + ')' + ' ' + teacher?.full_name + ' '  + `${start_split.pop()} - ${end_split.pop()}` + ' ' + (data[i]?.kurats_room ?  data[i]?.kurats_room  : room?.full_name)
            }
            setLoader(false)
            setDatas(data)
        }
    }

    useEffect(() => {
        getDepartment()
    },[])

    useEffect(() => {
        getSelectOption()
    },[selectedMntName, selectedValue])

    useEffect(() => {
        if (isCalendar == false) {
            getAll()
        }
    },[radioName, selectedValue, isCalendar, optionFilter])


    useUpdateEffect(
        () =>
        {
            if (isCalendar && rangeDate.start) {
                getKuratsData()
            }
        },
        [selectedValue, isCalendar, rangeDate, optionFilter]
    )

    useUpdateEffect(() => {
        convertSelectDate()
    }, [dates])

    /** mouse hover-лоход харагдаастай байна. */
    const handleMouseOver = (e) =>
    {
        if (useMouseOver)
        {
            setIsOpen(true)
        }
    }

    /** 300 милсекунд дараа Collapse hover-лоход алга болгохгүй болгоно */
    useUpdateEffect(
        () =>
        {
            if (!useMouseOver)
            {
                const timer = setTimeout(
                    () =>
                    {
                        setUseMouseOver(true)
                    },
                    60
                );

                return () => clearTimeout(timer);
            }
        },
        [useMouseOver]
    )

    const calendarMemo = useMemo(
        () =>
        {
            return (
                    isCalendar
                    ?
                        <KuratsCalendar
                            isRtl={isRtl}
                            handleAddEventSidebar={handleModal}
                            handleEventClick={editModal}
                            eventDatas={datas}
                            setEditDatas={setEditDatas}
                            setRangeDate={setRangeDate}
                            range_date={range_date}
                        />
                    :
                        <Calendar
                            isRtl={isRtl}
                            handleAddEventSidebar={handleModal}
                            handleEventClick={editModal}
                            eventDatas={datas}
                            resources={resourceOption}
                            blankEvent={blankEvent}
                            height={'70dvh'}
                            is_volume={resourceGroupField === 'lesson' ? true : false}
                            getDates={setDates}
                            eventValues={eventChangeValues}
                            resourceGroupField={resourceGroupField}
                            setEditDatas={setEditDatas}
                            getEventValue={setEventValue}
                            setLoader={setLoader}
                            getUpdateEvent={getUpdateEvent}
                            setEventChange={setEventChange}
                        />
            )
        },
        [isCalendar, datas, resourceOption]
    )

    const handleGroupModal = () =>
    {
        setGroupModal(!groupModal)
    }

    /**
     * Экселийн хэсэг
     */

    const excelApi = useApi().timetable.excel
    const { fetchData: fetchExcel, isLoading: excelLoading } = useLoader({})

    /**
     * excel-д зориулсан API-г дуудаж, датаг экселрүү хөрвүүлэх функцыг ажиллуулна
     */
    async function getExcelData() {
        const {success, data} = await fetchExcel(excelApi.get())
        if (success) {
            excelDownLoad(data)
        }
    }

    /**
        * Өрөөгөөр шүүсэн дата
        * Өрөөгөөр хэвлэх үед ашиглана
    */
    const filteredData = datas.filter(val => val.room === optionFilter)

    return (
        <Fragment>
            <Card className=''>
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Хичээлийн хуваарь')}</CardTitle>
                    <div
                        className='
                            d-flex
                            justify-content-lg-end
                            justify-content-xl-end
                            justify-content-center
                            flex-wrap
                            '
                            // justify-content-md-center
                            // justify-content-md-center
                    >
                        {
                            radioName === "room" ?
                                <div className='puff-in-center ms-1 my-50'>
                                    <AlertCircle size={16} id='fontSizeDetail' />
                                    <UncontrolledTooltip placement='top' target='fontSizeDetail' >Үсгийн хэмжээ</UncontrolledTooltip>
                                    <input
                                        type="number"
                                        defaultValue={6}
                                        min="0"
                                        style={{ width: '30px', marginRight: '3px', marginLeft: '3px' }}
                                        id='fontSizeValue'
                                        onKeyDown={(e) =>["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                                    />
                                    <Button
                                        className=''
                                        color='primary'
                                        disabled={resourceOption.length !== 1}
                                        onClick={() => {navigate(`print`, { state: { datas: filteredData, fontSizeValue: document.getElementById('fontSizeValue').value }})}}
                                    >
                                        <Printer size='12'/> Хэвлэх
                                    </Button>
                                </div>
                            :
                                ''
                        }

                        {/* Api бэлэн болох үед ашиглах нь */}
                        <Button className='ms-1 my-50' color='primary' disabled={excelLoading || !school_id} onClick={() => { getExcelData() }}>{excelLoading ? <Spinner size='sm'/> : <FileText size={15}/>} Эксел татах</Button>
                        {/* <Button className='ms-1' color='primary' onClick={() => { excelDownLoad() }}><Printer size={15}/> Хэвлэх</Button> */}

                        <Button className='ms-1 my-50' color='primary' onClick={() => { handleModal(), setEditValues(edit_values)}} disabled={school_id ? false : true}>Хуваарь нэмэх</Button>
                        <Button className='ms-1 my-50' color='primary' disabled={!school_id} onClick={() => { handleGroupModal() }}><Eye size={15}/> Анги багшаар харах</Button>
                    </div>
                </CardHeader>
                <div className='app-calendar overflow-hidden border'>
                    <Row className='g-0'>
                        <Row md={12} className='mx-0' >
                            <Col md={6} sm={6} xs={12} className="mt-2 ps-0 mx-0 d-flex w-fill">
                                <span data-bs-toggle="tooltip" data-bs-placement="top" title={selectedMntName} >
                                    <Button
                                        className='pe-1'
                                        outline size="sm"
                                        onClick={() => {setIsOpen(true)}}
                                        onMouseOver={() => setIsOpen(true)}
                                        onBlur={() => {setIsOpen(false)}}
                                    >
                                        {/* хуучин хувилбар нь */}
                                    {/* <Button className='pe-1' outline size="sm" onMouseOver={() => setIsOpen(true)} onMouseOut={() => setIsOpen(false)} > */}
                                        <i className={`far ${selectedIconName} fs-6 fs-lg-4 fs-xl-4`} ></i>
                                    </Button>
                                </span>

                                <Collapse isOpen={isOpen} horizontal={true} className='' onMouseOver={handleMouseOver} onMouseOut={() => setIsOpen(false)}>
                                    <div className='d-flex justify-content-between px-1'>
                                        <div className='d-flex justify-content-start'>
                                            <span data-bs-toggle="tooltip" data-bs-placement="top" title="Хичээл">
                                                <Button
                                                    onClick={() => handleChange("lesson")}
                                                    className='me-1'
                                                    outline
                                                    size="sm"
                                                    disabled={radioName === 'lesson'}
                                                >
                                                    <i className="far fa-book fs-6 fs-lg-4 fs-xl-4"></i>
                                                </Button>
                                            </span>
                                        </div>
                                        <div className='d-flex justify-content-start'>
                                            <span data-bs-toggle="tooltip" data-bs-placement="top" title="Анги">
                                                <Button
                                                    onClick={() => handleChange("group")}
                                                    className='me-1'
                                                    outline
                                                    size="sm"
                                                    disabled={radioName === 'group'}
                                                >
                                                    <i className="far fa-users-class fs-6 fs-lg-4 fs-xl-4"></i>
                                                </Button>
                                            </span>
                                        </div>
                                        <div className='d-flex justify-content-start'>
                                            <span data-bs-toggle="tooltip" data-bs-placement="top" title="Багш">
                                                <Button
                                                    onClick={() => handleChange("teacher")}
                                                    className='me-1'
                                                    outline
                                                    size="sm"
                                                    disabled={radioName === 'teacher'}

                                                >
                                                    <i className="far fa-chalkboard-teacher fs-6 fs-lg-4 fs-xl-4"></i>
                                                </Button>
                                            </span>
                                        </div>
                                        <div className='d-flex justify-content-start'>
                                            <span data-bs-toggle="tooltip" data-bs-placement="top" title="Өрөө">
                                                <Button
                                                    onClick={() => handleChange("room")}
                                                    className='me-1'
                                                    outline
                                                    size="sm"
                                                    disabled={radioName === 'room'}
                                                    onChange={() => handleChange("room")}
                                                >
                                                    <i className="far fa-door-open  fs-6 fs-lg-4 fs-xl-4"></i>
                                                </Button>
                                            </span>
                                        </div>
                                    </div>
                                </Collapse>
                            </Col>
                            <Col md={2} sm={6} xs={12} lg={2}  className='mt-1'>
                                <Label className="form label ms-1" for="department">
                                    {t('Хөтөлбөрийн баг')}
                                </Label>
                                <Select
                                    name="department"
                                    id="department"
                                    classNamePrefix='select'
                                    isClearable
                                    className={classnames('react-select')}
                                    isLoading={isLoading}
                                    placeholder={t('-- Сонгоно уу --')}
                                    options={depOption || []}
                                    onChange={(val) => {
                                        setSelectValue(val?.id || '')
                                    }}
                                    value={depOption.find((c) => c.id === selectedValue)}
                                    noOptionsMessage={() => t('Хоосон байна.')}
                                    styles={ReactSelectStyles}
                                    getOptionValue={(option) => option.id}
                                    getOptionLabel={(option) => option.name}
                                />
                            </Col>
                            <Col md={2} sm={6} xs={12}  className='mt-1'>
                                <Label className="form label ms-1" for="selected">
                                    {`${selectedMntName} хайх`}
                                </Label>
                                <Select
                                    name="selected"
                                    id="selected"
                                    classNamePrefix='select'
                                    isClearable
                                    className={classnames('react-select')}
                                    isDisabled={isLoading}
                                    isLoading={isLoading}
                                    placeholder={t('-- Сонгоно уу --')}
                                    options={selectedOption || []}
                                    onChange={(val) => {
                                        setOptionFilter(val?.id || '')
                                    }}
                                    value={selectedOption.find((c) => c.id === optionFilter)}
                                    noOptionsMessage={() => t('Хоосон байна.')}
                                    styles={ReactSelectStyles}
                                    getOptionValue={(option) => option.id}
                                    getOptionLabel={(option) => selectedMntName === 'Багш' ? option.last_name + " " + option.first_name : selectedMntName === 'Өрөө' ? option.full_name : option.name}
                                />
                            </Col>
                            <Col md={2} sm={6} xs={12} className='d-flex justify-content-end mt-3 ms-auto'>
                                <div className=" form-check form-switch ">
                                    <Label className='form-label pe-1' for='is_calendar'>
                                        {isCalendar ? "Календарь" : "Курац Календарь"}
                                    </Label>
                                    <Input
                                        id='is_calendar'
                                        type="switch"
                                        defaultChecked={isCalendar}
                                        onClick={() => {
                                            setIsCalendar(!isCalendar)
                                        }}
                                    />
                                </div>
                            </Col>
                        </Row>
                        {
                            is_loading && Loader
                                // <div className='suspense-loader'>
                                //     <Spinner size='bg'/>
                                //     <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                                // </div>
                        }
                        <div className='position-relative overflow-hidden'>
                        {
                            calendarMemo
                        }
                        </div>
                    </Row>
                </div>
                {addmodal && <AddModalV2 open={addmodal} handleModal={handleModal} refreshDatas={getRefresh} editValues={editValues}/>}
                {edit_modal && <EditModal open={edit_modal} handleModal={editCloseModal} editDatas={editDatas} refreshDatas={getRefresh} editValues={editValues}/>}
                {groupModal && <GroupModal open={groupModal} handleModal={handleGroupModal} isRtl={isRtl}/>}
            </Card>
        </Fragment>
    )
}

export default AddTimetableComponent
