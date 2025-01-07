import { AlertCircle, X } from "react-feather";
import { Button, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import { useTranslation } from 'react-i18next'
import { RefreshCcw } from 'react-feather'
import useModal from '@src/utility/hooks/useModal'
import useApi from '@src/utility/hooks/useApi'
import useLoader from "@src/utility/hooks/useLoader";
import { useState } from "react";
import ExamFilter from "../helpers/ExamFilter";

export default function UpdateChallengeStudentsScoreButton() {
	const { t } = useTranslation()
	const { showWarning } = useModal()
	const challengeApi = useApi().challenge
	const { isLoading, Loader, fetchData } = useLoader({})

	const [showModal, setShowModal] = useState(false)
	const [selected_exam, setSelectedExam] = useState('')

	async function handleUpdateCorrectAnswersScores() {
		const { success, data } = await fetchData(challengeApi.updateChallengeStudentsScore({
			exam: selected_exam
		}))

		if (success) {
			console.log('updateChallengeStudentsScore results: ', data)
			handleModal()
		}
	}

	const handleModal = () => {
		setShowModal(!showModal)

		// on modal close
		if (showModal) {
			setSelectedExam('')
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
									onClick: () => handleUpdateCorrectAnswersScores(),
									btnText: t('Шинэчлэх'),
								})
							}
						>
							{t('Шинэчлэх')}
						</Button>
					</div>
				</ModalBody>
			</Modal>
		</>
	)
}