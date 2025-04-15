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
import useApi from "@src/utility/hooks/useApi";
import useLoader from "@src/utility/hooks/useLoader";
import AddEditQuezQuestions from "../AddEditQuezQuestions";
import useApiCustom from "../../hooks/useApiCustom";
import { KIND_MULTI_CHOICE, KIND_ONE_CHOICE, KIND_RATING } from "../../utils";
import AddEditQuezChoices from "../AddEditQuezChoices";
import QuezChoicesBlock from "../QuezChoicesBlock";

export default function QuizBlock({
	onlineSubInfoData,
	t,
}) {
	const { id: onlineSubInfoId } = onlineSubInfoData || {}
	const { fetchData, isLoading, Loader } = useLoader({ isFullScreen: true });
	const remoteApi = useApi().remote

	// to control accordion
	const [open, setOpen] = useState('1');
	const toggle = (id) => open === id ? setOpen() : setOpen(id)

	// #region QuezQuestions code block
	// #region addEditModal for QuezQuestions
	const [addEditModal, setAddEditModal] = useState(false)
	const [editData, setEditData] = useState()

	function toggleAddEditModal(data) {
		if (addEditModal) setEditData()
		else setEditData(data)

		setAddEditModal(!addEditModal)
	}
	// #endregion

	// #region to handle 'delete' modal for QuezQuestions
	const { showWarning } = useModal()

	async function handleDelete(id) {
		const { success } = await fetchData(remoteApi.quezQuestions.delete(id))
		if (success) refreshQuezQuestionsFunc()
	}
	// #endregion

	// #region to get QuezQuestions data
	const [refreshQuezQuestions, setRefreshQuezQuestions] = useState(false)

	function refreshQuezQuestionsFunc() {
		setRefreshQuezQuestions((current) => !current)
	}

	const getQuezQuestions = () => remoteApi.quezQuestions.get({
		onlineSubInfoId: onlineSubInfoId,
		sort: 'id'
	})

	const { data: quezQuestionsDatasOriginal, isLoading: isLoadingQuezQuestions } = useApiCustom({
		apiFunction: getQuezQuestions,
		deps: [refreshQuezQuestions]
	})

	const quezQuestionsDatas = quezQuestionsDatasOriginal?.results || []
	// #endregion
	// #endregion QuezQuestions code block

	// #region QuezChoices code block
	// #region addEditModal for QuezChoices
	const [addEditQuezChoices, setQuezChoicesAddEditModal] = useState(false)
	const [quezQuestionsId, setQuezQuestionsId] = useState('')
	const [editQuezChoicesData, setEditQuezChoicesData] = useState()

	function toggleAddEditQuezChoices(data, quezQuestionsIdLocal) {
		if (data) {
			if (addEditQuezChoices) setEditQuezChoicesData()
			else setEditQuezChoicesData(data)
		} else setEditQuezChoicesData()

		setQuezQuestionsId(quezQuestionsIdLocal)
		setQuezChoicesAddEditModal(!addEditQuezChoices)
	}
	// #endregion

	// #region to get QuezChoices data
	const [refreshQuezChoices, setRefreshQuezChoices] = useState(false)

	function refreshQuezChoicesFunc() {
		setRefreshQuezChoices((current) => !current)
	}

	const getQuezChoices = () => remoteApi.quezChoices.get({
		onlineSubInfoId: onlineSubInfoId,
	})

	const { data: quezChoicesDatasOriginal, isLoading: isLoadingQuezChoices } = useApiCustom({
		apiFunction: getQuezChoices,
		deps: [refreshQuezChoices]
	})

	const quezChoicesDatas = quezChoicesDatasOriginal?.results || []
	// #endregion
	// #endregion QuezChoices code block

	return (
		<>
			{isLoading || isLoadingQuezQuestions || isLoadingQuezChoices && Loader}
			{addEditModal && <AddEditQuezQuestions
				open={addEditModal}
				handleModal={toggleAddEditModal}
				refreshDatas={refreshQuezQuestionsFunc}
				onlineSubInfoId={onlineSubInfoId}
				editData={editData}
			/>}
			{addEditQuezChoices && <AddEditQuezChoices
				open={addEditQuezChoices}
				handleModal={toggleAddEditQuezChoices}
				refreshDatas={refreshQuezChoicesFunc}
				quezQuestionsId={quezQuestionsId}
				editData={editQuezChoicesData}
			/>}
			<Card className="w-100">
				<CardHeader className="border-bottom d-block">
					<Row>
						<Col>
							<CardTitle tag="h4">{t("Цахим сургалтын сорил шалгалт")}</CardTitle>
						</Col>
						<Col md={2} className="d-flex justify-content-end">
							<div>
								<a
									role="button"
									onClick={() => toggleAddEditModal()}
									id={`quezQuestionsAdd`}
									className='ms-1'
								>
									<Badge color="primary"><Plus width={"10px"} /></Badge>
								</a>
								<UncontrolledTooltip placement='top' target={`quezQuestionsAdd`} >{t('Асуулт нэмэх')}</UncontrolledTooltip>
							</div>
						</Col>
					</Row>
				</CardHeader>
				<CardBody className="card-body-custom">
					<Accordion open={open} toggle={toggle} className="accordion-custom">
						{
							quezQuestionsDatas.map((quezQuestionsDatasItem, quezQuestionsDatasInd) => {
								const { id, question, kind, kind_name } = quezQuestionsDatasItem
								const quezChoicesFiltered = quezChoicesDatas.filter(item => item.quez_question_id === id)

								return <AccordionItem key={quezQuestionsDatasInd}>
									<AccordionHeader targetId={`quezQuestionsDatas_${quezQuestionsDatasInd}`}>
										<Row className="w-100">
											<Col>
												<span className="d-flex flex-column">
													<span className="h5 mb-0">{question}</span>
													<span className="text-body fw-normal">{kind_name}{[KIND_ONE_CHOICE, KIND_MULTI_CHOICE, KIND_RATING].includes(kind) && <> | {quezChoicesFiltered.length} {t('хариултууд')}</>}</span>
												</span>
											</Col>
											<Col md={2} className="d-flex justify-content-end align-items-center">
												<div>
													<a
														role="button"
														onClick={(e) => { toggleAddEditModal(quezQuestionsDatasItem); e.stopPropagation(); }}
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
																	title: t(`Асуултыг устгах`),
																},
																question: t(`Та энэ асуултыг устгахдаа итгэлтэй байна уу?`),
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
												{[KIND_ONE_CHOICE, KIND_MULTI_CHOICE, KIND_RATING].includes(kind) && <div>
													<a
														role="button"
														onClick={(e) => { toggleAddEditQuezChoices(null, id); e.stopPropagation(); }}
														id={`complaintListDatatableAdd${id}`}
														className='ms-1'
													>
														<Badge color="primary"><Plus width={"10px"} /></Badge>
													</a>
													<UncontrolledTooltip placement='top' target={`complaintListDatatableAdd${id}`} >{t('Хариулт нэмэх')}</UncontrolledTooltip>
												</div>}
											</Col>
										</Row>
									</AccordionHeader>
									<div className="override-accordion-body-styles">
										<AccordionBody accordionId={`quezQuestionsDatas_${quezQuestionsDatasInd}`}>
											<QuezChoicesBlock
												t={t}
												datas={quezChoicesFiltered}
												refreshQuezChoices={refreshQuezChoicesFunc}
												quezQuestionsId={id}
												fetchData={fetchData}
												remoteApi={remoteApi}
												toggleAddEditQuezChoices={toggleAddEditQuezChoices}
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