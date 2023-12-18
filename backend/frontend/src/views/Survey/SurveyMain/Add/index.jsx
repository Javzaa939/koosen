// ** React Imports
import { useRef, useState, Fragment, useEffect } from 'react'

// ** Custom Components
import Wizard from '@components/wizard'
import {
	Modal,
	ModalHeader,
	ModalBody,
    ModalFooter,
    Button
} from "reactstrap";

import { Info, X, Flag, Target} from 'react-feather'

// ** Steps
import MainInfo from './steps/MainInfo'
import Asuult from './steps/Asuult';
import Scope from './steps/Scope';

const Createmodal = ({ open, handleModal, editData, isEdit, refreshDatas, toggle, toggleNested, toggleAll, closeAll, nestedModal }) => {
    const closeBtn = (
        <X className="cursor-pointor" size={15} onClick={toggleNested} style={{cursor: "pointer"}} />
    )

    const ref = useRef(null)
    const [stepper, setStepper] = useState(null)

    const [datas, setSubmitDatas] = useState({})

    const steps = [
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
        },
    ]

    return  (
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
                style={{maxWidth: '1300px', width: '100%',}}
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
                        <Wizard instance={el => setStepper(el)} ref={ref} steps={steps} />
                    </div>
                </ModalBody>
            </Modal>
        </Fragment>
    )
}

export default Createmodal;