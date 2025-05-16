import React, { Fragment, useState, useCallback, useEffect } from 'react'
import {
    Row,
 } from 'reactstrap'

import Subject from '../components/Subject';
import SubjectQuestions from '../components/SubjectQuestions';

import Verification from '../components/Verification';

export default function PrepareQuestion(props) {

    const {
        lessonId,
        setSelectedQuestionDatas,
        selectedQuestionDatas,
        isEdit
    } = props

    const [checked_ids, setChecked] = useState([])
    const [questionIds, setQuestionChecked] = useState([])

    // хичээлийн сэдэв check
    const  handleSearchChecked = useCallback(
        (e) => {
            const { value, checked } = e.target;
            const id = parseInt(value)

            if (isEdit) {
                var isHave = checked_ids.find(item => item == id)

                if (!isHave) {
                    setChecked([...checked_ids, id]);
                }
            } else {
                setChecked([...checked_ids, id]);
            }

            if (!checked) {
                setChecked(checked_ids.filter(item => item !== id));
            }
        }, [checked_ids]
    )

    // асуулт  check
    const handleChooseQuestion = useCallback(
        (e) =>
        {
            const { value, checked } = e.target;
            const id = parseInt(value)

            if (isEdit) {
                var isHave = questionIds.find(item => item == id)

                if (!isHave) {
                    setQuestionChecked([...questionIds, id]);
                }
            } else {
                setQuestionChecked([...questionIds, id]);
            }

            if (!checked) {
                setQuestionChecked(questionIds.filter(item => item !== id));
            }
        },
        [questionIds]
    )

    // Буруу ажиллаж байна

    // useEffect(
    //     () =>
    //     {
    //         if (isEdit && selectedQuestionDatas.length > 0) {

    //             var check_ids = selectedQuestionDatas.map(li => li.subject?.id)
    //             var question_ids = selectedQuestionDatas.map(li => li.id)

    //             let uniqueChecks = [...new Set(check_ids)];
    //             let uniqueQuestions = [...new Set(question_ids)];

    //             console.log(uniqueQuestions);

    //             let difference_subject_ids = uniqueChecks.filter(x => checked_ids.indexOf(x) === -1);
    //             let difference_question_ids = uniqueQuestions.filter(x => questionIds.indexOf(x) === -1);

    //             setChecked([...difference_subject_ids])
    //             setQuestionChecked([...difference_question_ids])

    //         }
    //     },
    //     [isEdit, selectedQuestionDatas]
    // )

    return (
        <Fragment>
            <Row className='mb-1'>
                <Subject
                    lessonId={lessonId}
                    checked_ids={checked_ids}
                    handleSearchChecked={handleSearchChecked}
                />
                <SubjectQuestions
                    checked_ids={checked_ids}
                    questionIds={questionIds}
                    handleChooseQuestion={handleChooseQuestion}
                    setSelectedQuestionDatas={setSelectedQuestionDatas}
                    setQuestionChecked={setQuestionChecked}
                    isEdit={isEdit}
                />
            </Row>
            {
                selectedQuestionDatas.length > 0 &&
                    <Verification
                        {...props}
                    />
            }
        </Fragment>
    )
}
