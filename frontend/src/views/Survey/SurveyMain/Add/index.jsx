// ** React Imports
import { useRef, useState, useEffect } from 'react'

// ** Custom Components




// ** Steps

const Createmodal = ({ open, handleModal, editData, isEdit, refreshDatas, toggle, toggleNested, toggleAll, closeAll, nestedModal }) => {
    const closeBtn = (
        <X className="cursor-pointor" size={15} onClick={toggleNested} style={{ cursor: "pointer" }} />
    )

    const ref = useRef(null)
    const [stepper, setStepper] = useState(null)

    const [datas, setSubmitDatas] = useState({})

    const [surveyType, setSurveyType] = useState('regular')

    // array is not in global variable because only in this way values will be updated
    const [steps, setSteps] = useState([
        {
            id: 'survey_type',
            title: 'Төрөл',
            subtitle: 'Судалгааны төрөл',
            icon: <Target size={18} />,
            content: <Type
                stepper={stepper}
                setSubmitDatas={setSubmitDatas}
                setSurveyType={setSurveyType}
                surveyType={surveyType}
            />
        },
        {
            id: 'scope',
            title: 'Хамрах хүрээ',
            subtitle: 'Судалгааг хэнээс авах вэ?',
            icon: <Target size={18} />,
            content: <Scope
                stepper={stepper}
                setSubmitDatas={setSubmitDatas}
                data={datas}
                editData={editData}
            />
        },
        {
            id: 'main-information',
            title: 'Ерөнхий мэдээлэл',
            subtitle: 'Судалгааны мэдээлэл',
            icon: <Info size={18} />,
            content: <MainInfo
                stepper={stepper}
                setSubmitDatas={setSubmitDatas}
                data={datas}
                editData={editData}
            />
        },
        {
            id: 'asuult',
            title: 'Асуулт',
            subtitle: 'Судалгааны асуулт',
            icon: <Flag size={18} />,
            content: <Asuult
                stepper={stepper}
                setSubmitDatas={setSubmitDatas}
                data={datas}
                editData={editData}
                isEdit={isEdit}
                handleModal={handleModal}
                refreshDatas={refreshDatas}
            />
        }
    ])

    // to update wizard e.g. if steps changed with new props in 'content' field
    function syncSteps() {
        // array is not in global variable because only in this way values will be updated
        const stepsWithUpdatedValues = [
            {
                id: 'survey_type',
                title: 'Төрөл',
                subtitle: 'Судалгааны төрөл',
                icon: <Target size={18} />,
                content: <Type
                    stepper={stepper}
                    setSubmitDatas={setSubmitDatas}
                    setSurveyType={setSurveyType}
                    surveyType={surveyType}
                />
            },
            {
                id: 'scope',
                title: 'Хамрах хүрээ',
                subtitle: 'Судалгааг хэнээс авах вэ?',
                icon: <Target size={18} />,
                content: <Scope
                    stepper={stepper}
                    setSubmitDatas={setSubmitDatas}
                    data={datas}
                    editData={editData}
                />
            },
            {
                id: 'main-information',
                title: 'Ерөнхий мэдээлэл',
                subtitle: 'Судалгааны мэдээлэл',
                icon: <Info size={18} />,
                content: <MainInfo
                    stepper={stepper}
                    setSubmitDatas={setSubmitDatas}
                    data={datas}
                    editData={editData}
                />
            },
            {
                id: 'asuult',
                title: 'Асуулт',
                subtitle: 'Судалгааны асуулт',
                icon: <Flag size={18} />,
                content: <Asuult
                    stepper={stepper}
                    setSubmitDatas={setSubmitDatas}
                    cdata={datas}
                    editData={editData}
                    isEdit={isEdit}
                    handleModal={handleModal}
                    refreshDatas={refreshDatas}
                />
            }
        ]

        setSteps(stepsWithUpdatedValues)
    }

    // to give updated stepper into steps' contents stepper dependency is used, because stepper changes only after change of steps prop
    useEffect(() => {
        syncSteps()
    }, [surveyType, stepper])

    // to keep submitted data between steps
    useEffect(() => {
        syncSteps()
    }, [datas])

    return (
        <Fragment>
            {/* Модаль хаахдаа итгэлтэй байгаа эсэхийг шалгах давхар модаль */}
            <Modal
                isOpen={nestedModal}
                toggle={toggleNested}
                onClosed={closeAll ? toggle : undefined}
                centered={true}
            >
                <ModalHeader>Гарахдаа итгэлтэй байна уу?</ModalHeader>
                <ModalBody>Одоо гарвал таны хийсэн бүхэн устгагдах болно.</ModalBody>
                <ModalFooter>
                    <Button color="primary" outline onClick={toggleAll}>
                        Тийм
                    </Button>
                    <Button color="secondary" className="fw-bolder" outline onClick={toggleNested}>
                        Үгүй
                    </Button>{' '}
                </ModalFooter>
            </Modal>
            {/* Үндсэн модаль */}
            <Modal
                isOpen={open}
                toggle={toggleNested}
                className='sidebar-xl'
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
                keyboard={toggleNested}
                style={{ maxWidth: '1300px', width: '100%', }}
            >
                <ModalHeader
                    className="mb-1"
                    toggle={toggleNested}
                    close={closeBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{"Судалгаа авах"}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    <div className='horizontal-wizard'>
                        {/* key prop is used because only in this way steps changing updates wizard properly */}
                        <Wizard key={steps} instance={el => setStepper(el)} ref={ref} steps={steps} />
                    </div>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}

export default Createmodal;