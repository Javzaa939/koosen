import { useState, useCallback } from 'react'





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
