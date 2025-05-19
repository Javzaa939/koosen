import React, { Fragment, useState, useEffect } from 'react';
import { X } from 'react-feather';
import {
	Modal,
	ModalBody,
	ModalHeader,
} from "reactstrap";

import TestResult from '../components/TestResult';

export default function DetailModal({ open, handleModal, data}){

    const closeBtn = (
        <X className="cursor-pointer" size={20} onClick={handleModal} />
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
                >
                </ModalHeader>
                <ModalBody className="flex-grow-1">
                    {
                        Object.keys(data).length > 0
                        &&
                            <TestResult
                                selectedQuestionDatas={data?.answer_json}
                                generalDatas={data}
                            />
                    }
                </ModalBody>
            </Modal>
        </Fragment>
    )
};