import React, { Fragment, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { getPagination, convertDefaultValue, ReactSelectStyles } from "@utils";
import { Plus, Search } from "react-feather";
import { getQuestionColumns } from "./QuestionHelpers";
import { getColumns } from "./helpers";

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

import AddQuestion from "../AddQuestion";
import { EXAM_ROOT_PAGE } from "../../helpers";


function AddStudent() {

    const status = []
    const { t } = useTranslation();

    const { isLoading, Loader, fetchData } = useLoader({});
    const { fetchData: fetchQuestion } = useLoader({});
    const { fetchData: fetchStudents, isLoading: isLoadingExaminee } = useLoader({});
    const { control, handleSubmit, setError, formState: { errors }, watch, clearErrors } = useForm({});
    const formAll = watch()
    const selectedAdmissionIds = Array.isArray(formAll?.admission) ? formAll.admission.map(item => item.id) : []
    const { challenge_id, lesson_id } = useParams();

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [total_count, setTotalCount] = useState(1);
    const [searchValue, setSearchValue] = useState('');

    const [datas, setDatas] = useState([]);
    const [students, setStudents] = useState([]);
    const [question_datas, setQuestionData] = useState([]);
    const [question_count, setQuestionCount] = useState('')
    const [challenge_count, setChallengeCount] = useState('')

    const [modal, setModal] = useState(false);

    const [student_search_value, setStudentSearchValue] = useState([]);

    const challengeAPI = useApi().challenge;
	const elseltApi = useApi().elselt.admissionuserdata

    async function getDatas() {
        const { success, data } = await fetchData(challengeAPI.admission.getAddStudent(currentPage, rowsPerPage, searchValue, challenge_id));
        if (success) {
            setDatas(data?.results);
            setTotalCount(data?.count);
        }
    };

    async function getStudents() {
        const STATE_SEND = 1
        const { success, data } = await fetchStudents(elseltApi.get('Бүгд',1,'',student_search_value,'','','','',STATE_SEND,'','','','','','',''));
        if (success) {
            setStudents(data?.results)
        }
    }

    async function getQuestionTableData() {
        const { success, data } = await fetchQuestion(challengeAPI.getQuestionList(challenge_id))
        if (success) {
            setQuestionCount(data.question_count)
            setChallengeCount(data.challenge_question_count)
            setQuestionData(data.questions)
        }
    }

    async function handleDelete(id) {
        const { success, data } = await fetchData(challengeAPI.admission.deleteStudent(id, challenge_id));
        if (success) {
            getDatas();
        }
    };

    async function handleDeleteQuestion(id) {
        const { success, data } = await fetchData(challengeAPI.deleteQuestion(id));
        if (success) {
            getQuestionTableData();
        }
    };

    useEffect(() => {
        getDatas()
    }, [currentPage, rowsPerPage])

    useEffect(() => {
        getQuestionTableData()
    }, [])

	// #region Элсэлтийн жагсаалт авах
	const [admop, setAdmop] = useState([])
	const admissionApi = useApi().elselt

	async function getAdmission() {
		const { success, data } = await fetchData(admissionApi.getAll())
		if (success) {
			setAdmop(data)
		}
	}

    async function onSubmit(cdata) {
        cdata['admission'] = selectedAdmissionIds
        cdata = convertDefaultValue(cdata)
        const { success, error } = await fetchData(challengeAPI.admission.putTestKind(cdata, challenge_id))
        if (success) {
            getDatas()
        }
        else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message: error[key].msg });
            }
            clearErrors()
        }
    }

    useEffect(() => {
        getAdmission()
    }, [])
    // #endregion

    function handleFilter(e) {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    function handleSearch() {
        getDatas()
    }

    function handleStudentSelect() {
        getStudents()
    }

    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    };

    const handleModal = () => {
        setModal(!modal);
    };

    async function onSubmitStudent(cdata) {
        cdata["challenge"] = challenge_id
        cdata = convertDefaultValue(cdata)
        const { success, error } = await fetchData(challengeAPI.admission.putTest(cdata))
        if (success) {
            getDatas()
        }
        else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in error) {
                setError(error[key].field, { type: 'custom', message: error[key].msg });
            }
        }
    }

    useEffect(
        () => {
            if (searchValue.length === 0) {
                getDatas()
            }
        },
        [searchValue]
    )

    if (question_datas.length > 0) {
        for (let idx = 0; question_datas.length > idx; idx++) {
            status.push(question_datas[idx]?.status)
        }
    }

    return (
        <Fragment>
            <Row className="mt-2">
                <Col md={7}>
                    <Card xs={4}>
                        <CardHeader className="rounded border d-flex flex-row">
                            <Button
                                tag={Link}
                                to={`/${EXAM_ROOT_PAGE}/test`}
                                color="primary"
                                className="btn-sm-block"
                            >
                                {t('Буцах')}
                            </Button>
                            <CardTitle tag='h4' className="mt-0 mx-0">
                                {t('Шалгуулагчийг нэмэх')}
                            </CardTitle>
                        </CardHeader>
                        <Row className="m-0">
                            <Col md={7} className="mx-0 p-0">
                                <Form onSubmit={handleSubmit(onSubmit)}>
                                    <div className='added-cards mb-0 text-center'>
                                        <div className={classnames('cardMaster p-1 rounded border')}>
                                            <div className='content-header mb-2 mt-1'>
                                                <h4 className='content-header'>{t('Элсэлтийг сонгоно уу')}</h4>
                                            </div>
                                            <Row className='mt-1'>
                                                <Controller
                                                    defaultValue=''
                                                    control={control}
                                                    name="admission"
                                                    render={({ field }) => {
                                                        return (
                                                            <Col md={12} className="my-2">
                                                                <Select
                                                                    {...field}
                                                                    id={field.name}
                                                                    classNamePrefix='select'
                                                                    isClearable
                                                                    className={classnames('react-select')}
                                                                    isLoading={isLoading}
                                                                    placeholder={t('-- Сонгоно уу --')}
                                                                    options={admop || []}
                                                                    noOptionsMessage={() => t('Хоосон байна.')}
                                                                    styles={ReactSelectStyles}
                                                                    getOptionValue={(option) => option.id}
                                                                    getOptionLabel={(option) => option.lesson_year + ' ' + option.name}
                                                                    isMulti
                                                                />
                                                                {errors[field.name] && <FormFeedback className='d-block'>{t(errors[field.name].message)}</FormFeedback>}
                                                            </Col>
                                                        );
                                                    }}
                                                />
                                            </Row>
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
                            <Col md={5} className="p-0">
                                <Form onSubmit={handleSubmit(onSubmitStudent)}>
                                    <div className='added-cards mb-0'>
                                        <div className={classnames('cardMaster p-1 rounded border')}>
                                            <div className='content-header mb-2 mt-1 text-center'>
                                                <h4 className='content-header'>{t('Шалгуулагчийг кодоор/регистрийн дугаараар сонгох')}</h4>
                                            </div>
                                            <Row className="justify-content-center">
                                                <Col md={12} className="my-2">
                                                    <Controller
                                                        defaultValue=''
                                                        control={control}
                                                        name="student"
                                                        render={({ field: { value, onChange } }) => {
                                                            return (
                                                                <Select
                                                                    id="student"
                                                                    name="student"
                                                                    classNamePrefix='select'
                                                                    className='react-select'
                                                                    placeholder={`Хайх`}
                                                                    options={students || []}
                                                                    value={students.find((c) => c.id === value)}
                                                                    noOptionsMessage={() => 'Хоосон байна'}
                                                                    onChange={(val) => {
                                                                        onChange(val?.user.register)
                                                                    }}
                                                                    onInputChange={(e) => {
                                                                        setStudentSearchValue(e);
                                                                        if (student_search_value.length > 1) {
                                                                            handleStudentSelect();
                                                                        } else if (student_search_value.length === 0) {
                                                                            setStudents([]);
                                                                        }
                                                                    }}
                                                                    styles={ReactSelectStyles}
                                                                    getOptionValue={(option) => option.id}
                                                                    getOptionLabel={(option) => `${option.user.register} ${option.full_name}`}
                                                                    isLoading={isLoadingExaminee}
                                                                />
                                                            );
                                                        }}
                                                    />
                                                </Col>
                                            </Row>
                                            <div className="text-center">
                                                <Button
                                                    className="me-0 mt-1 text-end"
                                                    color="primary"
                                                    type="submit"
                                                >
                                                    {t("Хадгалах")}
                                                </Button>
                                            </div>
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
                            <div className="d-flex flex-column">
                                <CardTitle tag="h4" className="mt-50 ">{t("Асуулт нэмэх")}</CardTitle>
                                <div className="mt-1">
                                    {challenge_count} / {question_count}
                                </div>
                            </div>
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
                                    <div className="mb-2" style={{ marginTop: '27px' }}>
                                        <h5>{t("Асуулт байхгүй байна")}</h5>
                                    </div>
                                }
                                columns={getQuestionColumns(
                                    currentPage,
                                    rowsPerPage,
                                    total_count,
                                    handleDeleteQuestion,
                                )}
                                paginationPerPage={rowsPerPage}
                                paginationDefaultPage={currentPage}
                                data={question_datas}
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
                    </Card>
                </Col>
            </Row>
            <Card md={12}>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                    <CardTitle tag="h4">{t("Шалгалт өгөх шалгуулагчдын жагсаалт")}</CardTitle>
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
                        lesson={lesson_id}
                        challenge={challenge_id}
                        refreshQuestionData={getQuestionTableData}
                        status={status}
                    />
                )}
            </Card>
        </Fragment>
    )
} export default AddStudent;