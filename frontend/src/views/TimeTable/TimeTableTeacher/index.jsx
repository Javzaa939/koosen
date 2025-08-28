import React, { useContext, useState, useEffect } from "react";
import { t } from "i18next";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress"; // Import a loader
import Box from "@mui/material/Box"; // For centered loader styling
import AuthContext from "@context/AuthContext";
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import SchoolContext from "@src/utility/context/SchoolContext";
import { Button, Card, CardBody, CardHeader, Row, Col, Label, Input } from "reactstrap";
import Addmodal from "./Modal";
import { Controller, useForm } from "react-hook-form";
import { ChevronsLeft } from "react-feather";
import { useNavigate } from "react-router-dom";
import Select from 'react-select'
import { getPagination, ReactSelectStyles } from "@src/utility/Utils";
import classnames from "classnames";
import EditModal from "../Register/Edit";

export default function TimeTableTeacher() {

    const { school_id } = useContext(SchoolContext)

    const { user } = useContext(AuthContext);

    var values = {
        department: '',
        lesson: '',
        teacher: '',
        group: '',
        end_date: '',
        start_date: '',
    }

    const typeOption = [
        {
            'id': 2,
            'name': 'Лекц'
        },
        {
            'id': 3,
            'name': 'Семинар'
        },
        {
            'id': 5,
            'name': 'Дадлага'
        },
    ]


    // to make data persistent for session
    const currentPageStoredName = 'page_data-' + window.location.pathname
    const currentPageStoredData = JSON.parse(sessionStorage.getItem(currentPageStoredName));

    const { control, formState: { errors } } = useForm({});

    const [lesson_option, setLessonOption] = useState([])
    const [select_value, setSelectValue] = useState(values)
    const [datas, setDatas] = useState([]);
    const [department_option, setDepartmentOption] = useState([])
    const [teacherOption, setTeacher] = useState([]);
    const [teacher_option, setFilterTeacher] = useState([])
    const [group_option, setGroup] = useState([])
    const [currentWeek, setWeek] = useState('')
    const [stype, setType] = useState('')

    const [addmodal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [editRowData, setEditData] = useState({});

    const [timetableId, setId] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [teacherIds, setTeacherIds] = useState([]);

    // #region pagination
	const default_page = [ 10, 25, 50, 75, 100, 'Бүгд' ]
    const [current_page, setCurrentPage] = useState(currentPageStoredData?.current_page || 1)
    const [rows_per_page, setRowsPerPage] = useState(default_page[2])
    const [total_count, setTotalCount] = useState(0)
    // #endregion

    const timetableApi = useApi().timetable;
    const departmentApi = useApi().hrms.department
    const lessonApi = useApi().study.lessonStandart
    const teacherApi = useApi().hrms.teacher;

    const navigate = useNavigate();

    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({
        isFullScreen: false,
    });
    const { Loader, isLoading, fetchData } = useLoader({});

    // Тэнхимын жагсаалт
    async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get())
        if (success) {
            setDepartmentOption(data)
        }
    }

    // Хичээлийн жагсаалт
    async function getLessonOption() {
        const { success, data } = await fetchData(lessonApi.getList(school_id, select_value.department ? select_value?.department : user?.department, true))
        if (success) {
            setLessonOption(data)
        }
    }

    // Багшийн жагсаалт авах
    async function getListTeacher() {
        const { success, data } = await fetchData(teacherApi.getLessonToTeacher(select_value.lesson))
        if (success) {
            setFilterTeacher(data)
        }
    }

    // Ангийн жагсаалт
    async function getGroup() {
        const { success, data } = await fetchData(timetableApi.getGroups())
        if(success) {
            setGroup(data)
        }
    }

    async function getDatas() {
        let dep_id = "";
        if (user?.permissions?.includes("lms-timetable-register-teacher-update") && user?.department && user?.position?.name != 'Арга зүйч') {
            dep_id = user?.department;
        }
        if (select_value?.department && (user?.department != select_value?.department)) {
            dep_id = select_value?.department;
        }
        const { success, data } = await allFetch(timetableApi.getList(rows_per_page, current_page, '', '', dep_id, select_value.lesson, select_value.teacher, select_value.start_date, select_value.end_date, select_value.group, '', '', stype));

        if (success) {
            setDatas(data?.results);
            setTotalCount(data?.count)
        }
    }

    function updatePersistentData() {
        let currentPageStoredActualData = JSON.parse(sessionStorage.getItem(currentPageStoredName));

        currentPageStoredActualData = {
            ...currentPageStoredActualData,
            current_page: current_page,
            rows_per_page: rows_per_page,
            total_count: total_count
        };

        sessionStorage.setItem(currentPageStoredName, JSON.stringify(currentPageStoredActualData))
    }

    useEffect(() => {
        getDepartmentOption();
    }, []);

    useEffect(() => {
        getListTeacher();
        getGroup()
    }, [select_value.lesson])

    useEffect(() => {
        getLessonOption();
        getTeachers();
    }, [select_value.department]);

    useEffect(() => {
        getDatas();
        updatePersistentData();
    }, [select_value.department, select_value.lesson, select_value.teacher, select_value.end_date, select_value.start_date, select_value.group, current_page, rows_per_page, stype]);

    useEffect(()=>{
        updatePersistentData();
    },[total_count])

    const handleModal = () => {
        setAddModal(!addmodal);
    }

    // ** Fetch Teachers
    const getTeachers = async () => {
        var department = select_value?.department
        if (!select_value?.department && user?.permissions?.includes('lms-timetable-register-teacher-update')) {
            department = user?.department || ''
        }
        const { success, data } = await fetchData(teacherApi.getAll(department));
        if (success) {
            setTeacher(data);
        }
    };

    // #region pagination
    const handleNamePagination = (page) => {
        setCurrentPage(page.selected + 1);
    };

    function handlePerPage(e) {
        if (e.target.value === 'Бүгд') setRowsPerPage(total_count)
        else setRowsPerPage(parseInt(e.target.value))
    }
    // #endregion
    const handleEditModal = () => {
        setEditModal(!editModal)
    }
    var cindex = -1

    return (
        <Card>
            <CardHeader>
                <div
                    className="d-flex align-items-center"
                    role="button"
                    onClick={() => {
                        navigate("/timetable/register/");
                    }}
                >
                    <ChevronsLeft size={18} /> Календариар харах
                </div>
            </CardHeader>
            <CardBody>
                <Row className="justify-content-start mx-0 mt-1 mb-1" sm={12}>
                    <Col sm={6} lg={2} >
                        <Label className="form-label" for="department">
                            {t('Тэнхим')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue={select_value.department || user?.department}
                            name="department"
                            render={({ field: { value, onChange } }) => {
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
                    <Col sm={3} lg={2}>
                        <Label className="form-label" for="lesson">
                            {t('Хичээл')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue={select_value.lesson || ''}
                            name="lesson"
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <Select
                                        name="lesson"
                                        id="lesson"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.lesson })}
                                        isLoading={isLoading}
                                        placeholder={t('-- Сонгоно уу --')}
                                        options={lesson_option || []}
                                        value={value && lesson_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => t('Хоосон байна.')}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            if (val?.id) {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        lesson: val?.id
                                                    }
                                                })
                                            } else {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        lesson: ''
                                                    }
                                                })
                                            }
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.full_name}
                                    />
                                )
                            }}
                        ></Controller>
                        {errors.lesson && <FormFeedback className='d-block'>{t(errors.lesson.message)}</FormFeedback>}
                    </Col>
                    <Col sm={6} lg={2}>
                        <Label className="form-label" for="teacher">
                            {t('Багш')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue={select_value.teacher || ''}
                            name="teacher"
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <Select
                                        name="teacher"
                                        id="teacher"
                                        classNamePrefix='select'
                                        isClearable
                                        className={classnames('react-select', { 'is-invalid': errors.teacher })}
                                        isLoading={isLoading}
                                        placeholder={t(`-- Сонгоно уу --`)}
                                        options={teacherOption || []}
                                        value={teacherOption.find((c) => c.id === value)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            onChange(val?.id || '')
                                            if (val?.id) {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        teacher: val?.id
                                                    }
                                                })
                                            } else {
                                                setSelectValue(current => {
                                                    return {
                                                        ...current,
                                                        teacher: ''
                                                    }
                                                })
                                            }
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.full_name}
                                    />
                                )
                            }}
                        ></Controller>
                        {errors.teacher && <FormFeedback className='d-block'>{t(errors.teacher.message)}</FormFeedback>}
                    </Col>
                    <Col md={2} sm={6} xs={12} lg={2}>
                        <Label className="form-label" for="type">
                            {t("Хичээлийн төрөл")}
                        </Label>
                        <Select
                            name="type"
                            id="type"
                            classNamePrefix='select'
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={`-- Сонгоно уу --`}
                            options={typeOption || []}
                            value={typeOption.find((c) => c.id === stype)}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {
                                setType(val?.id || '')
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col sm={6} lg={2}>
                    <Label className="form-label" for="group">
                                {t('Анги')}
                            </Label>
                            <Controller
                                    control={control}
                                    defaultValue={''}
                                    name="group"
                                    render={({ field: { value, onChange} }) => {
                                        return (
                                            <Select
                                                name="group"
                                                id="group"
                                                classNamePrefix='select'
                                                isClearable
                                                className={classnames('react-select', { 'is-invalid': errors.group })}
                                                isLoading={isLoading}
                                                placeholder={t(`-- Сонгоно уу --`)}
                                                options={group_option || []}
                                                value={group_option.find((c) => c.id === value)}
                                                noOptionsMessage={() => t('Хоосон байна.')}
                                                onChange={(val) => {
                                                    onChange(val?.id || '')
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
                                                isSearchable={true}
                                                styles={ReactSelectStyles}
                                                getOptionValue={(option) => option.id}
                                                getOptionLabel={(option) => option.name}
                                            />
                                        )
                                    }}
                                ></Controller>
                    </Col>
                    <Col sm={4} lg={2}>
                        <Label className="form-label" for="start_date">
                            {t('Эхлэх хугацаа')}
                        </Label>
                        <Controller
                            control={control}
                            name="start_date"
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <>
                                    <Input
                                        id="start_date"
                                        name="start_date"
                                        type="date"
                                        className={`form-control form-control-sm ${error ? 'is-invalid' : ''}`}
                                        onChange={(e) => {
                                            const selectedDate = e.target.value;
                                            onChange(selectedDate);
                                            setSelectValue((current) => ({
                                                ...current,
                                                start_date: selectedDate,
                                            }));
                                        }}
                                        value={value || ''}
                                    />
                                    {error && <FormFeedback className="d-block">{t(error.message)}</FormFeedback>}
                                </>
                            )}
                        />
                    </Col>

                    <Col sm={4} lg={2}>
                        <Label className="form-label" for="end_date">
                            {t('Дуусах хугацаа')}
                        </Label>
                        <Controller
                            control={control}
                            name="end_date"
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <>
                                    <Input
                                        id="end_date"
                                        name="end_date"
                                        type="date"
                                        className={`form-control form-control-sm ${error ? 'is-invalid' : ''}`}
                                        onChange={(e) => {
                                            const selectedDate = e.target.value;
                                            onChange(selectedDate);
                                            setSelectValue((current) => ({
                                                ...current,
                                                end_date: selectedDate,
                                            }));
                                        }}
                                        value={value || ''}
                                        min={select_value.start_date || ''}
                                    />
                                    {error && <FormFeedback className="d-block">{t(error.message)}</FormFeedback>}
                                </>
                            )}
                        />
                    </Col>
                </Row>
                {isTableLoading ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "300px",
                        }}
                    >
                        <CircularProgress /> {/* Loader */}
                    </Box>
                ) : (<>
                    <Row className='justify-content-between'>
                        <Col className='d-flex align-items-center justify-content-start' md={6} sm={12}>
                            <Col md={2} sm={3} className='pe-1'>
                                <Input
                                    type='select'
                                    bsSize='sm'
                                    style={{ height: "30px" }}
                                    value={rows_per_page === total_count ? 'Бүгд' : rows_per_page}
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
                        <Col md={6} sm={12}>
                            {getPagination(handleNamePagination, current_page, rows_per_page, total_count)()}
                        </Col>
                    </Row>
                    <TableContainer component={Paper} sx={{ mt: 3, mb: 3 }}>
                        <Table sx={{ minWidth: 650, borderCollapse: "collapse", "& td, & th": { border: "1px solid #ddd" } }} aria-label="" size="small">
                            <TableHead>
                                <TableRow
                                    sx={{
                                        "& th": {
                                            color: "white",
                                            fontSize: "14px",
                                            padding: "10px",
                                            backgroundColor: "#457b9d",
                                            textAlign: "center",
                                            border: "1px solid #ddd"
                                        },
                                    }}
                                >
                                    <TableCell>{t("Сар өдөр")}</TableCell>
                                    <TableCell>{t("Хичээл")}</TableCell>
                                    <TableCell>{t("Багш")}</TableCell>
                                    <TableCell>{t("Өдөр")}</TableCell>
                                    <TableCell>{t("Цаг")}</TableCell>
                                    <TableCell>{t("Төрөл")}</TableCell>
                                    <TableCell>{t("Анги хэсэг")}</TableCell>
                                    <TableCell>{t("Хуваарь засах")}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Array.from({ length: 25 }).map((_, weekIndex) => {
                                    const currentWeek = weekIndex + 1;

                                    const weekDatas = datas.filter(item => {
                                        const begin = item?.is_kurats ? item.week_number : item.begin_week;
                                        const end = item?.is_kurats ? begin : item.end_week;
                                            return currentWeek >= begin && currentWeek <= end;
                                    });


                                    if (weekDatas.length === 0) return null;

                                    return (
                                        <React.Fragment key={currentWeek}>
                                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                            <TableCell colSpan={8} sx={{ textAlign: "center", fontWeight: "bold" }}>
                                                {currentWeek} {t("-р долоо хоног")}
                                            </TableCell>
                                            </TableRow>

                                            {weekDatas.map((record, index) => {
                                                cindex = cindex + 1
                                                // Calculate date
                                                let date = new Date(record.week_start_date);
                                                const startDate = new Date(record.week_start_date);
                                                const daysToAdd = (record.day - 1);
                                                let currentDate = startDate

                                                if (record.is_kurats) {
                                                    date = new Date(record.begin_date);
                                                } else {
                                                    // Долоо хоног дундаам нь өөр хуваарь орж ирэхэд 7 хоног бүр намрыг харуулж байсанг засав
                                                    let week_add = weekIndex - record.begin_week
                                                    if (record.begin_week != record.end_week) {
                                                        currentDate = new Date(startDate.getTime() + (week_add * 7 + daysToAdd) * 24 * 60 * 60 * 1000);
                                                    }
                                                }

                                                const formattedDate = record.is_kurats
                                                    ? date?.toISOString().split('T')[0]
                                                    : currentDate.toISOString().split('T')[0];

                                                if (record.odd_even == 1 && ![1, 3, 5, 7, 9, 11, 13, 15, 17, 19].includes(currentWeek)) {
                                                    return;
                                                }

                                                if (record.odd_even == 2 && ![2, 4, 6, 8, 10, 12, 14, 16, 18, 20].includes(currentWeek)) {
                                                    return;
                                                }

                                                return (
                                                    <TableRow key={index} sx={{ border: "1px solid #ddd" }}>
                                                        <TableCell sx={{ textAlign: "start", fontWeight: "bold", border: "1px solid #ddd", width: "180px" }}>
                                                            {t(formattedDate)}
                                                        </TableCell>
                                                        <TableCell sx={{ border: "1px solid #ddd" }}>
                                                            {record.lesson?.code + ' ' + record.lesson?.name || t("Мэдээлэл байхгүй")}
                                                        </TableCell>
                                                        <TableCell sx={{ border: "1px solid #ddd" }}>
                                                            {record.teacher ? (
                                                            <Button
                                                                color="success"
                                                                size="sm"
                                                                onClick={() => {

                                                                    let teachedIds = record.support_teacher?.length > 0 && record?.support_teacher?.includes(record.teacher.id) ? record?.support_teacher : [record.teacher.id]
                                                                    setId(record.id);
                                                                    setTeacherId(record.teacher.id);
                                                                    setTeacherIds(teachedIds)
                                                                    setWeek(currentWeek)
                                                                    handleModal();
                                                                }}
                                                            >
                                                                {record.teacher.full_name}
                                                            </Button>
                                                            ) : (
                                                            <Button
                                                                color="primary"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setId(record.id);
                                                                    setTeacherIds([])
                                                                    handleModal();
                                                                }}
                                                            >
                                                                {t("Багш сонгох")}
                                                            </Button>
                                                            )}
                                                        </TableCell>
                                                        <TableCell sx={{ border: "1px solid #ddd" }}>{record.day_name || t("Мэдээлэл байхгүй")}</TableCell>
                                                        <TableCell sx={{ border: "1px solid #ddd" }}>{record.time_name || t("Мэдээлэл байхгүй")}</TableCell>
                                                        <TableCell sx={{ border: "1px solid #ddd" }}>{record.type_name || t("Мэдээлэл байхгүй")}</TableCell>
                                                        <TableCell sx={{ border: "1px solid #ddd" }}>{record.group_names || t("Мэдээлэл байхгүй")}</TableCell>
                                                        <TableCell sx={{ border: "1px solid #ddd" }}>
                                                            <Button
                                                                color="primary"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setEditData(record),
                                                                    handleEditModal()
                                                                }}
                                                            >
                                                                {t("Засах")}
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })}
                                </TableBody>
                        </Table>
                    </TableContainer>
                </>)}
                {addmodal && <Addmodal open={addmodal} handleModal={handleModal} timetableId={timetableId} refreshDatas={getDatas} teacherOption={teacherOption} teacherId={teacherId} setTeacherId={setTeacherId} weekId={currentWeek} teacherIds={teacherIds} setTeacherIds={setTeacherIds}/>}
                {editModal && <EditModal open={editModal} handleModal={handleEditModal} editDatas={editRowData} refreshDatas={getDatas}/>}
            </CardBody>
        </Card>
    );
}
