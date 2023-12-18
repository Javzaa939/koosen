import React from 'react'

import {
    InputGroup,
    Input,
    InputGroupText,
    Popover,
    PopoverBody,
    Badge,
    FormFeedback
} from 'reactstrap'

import { Minus, X } from 'react-feather'
import empty from "@src/assets/images/empty-image.jpg"

import '../../style.css'

function ChoiceInput(props) {

    const {
        idx,
        index_name,
        popoverIdx,
        choices,
        readOnly,
        choiceErrors,
        onHandleChoiceChange,
        handlePopOver,
        clickAnswerImg,
        removeChoicesField,
        handleDeleteChoiceImage
    } = props

    return (
        choices.map((choice, cidx) =>
            <div key={cidx}>
                <div className='d-flex justify-content-start'>
                    <InputGroup className='mt-1'>
                        <Input
                            type='text'
                            bsSize='sm'
                            name='choices'
                            invalid={choiceErrors && (Object.keys(choiceErrors).length > 0 && choiceErrors.idx === cidx) ? true : false}

                            disabled={choice?.image || readOnly}
                            value={choice.choices}
                            onChange={(e) => onHandleChoiceChange(idx, cidx, e.target.value, e.target.name)}
                            placeholder='Сонголтын утга'
                        />
                        <InputGroupText onClick={() => {readOnly ? '' : handlePopOver(cidx, idx)}} id={`popover${cidx}${idx}`}>
                            <i className="far fa-ellipsis-h"></i>
                        </InputGroupText>
                        { choiceErrors && (Object.keys(choiceErrors).length > 0 && choiceErrors.idx === cidx) && <FormFeedback className='d-block'>{choiceErrors.message}</FormFeedback> }

                    </InputGroup>

                    <Popover
                        placement="top"
                        isOpen={(cidx===popoverIdx && idx===index_name)}
                        target={`popover${cidx}${idx}`}
                        toggle={handlePopOver}
                    >
                        <PopoverBody tag={'div'} className='d-flex justify-content-start flex-wrap '>
                            <small id="answerImg" onClick={() => clickAnswerImg(cidx)}  className='link-primary text-decoration'>Зураг</small>
                            <input accept="image/*" type="file" id={`imgInput${cidx}`} name="image" className="form-control d-none" onChange={(e) => onHandleChoiceChange(idx, cidx, e.target.files, e.target.name)}/>
                        </PopoverBody>
                    </Popover>

                    <div className='ms-1 mt-1'>
                        <Badge color='light-danger' pill  onClick={() => { readOnly ? '' : removeChoicesField(idx, cidx)}}>
                            <Minus size={15} />
                        </Badge>
                    </div>
                </div>
                {
                    (choice?.imageUrl || choice?.image )&&
                        <div className="d-flex custom-flex mt-1 ms-3">
                            <div className="d-flex justify-content-between">
                                <div className="choiceImgDiv " >
                                    <img src={choice?.imageUrl ? choice?.imageUrl : choice?.image ? choice?.image : empty}/>
                                </div>
                                <X size={15} color='red' onClick={() => { readOnly ? '' : handleDeleteChoiceImage(idx, cidx)}}></X>
                            </div>
                        </div>
                }
            </div>
        )
    )
}

export default ChoiceInput
