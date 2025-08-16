// ** React Imports
import { Fragment, useState, useEffect, useContext} from 'react'

import { Card, CardTitle, CardHeader, Spinner, Button } from 'reactstrap'

import { ChevronDown, Plus } from 'react-feather'
import DataTable from 'react-data-table-component'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import AuthContext from '@context/AuthContext'

import { getColumns } from './helpers';
import UpdateModal from "./Edit"
import AddModal from "./Add"

import { useTranslation } from "react-i18next";

const School = () => {
	const { user } = useContext(AuthContext)
	const [datas, setDatas] = useState([]);
	const { t } = useTranslation();

	// Loader
	const { Loader, isLoading, fetchData } = useLoader({});
	const { isLoading: isTableLoading, fetchData: allFetch } = useLoader({})

	// Modal
	const [detailModalData, setDetailModalData ] = useState({})
	const [update_modal, setUpdateModal] = useState(false)
	const [add_modal, setAddModal]= useState(false)

	// Api
	const schoolApi = useApi().hrms.school

	/* Модал setState функц */
	const handleModal = () => {
		setAddModal(!add_modal)
	}

	/* Жагсаалтын дата авах функц */
	async function getDatas() {
		const { success, data } = await allFetch(schoolApi.get())
		if(success) {
			setDatas(data)
		}
	}

	// Засах функц
    function handleUpdateModal(data) {
        setUpdateModal(!update_modal)
        setDetailModalData(data)
    }

	/* Устгах функц */
	async function handleDelete(id) {
		if (id){
			const { success } = await fetchData(schoolApi.delete(id))
			if(success)
			{
				getDatas()
			}
		}
	}

	useEffect(() => { getDatas() }, [])

	return (
		<Fragment>
			<Card className='pb-1'>
				{isLoading && Loader}
				<CardHeader className="flex-md-row flex-column align-md-items-center align-items-start border-bottom">
					<CardTitle tag='h4'>{t('Сургууль')}</CardTitle>
                    <div className='d-flex flex-wrap mt-md-0 mt-1'>
						<Button
                            color='primary'
                            disabled={Object.keys(user).length > 0 && user?.is_superuser ? false : true}
                            onClick={() => handleModal()}>
                            <Plus size={15} />
                            <span className='align-middle ms-50'>{t('Нэмэх')}</span>
                        </Button>
                    </div>
				</CardHeader>
				<div className="react-dataTable react-dataTable-selectable-rows mx-1">
					<DataTable
						noHeader
						className='react-dataTable'
						progressPending={isTableLoading}
						progressComponent={
							<div className='my-2 d-flex align-items-center justify-content-center'>
								<Spinner className='me-1' size='sm'/><h5>{t('Түр хүлээнэ үү')}...</h5>
							</div>
						}
						noDataComponent={(
							<div className="my-2">
								<h5>{t('Өгөгдөл байхгүй байна')}</h5>
							</div>
						)}
						columns={getColumns(1, 1000, datas, handleUpdateModal, handleDelete, user?.is_hr)}
						sortIcon={<ChevronDown size={10} />}
						data={datas}
						fixedHeader
						fixedHeaderScrollHeight='62vh'
					/>
				</div>
			</Card>
			{ update_modal && <UpdateModal open={update_modal} handleEdit={handleUpdateModal} refreshDatas={getDatas} datas={detailModalData}/> }
			{ add_modal && <AddModal open={add_modal} handleModal={handleModal} refreshDatas={getDatas}/>}
        </Fragment>
    )
}

export default School;
