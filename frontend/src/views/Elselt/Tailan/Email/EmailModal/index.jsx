import React from 'react'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'

function EmailModal({ emailModal, emailModalHandler, selectedEmail }) {

    return (
        <Modal
            isOpen={emailModal}
            toggle={emailModalHandler}
            centered
        >
            <ModalHeader toggle={emailModalHandler}>
                Хэрэглэгч рүү илгээсэн имейл
            </ModalHeader>
            <ModalBody className='d-flex justify-content-center align-items-center' style={{ minHeight: 500 }}>
                {
                    selectedEmail && selectedEmail?.message ?

                    <div
                        dangerouslySetInnerHTML={{__html: selectedEmail?.message}}
                    >
                    </div>
                    :
                    <div className='bg-light-info p-50 rounded-3' style={{ fontWeight: 800 }}>
                        Уучлаарай илгээсэн имейл олдсонгүй. Та дахин оролдоно уу.
                    </div>
                }
            </ModalBody>
        </Modal>
    )
}

export default EmailModal
