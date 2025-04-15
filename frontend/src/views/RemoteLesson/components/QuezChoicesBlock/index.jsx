import { Badge, Button, UncontrolledTooltip } from 'reactstrap';
import '../../style.scss';
import { QUIZ } from '../../utils';
import AddEditOnlineSubInfo from '../AddEditOnlineSubInfo';
import { Fragment, useState } from 'react';
import useModal from '@src/utility/hooks/useModal';
import { Edit, Plus, Trash2 } from 'react-feather';
import AddEditQuezChoices from '../AddEditQuezChoices';

export default function QuezChoicesBlock({
	t,
	datas,
	refreshQuezChoices,
	quezQuestionsId,
	fetchData,
	remoteApi,
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
		const { success } = await fetchData(remoteApi.quezChoices.delete(id))
		if (success) refreshQuezChoices()
	}
	// #endregion

	return datas.map((quezChoicesItem, quezChoicesInd) => {
		const { id, choices, score } = quezChoicesItem

		return <Fragment key={quezChoicesInd}>
			{addEditModal && <AddEditQuezChoices
				open={addEditModal}
				handleModal={toggleAddEditModal}
				refreshDatas={refreshQuezChoices}
				quezQuestionsId={quezQuestionsId}
				editData={editData}
			/>}
			<Button
				color='Link'
				className="d-flex justify-content-between p-1 w-100 text-start"
				onClick={null}
			>
				<div className='d-flex flex-column'>
					<span className="h5 mb-50">{choices}</span>
					<span className="text-body fw-normal">
						{t('Зөв хариултын оноо')}: {score}
					</span>
				</div>
				<div className='d-flex'>
					<div>
						<a
							role="button"
							onClick={(e) => { toggleAddEditModal(quezChoicesItem); e.stopPropagation(); }}
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
										title: t(`Хариулт устгах`),
									},
									question: t(`Та энэ хариулт устгахдаа итгэлтэй байна уу?`),
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
