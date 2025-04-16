import {
	Button,
	Col,
	Input,
	Label
} from "reactstrap";

import Questions from "../../Questions";
import { useEffect, useState } from "react";


export default function QuestionsBlock({
	setQuestionTitles,
	removeDataField,
	onHandleChange,
	handleAddChoice,
	choiceErrors,
	onHandleRatingWordChange,
	handleDeleteImage,
	clickLogoImage,
	handlePopOver,
	popoverIdx,
	index_name,
	readOnly,
	handleAddQuestion,
	default_page,
	handlePerPage,
	isEdit,
	titleIndex,
	removeChoicesField,
	onHandleChoiceChange,
	clickAnswerImg,
	handleDeleteChoiceImage,
	surveyType,
	questionTitles
}) {
	const [questions, setQuestions] = useState([])

	useEffect(() => {
		setQuestionTitles((currentState) => {
			const newState = [...currentState]
			newState[titleIndex].questions = questions
			return newState
		})
	}, [questions])

	function copyQuestion(index) {
		handleAddQuestion(null, setQuestions, index)
	}

	return (
		<div className="mt-1">
			<h3>{'Судалгааны асуулт'} {isEdit ? 'засах' : 'нэмэх'}</h3>
			{
				!isEdit &&
				<Col
					md={4}
					sm={12}
				>
					<hr></hr>
					<Label className='form-label'>
						{"Хуудсанд харуулах асуултын тоо"}
					</Label>
					<Input
						type="select"
						bsSize="sm"
						style={{ height: "30px", width: '100%' }}
						onChange={(e) => handlePerPage(e, setQuestions)}
					>
						{default_page.map((page, idx) => (
							<option key={idx} value={page}>
								{page}
							</option>
						))}
					</Input>
				</Col>
			}

			<Questions
				questions={questions}
				removeQuestion={removeDataField}
				handleChange={(idx, value, name) => onHandleChange(idx, value, name, setQuestions)}
				handleAddChoice={(idx) => handleAddChoice(idx, setQuestions)}
				errors={choiceErrors}
				onHandleRatingWordChange={(idx, i, value) => onHandleRatingWordChange(idx, i, value, setQuestions)}
				handleDeleteImage={(idx) => handleDeleteImage(idx, setQuestions)}
				clickLogoImage={clickLogoImage}
				handlePopOver={handlePopOver}
				popoverIdx={popoverIdx}
				index_name={index_name}
				choiceErrors={choiceErrors}
				readOnly={readOnly}
				setQuestions={setQuestions}
				titleIndex={titleIndex}
				removeChoicesField={(idx, cidx) => removeChoicesField(idx, cidx, setQuestions)}
				onHandleChoiceChange={(idx, cidx, value, name) => onHandleChoiceChange(idx, cidx, value, name, setQuestions)}
				clickAnswerImg={(idx) => clickAnswerImg(idx, setQuestions)}
				handleDeleteChoiceImage={(idx, cidx) => handleDeleteChoiceImage(idx, cidx, setQuestions)}
				copyQuestion={copyQuestion}
				surveyType={surveyType}
				questionTitles={questionTitles}
			/>

			<div className=''>
				<Button color="primary" size='sm' className="mt-2" onClick={() => handleAddQuestion(null, setQuestions)}>
					Асуулт нэмэх
				</Button>
			</div>
		</div>
	)
}
