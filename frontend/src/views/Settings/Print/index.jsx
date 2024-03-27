// ** React Imports
import { Fragment, useState, useEffect, useContext } from 'react'

import { Row, Col, Card, Input, Label, Button, CardTitle, CardHeader, Spinner } from 'reactstrap'

import { useTranslation } from 'react-i18next'

import { ChevronDown, Plus } from 'react-feather'

import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';
import AuthContext from "@context/AuthContext"

import { getPagination } from '@utils'

import { getColumns } from './helpers'

import Addmodal from './Add'

const Print = () => {

	const { t } = useTranslation()
	const { user } = useContext(AuthContext)

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10)
	const [datas, setDatas] = useState([]);

	const [edit_id, setEditId] = useState('')

    // Нийт датаны тоо
    const [total_count, setTotalCount] = useState(datas.length || 1)

	// Loader
	const { isLoading, fetchData } = useLoader({});

	// Modal
	const [modal, setModal] = useState(false);

	// Api
	const PrintApi = useApi().settings.print

	/* Модал setState функц */
	const handleModal = () => {
		setModal(!modal)
		if(modal){
			setEditId()
		}
	}

	// Засах функц
    function handleUpdateModal(id) {
        setEditId(id)
		handleModal()
    }

	/* Жагсаалтын дата авах функц */
	async function getDatas() {
		const { success, data } = await fetchData(PrintApi.get())
		if(success) {
			setDatas(data)
			setTotalCount(data.length)
		}
	}

	/* Жагсаалтын дата устгах функц */
	async function handleDelete(id){
		if(id){
			const{ success} = await fetchData(PrintApi.delete(id))
			if (success){
				getDatas()
			}
		}
	}

	useEffect(() => {
		getDatas()
	},[])

	// Хуудас солих үед ажиллах хэсэг
	const handlePagination = (page) => {
		setCurrentPage(page.selected + 1);
	};


	return (
		<Fragment>
			<Card>
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag="h4">{t('Хэвлэх маягтын хэмжээс')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
                        <Button
							color='primary'
							onClick={() => handleModal()}
							disabled={Object.keys(user).length > 0 ? false : true  }
							// disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-settings-print-create') ? false : true}

						>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
                </CardHeader>
				{isLoading ?
					<div className="my-2 text-center" sm={12}>
						<Spinner size='sm' />
						<span className='ms-50'>{t('Түр хүлээнэ үү')}...</span>
					</div>
				:
					<div className="react-dataTable react-dataTable-selectable-rows" id="datatableLeftTwoRightOne">
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
                            columns={getColumns(currentPage, rowsPerPage,datas, handleUpdateModal, user, handleDelete)}
                            sortIcon={<ChevronDown size={10} />}
                            paginationPerPage={rowsPerPage}
                            paginationDefaultPage={currentPage}
                            data={datas}
                            paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
                            fixedHeader
                            fixedHeaderScrollHeight='62vh'
                        />
					</div>
				}
				{modal && <Addmodal open={modal} handleModal={handleModal} refreshDatas={getDatas} editId={edit_id}/>}
			</Card>
        </Fragment>
    )
}

export default Print;

