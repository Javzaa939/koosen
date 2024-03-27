
import React, { Fragment, useState, useEffect } from "react"

import { Card, CardHeader, CardTitle, Row, Col, Input, Label, Button, ListGroupItem, Spinner } from "reactstrap"
import { ChevronDown, Plus, Search, Menu, Trash2, Edit } from 'react-feather'
import { useTranslation } from 'react-i18next'
import DataTable, { ExpanderComponentProps } from 'react-data-table-component'

import { ReactSortable } from 'react-sortablejs'

import { getPagination } from '@utils'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'
import useModal from '@hooks/useModal'

// drag-and-drop.scss
import '@styles/react/libs/drag-and-drop/drag-and-drop.scss'

import FormModal from "./form"
import { getColumns, ExpandedComponent } from './helpers'

export default function Specification()
{
    const default_page = [10, 15, 50, 75, 100]

    const { showWarning } = useModal()
    const { t } = useTranslation()

    const studentApi = useApi().student
    const signatureApi = useApi().signature
    const { Loader, isLoading, fetchData } = useLoader({})
    const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({})

    const [ datas, setDatas ] = useState([])
    // Хуудаслалтын анхны утга
    const [ currentPage, setCurrentPage ] = useState(1)
    // Нэг хуудсанд харуулах нийт датаны тоо
    const [ rowsPerPage, setRowsPerPage ] = useState(10)
    // Хайлт хийхэд ажиллах хувьсагч
    const [ searchValue, setSearchValue ] = useState('')
    // Нийт датаны тоо
    const [ total_count, setTotalCount ] = useState(1)
    // Эрэмбэлэлт
    const [ sortField, setSort ] = useState('')
    // Form modal
    const [ formModal, setFormModal ] = useState(false);
    const [ updateData, setUpdateData ] = useState({})

    const [ listArr, setListArr ] = useState([])

    useEffect(
        () =>
        {
            if (searchValue.length == 0) {
                getDatas();
            } else {
                const timeoutId = setTimeout(() => {
                    getDatas();
                }, 600);
                return () => clearTimeout(timeoutId);
            }
        },
        [rowsPerPage, currentPage, sortField, searchValue]
    )
    function getAllData()
    {
        Promise.all([
            fetchData(studentApi.getDefinitionLite(rowsPerPage, currentPage, sortField, searchValue)),
            fetchData(signatureApi.get(1)),
        ]).then((values) => {
            setDatas(values[0]?.data?.results)
            setListArr(values[1]?.data)
            sessionStorage.setItem("signature_data", JSON.stringify(values[1]?.data))
        })
    }

    // Function to handle per page
    function handlePerPage(e)
    {
        setRowsPerPage(parseInt(e.target.value))
    }

    // Хайх товч дарсан үед ажиллах функц
    async function handleSearch() {
        getDatas()
    }

    // ** Function to handle filter
    const handleFilter = e =>
    {
        const value = e.target.value.trimStart();
        setSearchValue(value)
    }

    function handleSort(column, sort)
    {
        if(sort === 'asc')
        {
            setSort(column.header)
        }
        else
        {
            setSort('-' + column.header)
        }
    }

    // Хуудас солих үед ажиллах хэсэг
	function handlePagination(page)
    {
		setCurrentPage(page.selected + 1);
	};

    async function getDatas()
    {
        const page_count = Math.ceil(total_count / rowsPerPage)

        if (page_count < currentPage && page_count != 0)
        {
            setCurrentPage(page_count)
        }

        const { success, data } = await allFetch(studentApi.getDefinitionLite(rowsPerPage, currentPage, sortField, searchValue))
        if(success)
        {
            setTotalCount(data?.count)
            setDatas(data?.results)
        }
    }

    async function getSignatureDatas()
    {
        const { success, data } = await fetchData(signatureApi.get(1))
        if (success)
        {
            setListArr(data)
        }
    }

    // Нэмэх функц
    function handleModal()
    {
        setUpdateData({})
        setFormModal(!formModal)
    }

    // Засах функц
    function handleUpdateModal(id, data)
    {
        setFormModal(!formModal)
        setUpdateData(data)
    }

    /* Устгах функц */
	const handleDelete = async(sigId) =>
    {
		const { success } = await fetchData(signatureApi.delete(sigId))
		if(success) {
			let removeVal = listArr.findIndex(({ id }) => id === sigId)
            listArr.splice(removeVal, 1)
		}
	};

    useEffect(
        () =>
        {
            getAllData()
        },
        []
    )

    async function changeOrder(order)
    {
        let from_id = listArr[order.oldIndex].id
        let to_id = listArr[order.newIndex].id

        let data = { from_id, to_id }

        const { success } = await fetchData(signatureApi.changeorder(data, 1))
        if (success)
        {
            getSignatureDatas()
        }
    }

    return (
        <Fragment>
            { isLoading && Loader }
            <Card>
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start'>
                    <CardTitle tag='h4'>{t('Тохиргоо ')} <small>( гарын үсэг зурах хүмүүс )</small> </CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button color='primary' onClick={() => handleModal()} >
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                {
                    listArr.length != 0
                    ?
                        <ReactSortable
                            tag='ul'
                            className='list-group'
                            list={listArr}
                            setList={setListArr}
                            onSort={changeOrder}
                        >
                        {
                            listArr.map((val, idx) => {
                                return (
                                    <ListGroupItem className='draggable' key={idx} value={val.id} >
                                        <div className='d-flex align-items-center justify-content-between'>
                                            <div className="d-flex align-items-center">
                                                <div>
                                                    <Menu size={16} className="me-2" />
                                                </div>
                                                <div>
                                                    <h5 className='mt-0'>{val?.last_name} {val?.first_name}</h5>
                                                    {val?.position_name}
                                                </div>
                                            </div>
                                            <div>
                                                <a role="button"
                                                    onClick={() => handleUpdateModal(val?.id, val)}
                                                    className="ms-1"
                                                >
                                                    <Edit color="gray" width={"18px"} />
                                                </a>
                                                <a role="button"
                                                    onClick={() => showWarning({
                                                        header: {
                                                            title: t(`Устгах үйлдэл`),
                                                        },
                                                        question: t(`Та энэхүү тохиргоог устгахдаа итгэлтэй байна уу?`),
                                                        onClick: () => handleDelete(val?.id),
                                                        btnText: t('Устгах'),
                                                    })}
                                                    className="ms-1"
                                                >
                                                    <Trash2 color="red" width={"18px"} />
                                                </a>
                                            </div>
                                        </div>
                                    </ListGroupItem>
                                )
                            })
                        }
                        </ReactSortable>
                    :
                        <p className="text-center">Өгөгдөл байхгүй байна.</p>
                }
            </Card>
            <Card>
                <CardHeader className='flex-md-row flex-column align-md-items-center align-items-start border-bottom'>
                    <CardTitle tag='h4'>{t('Тодорхойлолт')}</CardTitle>
                </CardHeader>
                <Row className='justify-content-between mx-0'>
                    <Col className='d-flex align-items-center justify-content-start mt-1' md={6} sm={12}>
                        <Col md={2} sm={3} className='pe-1'>
                            <Input
                                className='dataTable-select me-1 mb-50'
                                type='select'
                                bsSize='sm'
                                style={{ height: "30px" }}
                                value={rowsPerPage}
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
                                    ))
                                }
                            </Input>
                        </Col>
                        <Col md={10} sm={3}>
                            <Label for='sort-select'>{t('Хуудсанд харуулах тоо')}</Label>
                        </Col>
                    </Col>
                    <Col className='d-flex align-items-center mobile-datatable-search mt-1' md={6} sm={12}>
                        <Input
                            className='dataTable-filter mb-50'
                            type='text'
                            bsSize='sm'
                            id='search-input'
                            placeholder={t("Хайх")}
                            value={searchValue}
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
                </Row>
                <div className='react-dataTable react-dataTable-selectable-rows' >
                    <div id="expandableRowsId">
                        <DataTable
                            noHeader
                            pagination
                            paginationServer
                            className='react-dataTable'
                            progressPending={isTableLoading}
                            progressComponent={
                                <div className='my-2 d-flex align-items-center justify-content-center'>
                                    <Spinner className='me-1' color="" size='sm'/><h5>Түр хүлээнэ үү...</h5>
                                </div>
                            }
                            noDataComponent={(
                                <div className="my-2">
                                    <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                </div>
                            )}
                            onSort={handleSort}
                            sortIcon={<ChevronDown size={10} />}
                            columns={getColumns(currentPage, rowsPerPage, total_count)}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                            data={datas}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                            expandableRows
                            expandableRowsComponent={ExpandedComponent}
                        />
                    </div>
                </div>
            </Card>

            { formModal && <FormModal open={formModal} handleModal={handleModal} refreshDatas={getSignatureDatas} defaultDatas={updateData} /> }

        </Fragment>
    )
}
