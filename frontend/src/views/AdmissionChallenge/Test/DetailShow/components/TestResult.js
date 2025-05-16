import { Label, Input, CardBody } from 'reactstrap'
import classnames from "classnames";
import '../../style.css'

const KIND_ONE_CHOICE = 1
const KIND_MULTI_CHOICE = 2
const KIND_BOOLEAN = 3
const KIND_TEXT = 5

function makeQuestionText(question, maxChoiceCount, imageName, image)
{
	return (
		<div className='mb-1'>
			<span>{question}</span>
			<span style={{ color: 'red' }} className='ms-1 mb-1'>*</span>
			{
				maxChoiceCount
				?
					<small>{`(Хамгийн ихдээ ${maxChoiceCount} -г сонгоно)`}</small>
				:
					''
			}
			{
				imageName || image
				&&
					<div className='showImgDiv m-1'>
						<img src={imageName ? imageName : image} alt='logo'></img>
					</div>
			}
		</div>
	)
}

function displayChoice(title, idx, imageName, image, isMulti=false, checked, is_right)
{
    return (
        <div key={idx}>
            {
                checked && is_right === true
                ?
					<Input className=" mb-1 mx-1 inputCheckbox" type={isMulti ? "checkbox" : "radio"} disabled readOnly checked valid/>
                :
					checked && is_right === false
				?
					<Input className=" mb-1 mx-1 inputCheckbox" type={isMulti ? "checkbox" : "radio"} disabled readOnly checked invalid/>
				:	
					is_right === true
				?
					<Input className=" mb-1 mx-1 inputCheckbox" type={isMulti ? "checkbox" : "radio"} disabled readOnly checked valid/>
				:
					<Input className=" mb-1 mx-1 inputRadio" type={isMulti ? "checkbox" : "radio"} disabled readOnly/>
            }
            {
                image || imageName
                ?
                    <div className='mb-1 ms-0 showChoiceDiv'>
                        <img src={imageName ? imageName : image} alt='logo'></img>
                    </div>
                :
                    <Label className="form-check-label mb-1">{title}</Label>
            }
        </div>
	)
}

function displayChoiceKindTrue(checked=false, score){
    return (
        <div>
			<Label>
				<Input className=" mb-1 mx-1" type="radio" checked={checked === true ? true : false} disabled readOnly valid={checked === true && score != 0 ? true : false} invalid={checked === true && score === 0 ? true : false}/>
				<Label className="form-check-label mb-1">Тийм</Label>
			</Label><br/>
			<Label>
				<Input className=" mb-1 mx-1" type="radio" checked={checked === true ? false : true} disabled readOnly valid={checked === false && score != 0 ? true : false} invalid={checked === false && score === 0 ? true : false}/>
				<Label className="form-check-label mb-1">Үгүй</Label>
			</Label>
        </div>
	)
}

function PreviewQuestion({ questions }) {
	return questions.map((rowsData, idx) => {
        const { kind, question,  imageName, image, max_choice_count, choices, reply_checked, score} = rowsData;
		return(
			<div className='mb-1' key={idx}>
				<div className="d-flex">
					<div>
						{idx + 1}. &nbsp;
					</div>
					<div>
						{makeQuestionText(question, max_choice_count, imageName, image)}
					</div>
				</div>
				{
					kind == KIND_TEXT
					&&
						<div className='ms-2 mt-1 '>
							<textarea className="form-control" disabled readOnly placeholder="Хариултыг бичнэ"></textarea>
						</div>
				}
				{
					kind == KIND_BOOLEAN
					&&
						displayChoiceKindTrue(reply_checked, score)
				}
				{
					kind == KIND_ONE_CHOICE 
					&&
						choices.map(({ choices, image, imageName, reply_checked, is_right}, idx) => displayChoice(choices, idx, imageName, image, false, reply_checked, is_right))
				}
				{
					kind == KIND_MULTI_CHOICE
					&&
						choices.map(({ choices, image, imageName, reply_checked, is_right }, idx) => displayChoice(choices, idx, imageName, image, true, reply_checked, is_right))
				}
			</div>
		)
	})
}

const TestResult = ({ selectedQuestionDatas, generalDatas }) => {
	return (
		<div className='added-cards'>
			<div className={classnames('cardMaster rounded border p-1')}>
				<h5 className='mb-1'>Шалгалтын дэлгэрэнгүй мэдээлэл</h5>
				<CardBody className='invoice-padding pt-0'>
					<table className='w-100'>
						<tbody>
							<tr>
								<td className='pe-1'>Оюутны нэр: <b className='fw-bold'>{generalDatas?.student_name}</b></td>
							</tr>
							<tr>
								<td className='pe-1'>Оюутны код: <b className='fw-bold'>{generalDatas?.student_code}</b></td>
							</tr>
							<tr>
								<td className='pe-1'>Авсан оноо: <b className='fw-bold'>{generalDatas?.score}</b></td>
							</tr>
							<tr>
								<td className='pe-1'>Нийт оноо: <b className='fw-bold'>{generalDatas?.take_score}</b></td>
							</tr>
						</tbody>
					</table>

					<hr/>
					{
						selectedQuestionDatas?.length > 0 &&
							<PreviewQuestion questions={selectedQuestionDatas}/>
					}

				</CardBody>
			</div>
		</div>
	)
}
export default TestResult