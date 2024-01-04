// ** React Import
import { Fragment, useState, useEffect, useContext } from "react"

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner } from "reactstrap"

import { useTranslation } from "react-i18next"

import { ChevronDown, Plus } from "react-feather"

import DataTable from "react-data-table-component"

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from '@context/AuthContext'

import { getPagination } from '@utils'

import { getColumns } from './helpers';

import Addmodal from './Add'

const AdmissionLesson = () =>{

    const { t } = useTranslation()
    const { user } = useContext(AuthContext)

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [searchValue, setSearchValue] = useState("");

    const [filteredData, setFilteredData] = useState([]);
    const [datas, setDatas] = useState([]);

    const [edit_id, setEditId] = useState('')
    // нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

    // loader
    const { isLoading, fetchData} = useLoader({});

    // Modal
    const [modal, setModal] = useState(false);

    // Api
    const admissionlessonApi = useApi().settings.admissionlesson

    /* Модал setState функц */
    const handleModal = () =>{
        setModal(!modal)
        if(modal){
            setEditId()
        }
    }

    // Засах функц
    function handleUpdateModal(id) {
        if (id){
            setEditId(id)
        }
        handleModal()
    }

    /*Жагсаалт дата авах функц */
    async function getDatas(){
        const { success, data } = await fetchData(admissionlessonApi.get())
        if (success){
            setDatas(data)
            setTotalCount(data.length)
        }
    }


    useEffect(() => {
        getDatas()
    }, [])


    /* Жагсаалтын дата устгах функц */
	async function handleDelete(id){
		if(id){
			const{ success} = await fetchData(admissionlessonApi.delete(id))
			if (success){
				getDatas()
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
                    item.lesson_code.toString().toLowerCase().startsWith(value.toString().toLowerCase()) ||
                    item.lesson_name.toString().toLowerCase().startsWith(value.toString().toLowerCase())

                const includes =
                    item.lesson_code.toString().toLowerCase().startsWith(value.toString().toLowerCase()) ||
                    item.lesson_name.toString().toLowerCase().startsWith(value.toString().toLowerCase())

                if(startsWith) {
                    return startsWith;
                }
                else if(!startsWith && includes) {
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

    // Хуудас солих үед ажиллах хэсэг
    const handlePagination = (page) => {
        setCurrentPage(page.selected + 1);
    };

    return (
        <Fragment>
            <Card>
                <CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('ЭЕШ-ын хичээл')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-settings-admissionlesson-create') ? false : true} color='primary' onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
                <Row className="justify-content-between mx-0">
					<Col className="datatable-search-text d-flex justify-content-start mt-1" md={6} sm={6}>
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
				</Row>
                {isLoading ?
                    <div className="my-2 text-center" sm={12}>
						<Spinner size='sm' />
						<span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
					</div>
				:
					<div className="react-dataTable react-dataTable-selectable-rows">
						<DataTable
                            noHeader
                            pagination
                            className='react-dataTable'
                            progressPending={isLoading}
                            progressComponent={(
                                <div className='my-2'>
                                    <h5>{t('Түр хүлээнэ үү')}...</h5>
                                </div>
                            )}
                            noDataComponent={(
                                <div className="my-2">
                                    <h5>{t('Өгөгдөл байхгүй байна')}</h5>
                                </div>
                            )}
                            columns={getColumns(currentPage, rowsPerPage, searchValue.length ? filteredData : datas, handleUpdateModal, user, handleDelete)}
                            sortIcon={<ChevronDown size={10} />}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            data={searchValue.length ? filteredData : datas}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count, searchValue, filteredData)}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                        />
					</div>
                }
                {modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} editId={edit_id} handleEdit={handleUpdateModal}/>}

            </Card>
        </Fragment>
    )
}
export default AdmissionLesson;
