import React, { useState, useEffect, useContext } from 'react';
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import { Card, Col, Form, Label, Input, Button, CardHeader, CardBody, Alert, Modal, ModalBody } from 'reactstrap';

const KIND_ONE_CHOICE = 1; // 'Нэг сонголт'
const KIND_MULTI_CHOICE = 2; // 'Олон сонголт'
const KIND_BOOLEAN = 3; // 'Тийм // Үгүй сонголт'
const KIND_RATING = 4; // 'Үнэлгээ'
const KIND_TEXT = 5; // 'Бичвэр'

// Helper function to render the question text
function makeQuestionText(question, image, kind) {
	return (
		<div className='qtext'>
			<p>
				<span className='fw-bolder fs-4'>{question}</span>
				<small className='ms-1 fs-5'>{kind === KIND_MULTI_CHOICE ? '(Олон сонголттой)' : '(Нэг сонголттой)'}</small>
			</p>
			{image && (
				<div className='showImgDiv m-1'>
					<img src={image} alt='question-related' className='w-100' />
				</div>
			)}
		</div>
	);
}

// Helper function to render the rating answers
function makeRatingAns(textLow, textHigh, numStars, qIndx) {
	const radios = [];
	for (let index = 1; index <= numStars; index++) {
		radios.push(
			<div className="m-1" key={index}>
				<Input
					type="radio"
					id={`radio-${qIndx}-${index}-in`}
					value={index}
					className="form-check-input"
				/>
				<Label for={`radio-${qIndx}-${index}-in`} className="form-label d-flex justify-content-center">
					{index}
				</Label>
			</div>
		);
	}
	return (
		<div className="d-flex align-items-center ms-2">
			<div>{textLow}</div>
			{radios}
			<div>{textHigh}</div>
		</div>
	);
}

const Exam = ({ testId, handleModal }) => {

	const { fetchData } = useLoader({ isFullScreen: true });
	//state
	const [datas, setDatas] = useState([]);

	// 	//api
	const questionApi = useApi().challenge;

	const getDatas = async () => {
		const { success, data } = await fetchData(questionApi.getQuestionAll(testId));
		if (success) {
			setDatas(data);
		}
	};

	useEffect(() => {
		getDatas();
	}, []);


	return (
		<Modal
			isOpen={open}
			toggle={handleModal}
			className="modal-dialog-centered modal-lg"
			contentClassName="pt-0">
			<ModalBody>
				<Card>
					<CardHeader className="bg-primary justify-content-center">
						<h4 className='text-white'>Бататгах тест</h4>
					</CardHeader>
					<CardBody>
						<Form className='mt-1'>
							{datas.map((question, qIdx) => {
								const { kind, question: questionText, image, rating_max_count, low_rating_word, high_rating_word, max_choice_count, choices, id } = question;

								return (
									<Card className='p-2 border-1' key={id}>
										<div>
											<div className="d-flex gap-1 mt-1 font-weight-bold">
												{qIdx + 1}.<p>{makeQuestionText(questionText, image, kind)} </p> {question.score && (<small >{question.score}оноо</small>)}
											</div>
											<div className="d-flex">
												{kind === KIND_TEXT && (
													<Input
														type='textarea'
														className="form-control mt-1"
														placeholder="Хариултыг бичнэ"
													/>
												)}

												{kind === KIND_RATING && makeRatingAns(low_rating_word, high_rating_word, rating_max_count, qIdx, id)}

												{(kind === KIND_ONE_CHOICE || kind === KIND_MULTI_CHOICE) && (
													<div className='d-flex flex-row flex-wrap justify-content-center w-100'>
														{choices.map((choice, idx) => (
															<div className="form-check my-1 me-3 " key={idx}>
																<Input
																	type={kind === KIND_MULTI_CHOICE ? 'checkbox' : 'radio'}
																	name={`choice${qIdx}`}
																	className="form-check-input mb-1"
																	checked={choice.checked}
																/>
																{choice.image || choice.imageUrl ? (
																	<div className='m-1 ms-0 showChoiceDiv'>
																		<img src={choice.imageUrl || choice.image} alt='choice' />
																	</div>
																) : (
																	<Label className="form-check-label" for={`choice${qIdx}`}>{choice.choices}</Label>
																)}
															</div>
														))}
													</div>
												)}

												{kind === KIND_BOOLEAN && ['Тийм', 'Үгүй'].map((text, yIdx) => (
													<div className="form-check my-1 me-3" key={yIdx}>
														<Input
															type="radio"
															id={`yes${id}`}
															name={`yes${qIdx}`}
															className="form-check-input mb-1"
														/>
														<Label className="form-check-label">{text}</Label>
													</div>
												))}
											</div>
										</div>
									</Card>
								);
							})}
							<div className="d-flex gap-2 mt-3">
								<Button onClick={handleModal}>Буцах</Button>
							</div>
						</Form>
					</CardBody>
				</Card>
			</ModalBody>
		</Modal>
	);
};

export default Exam;
