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

	// #region addEditModal for onlineSubInfo
	const [addEditOnlineSubInfoModal, setOnlineSubInfoAddEditModal] = useState(false)
	const [onlineInfoId, setOnlineInfoId] = useState('')

	function toggleAddOnlineSubInfoModal(onlineInfoId) {
		setOnlineInfoId(onlineInfoId)
		setOnlineSubInfoAddEditModal(!addEditOnlineSubInfoModal)
	}
	// #endregion

	// to control accordion
	const [open, setOpen] = useState('1');
	const toggle = (id) => open === id ? setOpen() : setOpen(id)

	// #region to handle 'delete' modal
	const { showWarning } = useModal()

	async function handleDelete(id) {
		const { success } = await fetchData(remoteApi.onlineInfo.delete(id))
		if (success) getDatas()
	}
	// #endregion

	return (
		<>
			<AddEditOnlineInfo
				open={addEditModal}
				handleModal={toggleAddEditModal}
				refreshDatas={getDatas}
				elearnId={elearnId}
				editData={editData}
			/>
			<AddEditOnlineSubInfo
				open={addEditOnlineSubInfoModal}
				handleModal={toggleAddOnlineSubInfoModal}
				refreshDatas={getOnlineSubInfoDatas}
				elearnId={elearnId}
				onlineInfoId={onlineInfoId}
			/>
			<Card md={12}>
				<CardHeader className="border-bottom d-block">
					<Row>
						<Col>
							<CardTitle tag="h4">{t("Хичээлийн бүлэг")}</CardTitle>
						</Col>
						<Col md={2} className="d-flex justify-content-end">
							<div>
								<Button color='primary' onClick={() => toggleAddEditModal()}
									className="rounded-circle d-flex align-items-center justify-content-center p-0"
									style={{ width: '30px', height: '30px' }}
								>
									<Plus size={15} />
								</Button>
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
													<span className="text-body fw-normal">{0} / {online_sub_infos_filtered.length} {t('дэд бүлэг')}</span>
												</span>
											</Col>
											<Col md={2} className="d-flex justify-content-end">
												<div>
													<div>
														<a
															role="button"
															onClick={(e) => { toggleAddEditModal(onlineInfosItem); e.stopPropagation(); }}
															id={`complaintListDatatableEdit${id}`}
															className='me-1'
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
															className='me-1'
															id={`complaintListDatatableCancel${id}`}
														>
															<Badge color="light-danger" ><Trash2 width={"10px"} /></Badge>
														</a>
														<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${id}`} >{t('Устгах')}</UncontrolledTooltip>
													</div>
													<Button color='primary' onClick={(e) => { toggleAddOnlineSubInfoModal(id); e.stopPropagation(); }}
														className="rounded-circle d-flex align-items-center justify-content-center p-0"
														style={{ width: '30px', height: '30px' }}
													>
														<Plus size={15} />
													</Button>
												</div>
											</Col>
										</Row>
									</AccordionHeader>
									<AccordionBody accordionId={`onlineInfos_${onlineInfosInd}`}>
										<OnlineSubInfoBlock
											t={t}
											datas={online_sub_infos_filtered}
											handleSelectOnlineSubInfo={handleSelectOnlineSubInfo}
											onlineInfoTitle={title}
										/>
									</AccordionBody>
								</AccordionItem>
							})
						}
					</Accordion>
				</CardBody>
			</Card>
		</>
	)
}