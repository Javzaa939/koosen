import { AlertCircle, X } from "react-feather";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { useTranslation } from 'react-i18next'
import { RefreshCcw } from 'react-feather'
import useModal from '@src/utility/hooks/useModal'
import useApi from '@src/utility/hooks/useApi'
import useLoader from "@src/utility/hooks/useLoader";
import { useState } from "react";
import { Table } from 'reactstrap'
import ExamFilter from "../helpers/ExamFilter";

export default function UpdateChallengeStudentsScoreButton() {
	const { t } = useTranslation()
	const { showWarning } = useModal()
	const challengeApi = useApi().challenge
	const { isLoading, Loader, fetchData } = useLoader({})

	const [showModal, setShowModal] = useState(false)
	const [selected_exam, setSelectedExam] = useState('')
	const [updateCorrectAnswersScoreResult, setUpdateCorrectAnswersScoreResult] = useState({})

	async function handleUpdateCorrectAnswersScore() {
		const { success, data } = await fetchData(challengeApi.updateChallengeStudentsScore({
			exam: selected_exam
		}))

		if (success) {
			setUpdateCorrectAnswersScoreResult(data)
		}
	}

	const handleModal = () => {
		setShowModal(!showModal)

		// on modal close
		if (showModal) {
			setSelectedExam('')
			setUpdateCorrectAnswersScoreResult({})
		}
	}

	const CloseBtn = (
		<X className="cursor-pointer" size={15} onClick={handleModal} />
	)

	return (
		<>
			<div style={{ textAlign: 'right' }}>
				<Button
					color='primary'
					className='mb-1'
					onClick={handleModal}
				>
					<RefreshCcw size={15} />
					<span className='align-middle ms-50'>{t('Үнэлгээ шинэчлэх')}</span>
				</Button>
			</div>
			<Modal
				isOpen={showModal}
				toggle={handleModal}
				className="modal-dialog-centered"
			>
				<ModalHeader
					close={CloseBtn}
					tag="div"
					className="justify-content-between"
				>
					<h5>{t('Дүнгийн үнэлгээ шинэчлэх')}</h5>
				</ModalHeader>
				<ModalBody>
					{isLoading && Loader}

					<div className='mb-1'>
						<AlertCircle size={15} color='#fb8500' />
						<span className='ms-1'>{t('Болих товч дарах үед дүнгийн үнэлгээ шинэчлэх хадгалагдахгүй байхыг анхаарна уу')}</span>
					</div>
					<ExamFilter setSelected={setSelectedExam} />
					<div className='my-1 d-flex justify-content-between'>
						<Button
							className="me-2  justify-content-start"
							color="primary"
							type="submit"
							disabled={!selected_exam || isLoading}
							size='sm'
							onClick={() =>
								showWarning({
									header: {
										title: t(`Дүнгийн үнэлгээ шинэчлэх`),
									},
									question: t(`Та дүнгийн үнэлгээ шинэчлэхдээ итгэлтэй байна уу?`),
									onClick: () => handleUpdateCorrectAnswersScore(),
									btnText: t('Шинэчлэх'),
								})
							}
						>
							{t('Шинэчлэх')}
						</Button>
					</div>
					{Object.entries(updateCorrectAnswersScoreResult).map(([key, value], index)=>{
						if (key === 'ChallengeStudents') {
							return (
								<div key={index}>
									<h5 style={{textAlign: 'center'}}>{key.replace('ChallengeStudents','Шалгалтад оролцогчид')}</h5>
									<Table size='sm' responsive>
										<thead>
											<tr>
												<th rowSpan={2}>№</th>
												<th rowSpan={2}>{t('Оюутны код')}</th>
												<th colSpan={2}>{t('Оюутны авсан оноо')}</th>
												<th colSpan={2}>{t('Оюутны авах оноо')}</th>
												<th colSpan={2}>{t('Оюутны оролдлогын тоо дүүрсэн эсэх')}</th>
											</tr>
											<tr>
												<th>{t('Өмнө')}</th>
												<th>{t('Дараа')}</th>
												<th>{t('Өмнө')}</th>
												<th>{t('Дараа')}</th>
												<th>{t('Өмнө')}</th>
												<th>{t('Дараа')}</th>
											</tr>
										</thead>
										<tbody>
										{Object.entries(value).map(([key2, value2], index2)=>{
											const score = value2?.score
											const take_score = value2?.take_score
											const tried = value2?.tried

											return (
												<tr key={index2}>
													<td>
														{index2 + 1}
													</td>
													<td title={key2.split('-')[0]}>
														{key2.split('-')[1]}
													</td>
													<td>
														{score?.old}
													</td>
													<td>
														{score?.new}
													</td>
													<td>
														{take_score?.old}
													</td>
													<td>
														{take_score?.new}
													</td>
													<td>
														{tried?.old}
													</td>
													<td>
														{tried?.new}
													</td>
												</tr>
											)
										})}
										</tbody>
									</Table>
								</div>
							)
						} else {
							return <></>
						}
					})}
				</ModalBody>
			</Modal>
		</>
	)
}