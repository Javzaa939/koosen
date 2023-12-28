import React, { useState, memo, useEffect } from 'react'

import {
    Col,
    Input,
    Label,
    Button
} from 'reactstrap'

import classnames from 'classnames'

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

function SubjectQuestions({ checked_ids, questionIds, handleChooseQuestion, setSelectedQuestionDatas, setQuestionChecked, isEdit }) {

    const defaultOption = [ 'Эхний', 'Сүүлийн']

    const [questions, setQuestions] = useState([])
    const [ allRadio, setAllRadio ] = useState(true)
    const [ numberRadio, setNumberRadio ] = useState(false)

    const [selected, setSelect] = useState('')
    const [questionCount, setQuestionCount] = useState('')

    // Loader
	const { isLoading, fetchData } = useLoader({});

	// API
	const questionAPI = useApi().challenge.question

    // Асуултуудыг авах
    async function getQuestions()
    {
        if(checked_ids.length > 0 && ((questionCount && parseInt(questionCount) > 0) || allRadio)) {
            const { success, data } = await fetchData(questionAPI.getList(checked_ids, questionCount, selected))
            if(success) {
                setQuestions(data)
                if (data) {
                    var checked_list = []
                    data.forEach(element => {
                        var ids = element.data.map(li => li.id)
                        checked_list.push(...ids)
                    });

                    setQuestionChecked([...checked_list])
                }
            }
        }
    }

    // Эхний сүүлийн сонгох
    const handlePerQuestion = (e) => {
        setSelect(e.target.value)
    }

    // Асуултын тоо
    const handleChange = (e) => {
        setQuestionCount(e.target.value)
    }

    function addQuestion() {

        if (questionIds.length > 0) {

            var all_datas = []
            questions.forEach(item => {
                var filtered_data = item.data?.filter((c) => questionIds.includes(c.id))
                all_datas.push(...filtered_data)
            })

            setSelectedQuestionDatas([...all_datas])
        }
    }


    useEffect(
        () =>
        {
            setTimeout(() => {
                getQuestions()
            }, 1000)
        },
        [questionCount, allRadio, selected, checked_ids]
    )

    return (
        <Col md={6}>
            <h5>Хичээлийн сэдвийн асуултууд</h5>
            <div className='added-cards'>
                <div className={classnames('cardMaster rounded border p-1')}>

                    <div>
                        <div className='d-flex justify-content-start mb-1'>
                            <div>
                                <Input
                                    id="all"
                                    name='is_confirm'
                                    type='radio'
                                    className='me-1'
                                    bsSize="md"
                                    defaultChecked={allRadio}
                                    onClick={() => { setAllRadio(true); setNumberRadio(false); setQuestionCount('') }}
                                />
                                <Label className='form-label'>Бүгд</Label>
                            </div>
                            {
                                !isEdit &&
                                    <div className='ms-2'>
                                        <Input
                                            id="not_all"
                                            name='is_confirm'
                                            type='radio'
                                            className='me-1'
                                            bsSize="md"
                                            defaultChecked={numberRadio}
                                            onClick={() => { setAllRadio(false); setNumberRadio(true); setQuestions([]) }}
                                        />
                                        <Label className='form-label'>Утга бичих</Label>
                                    </div>
                            }
                            {
                                numberRadio &&
                                    <div className='ms-1'>
                                        <Input
                                            className='me-1'
                                            type='select'
                                            bsSize='sm'
                                            value={selected}
                                            onChange={e => handlePerQuestion(e)}
                                        >
                                            <option value=''>-- Сонгоно уу --</option>
                                            {
                                                defaultOption.map((page, idx) => (
                                                    <option
                                                        key={idx}
                                                        value={page}
                                                    >
                                                        {page}
                                                    </option>
                                                ))
                                            }
                                        </Input>
                                    </div>
                            }
                            {
                                (selected && numberRadio) &&
                                    <div className='ms-1'>
                                        <Input
                                            className='me-1 mb-50'
                                            type='number'
                                            bsSize='sm'
                                            placeholder='Асуултын тоо'
                                            onChange={(e) => handleChange(e)}
                                        />
                                    </div>
                            }
                        </div>

                        <hr/>

                    </div>
                    { questions && questions.map((item, idx) =>
                            <div className='added-cards mb-1' key={idx}>
                                <div className={classnames('cardMaster rounded border p-1')}>
                                    <h6>{item?.name}</h6>

                                    <hr className='mt-0'/>

                                    {
                                        item?.data.length > 0
                                        ?
                                            item?.data.map(
                                                (data, cidx) =>
                                                <div className='d-flex justify-content-start mb-1' key={cidx}>
                                                    <div>
                                                        <Input
                                                            type='checkbox'
                                                            className='me-1'
                                                            bsSize="md"
                                                            value={data.id}
                                                            name={data.question}
                                                            id={data.question}
                                                            checked={questionIds.includes(data.id)}
                                                            onChange={(e) => handleChooseQuestion(e, data)}
                                                        />
                                                    </div>
                                                    <Label className='form-label'>{data.question}</Label>
                                                </div>
                                            )
                                        :
                                            <Label className='text-center'>Асуулт байхгүй байна</Label>
                                    }
                                </div>
                            </div>
                        )
                    }
                    <div className='d-flex justify-content-end mt-1'>
                        <Button size='sm' color='primary' onClick={() => addQuestion()}>Нэмэх</Button>
                    </div>
                </div>
            </div>
        </Col>
    )
}

export default memo(SubjectQuestions)
