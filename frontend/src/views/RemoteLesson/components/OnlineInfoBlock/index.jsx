import { useState } from "react";
import { Edit, Plus, Trash2 } from "react-feather";

import {
	Accordion,
	AccordionBody,
	AccordionHeader,
	AccordionItem,
	Badge,
	Button,
	Card,
	CardBody,
	CardHeader,
	CardTitle,
	Col,
	Row,
	UncontrolledTooltip
} from "reactstrap";

import AddEditOnlineInfo from "../AddEditOnlineInfo";
import '../../style.scss'
import OnlineSubInfoBlock from "../OnlineSubInfoBlock";
import AddEditOnlineSubInfo from "../AddEditOnlineSubInfo";
import useModal from "@src/utility/hooks/useModal";

export default function OnlineInfoBlock({
	t,
	datas,
	getDatas,
	elearnId,
	onlineSubInfoDatas,
	getOnlineSubInfoDatas,
	handleSelectOnlineSubInfo,
	fetchData,
	remoteApi
}) {
	const onlineInfos = datas?.results || []
	const onlineSubInfos = onlineSubInfoDatas?.results || []

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
		const { success } = await fetchData(remoteApi.onlineInfo.delete(id))
		if (success) getDatas()
	}
	// #endregion

	// #region addEditModal for OnlineSubInfo
	const [addEditOnlineSubInfoModal, setOnlineSubInfoAddEditModal] = useState(false)
	const [onlineInfoId, setOnlineInfoId] = useState('')
	const [editOnlineSubInfoData, setEditOnlineSubInfoData] = useState()

	function toggleAddOnlineSubInfoModal(data, onlineInfoIdLocal) {
		if (data) {
			if (addEditOnlineSubInfoModal) setEditOnlineSubInfoData()
			else setEditOnlineSubInfoData(data)
		} else setEditOnlineSubInfoData()

		setOnlineInfoId(onlineInfoIdLocal)
		setOnlineSubInfoAddEditModal(!addEditOnlineSubInfoModal)
	}
	// #endregion

	// to control accordion
	const [open, setOpen] = useState('1');
	const toggle = (id) => open === id ? setOpen() : setOpen(id)

	return (
		<>
			{addEditModal && <AddEditOnlineInfo
				open={addEditModal}
				handleModal={toggleAddEditModal}
				refreshDatas={getDatas}
				elearnId={elearnId}
				editData={editData}
			/>}
			{addEditOnlineSubInfoModal && <AddEditOnlineSubInfo
				open={addEditOnlineSubInfoModal}
				handleModal={toggleAddOnlineSubInfoModal}
				refreshDatas={getOnlineSubInfoDatas}
				elearnId={elearnId}
				onlineInfoId={onlineInfoId}
				editData={editOnlineSubInfoData}
			/>}
			<Card>
				<CardHeader className="border-bottom d-block">
					<Row>
						<Col>
							<CardTitle tag="h4">{t("Хичээлийн бүлэг")}</CardTitle>
						</Col>
						<Col md={2} className="d-flex justify-content-end">
							<div>
								<a
									role="button"
									onClick={() => toggleAddEditModal()}
									id={`onlineInfoAdd`}
									className='ms-1'
								>
									<Badge color="primary"><Plus width={"10px"} /></Badge>
								</a>
								<UncontrolledTooltip placement='top' target={`onlineInfoAdd`} >{t('Бүлэг нэмэх')}</UncontrolledTooltip>
							</div>
						</Col>
					</Row>
				</CardHeader>
				<CardBody className="card-body-custom">
					<Accordion open={open} toggle={toggle} className="accordion-custom">
						{
							onlineInfos.map((onlineInfosItem, onlineInfosInd) => {
								const { id, title } = onlineInfosItem
								const online_sub_infos_filtered = onlineSubInfos.filter(item => item.parent_title === id)

								return <AccordionItem key={onlineInfosInd}>
									<AccordionHeader targetId={`onlineInfos_${onlineInfosInd}`}>
										<Row className="w-100">
											<Col>
												<span className="d-flex flex-column">
													<span className="h5 mb-0">{title}</span>
													<span className="text-body fw-normal">{online_sub_infos_filtered.length} {t('дэд бүлгүүд')}</span>
												</span>
											</Col>
											<Col md={2} className="d-flex justify-content-end align-items-center">
												<div>
													<a
														role="button"
														onClick={(e) => { toggleAddEditModal(onlineInfosItem); e.stopPropagation(); }}
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
												<div>
													<a
														role="button"
														onClick={(e) => { toggleAddOnlineSubInfoModal(null, id); e.stopPropagation(); }}
														id={`complaintListDatatableAdd${id}`}
														className='ms-1'
													>
														<Badge color="primary"><Plus width={"10px"} /></Badge>
													</a>
													<UncontrolledTooltip placement='top' target={`complaintListDatatableAdd${id}`} >{t('Дэд бүлэг нэмэх')}</UncontrolledTooltip>
												</div>
											</Col>
										</Row>
									</AccordionHeader>
									<div className="override-accordion-body-styles">
										<AccordionBody accordionId={`onlineInfos_${onlineInfosInd}`}>
											<OnlineSubInfoBlock
												t={t}
												datas={online_sub_infos_filtered}
												handleSelectOnlineSubInfo={handleSelectOnlineSubInfo}
												onlineInfoTitle={title}
												getOnlineSubInfoDatas={getOnlineSubInfoDatas}
												onlineInfoId={id}
												fetchData={fetchData}
												remoteApi={remoteApi}
												toggleAddOnlineSubInfoModal={toggleAddOnlineSubInfoModal}
											/>
										</AccordionBody>
									</div>
								</AccordionItem>
							})
						}
					</Accordion>
				</CardBody>
			</Card>
		</>
	)
}