import { getPagination, convertDefaultValue, ReactSelectStyles, validate} from "@utils";
import React, { Fragment, useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { Plus, Search, AlertCircle } from "react-feather";
import { getQuestionColumns } from "./QuestionHelpers";
import { getColumns } from "./helpers";

import {
	Row,
	Col,
	Form,
	Input,
	Label,
	Button,
	CardHeader,
	Card,
	CardTitle,
    Badge
} from "reactstrap";

import Select from "react-select";
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import classnames from "classnames";
import DataTable from "react-data-table-component";

import AddQuestion from "./AddQuestion";


function AddStudent(){

    const status = []
	const { t } = useTranslation();

    const { isLoading, Loader, fetchData } = useLoader({});
    // loading indicator corrected
    const { isLoading:isLoadingSelectData, Loader:SelectDataLoader, fetchData: fetchSelectData } = useLoader({});
    const { fetchData: fetchQuestion } = useLoader({});
    const { control, handleSubmit, setError, formState: { errors }, } = useForm();
    const { challenge_id } = useParams();

    const [scope, setScope] = useState('');
    const [department, setDepartment] = useState([]);
    const [elsegchDef, setElsegchDef] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total_count, setTotalCount] = useState(1);
    const [searchValue, setSearchValue] = useState('');

    const [currentPageQuestion, setCurrentPageQuestion] = useState(1);
    const [rowsPerPageQuestion, setRowsPerPageQuestion] = useState(5);
    const [totalCountQuestion, setTotalCountQuestion] = useState();

    const [selectOption, setSelectOption] = useState([]);

    const [datas, setDatas] = useState([]);
    const [question_datas, setQuestionData] = useState([]);

    const [modal, setModal] = useState(false);

    const challengeAPI = useApi().challenge.psychologicalTest;
    const psychologicalTestQuestionsAPi = useApi().challenge.psychologicalTestOne

    async function getDatas(){
        const { success, data } = await fetchData(challengeAPI.getScope(rowsPerPage, currentPage, searchValue, challenge_id));
        if (success) {
            setDatas(data?.results);
            setTotalCount(data?.count);
        }
    };

    // to populate select inputs on startup
    async function getSelects(){
		const { success, data } = await fetchSelectData(challengeAPI.getSelect('', 'start', 2, '', '', ''))
		if(success){
            setSelectOption(data)
            setDepartmentOption(data?.department_options)
            setGroupOption(data?.group_options)

            // participants select inputs
            setScrollBottomDatasTeacher(data?.teacher_options)
            setScrollBottomDatas(data?.student_options)
            setScrollBottomDatasElseltUser(data?.elselt_user_options)
		}
	}

    async function getQuestionTableData(){
        const { success, data } = await fetchQuestion(psychologicalTestQuestionsAPi.get(rowsPerPageQuestion, currentPageQuestion, challenge_id))
        if(success) {
            setTotalCountQuestion(data?.count)
            setQuestionData(data?.results)
        }
    }

    async function handleDelete(id) {
		const { success } = await fetchData(challengeAPI.deleteParticitant(id, challenge_id));
		if (success) {
			getDatas();
		}
	};

    async function handleDeleteQuestion(id) {
		const { success } = await fetchData(psychologicalTestQuestionsAPi.delete(id, challenge_id));
		if (success) {
			getQuestionTableData();
		}
	};

    useEffect(() => {
        getDatas()
    },[currentPage, rowsPerPage])

    useEffect(() => {
        getQuestionTableData()
    },[currentPageQuestion, rowsPerPageQuestion])

    useEffect(() => {
        getSelects()
    },[])

    function handleFilter(e){
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    function handleSearch(){
		getDatas()
	}

    const handleScope = (name) => {
        setScope(name)
    };

    const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};

    const handlePaginationQuestion = (page) => {
		setCurrentPageQuestion(page.selected + 1);
	};

	const handleModal = () => {
		setModal(!modal);
	};

    async function onSubmit(cdata) {
        cdata['scope'] = scope
        cdata['admission'] = elsegchDef
        cdata = convertDefaultValue(cdata)

        const { success, error } = await fetchData(challengeAPI.putAddScope(cdata, challenge_id))
        if(success) {
            getDatas()
        }
        else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message:  error[key].msg});
            }
        }
	}

    useEffect(() => {
        if (searchValue.length === 0) getDatas()
    },[searchValue])

    if(question_datas.length > 0){
        for(let idx = 0; question_datas.length > idx; idx++){
            status.push(question_datas[idx]?.status)
        }
    }

    // Api
    const permissionStudentApi = useApi().role.student
    const professionApi = useApi().elselt.profession

    // States
    // teachers adding inputs states
    const [bottom_check_teacher, setBottomCheckTeacher] = useState(3);
    const [select_teacher, setTeacherOption] = useState([]);
    const [teacher_search_value, setTeacherSearchValue] = useState([]);
    const [scroll_bottom_datas_teacher, setScrollBottomDatasTeacher] = useState([]);
    const [departmentOption, setDepartmentOption] = useState([]);
    const [departmentTeacher, setDepartmentTeacher] = useState([]);

    // students adding inputs states
    const [bottom_check, setBottomCheck] = useState(3);
    const [select_student, setStudentOption] = useState([]);
    const [student_search_value, setStudentSearchValue] = useState([]);
    const [scroll_bottom_datas, setScrollBottomDatas] = useState([]);
    const [groupOption, setGroupOption] = useState([]);
    const [group, setGroup] = useState([]);

    // elesltUsers adding inputs states
    const [bottom_check_elselt_user, setBottomCheckElseltUser] = useState(3);
    const [select_elselt_user, setElseltUserOption] = useState([]);
    const [elselt_user_search_value, setElseltUserSearchValue] = useState([]);
    const [scroll_bottom_datas_elselt_user, setScrollBottomDatasElseltUser] = useState([]);
    const [profOption, setProfessionOption] = useState([]);
    const [profession, setProfession] = useState([]);

    // Loaders
    const { isLoading:TeacherLoading, Loader:TeacherLoader, fetchData: fetchSelectTeachers } = useLoader({});
    const { isLoading:StudentLoading, Loader:StudentLoader, fetchData: fetchSelectStudents } = useLoader({});
    const { isLoading:ElseltUserLoading, Loader:ElseltUserLoader, fetchData: fetchSelectElseltUsers } = useLoader({});

    // Refs
    const hasMountedDepartmentTeacher = useRef(false);

    const hasMountedDepartment = useRef(false);
    const hasMountedGroups = useRef(false);

    const hasMountedElsegchDef = useRef(false);
    const hasMountedProfession = useRef(false);

    // to filter teachers by search string from select input
    async function getTeacherOption(searchValue) {
        const { success, data } = await fetchSelectTeachers(challengeAPI.getSelect(scope, 'participants', 2, departmentTeacher, '', searchValue))
        if (success) {
            setTeacherOption(data?.teacher_options)
        }
    }

    // populating teachers in select input initially and by scroll
    async function getSelectBottomDatasTeacher(state){
        const { success, data } = await fetchSelectElseltUsers(challengeAPI.getSelect(1, 'participants', state, departmentTeacher, '', ''))
        if(success){
            if(state === 2){
                setScrollBottomDatasTeacher(data?.teacher_options)
            } else {
                setScrollBottomDatasTeacher((prev) => [...prev, ...data?.teacher_options])
            }
        }
    }

    // Getting students groups
    async function getGroup() {
        const { success, data } = await fetchSelectData(challengeAPI.getSelect(scope, 'group', 2, department, '', ''))
        if (success) {
            setGroupOption(data?.group_options)
        }
    }

    //  Оюутны жагсаалт хайлтаар
    async function getStudentOption(searchValue) {
        const { success, data } = await fetchSelectStudents(challengeAPI.getSelect(scope, 'participants', 2, department, group, searchValue))
        if(success) {
            setStudentOption(data?.student_options)
        }
    }

    //  Оюутны жагсаалт select ашигласан
    async function getSelectBottomDatas(state){
        const { success, data } = await fetchSelectStudents(challengeAPI.getSelect(3, 'participants', state, department, group, ''))
        if(success){
            // when select input list is needed to be resetted for current conditions
            if(state === 2){
                setScrollBottomDatas(data?.student_options)
            } else {
                setScrollBottomDatas((prev) => [...prev, ...data?.student_options])
            }
        }
    }

    // Хөтөлбөрийн жагсаалт авах
    async function getProfession() {
        const { success, data } = await fetchData(professionApi.getList(elsegchDef))
        if (success) {
            setProfessionOption(data)
        }
    }

    // to filter elseltUsers by search string from select input
    async function getElseltUserOption(searchValue) {
        const { success, data } = await fetchSelectElseltUsers(challengeAPI.getSelect(scope, 'participants', 2, elsegchDef, profession, searchValue))
        if (success) {
            setElseltUserOption(data?.elselt_user_options)
        }
    }

    // populating elseltUser in select input initially and by scroll
    async function getSelectBottomDatasElseltUser(state){
        const { success, data } = await fetchSelectElseltUsers(challengeAPI.getSelect(2, 'participants', state, elsegchDef, profession, ''))
        if(success){
            if(state === 2){
                setScrollBottomDatasElseltUser(data?.elselt_user_options)
            } else {
                setScrollBottomDatasElseltUser((prev) => [...prev, ...data?.elselt_user_options])
            }
        }
    }

    // teachers searching handler
    function handleTeacherSelect(value){
        getTeacherOption(value)
    }

    // handler to filter teachers list in select input by other select inputs
    function handleTeacher(ids){
        setDepartmentTeacher(ids)
        setScrollBottomDatasTeacher([])
        setBottomCheckTeacher(3)
    }

    // students searching handler
    function handleStudentSelect(value){
        getStudentOption(value)
    }

    // handler to filter students list in select input by other select inputs
    function handleStudent(ids, select){
        if(select == 1) {
            setDepartment(ids)
        } else if (select == 2) {
            setGroup(ids)
        }
        setScrollBottomDatas([])
        setBottomCheck(3)
    }

     // elseltUser searching handler
    function handleElseltUserSelect(value){
        getElseltUserOption(value)
    }

    // handler to filter elseltUser list in select input by other select inputs
    function handleElseltUser(ids, select){
        if(select == 1) {
            setElsegchDef(ids)
        } else if (select == 2) {
            setProfession(ids)
        }
        setScrollBottomDatasElseltUser([])
        setBottomCheckElseltUser(3)
    }

    // to filter students list and groups when chosen departments changed
    useEffect(() => {
        if (hasMountedDepartment.current) {
            getGroup()
            getSelectBottomDatas(2)
        } else {
            hasMountedDepartment.current = true;
        }
    },[department])

    // to filter students list when chosen groups changed
    useEffect(() => {
        if (hasMountedGroups.current) {
            getSelectBottomDatas(2)
        } else {
            hasMountedGroups.current = true;
        }
    },[group])

    // startup professions populating
    // to filter elseltUsers list and professions when chosen admissions changed
    useEffect(() => {
        getProfession()
        if(hasMountedElsegchDef.current){
            getSelectBottomDatasElseltUser(2)
        } else {
            hasMountedElsegchDef.current = true
        }
    },[elsegchDef])

    // to filter elseltUsers list when chosen professions changed
    useEffect(() => {
        if(hasMountedProfession.current){
            getSelectBottomDatasElseltUser(2)
        } else {
            hasMountedProfession.current = true
        }
    },[profession])

    // to filter teachers list in select input by other select inputs
    useEffect(() => {
        if(hasMountedDepartmentTeacher.current){
            getSelectBottomDatasTeacher(2)
        } else {
            hasMountedDepartmentTeacher.current = true
        }
    }, [departmentTeacher])

    return(
        <Fragment>
            <Row className="mt-2">
                <Col md={7}>
                    <Card xs={4}>
                        <CardHeader className="rounded border d-flex flex-row">
                            <Button
                                tag={Link}
                                to="/psychologicaltesting/exam"
                                color="primary"
                                className="btn-sm-block"
                            >
                                Буцах
                            </Button>
                            <CardTitle tag='h4' className="mt-0 mx-0">
                                {t('Сорилын хамрах хүрээг нэмэх')}
                            </CardTitle>
                        </CardHeader>
                        <Row className="m-0">
                            <Col md={12} className="mx-0 p-0">
                                <Form onSubmit={handleSubmit(onSubmit)}>
                                    <div className='added-cards mb-0 text-center'>
                                        <div className={classnames('cardMaster p-1 rounded border')}>
                                            <div className='content-header mb-2 mt-1'>
                                                <h4 className='content-header'>Хамрах хүрээгээ сонгоно уу</h4>
                                            </div>
                                            <Row className='custom-options-checkable gx-1'>
                                                <Col md={4}>
                                                    <Input type='radio' id='teacher' name='plans' className='custom-option-item-check' onChange={() => handleScope(1)} checked={scope == 1}/>
                                                    <Label for='teacher' className='custom-option-item text-center p-1'>
                                                        <span className='fw-bolder'>Ажилчид</span>
                                                    </Label>
                                                </Col>
                                                <Col md={4}>
                                                    <Input type='radio' id='student' name='plans' className='custom-option-item-check ' onChange={() => handleScope(3)} checked={scope == 3}/>
                                                    <Label for='student' className='custom-option-item text-center p-1'>
                                                        <span className='fw-bolder'>Оюутан</span>
                                                    </Label>
                                                </Col>
                                                <Col md={4}>
                                                    <Input type='radio' id='elsegch' name='plans' className='custom-option-item-check ' onChange={() => handleScope(2)} checked={scope == 2}/>
                                                    <Label for='elsegch' className='custom-option-item text-center p-1'>
                                                        <span className='fw-bolder'>Элсэгч</span>
                                                    </Label>
                                                </Col>
                                            </Row>
                                            {
                                                scope === 1 &&
                                                    <Row className='mt-1'>
                                                        <Col md={6}>
                                                            <Label className='form-label' for="departmentTeacher">
                                                                {t('Хөтөлбөрийн баг')}
                                                            </Label>
                                                            <Controller
                                                                control={control}
                                                                defaultValue=''
                                                                name="departmentTeacher"
                                                                render={({ field: { value, onChange} }) => {
                                                                    return (
                                                                        <Select
                                                                            name="departmentTeacher"
                                                                            id="departmentTeacher"
                                                                            classNamePrefix='select'
                                                                            isClearable
                                                                            isMulti
                                                                            value={value}
                                                                            className={classnames('react-select')}
                                                                            isLoading={isLoadingSelectData}
                                                                            options={departmentOption || []}
                                                                            placeholder={t('-- Сонгоно уу --')}
                                                                            noOptionsMessage={() => t('Хоосон байна.')}
                                                                            onChange={(val) => {
                                                                                onChange(val)
                                                                                const ids = val.map(item => item.id);
                                                                                handleTeacher(ids)
                                                                            }}
                                                                            styles={ReactSelectStyles}
                                                                            getOptionValue={(option) => option.id}
                                                                            getOptionLabel={(option) => option.name}
                                                                        />
                                                                    )
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col md={6}>
                                                            <Label className='form-label' for='participants'>
                                                                {t('Нэр')}
                                                            </Label>
                                                            <Controller
                                                                control={control}
                                                                defaultValue=''
                                                                name="participants"
                                                                render={({ field: { value, onChange} }) => {
                                                                    return (
                                                                        <Select
                                                                            name="participants"
                                                                            id="participants"
                                                                            classNamePrefix='select'
                                                                            isClearable
                                                                            isMulti
                                                                            className={classnames('react-select')}
                                                                            placeholder={t('-- Хайх --')}
                                                                            isLoading={TeacherLoading}
                                                                            loadingMessage={() => "Түр хүлээнэ үү..."}
                                                                            options={
                                                                                teacher_search_value.length === 0
                                                                                    ? scroll_bottom_datas_teacher || []
                                                                                    : select_teacher || []
                                                                            }
                                                                            value={
                                                                                teacher_search_value.length === 0
                                                                                    ? scroll_bottom_datas_teacher.find((c) => c.id === value)
                                                                                    : select_teacher.find((c) => c.id === value)
                                                                            }
                                                                            noOptionsMessage={() =>
                                                                                teacher_search_value.length > 1
                                                                                    ? t('Хоосон байна')
                                                                                    : null
                                                                            }
                                                                            onMenuScrollToBottom={() => {
                                                                                if(teacher_search_value.length === 0){
                                                                                    setBottomCheckTeacher(bottom_check_teacher + 1)
                                                                                    getSelectBottomDatasTeacher(bottom_check_teacher)
                                                                                }
                                                                            }}
                                                                            onChange={(val) => {
                                                                                onChange(val)
                                                                            }}
                                                                            onInputChange={(e) => {
                                                                                setTeacherSearchValue(e);
                                                                                if(e.length > 1 && e !== teacher_search_value){
                                                                                    handleTeacherSelect(e);
                                                                                } else if (e.length === 0){
                                                                                    setTeacherOption([]);
                                                                                }
                                                                            }}
                                                                            styles={ReactSelectStyles}
                                                                            getOptionValue={(option) => option.id}
                                                                            getOptionLabel={(option) => (option.code ? option.code + ' ' : '') + option.full_name}
                                                                        />
                                                                    )
                                                                }}
                                                            />
                                                        </Col>
                                                    </Row>
                                            }
                                            {
                                                scope == 2
                                                &&
                                                <Row>
                                                    <div>
                                                        <Badge pill color='light-info' className='p-1 m-2 text-wrap'>
                                                            <AlertCircle size={15}/> Бие бялдарын элсэлтэд тэнцсэн элсэгчид л нэмэгдэхийг анхаарна уу.
                                                        </Badge>
                                                    </div>
                                                </Row>
                                            }
                                            {
                                                scope === 2 &&
                                                    <Row className='mt-1'>
                                                        <Col md={6}>
                                                            <Label className="form-label" for="admission">
                                                                {'Элсэлт'}
                                                            </Label>
                                                            <Controller
                                                                control={control}
                                                                defaultValue=''
                                                                name="admission"
                                                                render={({ field: { value, onChange} }) => {
                                                                    return (
                                                                        <Select
                                                                            name="admission"
                                                                            id="admission"
                                                                            isClearable
                                                                            classNamePrefix='select'
                                                                            value={value}
                                                                            className={classnames('react-select')}
                                                                            isLoading={isLoadingSelectData}
                                                                            options={selectOption?.admission_options || []}
                                                                            placeholder={t('-- Сонгоно уу --')}
                                                                            noOptionsMessage={() => t('Хоосон байна.')}
                                                                            onChange={(val) => {
                                                                                onChange(val)
                                                                                handleElseltUser(val?.admission || '', 1)
                                                                            }}
                                                                            styles={ReactSelectStyles}
                                                                            getOptionValue={(option) => option.admission}
                                                                            getOptionLabel={(option) => option.admission_name}
                                                                        />
                                                                    )
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col md={6}>
                                                            <Label className='form-label' for="profession">
                                                                {t('Хөтөлбөр')}
                                                            </Label>
                                                            <Controller
                                                                control={control}
                                                                defaultValue=''
                                                                name="profession"
                                                                render={({ field: { value, onChange} }) => {
                                                                    return (
                                                                        <Select
                                                                            name="profession"
                                                                            id="profession"
                                                                            classNamePrefix='select'
                                                                            isClearable
                                                                            isMulti
                                                                            value={value}
                                                                            className={classnames('react-select')}
                                                                            isLoading={isLoadingSelectData}
                                                                            options={profOption || []}
                                                                            placeholder={t('-- Сонгоно уу --')}
                                                                            noOptionsMessage={() => t('Хоосон байна.')}
                                                                            onChange={(val) => {
                                                                                onChange(val)
                                                                                const ids = val.map(item => item.prof_id);
                                                                                handleElseltUser(ids, 2)
                                                                            }}
                                                                            styles={ReactSelectStyles}
                                                                            getOptionValue={(option) => option.prof_id}
                                                                            getOptionLabel={(option) => option.name}
                                                                        />
                                                                    )
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col md={6}>
                                                            <Label className='form-label' for='participants'>
                                                                {t('Нэр')}
                                                            </Label>
                                                            <Controller
                                                                control={control}
                                                                defaultValue=''
                                                                name="participants"
                                                                render={({ field: { value, onChange} }) => {
                                                                    return (
                                                                        <Select
                                                                            name="participants"
                                                                            id="participants"
                                                                            classNamePrefix='select'
                                                                            isClearable
                                                                            isMulti
                                                                            className={classnames('react-select')}
                                                                            placeholder={t('-- Хайх --')}
                                                                            isLoading={ElseltUserLoading}
                                                                            loadingMessage={() => "Түр хүлээнэ үү..."}
                                                                            options={
                                                                                elselt_user_search_value.length === 0
                                                                                    ? scroll_bottom_datas_elselt_user || []
                                                                                    : select_elselt_user || []
                                                                            }
                                                                            value={
                                                                                elselt_user_search_value.length === 0
                                                                                    ? scroll_bottom_datas_elselt_user.find((c) => c.id === value)
                                                                                    : select_elselt_user.find((c) => c.id === value)
                                                                            }
                                                                            noOptionsMessage={() =>
                                                                                elselt_user_search_value.length > 1
                                                                                    ? t('Хоосон байна')
                                                                                    : null
                                                                            }
                                                                            onMenuScrollToBottom={() => {
                                                                                if(elselt_user_search_value.length === 0){
                                                                                    setBottomCheckElseltUser(bottom_check_elselt_user + 1)
                                                                                    getSelectBottomDatasElseltUser(bottom_check_elselt_user)
                                                                                }
                                                                            }}
                                                                            onChange={(val) => {
                                                                                onChange(val)
                                                                            }}
                                                                            onInputChange={(e) => {
                                                                                setElseltUserSearchValue(e);
                                                                                if(e.length > 1 && e !== elselt_user_search_value){
                                                                                    handleElseltUserSelect(e);
                                                                                } else if (e.length === 0){
                                                                                    setElseltUserOption([]);
                                                                                }
                                                                            }}
                                                                            styles={ReactSelectStyles}
                                                                            getOptionValue={(option) => option.id}
                                                                            getOptionLabel={(option) => (option.code ? option.code + ' ' : '') + option.full_name}
                                                                        />
                                                                    )
                                                                }}
                                                            />
                                                        </Col>
                                                    </Row>
                                            }
                                            {
                                                scope === 3 &&
                                                    <Row className='mt-1'>
                                                        <Col md={6}>
                                                            <Label className="form-label" for="department">
                                                                {'Хөтөлбөрийн баг'}
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
                                                                            value={value}
                                                                            className={classnames('react-select')}
                                                                            isLoading={isLoadingSelectData}
                                                                            options={selectOption?.department_options || []}
                                                                            placeholder={t('-- Сонгоно уу --')}
                                                                            noOptionsMessage={() => t('Хоосон байна.')}
                                                                            onChange={(val) => {
                                                                                onChange(val)
                                                                                handleStudent(val?.id || '', 1)
                                                                            }}
                                                                            styles={ReactSelectStyles}
                                                                            getOptionValue={(option) => option.id}
                                                                            getOptionLabel={(option) => option.name}
                                                                        />
                                                                    )
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col md={6}>
                                                            <Label className="form-label" for="groups">
                                                                {'Анги сонгох'}
                                                            </Label>
                                                            <Controller
                                                                control={control}
                                                                defaultValue=''
                                                                name="groups"
                                                                render={({ field: { value, onChange} }) => {
                                                                    return (
                                                                        <Select
                                                                            name="groups"
                                                                            id="groups"
                                                                            classNamePrefix='select'
                                                                            isClearable
                                                                            isMulti
                                                                            value={value}
                                                                            className={classnames('react-select')}
                                                                            isLoading={isLoadingSelectData}
                                                                            options={groupOption || []}
                                                                            placeholder={t('-- Сонгоно уу --')}
                                                                            noOptionsMessage={() => t('Хоосон байна.')}
                                                                            onChange={(val) => {
                                                                                onChange(val)
                                                                                const ids = val.map(item => item.id);
                                                                                handleStudent(ids, 2)
                                                                            }}
                                                                            styles={ReactSelectStyles}
                                                                            getOptionValue={(option) => option.id}
                                                                            getOptionLabel={(option) => option.name}
                                                                        />
                                                                    )
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col sm={6}>
                                                            <Label className='form-label' for='participants'>
                                                                {t('Нийт оюутнууд')}
                                                            </Label>
                                                            <Controller
                                                                control={control}
                                                                defaultValue=''
                                                                name="participants"
                                                                render={({ field: {value, onChange } }) => {
                                                                    return (
                                                                        <Select
                                                                            name="participants"
                                                                            id="participants"
                                                                            classNamePrefix='select'
                                                                            isClearable
                                                                            isMulti
                                                                            className={classnames('react-select')}
                                                                            placeholder={`-- Хайх --`}
                                                                            isLoading={StudentLoading}
                                                                            loadingMessage={() => "Түр хүлээнэ үү..."}
                                                                            options={
                                                                                student_search_value.length === 0
                                                                                    ? scroll_bottom_datas || []
                                                                                    : select_student || []
                                                                            }
                                                                            value={
                                                                                student_search_value.length === 0
                                                                                    ? scroll_bottom_datas.find((c) => c.id === value)
                                                                                    : select_student.find((c) => c.id === value)
                                                                            }
                                                                            noOptionsMessage={() =>
                                                                                student_search_value.length > 1
                                                                                    ? t('Хоосон байна')
                                                                                    : null
                                                                            }
                                                                            onMenuScrollToBottom={() => {
                                                                                if(student_search_value.length === 0){
                                                                                    setBottomCheck(bottom_check + 1)
                                                                                    getSelectBottomDatas(bottom_check)
                                                                                }
                                                                            }}
                                                                            onChange={(val) => {
                                                                                onChange(val)
                                                                            }}
                                                                            onInputChange={(e) => {
                                                                                setStudentSearchValue(e);
                                                                                if(e.length > 1 && e !== student_search_value){
                                                                                    handleStudentSelect(e);
                                                                                } else if (e.length === 0){
                                                                                    setStudentOption([]);
                                                                                }
                                                                            }}
                                                                            styles={ReactSelectStyles}
                                                                            getOptionValue={(option) => option.id}
                                                                            getOptionLabel={(option) => (option.code ? option.code + ' ' : '') + option.full_name}
                                                                        />
                                                                    )
                                                                }}
                                                            />
                                                        </Col>
                                                    </Row>
                                            }
                                            <Button
                                                className="me-0 mt-1"
                                                color="primary"
                                                type="submit"
                                            >
                                                {t("Хадгалах")}
                                            </Button>
                                        </div>
                                    </div>
                                </Form>
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col md={5}>
                    <Card md={3}>
                        <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                            <CardTitle tag="h4" className="mt-50">{t("Асуулт нэмэх")}</CardTitle>
                            <div className="d-flex flex-wrap mt-md-0 mt-1">
                                <Button
                                    color="primary"
                                    onClick={() => handleModal()}
                                >
                                    <Plus size={15} />
                                    <span className="align-middle ms-50">
                                        {t("Нэмэх")}
                                    </span>
                                </Button>
                            </div>
                        </CardHeader>
                        <div className="react-dataTable react-dataTable-selectable-rows mx-50 rounded border my-50">
                            <DataTable
                                noHeader
                                pagination
                                className="react-dataTable"
                                progressPending={isLoading}
                                progressComponent={
                                    <div className="my-2">
                                        <h5>{t("Түр хүлээнэ үү...")}</h5>
                                    </div>
                                }
                                noDataComponent={
                                    <div className="my-2">
                                        <h5>{t("Өгөгдөл байхгүй байна")}</h5>
                                    </div>
                                }
                                columns={getQuestionColumns(
                                    currentPageQuestion,
                                    rowsPerPageQuestion,
                                    totalCountQuestion,
                                    handleDeleteQuestion,
                                )}
                                paginationPerPage={rowsPerPageQuestion}
                                paginationDefaultPage={currentPageQuestion}
                                data={question_datas}
                                paginationComponent={getPagination(
                                    handlePaginationQuestion,
                                    currentPageQuestion,
                                    rowsPerPageQuestion,
                                    totalCountQuestion,
                                )}
                                fixedHeader
                                fixedHeaderScrollHeight="62vh"
                            />
                        </div>
                    </Card>
                </Col>
            </Row>
            <Card md={12}>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t("Сорил өгөх оролцогчдын жагсаалт")}</CardTitle>
                </CardHeader>
                <Col className='mt-2 my-1 mx-1 d-flex align-items-center mobile-datatable-search'>
                    <Input
                        className='dataTable-filter mb-50'
                        type='text'
                        bsSize='sm'
                        id='search-input'
                        placeholder={t('Хайх')}
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
                <div className="react-dataTable react-dataTable-selectable-rows">
					<DataTable
						noHeader
						pagination
						className="react-dataTable"
						progressPending={isLoading}
						progressComponent={
							<div className="my-2">
								<h5>{t("Түр хүлээнэ үү...")}</h5>
							</div>
						}
						noDataComponent={
							<div className="my-2">
								<h5>{t("Өгөгдөл байхгүй байна")}</h5>
							</div>
						}
						columns={getColumns(
							currentPage,
							rowsPerPage,
							total_count,
							handleDelete,
						)}
						paginationPerPage={rowsPerPage}
						paginationDefaultPage={currentPage}
						data={datas}
						paginationComponent={getPagination(
                            handlePagination,
							currentPage,
							rowsPerPage,
							total_count,
						)}
						fixedHeader
						fixedHeaderScrollHeight="62vh"
					/>
				</div>
                {modal && (
					<AddQuestion
						open={modal}
						handleModal={handleModal}
						refreshDatas={getDatas}
                        test_id={challenge_id}
                        refreshQuestionData={getQuestionTableData}
                        status={status}
					/>
				)}
            </Card>
        </Fragment>
    )
}export default AddStudent;