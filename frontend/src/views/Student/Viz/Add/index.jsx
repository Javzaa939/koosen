// ** React imports
import React, { Fragment, useState, useEffect, useContext, useMemo } from 'react'

import { X } from "react-feather";

import Select from 'react-select'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import SchoolContext from "@context/SchoolContext"

import { ReactSelectStyles, getPagination} from "@utils"

import classnames from "classnames";

import { useForm, Controller } from "react-hook-form";

import {
    Row,
    Col,
	Form,
	Modal,
	Input,
	Label,
	Button,
    Spinner,
	ModalBody,
	ModalHeader,
	FormFeedback,
} from "reactstrap";

import { ChevronDown, Plus, Search } from 'react-feather'
import { validate, convertDefaultValue,generateLessonYear, get_status} from "@utils"
import { validateSchema } from '../validateSchema';
import { useTranslation } from 'react-i18next'
import DataTable from 'react-data-table-component'
import { getColumns, customStyles } from './helpers'

const Addmodal = ({ open, handleModal, refreshDatas}) => {

    const CloseBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    )

    const { school_id } = useContext(SchoolContext)

    var values = {
        year:'',
        status: '',
    }
    const [select_value, setSelectValue] = useState(values)
    const [yearOption, setYear] = useState(generateLessonYear(10))
    const [status_option, setStatusOption] = useState(get_status())
    const [datas, setDatas] = useState([])
    const [filteredData, setFilteredData] = useState([]);

    const { t } = useTranslation()
    // ** Hook
    const { control, handleSubmit, reset, setError, setValue, formState: { errors } } = useForm(validate(validateSchema));

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

    // Хуудаслалтын анхны утга
    const [currentPage, setCurrentPage] = useState(1)

    // Нэг хуудсанд харуулах нийт датаны тоо
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

    // Нийт хуудасны тоо
    const [pageCount, setPageCount] = useState(1)

    const default_page = [10, 15, 50, 75, 100]
    const [searchValue, setSearchValue] = useState('')

    const [is_change, setIsChange] = useState(false);
    const [student_ids, setStudentIds] = useState(0)
    const [check, setCheck] = useState(false)

    // Эрэмбэлэлт
    const [sort, setSort] = useState('')

    // Api
    const studentApi = useApi().student.viz
    const studentListApi = useApi().student

     // зөвхөн оюутны жагсаалт харуулах
    const getStudentList = async() => {
        const { success, data } = await fetchData(studentListApi.get(rowsPerPage, currentPage,"", "", "","", "", "", "", "", "", ""))
        if(success)
        {
            setDatas(data?.results)
            setTotalCount(data?.count)

        }
    }

    useEffect(() => {
        getStudentList()
    },[rowsPerPage, currentPage, school_id])

    async function onSubmit(cdata) {

        var selected = datas.filter((select) => select.is_selected == true)

        cdata['student'] = selected.map((c) => c.id)
        cdata['year'] = select_value.year
        cdata['status'] = select_value.status
        cdata = convertDefaultValue(cdata)
        const { success, errors} = await fetchData(studentApi.post(cdata))
        if(success)
        {
            reset()
            handleModal()
            refreshDatas()
        }
        else {
            /** Алдааны мессэжийг input дээр харуулна */
            for (let key in errors) {
                setError(errors[key].field, { type: 'custom', message:  errors[key].msg});
            }
        }
	}

    // Хайлт хийх үед ажиллах хэсэг
	const handleFilter = (e) => {
		var updatedData = [];
		const value = e.target.value.trimStart();

		setSearchValue(value);

		if (value.length) {
			updatedData = datas.filter((item) => {
				const startsWith =
					item?.code?.toString().toLowerCase().startsWith(value.toString().toLowerCase()) ||
					item?.first_name?.toLowerCase().startsWith(value.toLowerCase()) ||
					item?.last_name?.toString().toLowerCase().startsWith(value.toString().toLowerCase()) ||
					item?.register_num?.toString().toLowerCase().startsWith(value.toString().toLowerCase())

				const includes =
					item?.code?.toString().toLowerCase().includes(value.toString().toLowerCase()) ||
					item?.first_name?.toLowerCase().includes(value.toLowerCase()) ||
                    item?.last_name?.toString().toLowerCase().includes(value.toString().toLowerCase()) ||
					item?.register_num?.toString().toLowerCase().includes(value.toString().toLowerCase())

				if (startsWith) {
					return startsWith;
				}
				else if (!startsWith && includes) {
					return includes;
				}
				else {
					return null;
				}
			});

			setFilteredData(updatedData);
			setSearchValue(value);
		}
	};

    function onSelectedRowsChange(state) {
        var selected_rows = []
        var selectedRows = state.selectedRows

        var selected = selectedRows.filter((select) => select.is_selected == true)

        setIsChange(true)
        setCheck(selected.length > 0)

        for (let i in datas) {
            if(!selectedRows.includes(datas[i])) {
                datas[i].is_selected = false
            }
            else {
                datas[i].is_selected = true
                if(!selected_rows.includes(datas[i].id)) {
                    selected_rows.push(datas[i].id)
                }
            }
        }
        setStudentIds(selected_rows.length)
    }

    // Хуудас солих үед ажиллах хэсэг
    const handlePagination= page => {
		setCurrentPage(page.selected + 1);
	};

    const studentCountMemo = useMemo(() => {
        const count = datas.filter(data => is_change ? data.is_selected : data.selected).length
        return count
    }, [is_change, datas, student_ids])

    const searchComponent = useMemo(() => {
        return(
            <Col className="d-flex align-items-center mobile-datatable-search mt-1" md={6} sm={6}>
                <Input
                    className="dataTable-filter mb-50"
                    type="text"
                    bsSize="sm"
                    id="search-input"
                    value={searchValue}
                    onChange={handleFilter}
                    placeholder={t('Хайх үг....')}
                />
            </Col>
        )
    }, [searchValue, datas])

	return (
        <Fragment>
            {
                postLoading &&
                    <div className='suspense-loader'>
                        <Spinner size='bg'/>
                        <span className='ms-50'>{t('Түр хүлээнэ үү...')}</span>
                    </div>
            }
            <Modal
                isOpen={open}
                toggle={handleModal}
                className='modal-dialog-centered modal-lg'
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={CloseBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{t('Гадаад оюутны визний мэдээлэл нэмэх')}</h5>
                </ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <Row tag={Form} className="gy-1" onSubmit={handleSubmit(onSubmit)}>
                        <Col lg={6} md={6}>
                            <Label className="form-label" for="year">
                                {t("Жил")}
                            </Label>
                            <Controller
                                control={control}
                                defaultValue=''
                                name="year"
                                render={({ field: { value, onChange} }) => {
                                    return (
                                        <Select
                                            name="year"
                                            id="year"
                                            classNamePrefix='select'
                                            isClearable
                                            className={classnames('react-select', { 'is-invalid': errors.year })}
                                            isLoading={isLoading}
                                            placeholder={`-- Сонгоно уу --`}
                                            options={yearOption || []}
                                            value={yearOption.find((c) => c.id === value)}
                                            noOptionsMessage={() => 'Хоосон байна'}
                                            onChange={(val) => {
                                                onChange(val?.id || '')
                                                if (val?.id) {
                                                    setSelectValue(current => {
                                                        return {
                                                            ...current,
                                                            year: val?.id
                                                        }
                                                    })
                                                } else {
                                                    setSelectValue(current => {
                                                        return {
                                                            ...current,
                                                            year: ''
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
                            {errors.year && <FormFeedback className='d-block'>{errors.year.message}</FormFeedback>}
                        <Col lg={6} md={6} >
                            <Label className="form-label" for="status">
                                {t("Төлөв")}
                            </Label>
                            <Select
                                name="status"
                                id="status"
                                classNamePrefix='select'
                                isClearable
                                className={classnames('react-select', { 'is-invalid': errors.status})}
                                isLoading={isLoading}
                                placeholder={`-- Сонгоно уу --`}
                                options={status_option || []}
                                value={status_option.find((c) => c.id === select_value.status)}
                                noOptionsMessage={() => 'Хоосон байна'}
                                onChange={(val) => {
                                    if (val?.id) {
                                        setSelectValue(current => {
                                            return {
                                                ...current,
                                                status: val?.id
                                            }
                                        })
                                    } else {
                                        setSelectValue(current => {
                                            return {
                                                ...current,
                                                status: ''
                                            }
                                        })
                                    }
                                }}
                                styles={ReactSelectStyles}
                                getOptionValue={(option) => option.id}
                                getOptionLabel={(option) => option.name}
                            />
                        </Col>
                            {errors.status && <FormFeedback className='d-block'>{errors.status.message}</FormFeedback>}
                        <div className="react-dataTable react-dataTable-selectable-rows pb-0">
                        <DataTable
                            responsive
                            pagination
                            noHeader
                            progressComponent={(
                                <div className='my-2'>
                                    <Spinner size='sm' />
                                    <span className='ms-50'>Түр хүлээнэ үү...</span>
                                </div>
                            )}
                            className="react-dataTable"
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                            noDataComponent={(
                                <h5 className="mb-2">Өгөгдөл байхгүй байна.</h5>
                            )}
                            sortIcon={<ChevronDown size={10} />}
                            pointerOnHover
                            customStyles={customStyles}
                            contextMessage={
                                {
                                    singular: '',
                                    plural: '',
                                    message: 'оюутан сонгосон байна.'
                                }
                            }
                            data={searchValue.length > 0 ? filteredData : datas}
                            columns={getColumns(currentPage, rowsPerPage, datas)}
                            selectableRows
                            subHeader
                            subHeaderComponent={searchComponent}
                            onSelectedRowsChange={(state) => onSelectedRowsChange(state)}
                            selectableRowSelected={row => is_change ? row?.is_selected && row?.is_selected : true}
                        />
                        {
                            datas &&
                            <h6 className="fw-bolder">{t('Сонгогдсон оюутны тоо:')} {`${studentCountMemo}`}</h6>
                        }
                    </div>
                    {
                        check &&
                       <Col lg={12} className='d-flex' >
                            <div className='d-inline-block m-auto'>
                                <Button className="me-2" color="primary" type="submit" disabled={postLoading}>
                                    {postLoading &&<Spinner size='sm' className='me-1'/>}
                                    {t('Хадгалах')}
                                </Button>
                                <Button color="secondary" type="reset" outline  onClick={handleModal}>
                                    {t('Буцах')}
                                </Button>
                            </div>
                        </Col>
                    }
                    </Row>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default Addmodal;
