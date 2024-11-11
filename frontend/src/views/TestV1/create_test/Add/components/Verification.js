import { ChevronLeft } from 'react-feather'

import { Label, Button, Input, CardBody } from 'reactstrap'

import classnames from "classnames";

import useModal from "@hooks/useModal"

import { fixDatetimeFormat } from "@utils"

import '../../../style.css'

const KIND_ONE_CHOICE = 1 // 'Нэг сонголт'
const KIND_MULTI_CHOICE = 2 // 'Олон сонголт'
const KIND_BOOLEAN = 3 // 'Тийм // Үгүй сонголт'
const KIND_RATING = 4 // 'Үнэлгээ'
const KIND_TEXT = 5 // 'Бичвэр'

// Асуулт бэлдэх хэсэг
function makeQuestionText(question, maxChoiceCount, imageUrl, image)
{

	return (
		<div>
			<span>{question}</span>
			<span style={{ color: 'red' }} className='ms-1'>*</span>
			{
				maxChoiceCount
				?
					<small>{`(Хамгийн ихдээ ${maxChoiceCount} -г сонгоно)`}</small>
				:
					''

			}
			{
				imageUrl || image
				&&
					<div className='showImgDiv m-1'>
						<img src={imageUrl ? imageUrl : image} alt='logo'></img>
					</div>
			}
		</div>
	)
}

// Тийм үгүй хариулт
function displayChoice(title, idx, imageUrl, image, isMulti=false)
{
    return (
        <div className="form-check ms-2 " key={idx}>
            <Input className="form-check-input mb-1" type={isMulti ? "checkbox" : "radio"} disabled readOnly/>
			{
				image || imageUrl
				?
					<div className='m-1 ms-0 showChoiceDiv'>
						<img src={imageUrl ? imageUrl : image} alt='logo'></img>
					</div>
				:
            		<Label className="form-check-label">{title}</Label>
			}
        </div>
	)

}

// Үнэлгээ харуулах хэсэг
function makeRatingAns(textLow, textHigh, numStars, qIndx)
{
    function radios()
    {
        let radios = []
        for (let index = 1; index <= numStars; index++)
        {
            radios.push(
                <div className="m-1">
                    <Input type="radio" id={`radio-${qIndx}-${index}-in`} value={index} className="form-check-input" disabled />
                    <Label for={`radio-${qIndx}-${index}-in`} className="form-label d-flex justify-content-center">
                        {index}
                    </Label>
                </div>
			)
        }
        return radios
    }

    return (
        <div className="d-flex align-items-center ms-2">
            <div>
                {textLow}
            </div>
           	 	{radios()}
            <div>
                {textHigh}
            </div>
        </div>
	)
}

function PreviewQuestion({ questions }) {
	return questions.map((rowsData, idx) => {
        const { kind, question,  imageUrl, image, rating_max_count, low_rating_word, high_rating_word, max_choice_count, choices, } = rowsData;
		return(
			<div className='mb-1' key={idx}>
				<div className="d-flex">
					<div>
						{idx + 1}. &nbsp;
					</div>
					<div>
						{makeQuestionText(question, max_choice_count, imageUrl, image)}
					</div>
				</div>
				{
					kind == KIND_TEXT // TEXT хариултай байх үед
					&&
						<div className='ms-2 mt-1 '>
							<textarea className="form-control" disabled readOnly placeholder="Хариултыг бичнэ"></textarea>
						</div>
				}
				{
					kind == KIND_BOOLEAN // Тийм үгүй сонголттой үед
					&&
						['Тийм', 'Үгүй'].map((text, idx) => displayChoice(text, idx))
				}
				{
					kind == KIND_ONE_CHOICE // Зөвхөн нэг сонголттой үед
					&&
						choices.map(({ choices, image, imageUrl }, idx) => displayChoice(choices, idx, imageUrl, image))
				}
				{
					kind == KIND_MULTI_CHOICE // Олон сонголттой үед
					&&
						choices.map(({ choices, image, imageUrl }, idx) => displayChoice(choices, idx, imageUrl, image, true))
				}
				{
					kind == KIND_RATING // Үнэлгээ өгдөг байх үед
					&&
						makeRatingAns(low_rating_word, high_rating_word, rating_max_count, idx)
				}

			</div>
		)
	})
}

const Verification = ({ stepper, selectedQuestionDatas, generalDatas, onSubmit, isEdit }) => {

	const { showWarning } = useModal()

	return (
		<div className='added-cards'>
			<div className={classnames('cardMaster rounded border p-1')}>
				<h5 className='mb-1'>Шалгалтын загвар</h5>
				<CardBody className='invoice-padding pt-0'>
					<table className='w-100'>
						<tbody>
							<tr>
								<td className='pe-1' style={{ width: '33%' }}>Хамрах хүрээ:</td>
								<td>
									<b className='fw-bold'>{generalDatas?.scopeName}</b>
								</td>
							</tr>
							<tr className=''>
								<td className='pe-1'>Шалгалтын нэр: </td>
								<td><b className='fw-bold'>{generalDatas?.title}</b></td>
							</tr>
							<tr>
								<td className='pe-1'>Тайлбар: </td>
								<td><b className='fw-bold'>{generalDatas?.description}</b></td>
							</tr>
							<tr>
								<td className='pe-1'>Шалгалтын огноо:</td>
								<td><b className='fw-bold'>{fixDatetimeFormat(generalDatas?.start_date) +  " " + "-" + " " + fixDatetimeFormat(generalDatas?.start_date)}</b></td>
							</tr>
							<tr>
								<td className='pe-1'>Шалгалтын үргэлжлэх хугацаа: </td>
								<td><b className='fw-bold'>{generalDatas?.duration} минут</b></td>
							</tr>
						</tbody>
					</table>

					<hr/>

					{
						selectedQuestionDatas.length > 0 &&
							<PreviewQuestion questions={selectedQuestionDatas}/>
					}

				</CardBody>
				{
					stepper &&
						<div className='d-flex justify-content-between mt-3'>
							<Button color='secondary' className='btn-prev' outline onClick={() => stepper.previous()}>
								<ChevronLeft size={14} className='align-middle me-sm-25 me-0'></ChevronLeft>
								<span className='align-middle d-sm-inline-block d-none'>Өмнөх</span>
							</Button>
							<Button
								color={isEdit ? 'primary' : 'success'}
								className='btn-next'
								onClick={
									() =>
									showWarning({
										header: {
											title: isEdit ? 'Засах' : 'Баталгаажуулах',
										},
										question: `Та энэ шалгалтын мэдээллийг хадгалахдаа итгэлтэй байна уу?`,
										onClick: () => onSubmit(),
										btnText: 'Хадгалах',
									})
								}
							>
								<span className='align-middle d-sm-inline-block d-none'>{isEdit ? 'Засах' : 'Баталгаажуулах'}</span>
							</Button>
						</div>
				}
			</div>
		</div>
	)
}

export default Verification
