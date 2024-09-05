import { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader, Table, Button, Input } from "reactstrap";
import useApi from "@src/utility/hooks/useApi";
import { useParams } from "react-router-dom";
import moment from 'moment';
import useModal from "@hooks/useModal";

function OnlineExamModal({ item, refresh }) {
	const { index } = useParams();
	const [modal, setModal] = useState(false);
	const [data, setData] = useState([]);
	const [selectedTest, setSelectedTest] = useState(null);
	const { showWarning } = useModal()
	const toggle = () => setModal(!modal);
	const challengeAPI = useApi().online_lesson.test;

	// Fetch test data
	const getTest = async () => {
		try {
			const { success, data } = await challengeAPI.getAll(index);
			if (success) {
				setData(data);
			}
		} catch (error) {
			console.error("Failed to fetch lesson:", error);
		}
	};

	useEffect(() => {
		getTest();
	}, [index]);

	// Handle radio button change
	const handleRadioChange = (testId) => {
		setSelectedTest(testId);
	};

	// Handle confirm button click
	const handleConfirm = async () => {
		const selected = data.find((test) => test.id === selectedTest);
		let challengeId = selected.id
		let weekData = item.id
		const { success, error } = await challengeAPI.post(challengeId, weekData)
		if (success) {
			toggle()
			refresh()
		}
	};
	const deleteTest = async(id) => {
		const {success} = await challengeAPI.delete(id)
		if (success){
			refresh()
		}
	}

	return (
		<div className="w-100">
			{!item?.challenge ? (
				<>
					<div className="d-flex flex-row justify-content-end align-items-center">
						<Button size='sm' color="primary" onClick={toggle}>
							Оруулах
						</Button>
					</div>
					<Modal
						className="modal-dialog-centered modal-lg h-100"
						contentClassName="pt-0"
						backdrop="static"
						isOpen={modal}
						toggle={toggle}
					>
						<ModalHeader toggle={toggle}>
							Шалгалт оруулах
						</ModalHeader>
						<ModalBody>
							<Table responsive>
								<thead>
									<tr>
										<th>Сонгоно уу</th>
										<th>Гарчиг</th>
										<th>тайлбар</th>
										<th>Эхлэх хугацаа</th>
										<th>Дуусах хугацаа</th>
										<th>Үргэлжлэх хугацаа(минут)</th>
									</tr>
								</thead>
								<tbody>
									{data.map((test) => (
										<tr key={test.id}>
											<td>
												<Input
													type="radio"
													id={`test_${test.id}`}
													name="testSelection"
													checked={selectedTest === test.id}
													onChange={() => handleRadioChange(test.id)}
												/>
											</td>
											<td>{test.title}</td>
											<td>{test.description}</td>
											<td>{moment(test.start_date).format('MM-DD HH:SS')}</td>
											<td>{moment(test.end_date).format('MM-DD HH:SS')}</td>
											<td>{test.duration}</td>
										</tr>
									))}
								</tbody>
							</Table>
							<div className="mt-3 d-flex justify-content-between">
								<Button
									color="secondary"
									onClick={toggle}
								>
									Буцах
								</Button>
								<Button
									color="primary"
									disabled={selectedTest === null}
									onClick={handleConfirm}
								>
									Сонгох
								</Button>
							</div>
						</ModalBody>
					</Modal>
				</>
			) : (
				<div className="d-flex flex-row justify-content-between align-items-center">
					<div>
						{item?.challenge && (
							<>
								<div>Эхлэх хугацаа:{moment(item?.challenge.start_date).format('MM-DD HH:SS')}</div>
								<div>Дуусах хугацаа:{moment(item?.challenge.end_date).format('MM-DD HH:SS')}</div>
								<Button style={{ marginRight: '10px' }}>
									Шалгалтын дүн харах
								</Button>
							</>
						)}
						<Button
							onClick={() => showWarning({
								header: {
									title: `Шалгалтыг устгахдаа итгэлтэй байна уу`,
								},
								question: `Та "${item?.challenge.title}" Шалгалтыг устгахдаа итгэлтэй байна уу?`,
								onClick: () => deleteTest(item.id),
								btnText: 'Устгах',
							})}
							color="danger"
						>
							Устгах
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

export default OnlineExamModal;
