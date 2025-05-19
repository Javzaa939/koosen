import { AlertCircle, X } from "react-feather";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { useTranslation } from 'react-i18next'
import { RefreshCcw } from 'react-feather'
import useModal from '@src/utility/hooks/useModal'
import useApi from '@src/utility/hooks/useApi'
import useLoader from "@src/utility/hooks/useLoader";
import { useState } from "react";
import { Table } from 'reactstrap'

export default function UpdateChallengeStudentsScoreButton({ selected_exam }) {
	const { t } = useTranslation()
	const { showWarning } = useModal()
	const challengeApi = useApi().challenge
	const { isLoading, Loader, fetchData } = useLoader({})

	const [showModal, setShowModal] = useState(false)
	const [updateCorrectAnswersScoreResult, setUpdateCorrectAnswersScoreResult] = useState({})

	async function handleUpdateCorrectAnswersScore() {
		const { success, data } = await fetchData(challengeApi.updateChallengeStudentsScore({
			exam: selected_exam
		}))

		if (success) {
			setUpdateCorrectAnswersScoreResult(data)
			handleModal()
		}
	}

	const handleModal = () => {
		setShowModal(!showModal)

		// on modal close
		if (showModal) {
			setUpdateCorrectAnswersScoreResult({})
		}
	}

	const CloseBtn = (
		<X className="cursor-pointer" size={15} onClick={handleModal} />
	)

	return (
		<>
			<Button
				color="primary"
				outline
				className="btn-sm-block ms-1"
				disabled={!selected_exam || isLoading}
				onClick={() =>
					showWarning({
						header: {
							title: t(`Онооны шинэчлэлт`),
						},
						question: t(`Та шинэчлэгдсэн оноонд итгэж байна уу?`),
						onClick: () => handleUpdateCorrectAnswersScore(),
						btnText: t('Шинэчлэх'),
					})
				}
			>
				<RefreshCcw size={15} />
				<span className='align-middle ms-50'>{t('Онооны шинэчлэх')}</span>
			</Button>
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
					<h5>{t('Өөрчлөгдсөн өгөгдлүүд')}</h5>
				</ModalHeader>
				<ModalBody>
					{isLoading && Loader}

					{Object.entries(updateCorrectAnswersScoreResult).map(([key, value], index)=>{
						if (key === 'ChallengeStudents') {
							return (
								<div key={index}>
									<h5 style={{textAlign: 'center'}}>{key.replace('ChallengeStudents','Шалгалтад оролцогчид')}</h5>
									<Table size='sm' responsive>
										<thead>
											<tr>
												<th rowSpan={2}>№</th>
												<th rowSpan={2}>{t('Шалгуулагчийн код')}</th>
												<th colSpan={2}>{t('Өмнөх оноо')}</th>
												<th colSpan={2}>{t('Шинэчлэгдсэн оноо')}</th>
												{/* <th colSpan={2}>{t('Шалгуулагчийн оролдлогын тоо дүүрсэн эсэх')}</th>  Шаардлагатай үед ашиглана */}
											</tr>
											<tr>
												<th>{t('Авсан')}</th>
												<th>{t('Авах')}</th>
												<th>{t('Авсан')}</th>
												<th>{t('Авах')}</th>
												{/* <th>{t('Авсан')}</th>
												<th>{t('Авах')}</th> */}
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
														{take_score?.old}
													</td>
													<td>
														{score?.new}
													</td>
													<td>
														{take_score?.new}
													</td>
													{/* <td>
														{tried?.old}
													</td>
													<td>
														{tried?.new}
													</td> */}
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