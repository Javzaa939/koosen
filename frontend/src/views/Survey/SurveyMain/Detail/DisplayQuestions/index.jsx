import React from "react";

import "./style.css";

import {
	Badge,
  Input
} from "reactstrap";

import { AlertCircle } from "react-feather";


const KIND_ONE_CHOICE = 1; // 'Нэг сонголт'
const KIND_MULTI_CHOICE = 2; // 'Олон сонголт'
const KIND_BOOLEAN = 3; // 'Тийм // Үгүй сонголт'
const KIND_RATING = 4; // 'Үнэлгээ'
const KIND_TEXT = 5; // 'Бичвэр'

function makeQuestionText(question, imageUrl, kind, idx)
{
	return (
		<h6>
			{`${idx + 1}. ${question}`}
		</h6>
	)

	//	// Зураг оруулах үед ашиглана

// 	return (
// 		<div className='fontsizec'>
//             <p>
//                 <span>{`${idx + 1}. ${question}`}</span>
//             </p>
// 			{
// 				imageUrl || image
// 				&&
// 					<div>
// 						<img src={imageUrl ? imageUrl : image} alt='logo' className="imagecss"></img>
// 					</div>
// 			}
// 		</div>
// 	)
// }
}


// Нэг сонголттой асуулт
function displayOneChoice(title, idx, imageUrl, image, qIdx, replyHandleChange) {
	return (
		<div className="form-check ms-2 " key={`radio-${qIdx}-${idx}`}>
			{image || imageUrl ? (
			<div className="m-1 ms-0 showChoiceDiv">
				<img src={imageUrl ? imageUrl : image} alt="question image"></img>
			</div>
			) : (
				<label className="form-check-label">{title}
					<Input
						className="form-check-input mb-1"
						type="radio"
						name={`choice${qIdx}`}
						disabled
					/>
				</label>
			)}
	  	</div>
	);
}

// Олон сонголттой асуулт
function displayMultiChoice(title, idx, imageUrl, image, qIdx, replyHandleChange) {
	return (
	<div className="form-check ms-2 " key={`checkbox-${qIdx}-${idx}`}>
		{image || imageUrl ? (
		  <div className=" showChoiceDiv">
			<img src={imageUrl ? imageUrl : image} alt="question image"></img>
		  </div>
		) : (
		  <label className="form-check-label">{title}
		  		<Input
					className="form-check-input mb-1"
					type="checkbox"
					name={`choice${qIdx}`}
					disabled
				/>
		  </label>
		)}
	  </div>
	);
}

// Үнэлгээ
function makeRatingAns(ratingWords, qIdx, replyHandleChange) {
	function radios() {
		let radios = [];

		for (let idx = 0; idx < ratingWords.length; idx++) {
			radios.push(
				<td key={`rating-${idx}-${qIdx}`} style={{ padding: '20px' }}>
					<table>
						<tbody>
							<tr>
								<td>
									<label
										htmlFor={`radio-${qIdx}-${idx}-in`}
										style={{
											writingMode: 'vertical-rl',
											transform: 'rotate(180deg)',
											cursor: 'pointer'
										}}
									>
										{ratingWords[idx]}
									</label>
								</td>
							</tr>
							<tr>
								<td>
									<input
										type="radio"
										name={`rating-${qIdx}`}
										id={`radio-${qIdx}-${idx}-in`}
										className="form-check-input"
										disabled
										value={idx}
									/>
								</td>
							</tr>
						</tbody>
					</table>
				</td>
			);
	  	}
	  	return radios;
	}
	return (
		<div className='questionRating' style={{ overflow: 'auto' }}>
			<table>
				<tbody>
					<tr style={{ verticalAlign: 'bottom' }}>
						{radios()}
					</tr>
				</tbody>
			</table>
		</div>
	);
}
function DisplayQuestions({ questions }) {

	if( questions.length < 1) {
		return (<Badge color="light-danger" className="p-1 rounded-5"> <AlertCircle/> Энэ судалгаа асуулт үүсгээгүй байна</Badge>)
	}

	return questions.map((rowsData, idx) => {
			const {
				kind,
				question,
				imageUrl,
				image,
				rating_max_count,
				rating_words,
				choices,
				id
			} = rowsData;

			return (
				<div className="card-contain shadow-lg" key={`question${idx}`}>
				<div className="mb-2">

					<div className="mb-1 ">
						{makeQuestionText(question, imageUrl, kind, idx)}
					</div>

					{
						kind === KIND_BOOLEAN &&
							<div className="form-check" key={idx}>
								<div>
									<label className="form-check-label ms-2">
										Тийм
										<Input
											className="form-check-input mb-2 "
											type="radio"
											name="boolean"
											value="1"
											disabled
										/>
									</label>
								</div>
								<div>
									<label className="form-check-label ms-2">
										Үгүй
										<Input
											className="form-check-input mb-2 "
											type="radio"
											name="boolean"
											disabled
											value="0"
										/>
									</label>
								</div>
							</div>
					}
					{
						kind === KIND_ONE_CHOICE &&
							choices.map(({ choices, image, imageUrl }, choiceIdx) => // Changed idx to choiceIdx
								displayOneChoice(choices, choiceIdx, imageUrl, image, idx) // Passed idx as qIdx
							)
					}
					{
						kind === KIND_MULTI_CHOICE &&
							choices.map(({ choices, image, imageUrl }, choiceIdx) => (
								displayMultiChoice(choices, choiceIdx, imageUrl, image, idx)
							))
					}
					{
						kind === KIND_RATING &&
							makeRatingAns(
								rating_words,
								idx,
						)
					}
					{
						kind === KIND_TEXT && (
							<div key={`text${idx}`}>
								<Input
									type="textarea"
									className="form-control"
									id="message" name="textkind"
											disabled
								/>
							</div>
					)}
				</div>
			</div>
    	)
  	})
}

export default DisplayQuestions;


