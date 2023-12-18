import React, { Fragment, useState, useMemo } from "react";

import { Modal, ModalBody, ModalHeader, Col, Input, Label, Spinner, Button, Badge } from 'reactstrap'

// icon
import { AlertTriangle, ChevronDown } from 'react-feather'

// ** Third Party Components
import DataTable from "react-data-table-component";

import { useTranslation } from "react-i18next";

import { getPagination } from '@utils'

// Хүснэгтйн багана болон хуудаслалт
import { getColumns, customStyles } from "./helpers";


function StudentList({ open, handleModal, handleSelectedModal, datas, isLoading, Loader }) {

    const { t } = useTranslation()

	// Хуудаслалтын хувьсагч
	const [currentPage, setCurrentPage] = useState(1);

	/** Хайлтын хэсгийн хувьсагчид */
	const [searchValue, setSearchValue] = useState('');

    const [rowsPerPage, setRowsPerPage] = useState(10)

	const [filteredData, setFilteredData] = useState([]);

	// Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

    const [is_change, setIsChange] = useState(false);

    const [student_ids, setStudentIds] = useState(0)

    /** Хуудас солих үед ажиллах хэсэг */
	const handlePagination = page => {
		setCurrentPage(page.selected + 1);
	};

    function onSelectedRowsChange(state) {
        var selected_rows = []
        var selectedRows = state.selectedRows

        setIsChange(true)

        if(searchValue) {
            for (let j in filteredData) {
                if(!selectedRows.includes(filteredData[j])) {
                    filteredData[j].is_selected = false
                }
                else {
                    filteredData[j].is_selected = true
                    if(!selected_rows.includes(filteredData[j].id)) {
                        selected_rows.push(filteredData[j].id)
                    }
                }
            }
        } else {
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
        }
        setStudentIds(selected_rows.length)
    }

    const handleChangeModal = () => {
        var student_ids = []
        var check = datas.filter(data => data.is_selected)
        for(let i in check) {
            if(!student_ids.includes(check[i].id)) {
                student_ids.push(check[i].id)
            }
        }
        handleSelectedModal(student_ids)
        handleModal()
    }

    const studentCountMemo = useMemo(() => {
        const count = datas.filter(data => is_change ? data.is_selected : data.selected).length
        return count
    }, [is_change, datas, student_ids])

    // Хайлт хийх үед ажиллах хэсэг
    const handleFilter = e => {
        var updatedData = [];
        const value = e.target.value.trimStart();

        setSearchValue(value);

        if (value.length) {
            updatedData = datas.filter((item) => {
                const startsWith =
                    item?.code?.toString().toLowerCase().startsWith(value.toString().toLowerCase()) ||
                    item?.first_name?.toLowerCase().startsWith(value.toLowerCase()) ||
                    item?.last_name?.toLowerCase().startsWith(value.toLowerCase()) ||
                    item?.group?.name?.toLowerCase().startsWith(value.toLowerCase()) ||
                    item?.full_name?.toLowerCase().startsWith(value.toLowerCase())

                const includes =
                    item?.code?.toString().toLowerCase().includes(value.toString().toLowerCase()) ||
                    item?.first_name?.toLowerCase().includes(value.toLowerCase()) ||
                    item?.last_name?.toLowerCase().includes(value.toLowerCase()) ||
                    item?.group?.name?.toLowerCase().includes(value.toLowerCase()) ||
                    item?.full_name?.toLowerCase().includes(value.toLowerCase())

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
    }

    const searchComponent = useMemo(() => {
        return(
            <Col className="d-flex align-items-center mobile-datatable-search mt-1" md={6} sm={6}>
                <Label className="me-1 search-filter-title pt-50" for="search-input">
                    {t('Хайлт')}
                </Label>
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
			<Modal
				isOpen={open}
				toggle={handleModal}
				className="modal-dialog-centered modal-lg"
				contentClassName="pt-0"
			>
				<ModalHeader
					className="bg-transparent pb-0"
					toggle={handleModal}
					tag="div"
				>
					<h5 className="modal-title">Оюутны жагсаалт</h5>
				</ModalHeader>
				<ModalBody className="flex-grow-1">
                    <div className="react-dataTable react-dataTable-selectable-rows pb-0">

                        {isLoading ?
                            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 100 }}>{Loader}</div>
                            :
                                datas && datas.length > 0 ?
                                    <div>

                                        <div className="d-flex justify-content-end">
                                            {searchComponent}
                                        </div>
                                        <DataTable
                                            title={datas && datas.length > 0 && datas.filter(data => is_change ? data.is_selected : data.selected).length > 0 ? "Оюутны жагсаалт" : ''}
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
                                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count, searchValue, filteredData)}
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
                                            data={searchValue.length ? filteredData : datas}
                                            columns={getColumns(currentPage, rowsPerPage, searchValue.length ? filteredData : datas)}
                                            selectableRows
                                            // subHeader
                                            // subHeaderComponent={searchComponent}
                                            onSelectedRowsChange={(state) => onSelectedRowsChange(state)}
                                            selectableRowSelected={row => is_change ? row?.is_selected : row?.selected}
                                        />
                                    </div>
                                :
                                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 100 }}>
                                        <Badge color="light-warning d-flex align-items-center text-wrap" className="p-1 m-3 rounded-4" style={{ lineHeight: 2 }}>
                                            <AlertTriangle className="me-50" style={{ height: 36, width: 36 }}/>
                                            Уучлаарай тухайн хичээлийн хуваарьд сонгогдсон оюутан байхгүй байна. Та хуваариа шалгаад алдаагүй бол системийн админд хандана уу.
                                        </Badge>
                                    </div>

                        }

                        {
                            datas && datas.length > 0 &&
                            <h6 className="fw-bolder">{t('Сонгогдсон оюутаны тоо:')} {`${studentCountMemo}`}</h6>
                        }
                    </div>
                </ModalBody>
                {
                    datas && datas.length > 0 && datas.filter(data => is_change ? data.is_selected : data.selected).length > 0 &&
                    <Col md={12} className="mb-2 text-center">
                        <Button size='sm' key="submit" className="me-2" onClick={() => handleChangeModal()} color="primary">
                            Сонголт хадгалах
                        </Button>
                        <Button color="secondary" size='sm' type="reset" outline  onClick={handleModal}>
                            {t('Буцах')}
                        </Button>
                    </Col>
                }
            </Modal>
        </Fragment>
    );
}

export default StudentList;
