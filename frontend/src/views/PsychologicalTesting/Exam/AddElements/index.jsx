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

    // to populate select inputs on startup and to filter students groups list in select input
    async function getSelects(){
		const { success, data } = await fetchSelectData(challengeAPI.getSelect(scope, challenge_id, department, '', '', '', '', ''))
		if(success){
            setSelectOption(data)
            setDepartmentOption(data?.teacher_department)
            setScrollBottomDatasTeacher(data?.teacher)
            setScrollBottomDatasElseltUser(data?.elsegch)
            setScrollBottomDatas(data?.student)
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
    const [teacher, setTeacher] = useState(0);

    const { isLoading:TeacherLoading, Loader:TeacherLoader, fetchData: fetchSelectTeachers } = useLoader({});

    // students adding inputs states
    const [bottom_check, setBottomCheck] = useState(3);
    const [select_student, setStudentOption] = useState([]);
    const [student_search_value, setStudentSearchValue] = useState([]);
    const [scroll_bottom_datas, setScrollBottomDatas] = useState([]);
    const [group, setGroup] = useState([]);
    const [student, setStudent] = useState(0);
    const hasMounted = useRef(false);

    const { isLoading:StudentLoading, Loader:StudentLoader, fetchData: fetchSelectStudents } = useLoader({});

    // elesltUsers adding inputs states
    const [bottom_check_elselt_user, setBottomCheckElseltUser] = useState(3);
    const [select_elselt_user, setElseltUserOption] = useState([]);
    const [elselt_user_search_value, setElseltUserSearchValue] = useState([]);
    const [scroll_bottom_datas_elselt_user, setScrollBottomDatasElseltUser] = useState([]);
    const [profOption, setProfessionOption] = useState([]);
    const [profession, setProfession] = useState([]);
    const [elselt_user, setElseltUser] = useState(0);

    const { isLoading:ElseltUserLoading, Loader:ElseltUserLoader, fetchData: fetchSelectElseltUsers } = useLoader({});

    // to filter teachers by search string from select input
    async function getTeacherOption(searchValue) {
        const { success, data } = await fetchSelectTeachers(challengeAPI.getSelect(scope, challenge_id, department, 'participants', 2, departmentTeacher, '', searchValue))
        if (success) {
            setTeacherOption(data?.teacher)
        }
    }

    // populating teachers in select input initially and by scroll
    async function getSelectBottomDatasTeacher(state){
        const { success, data } = await fetchSelectElseltUsers(challengeAPI.getSelect(1, challenge_id, department, 'participants', state, departmentTeacher, '', ''))
        if(success){
            if(state===2){
                setScrollBottomDatasTeacher(data?.teacher)
            } else {
                setScrollBottomDatasTeacher((prev) => [...prev, ...data?.teacher])
            }
        }
    }

    //  Оюутны жагсаалт хайлтаар
    async function getStudentOption(searchValue) {
        const { success, data } = await fetchSelectStudents(challengeAPI.getSelect(scope, challenge_id, department, 'participants', 2, '', group, searchValue))
        if(success) {
            setStudentOption(data?.student)
        }
    }

    //  Оюутны жагсаалт select ашигласан
    async function getSelectBottomDatas(state){
        const { success, data } = await fetchSelectStudents(challengeAPI.getSelect(3, challenge_id, department, 'participants', state, '', group, ''))
        if(success){
            // when select input list is needed to be resetted for current conditions
            if(state===2){
                setScrollBottomDatas(data?.student)
            } else {
                setScrollBottomDatas((prev) => [...prev, ...data?.student])
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
        const { success, data } = await fetchSelectElseltUsers(challengeAPI.getSelect(scope, challenge_id, department, 'participants', 2, elsegchDef, profession, searchValue))
        if (success) {
            setElseltUserOption(data?.elsegch)
        }
    }

    // populating elseltUser in select input initially and by scroll
    async function getSelectBottomDatasElseltUser(state){
        const { success, data } = await fetchSelectElseltUsers(challengeAPI.getSelect(2, challenge_id, department, 'participants', state, elsegchDef, profession, ''))
        if(success){
            if(state===2){
                setScrollBottomDatasElseltUser(data?.elsegch)
            } else {
                setScrollBottomDatasElseltUser((prev) => [...prev, ...data?.elsegch])
            }
        }
    }

    // teachers searching handler
    function handleTeacherSelect(value){
        getTeacherOption(value)
    }

    // handler to filter teachers list in select input by other select inputs
    function handleTeacher(){
        setScrollBottomDatasTeacher([])
        setBottomCheckTeacher(3)
        setTeacher(teacher ? teacher == 1 ? 2 : 1 : 1)
    }

    // students searching handler
    function handleStudentSelect(value){
        getStudentOption(value)
    }

    // handler to filter students list in select input by other select inputs
    function handleStudent(){
        setScrollBottomDatas([])
        setBottomCheck(3)
        setStudent(student ? student == 1 ? 2 : 1 : 1)
    }

     // elseltUser searching handler
    function handleElseltUserSelect(value){
        getElseltUserOption(value)
    }

    // handler to filter elseltUser list in select input by other select inputs
    function handleElseltUser(){
        setScrollBottomDatasElseltUser([])
        setBottomCheckElseltUser(3)
        setElseltUser(elselt_user ? elselt_user == 1 ? 2 : 1 : 1)
    }

    // to filter students groups when department changed
    useEffect(() => {
        if (hasMounted.current) {
            getSelects()
        } else {
            hasMounted.current = true;
        }
    },[department])

    // to filter elseltUsers professions when admissiion changed
    useEffect(() => {
        getProfession()
    },[elsegchDef])

    // to filter teachers list in select input by other select inputs
    useEffect(() => {
        if(teacher){
            getSelectBottomDatasTeacher(2)
        }
    }, [teacher])

    // to filter students list in select input by other select inputs
    useEffect(() => {
        if(student){
            getSelectBottomDatas(2)
        }
    }, [student])

    // to filter elseltUsers list in select input by other select inputs
    useEffect(() => {
        if(elselt_user){
            getSelectBottomDatasElseltUser(2)
        }
    }, [elselt_user])

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
                                                                                setDepartmentTeacher(ids)
                                                                                handleTeacher()
                                                                            }}
                                                                            styles={ReactSelectStyles}
                                                                            getOptionValue={(option) => option.id}
                                                                            getOptionLabel={(option) => option.name}
                                                                        />
                                                                    )
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col md={4}>
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
                                                                            options={selectOption?.elsegch_admission || []}
                                                                            placeholder={t('-- Сонгоно уу --')}
                                                                            noOptionsMessage={() => t('Хоосон байна.')}
                                                                            onChange={(val) => {
                                                                                onChange(val)
                                                                                setElsegchDef(val?.admission || '')
                                                                                handleElseltUser()
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
                                                                                setProfession(ids)
                                                                                handleElseltUser()
                                                                            }}
                                                                            styles={ReactSelectStyles}
                                                                            getOptionValue={(option) => option.prof_id}
                                                                            getOptionLabel={(option) => option.name}
                                                                        />
                                                                    )
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col md={4}>
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
                                                                                setDepartment(val?.id || '')
                                                                                handleStudent()
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
                                                                            options={selectOption?.select_student_data || []}
                                                                            placeholder={t('-- Сонгоно уу --')}
                                                                            noOptionsMessage={() => t('Хоосон байна.')}
                                                                            onChange={(val) => {
                                                                                onChange(val)
                                                                                const ids = val.map(item => item.id);
                                                                                setGroup(ids)
                                                                                handleStudent()
                                                                            }}
                                                                            styles={ReactSelectStyles}
                                                                            getOptionValue={(option) => option.id}
                                                                            getOptionLabel={(option) => option.name}
                                                                        />
                                                                    )
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col sm={4}>
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