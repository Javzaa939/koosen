// ** React Imports
import { useRef, useState, Fragment } from 'react'

// ** Custom Components
import Wizard from '@components/wizard'
import {
	Modal,
	ModalHeader,
	ModalBody,
} from "reactstrap";

import { Info, User, X } from 'react-feather'

// ** Steps
import General from './Steps/General'
import Students from './Steps/Students';

import useApi from '@hooks/useApi';
import useLoader from '@hooks/useLoader';

import { convertDefaultValue } from "@utils"

const Addmodal = ({ open, handleModal, setEditRowData, refreshDatas }) => {

    // ** Ref
    const ref = useRef(null)

	const [selectedLesson, setSelectedLesson] = useState('')

    // ** State
    const [stepper, setStepper] = useState(null)

	const [submitDatas, setSubmitDatas] = useState({})

    // API
    const challengeAPI = useApi().challenge

    // Loader
	const { isLoading, fetchData, Loader } = useLoader({ isFullScreen: true });

    const closeBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    );

    const onSubmit = async(students) => {

        var cdatas = convertDefaultValue(submitDatas)
        cdatas['students'] = students

        const { success, data } = await fetchData(challengeAPI.postTest(cdatas, 1))
        if(success)
        {
            handleModal()
            refreshDatas()
        }

    }

    const steps = [
        {
            id: 'main-information',
            title: 'Ерөнхий мэдээлэл',
            subtitle: 'Шалгалтын мэдээлэл',
            icon: <Info size={18} />,
            content: <General
                        stepper={stepper}
                        setSubmitDatas={setSubmitDatas}
                        setSelectedLesson={setSelectedLesson}
                        setEditRowData={setEditRowData}
                    />
        },
        {
            id: 'student-information',
            title: 'Шалгалтад оролцогчид',
            subtitle: 'Оюутны мэдээлэл',
            icon: <User size={18} />,
            content: <Students
                    stepper={stepper}
                    setSubmitDatas={setSubmitDatas}
                    onSubmit={onSubmit}
                    selectedLesson={selectedLesson}
                    setEditRowData={setEditRowData}
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
