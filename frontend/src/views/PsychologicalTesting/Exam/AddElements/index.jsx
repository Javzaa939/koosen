import { getPagination, convertDefaultValue, ReactSelectStyles, validate} from "@utils";
import React, { Fragment, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { Plus, Search } from "react-feather";
import { getQuestionColumns } from "./QuestionHelpers";
import { getColumns } from "./helpers";
import * as Yup from 'yup';

import {
	Row,
	Col,
	Form,
	Input,
	Label,
	Button,
	FormFeedback,
	CardHeader,
	Card,
	CardTitle,
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
    const { fetchData: fetchSelectData} = useLoader({});
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

    async function getSelects(){
		const { success, data } = await fetchSelectData(challengeAPI.getSelect(scope, challenge_id, department))
		if(success){
			setSelectOption(data)
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
    },[scope, department])

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
    const [student_id , setStudentId] = useState('');
    const [bottom_check, setBottomCheck] = useState(3);
    const [select_student, setStudentOption] = useState([]);
    const [student_search_value, setStudentSearchValue] = useState([]);
    const [scroll_bottom_datas, setScrollBottomDatas] = useState([]);
    const [profOption, setProfessionOption] = useState([]);
    const [profession, setProfession] = useState([]);

    const { isLoading:StudentLoading, Loader:StudentLoader, fetchData: fetchSelectStudents } = useLoader({});

    //  Оюутны жагсаалт хайлтаар
    async function getStudentOption(searchValue) {
        const { success, data } = await fetchSelectStudents(permissionStudentApi.getStudent(searchValue))
        if(success) {
            setStudentOption(data)
        }
    }

    //  Оюутны жагсаалт select ашигласан
    async function getSelectBottomDatas(state){
        const { success, data } = await fetchSelectStudents(permissionStudentApi.getSelectStudents(state))
        if(success){
            setScrollBottomDatas((prev) => [...prev, ...data])
        }
    }

    // Хөтөлбөрийн жагсаалт авах
    async function getProfession() {
        const { success, data } = await fetchData(professionApi.getList(elsegchDef))
        if (success) {
            setProfessionOption(data)
        }
    }

    function handleStudentSelect(value){
        getStudentOption(value)
    }

    useEffect(() => {
        getSelectBottomDatas(2)
    }, []);

    useEffect(() => {
        getProfession()
    },[elsegchDef])

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
                                                                            isLoading={isLoading}
                                                                            options={selectOption?.elsegch_admission || []}
                                                                            placeholder={t('-- Сонгоно уу --')}
                                                                            noOptionsMessage={() => t('Хоосон байна.')}
                                                                            onChange={(val) => {
                                                                                onChange(val)
                                                                                setElsegchDef(val?.admission);
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
                                                            <Label for='form-label'>{t('Хөтөлбөр')}</Label>
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
                                                                            isLoading={isLoading}
                                                                            options={profOption || []}
                                                                            placeholder={t('-- Сонгоно уу --')}
                                                                            noOptionsMessage={() => t('Хоосон байна.')}
                                                                            onChange={(val) => {
                                                                                onChange(val)
                                                                                const ids = val.map(item => item.id);
                                                                                setProfession(ids)
                                                                            }}
                                                                            styles={ReactSelectStyles}
                                                                            getOptionValue={(option) => option.prof_id}
                                                                            getOptionLabel={(option) => option.name}
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
                                                                            isMulti
                                                                            value={value}
                                                                            className={classnames('react-select')}
                                                                            isLoading={isLoading}
                                                                            options={selectOption?.deparment_options || []}
                                                                            placeholder={t('-- Сонгоно уу --')}
                                                                            noOptionsMessage={() => t('Хоосон байна.')}
                                                                            onChange={(val) => {
                                                                                onChange(val)
                                                                                const ids = val.map(item => item.id);
                                                                                setDepartment(ids);
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
                                                            <Label className="form-label" for="participants">
                                                                {'Анги сонгох'}
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
                                                                            value={value}
                                                                            className={classnames('react-select')}
                                                                            isLoading={isLoading}
                                                                            options={selectOption?.select_student_data || []}
                                                                            placeholder={t('-- Сонгоно уу --')}
                                                                            noOptionsMessage={() => t('Хоосон байна.')}
                                                                            onChange={(val) => {
                                                                                onChange(val)
                                                                            }}
                                                                            styles={ReactSelectStyles}
                                                                            getOptionValue={(option) => option.id}
                                                                            getOptionLabel={(option) => option.name}
                                                                        />
                                                                    )
                                                                }}
                                                            />
                                                        </Col>
                                                        {/* <Col sm={4}>
                                                            <Label className='form-label' for='student'>
                                                                {t('Нийт оюутнууд')}
                                                            </Label>
                                                            <Controller
                                                                control={control}
                                                                defaultValue=''
                                                                name="student"
                                                                render={({ field: {value, onChange } }) => {
                                                                    return (
                                                                        <Select
                                                                            name="student"
                                                                            id="student"
                                                                            classNamePrefix='select'
                                                                            isClearable
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
                                                                                onChange(val?.id || '')
                                                                                setStudentId(val?.id || '')
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
                                                                            getOptionLabel={(option) => option.full_name}
                                                                        />
                                                                    )
                                                                }}
                                                            />
                                                        </Col> */}
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