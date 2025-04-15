import { Badge, Button, UncontrolledTooltip } from 'reactstrap';
import '../../style.scss';
import { QUIZ } from '../../utils';
import AddEditOnlineSubInfo from '../AddEditOnlineSubInfo';
import { Fragment, useState } from 'react';
import useModal from '@src/utility/hooks/useModal';
import { Edit, Plus, Trash2 } from 'react-feather';

export default function OnlineSubInfoBlock({
	t,
	datas = [],
	handleSelectOnlineSubInfo,
	onlineInfoTitle,
	getOnlineSubInfoDatas,
	elearnId,
	onlineInfoId,
	fetchData,
	remoteApi
}) {
	// #region addEditModal
	const [addEditModal, setAddEditModal] = useState(false)
	const [editData, setEditData] = useState()

	function toggleAddEditModal(data) {
		if (addEditModal) setEditData()
		else setEditData(data)

		setAddEditModal(!addEditModal)
	}
	// #endregion

	// #region to handle 'delete' modal
	const { showWarning } = useModal()

	async function handleDelete(id) {
		const { success } = await fetchData(remoteApi.onlineSubInfo.delete(id))
		if (success) getOnlineSubInfoDatas()
	}
	// #endregion

	const [activeOnlineSubInfo, setActiveOnlineSubInfo] = useState()

	function handleSelectOnlineSubInfoLocal(onlineSubInfosItem, onlineInfoTitle) {
		handleSelectOnlineSubInfo(onlineSubInfosItem, onlineInfoTitle)
		setActiveOnlineSubInfo(onlineSubInfosItem.id)
	}

	return datas.map((onlineSubInfosItem, onlineSubInfosInd) => {
		const { id, title, quezquestions_count, file_type_name, file_type } = onlineSubInfosItem

		return <Fragment key={onlineSubInfosInd}>
			{addEditModal && <AddEditOnlineSubInfo
				open={addEditModal}
				handleModal={toggleAddEditModal}
				refreshDatas={getOnlineSubInfoDatas}
				elearnId={elearnId}
				onlineInfoId={onlineInfoId}
				editData={editData}
			/>}
			<Button
				color='Link'
				className="d-flex justify-content-between p-1 w-100 text-start"
				onClick={() => handleSelectOnlineSubInfoLocal(onlineSubInfosItem, onlineInfoTitle)}
				style={activeOnlineSubInfo === id ? { backgroundColor: '#fcfcfc' } : {}}
			>
				<div className='d-flex flex-column'>
					<span className="h5 mb-50">{title}</span>
					<span className="text-body fw-normal">
						{
							file_type === QUIZ ?
								`${0} / ${quezquestions_count} ${t('асуултууд')}`
								:
								file_type_name
						}
					</span>
				</div>
				<div className='d-flex'>
					<div>
						<a
							role="button"
							onClick={(e) => { toggleAddEditModal(onlineSubInfosItem); e.stopPropagation(); }}
							id={`complaintListDatatableEdit${id}`}
							className='ms-1'
						>
							<Badge color="light-success"><Edit width={"10px"} /></Badge>
						</a>
						<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${id}`} >{t('Засах')}</UncontrolledTooltip>
					</div>
					<div>
						<a
							role="button"
							onClick={(e) => {
								showWarning({
									header: {
										title: t(`Бүлэг устгах`),
									},
									question: t(`Та энэ бүлгийг устгахдаа итгэлтэй байна уу?`),
									onClick: () => handleDelete(id),
									btnText: t('Устгах'),
								})
								e.stopPropagation()
							}}
							className='ms-1'
							id={`complaintListDatatableCancel${id}`}
						>
							<Badge color="light-danger" ><Trash2 width={"10px"} /></Badge>
						</a>
						<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${id}`} >{t('Устгах')}</UncontrolledTooltip>
					</div>
				</div>
			</Button>
		</Fragment>
	})
}
