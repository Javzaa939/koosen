import React, { Fragment, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { getPagination, convertDefaultValue, ReactSelectStyles} from "@utils";
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

import AddQuestion from "./AddQuestion";


function AddStudent(){

    const status = []
	const { t } = useTranslation();

    const { isLoading, Loader, fetchData } = useLoader({});
    const { fetchData: fetchSelectData} = useLoader({});
    const { fetchData: fetchQuestion } = useLoader({});
    const { control, handleSubmit, setError, formState: { errors }, } = useForm({});
    const { challenge_id } = useParams();

    const [scope, setScope] = useState('');

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
		const { success, data } = await fetchSelectData(challengeAPI.getSelect(scope, challenge_id))
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
    },[scope])

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
                                                scope === 3 &&
                                                    <Row className='mt-1'>
                                                        <Col md={12}>
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
                                                                            className={'react-select'}
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
                                                            {errors.select && <FormFeedback className='d-block'>{t(errors.select.message)}</FormFeedback>}
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