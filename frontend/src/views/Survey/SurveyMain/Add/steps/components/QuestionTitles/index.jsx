import {
	Col,
	Input,
	Label,
	Row
} from "reactstrap";

import { Button } from 'reactstrap';
import classnames from "classnames";
import Select from 'react-select';

import { ReactSelectStyles } from "@utils";

import QuestionsBlock from '../QuestionsBlock';
import { useEffect } from "react";


export default function QuestionTitles({
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
	questionTitles,
	onHandleChangeTitle,
	setQuestionTitles,
	removeChoicesField,
	onHandleChoiceChange,
	clickAnswerImg,
	handleDeleteChoiceImage,
	surveyType
}) {
	return questionTitles.map((questionTitlesItem, idx) => {
		const { name } = questionTitlesItem;

		return (
			<div className='added-cards mt-1' key={idx} >
				<div className={classnames('cardMaster rounded border p-1')}>
					<Row className='mt-1'>
						<Row>
							<div className='d-flex justify-content-between'>
								<h5>{`Асуултын сэдэв(${idx + 1})`}</h5>
								<div className=''>
									<Button  color="danger" size='sm' outline onClick={() => removeDataField(idx, questionTitles, setQuestionTitles)} disabled={readOnly}>
										Устгах
									</Button>
								</div>
							</div>
						</Row>
						<Row>
							<Col md={6} className='mt-1'>
								<Label className="form-label" htmlFor="name">
									{'Асуултын сэдэв'}
								</Label>
								<Input
									id ="name"
									name ="name"
									disabled={readOnly}
									bsSize="sm"
									placeholder="Асуултын сэдвээ бичнэ үү"
									type="text"
									value={name || ''}
									onChange={(e) => onHandleChangeTitle(idx, e.target.value, e.target.name,)}
								/>
							</Col>
						</Row>
						<QuestionsBlock
							removeDataField={removeDataField}
							onHandleChange={onHandleChange}
							handleAddChoice={handleAddChoice}
							choiceErrors={choiceErrors}
							onHandleRatingWordChange={onHandleRatingWordChange}
							handleDeleteImage={handleDeleteImage}
							clickLogoImage={clickLogoImage}
							handlePopOver={handlePopOver}
							popoverIdx={popoverIdx}
							index_name={index_name}
							readOnly={readOnly}
							handleAddQuestion={handleAddQuestion}
							default_page={default_page}
							handlePerPage={handlePerPage}
							isEdit={isEdit}
							titleIndex={idx}
							removeChoicesField={removeChoicesField}
							onHandleChoiceChange={onHandleChoiceChange}
							clickAnswerImg={clickAnswerImg}
							handleDeleteChoiceImage={handleDeleteChoiceImage}
							setQuestionTitles={setQuestionTitles}
							surveyType={surveyType}
							questionTitles={questionTitles}
						/>
					</Row>
				</div>
			</div>
		)
	})
}
