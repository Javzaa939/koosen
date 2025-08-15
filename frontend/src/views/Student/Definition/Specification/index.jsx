import React, { Fragment, useState, useEffect } from 'react';

import {
    Card,
    CardHeader,
    CardTitle,
    Row,
    Col,
    Input,
    Label,
    Button,
    ListGroupItem,
    Spinner,
} from 'reactstrap';
import { ChevronDown, Plus, Search, Menu, Trash2, Edit } from 'react-feather';
import { useTranslation } from 'react-i18next';
import DataTable, { ExpanderComponentProps } from 'react-data-table-component';
import { useForm, Controller } from 'react-hook-form';

import { ReactSortable } from 'react-sortablejs';

import { getPagination, ReactSelectStyles } from '@utils';

import Select from 'react-select';
import classnames from 'classnames';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import useModal from '@hooks/useModal';

// drag-and-drop.scss
import '@styles/react/libs/drag-and-drop/drag-and-drop.scss';

import FormModal from './form';
import { getColumns, ExpandedComponent } from './helpers';

export default function Specification() {
    const default_page = [10, 15, 50, 75, 100];

    const { showWarning } = useModal();
    const { t } = useTranslation();

    const {
        control,
        setValue,
        formState: { errors },
    } = useForm({});

    const studentApi = useApi().student;
    const signatureApi = useApi().signature;
    const departmentApi = useApi().hrms.department;
    const professionApi = useApi().study.professionDefinition;
    const groupApi = useApi().student.group;
    const settingsApi = useApi().settings.studentRegisterType;

    const { Loader, isLoading, fetchData } = useLoader({});
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({});

    var values = {
        profession: '',
        join_year: '',
        group: '',
        department: '',
        degree: '',
        status: '',
    };
    const [select_value, setSelectValue] = useState(values);

    const [datas, setDatas] = useState([]);
    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1);
    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(10);
    // Хайлт хийхэд ажиллах хувьсагч
    const [searchValue, setSearchValue] = useState('');
    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(1);
    // Эрэмбэлэлт
    const [sortField, setSort] = useState('');
    // Form modal
    const [formModal, setFormModal] = useState(false);

    // Хөтөлбөрөөр хайлт хийх
    const [department_option, setDepartmentOption] = useState([]);

    // Мэргэжлээр хайлт хийх
    const [profession_option, setProfessionOption] = useState([]);

    // Ангиар хайлт хийх
    const [groupOption, setGroupOption] = useState([]);
    const [status_option, setStatusOption] = useState([]);

    const [updateData, setUpdateData] = useState({});

    const [listArr, setListArr] = useState([]);

    useEffect(() => {
        getProfession();
        getGroup();
        getDepartmentOption();
    }, [select_value]);

    useEffect(() => {
        if (searchValue.length == 0) {
            getDatas();
        } else {
            const timeoutId = setTimeout(() => {
                getDatas();
            }, 600);
            return () => clearTimeout(timeoutId);
        }
    }, [rowsPerPage, currentPage, sortField, searchValue, select_value]);

    function getAllData() {
        Promise.all([
            fetchData(
                studentApi.getDefinitionLite(rowsPerPage, currentPage, sortField, searchValue),
            ),
            fetchData(signatureApi.get(1)),
        ]).then((values) => {
            setDatas(values[0]?.data?.results);
            setListArr(values[1]?.data);
            sessionStorage.setItem('signature_data', JSON.stringify(values[1]?.data));
        });
    }

    // Function to handle per page
    function handlePerPage(e) {
        setRowsPerPage(parseInt(e.target.value));
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        getDatas();
    }

    // ** Function to handle filter
    const handleFilter = (e) => {
        const value = e.target.value.trimStart();
        setSearchValue(value);
    };

    function handleSort(column, sort) {
        if (sort === 'asc') {
            setSort(column.header);
        } else {
            setSort('-' + column.header);
        }
    }

    // Хуудас солих үед ажиллах хэсэг
    function handlePagination(page) {
        setCurrentPage(page.selected + 1);
    }

    async function getDatas() {
        const page_count = Math.ceil(total_count / rowsPerPage);

        if (page_count < currentPage && page_count != 0) {
            setCurrentPage(page_count);
        }

        const { success, data } = await allFetch(
            studentApi.getDefinitionLite(
                rowsPerPage,
                currentPage,
                sortField,
                searchValue,
                select_value?.group,
                select_value?.profession,
                select_value?.department,
                select_value?.status,
            ),
        );
        if (success) {
            setTotalCount(data?.count);
            setDatas(data?.results);
        }
    }

    async function getSignatureDatas() {
        const { success, data } = await fetchData(signatureApi.get(1));
        if (success) {
            setListArr(data);
        }
    }

    // Мэргэжлийн жагсаалтын getList функц боловсролын зэргээс хамаарч жагсаалтаа авна. Шаардлагагүй үед хоосон string явуулна.
    async function getProfession() {
        const { success, data } = await fetchData(
            professionApi.getList(select_value?.degree, select_value.department, ''),
        );
        if (success) {
            setProfessionOption(data);
        }
    }

    // Суралцаж буй хэлбэрийн жагсаалт
    async function getStatus() {
        const { success, data } = await fetchData(settingsApi.get());
        if (success) {
            setStatusOption(data);
        }
    }

    // Ангийн жагсаалт авна.
    async function getGroup() {
        const { success, data } = await fetchData(
            groupApi.getList(
                select_value.department,
                select_value.degree,
                select_value.profession,
                select_value.join_year,
            ),
        );
        if (success) {
            setGroupOption(data);
        }
    }

    // Хөтөлбөрийн баг / тэнхимын жагсаалт
    async function getDepartmentOption() {
        const { success, data } = await fetchData(departmentApi.get());
        if (success) {
            setDepartmentOption(data);
        }
    }

    // Нэмэх функц
    function handleModal() {
        setUpdateData({});
        setFormModal(!formModal);
    }

    // Засах функц
    function handleUpdateModal(id, data) {
        setFormModal(!formModal);
        setUpdateData(data);
    }

    /* Устгах функц */
    const handleDelete = async (sigId) => {
        const { success } = await fetchData(signatureApi.delete(sigId));
        if (success) {
            let removeVal = listArr.findIndex(({ id }) => id === sigId);
            listArr.splice(removeVal, 1);
        }
    };

    useEffect(() => {
        getAllData();
        getStatus();
    }, []);

    async function changeOrder(order) {
        let from_id = listArr[order.oldIndex].id;
        let to_id = listArr[order.newIndex].id;

        let data = { from_id, to_id };

        const { success } = await fetchData(signatureApi.changeorder(data, 1));
        if (success) {
            getSignatureDatas();
        }
    }

    return (
        <Fragment>
            {isLoading && Loader}
            <Card>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start">
                    <CardTitle tag="h4">
                        {t('Тохиргоо ')} <small>( гарын үсэг зурах хүмүүс )</small>{' '}
                    </CardTitle>
                    <div className="d-flex flex-wrap mt-md-0 mt-1">
                        <Button color="primary" onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className="align-middle ms-50">{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                {listArr.length != 0 ? (
                    <ReactSortable
                        tag="ul"
                        className="list-group"
                        list={listArr}
                        setList={setListArr}
                        onSort={changeOrder}
                    >
                        {listArr.map((val, idx) => {
                            return (
                                <ListGroupItem className="draggable" key={idx} value={val.id}>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                            <div>
                                                <Menu size={16} className="me-2" />
                                            </div>
                                            <div>
                                                <h5 className="mt-0">
                                                    {val?.last_name} {val?.first_name}
                                                </h5>
                                                {val?.position_name}
                                            </div>
                                        </div>
                                        <div>
                                            <a
                                                role="button"
                                                onClick={() => handleUpdateModal(val?.id, val)}
                                                className="ms-1"
                                            >
                                                <Edit color="gray" width={'18px'} />
                                            </a>
                                            <a
                                                role="button"
                                                onClick={() =>
                                                    showWarning({
                                                        header: {
                                                            title: t(`Устгах үйлдэл`),
                                                        },
                                                        question: t(
                                                            `Та энэхүү тохиргоог устгахдаа итгэлтэй байна уу?`,
                                                        ),
                                                        onClick: () => handleDelete(val?.id),
                                                        btnText: t('Устгах'),
                                                    })
                                                }
                                                className="ms-1"
                                            >
                                                <Trash2 color="red" width={'18px'} />
                                            </a>
                                        </div>
                                    </div>
                                </ListGroupItem>
                            );
                        })}
                    </ReactSortable>
                ) : (
                    <p className="text-center">Өгөгдөл байхгүй байна.</p>
                )}
            </Card>
            <Card>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
                    <CardTitle tag="h4">{t('Тодорхойлолт')}</CardTitle>
                </CardHeader>
                <Row className="  mx-0 mt-1 mb-1">
                    <Col sm={6} lg={3}>
                        <Label className="form-label" for="department">
                            {t('Хөтөлбөрийн баг / тэнхим / тэнхим')}
                        </Label>
                        <Controller
                            control={control}
                            defaultValue=""
                            name="department"
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <Select
                                        name="department"
                                        id="department"
                                        classNamePrefix="select"
                                        isClearable
                                        className={classnames('react-select', {
                                            'is-invalid': errors.department,
                                        })}
                                        isLoading={isLoading}
                                        placeholder={`-- Сонгоно уу --`}
                                        options={department_option || []}
                                        value={department_option.find((c) => c.id === value)}
                                        noOptionsMessage={() => 'Хоосон байна'}
                                        onChange={(val) => {
                                            onChange(val?.id || '');
                                            if (val?.id) {
                                                setSelectValue((current) => {
                                                    return {
                                                        ...current,
                                                        department: val?.id,
                                                    };
                                                });
                                            } else {
                                                setSelectValue((current) => {
                                                    return {
                                                        ...current,
                                                        department: '',
                                                    };
                                                });
                                            }
                                        }}
                                        styles={ReactSelectStyles}
                                        getOptionValue={(option) => option.id}
                                        getOptionLabel={(option) => option.name}
                                    />
                                );
                            }}
                        ></Controller>
                    </Col>
                    <Col sm={6} lg={3}>
                        <Label className="form-label" for="profession">
                            {t('Мэргэжил / хөтөлбөр')}
                        </Label>
                        <Select
                            name="profession"
                            id="profession"
                            classNamePrefix="select"
                            isClearable
                            className={classnames('react-select', {
                                'is-invalid': errors.profession,
                            })}
                            isLoading={isLoading}
                            placeholder={`-- Сонгоно уу --`}
                            options={profession_option || []}
                            value={profession_option.find((c) => c.id === select_value.profession)}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {
                                if (val?.id) {
                                    setSelectValue((current) => {
                                        return {
                                            ...current,
                                            profession: val?.id,
                                        };
                                    });
                                } else {
                                    setSelectValue((current) => {
                                        return {
                                            ...current,
                                            profession: '',
                                        };
                                    });
                                }
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.full_name}
                        />
                    </Col>
                    <Col sm={6} lg={3}>
                        <Label className="form-label" for="group">
                            {t('Анги / бүлэг')}
                        </Label>
                        <Select
                            name="group"
                            id="group"
                            classNamePrefix="select"
                            isClearable
                            className={classnames('react-select', { 'is-invalid': errors.group })}
                            isLoading={isLoading}
                            placeholder={`-- Сонгоно уу --`}
                            options={groupOption || []}
                            value={groupOption.find((c) => c.id === select_value.group)}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {
                                if (val?.id) {
                                    setSelectValue((current) => {
                                        return {
                                            ...current,
                                            group: val?.id,
                                        };
                                    });
                                } else {
                                    setSelectValue((current) => {
                                        return {
                                            ...current,
                                            group: '',
                                        };
                                    });
                                }
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                    <Col sm={6} md={3}>
                        <Label className="form-label" for="status">
                            {t('Төлөв')}
                        </Label>
                        <Select
                            name="status"
                            id="status"
                            classNamePrefix="select"
                            isClearable
                            className={classnames('react-select')}
                            isLoading={isLoading}
                            placeholder={`-- Сонгоно уу --`}
                            options={status_option || []}
                            value={status_option.find((c) => c.id === select_value.status)}
                            noOptionsMessage={() => 'Хоосон байна'}
                            onChange={(val) => {
                                if (val?.id) {
                                    setSelectValue((current) => {
                                        return {
                                            ...current,
                                            status: val?.id,
                                        };
                                    });
                                } else {
                                    setSelectValue((current) => {
                                        return {
                                            ...current,
                                            status: '',
                                        };
                                    });
                                }
                            }}
                            styles={ReactSelectStyles}
                            getOptionValue={(option) => option.id}
                            getOptionLabel={(option) => option.name}
                        />
                    </Col>
                </Row>
                <Row className="justify-content-between mx-0">
                    <Col
                        className="d-flex align-items-center justify-content-start mt-1"
                        md={6}
                        sm={12}
                    >
                        <Col md={2} sm={3} className="pe-1">
                            <Input
                                className="dataTable-select me-1 mb-50"
                                type="select"
                                bsSize="sm"
                                style={{ height: '30px' }}
                                value={rowsPerPage}
                                onChange={(e) => handlePerPage(e)}
                            >
                                {default_page.map((page, idx) => (
                                    <option key={idx} value={page}>
                                        {page}
                                    </option>
                                ))}
                            </Input>
                        </Col>
                        <Col md={10} sm={3}>
                            <Label for="sort-select">{t('Хуудсанд харуулах тоо')}</Label>
                        </Col>
                    </Col>
                    <Col
                        className="d-flex align-items-center mobile-datatable-search mt-1"
                        md={6}
                        sm={12}
                    >
                        <Input
                            className="dataTable-filter mb-50"
                            type="text"
                            bsSize="sm"
                            id="search-input"
                            placeholder={t('Хайх')}
                            value={searchValue}
                            onChange={handleFilter}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button
                            size="sm"
                            className="ms-50 mb-50"
                            color="primary"
                            onClick={handleSearch}
                        >
                            <Search size={15} />
                            <span className="align-middle ms-50"></span>
                        </Button>
                    </Col>
                </Row>
                <div className="react-dataTable react-dataTable-selectable-rows">
                    <div id="expandableRowsId">
                        <DataTable
                            noHeader
                            pagination
                            paginationServer
                            className="react-dataTable"
                            progressPending={isTableLoading}
                            progressComponent={
                                <div className="my-2 d-flex align-items-center justify-content-center">
                                    <Spinner className="me-1" color="" size="sm" />
                                    <h5>Түр хүлээнэ үү...</h5>
                                </div>
                            }
                            noDataComponent={
                                <div className="my-2">
                                    <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                </div>
                            }
                            onSort={handleSort}
                            sortIcon={<ChevronDown size={10} />}
                            columns={getColumns(currentPage, rowsPerPage, total_count)}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            paginationComponent={getPagination(
                                handlePagination,
                                currentPage,
                                rowsPerPage,
                                total_count,
                            )}
                            data={datas}
                            fixedHeader
                            fixedHeaderScrollHeight="62vh"
                            expandableRows
                            expandableRowsComponent={ExpandedComponent}
                        />
                    </div>
                </div>
            </Card>

            {formModal && (
                <FormModal
                    open={formModal}
                    handleModal={handleModal}
                    refreshDatas={getSignatureDatas}
                    defaultDatas={updateData}
                />
            )}
        </Fragment>
    );
}
