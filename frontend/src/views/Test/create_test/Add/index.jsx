// ** React Imports
import { useRef, useState, Fragment, useEffect } from 'react'

// ** Custom Components
import Wizard from '@components/wizard'
import {
	Modal,
	ModalHeader,
	ModalBody,
} from "reactstrap";

import { Info, Link, X } from 'react-feather'

// ** Steps
import Lists from './steps/List'
import PrepareQuestion from './steps/PrepareQuestion';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { convertDefaultValue } from "@utils"

import '../../style.css'

const Addmodal = ({ open, handleModal, editData, isEdit, setEditRowData, refreshDatas }) => {

    // ** Ref
    const ref = useRef(null)

	const [selectedLesson, setSelectedLesson] = useState('')

    // ** State
    const [stepper, setStepper] = useState(null)

	const [submitDatas, setSubmitDatas] = useState({})
    const [selectedQuestionDatas, setSelectedQuestionDatas] = useState([])

    // API
    const challengeAPI = useApi().challenge

    // Loader
	const { isLoading, fetchData, Loader } = useLoader({ isFullScreen: true });

    const closeBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    );

    const onSubmit = async() => {

        var question_ids = selectedQuestionDatas.map((li) => li.id)

        var cdatas = convertDefaultValue(submitDatas)
        cdatas['question_ids'] = question_ids

        if (isEdit) {
            const { success, data } = await fetchData(challengeAPI.put(cdatas, cdatas?.id))
            if(success)
            {
                handleModal()
                refreshDatas()
            }
        } else {

            const { success, data } = await fetchData(challengeAPI.post(cdatas))
            if(success)
            {
                handleModal()
                refreshDatas()
            }
        }

    }

    const steps = [
        {
            id: 'main-information',
            title: 'Ерөнхий мэдээлэл',
            subtitle: 'Шалгалтын мэдээлэл',
            icon: <Info size={18} />,
            content: <Lists
                        stepper={stepper}
                        setSubmitDatas={setSubmitDatas}
                        setSelectedLesson={setSelectedLesson}
                        selectedLesson={selectedLesson}
                        editData={editData}
                        setSelectedQuestionDatas={setSelectedQuestionDatas}
                        setEditRowData={setEditRowData}
                    />
        },
        {
            id: 'questions',
            title: 'Асуултууд',
            subtitle: 'Асуулт бэлдэх',
            icon: <Link size={18} />,
            content: <PrepareQuestion
                        stepper={stepper}
                        lessonId={selectedLesson}
                        generalDatas={submitDatas}
                        onSubmit={onSubmit}
                        setSelectedQuestionDatas={setSelectedQuestionDatas}
                        selectedQuestionDatas={selectedQuestionDatas}
                        isEdit={isEdit}
                    />
        },
    ]

    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className='sidebar-xl custom-80'
                modalClassName='modal-slide-in'
                contentClassName='pt-0'
            >
                <ModalHeader
                    className="mb-1"
                    toggle={handleModal}
                    close={closeBtn}
                    tag="div"
                >
                    <h5 className="modal-title">{"Шалгалт нэмэх"}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    {isLoading && Loader}
                    <div className='horizontal-wizard'>
                        <Wizard instance={el => setStepper(el)} ref={ref} steps={steps} />
                    </div>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}

export default Addmodal
