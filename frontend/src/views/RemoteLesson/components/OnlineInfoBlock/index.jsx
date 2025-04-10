import { useState } from "react";
import { Plus } from "react-feather";

import {
	Accordion,
	AccordionBody,
	AccordionHeader,
	AccordionItem,
	Button,
	Card,
	CardBody,
	CardHeader,
	CardTitle,
	Col,
	Row
} from "reactstrap";

import AddEditOnlineInfo from "../AddEditOnlineInfo";
import '../../style.scss'
import OnlineSubInfoBlock from "../OnlineSubInfoBlock";
import AddEditOnlineSubInfo from "../AddEditOnlineSubInfo";

export default function OnlineInfoBlock({
	t,
	datas,
	getDatas,
	elearnId,
	onlineSubInfoDatas,
	getOnlineSubInfoDatas,
}) {
	const onlineInfos = datas?.results || []
	const onlineSubInfos = onlineSubInfoDatas?.results || []

	// #region addmodal
	const [addModal, setAddModal] = useState(false)

	function toggleAddModal() {
		setAddModal(!addModal)
	}
	// #endregion

	// #region addmodal for onlineSubInfo
	const [addOnlineSubInfoModal, setOnlineSubInfoAddModal] = useState(false)
	const [onlineInfoId, setOnlineInfoId] = useState('')

	function toggleAddOnlineSubInfoModal(onlineInfoId) {
		setOnlineInfoId(onlineInfoId)
		setOnlineSubInfoAddModal(!addOnlineSubInfoModal)
	}
	// #endregion

	// to control accordion
	const [open, setOpen] = useState('1');
	const toggle = (id) => open === id ? setOpen() : setOpen(id)

	return (
		<>
			<AddEditOnlineInfo
				open={addModal}
				handleModal={toggleAddModal}
				refreshDatas={getDatas}
				elearnId={elearnId}
			/>
			<AddEditOnlineSubInfo
				open={addOnlineSubInfoModal}
				handleModal={toggleAddOnlineSubInfoModal}
				refreshDatas={getOnlineSubInfoDatas}
				elearnId={elearnId}
				onlineInfoId={onlineInfoId}
			/>
			<Card md={12}>
				<CardHeader className="border-bottom d-block">
					<Row>
						<Col>
							<CardTitle tag="h4">{t("Бүлэг")}</CardTitle>
						</Col>
						<Col md={2} className="d-flex justify-content-end">
							<div>
								<Button color='primary' onClick={toggleAddModal}
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
							onlineInfos.map((onlineInfos_item, onlineInfos_ind) => {
								const { id, title, online_sub_info_count } = onlineInfos_item

								return <AccordionItem key={onlineInfos_ind}>
									<AccordionHeader targetId={`onlineInfos_${onlineInfos_ind}`}>
										<Row className="w-100">
											<Col>
												<span className="d-flex flex-column">
													<span className="h5 mb-0">{title}</span>
													<span className="text-body fw-normal">{0} / {online_sub_info_count} {t('хэсгүүд')}</span>
												</span>
											</Col>
											<Col md={2} className="d-flex justify-content-end">
												<div>
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
									<AccordionBody accordionId={`onlineInfos_${onlineInfos_ind}`}>
										<OnlineSubInfoBlock
											t={t}
											datas={onlineSubInfos.filter(item => item.parent_title === id)}
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