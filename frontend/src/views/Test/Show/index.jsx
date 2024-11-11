import React, { Fragment } from 'react'

import {
	Modal,
	ModalHeader,
	ModalBody,
} from "reactstrap";

import Verification from '../Add/components/Verification';

import { X } from 'react-feather';

export default function Show({ open, handleModal, datas }) {

    const closeBtn = (
        <X className="cursor-pointer" size={15} onClick={handleModal} />
    );

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
                    <h5 className="modal-title">{"Шалгалт харах"}</h5>
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    {
                        Object.keys(datas).length > 0
                        &&
                            <Verification
                                selectedQuestionDatas={datas?.questions}
                                generalDatas={datas}
                            />
                    }
                </ModalBody>
            </Modal>
        </Fragment>
    )
}
