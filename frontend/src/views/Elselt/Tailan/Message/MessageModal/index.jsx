import React from 'react'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'

function Message({ emailModal, emailModalHandler, selectedEmail }) {

    return (
        <Modal
            isOpen={emailModal}
            toggle={emailModalHandler}
            centered
        >
            <ModalHeader toggle={emailModalHandler}>
                Хэрэглэгч рүү илгээсэн мессеж
            </ModalHeader>
            <ModalBody className='d-flex justify-content-center align-items-center' style={{ minHeight: 100 }}>
                {
                    selectedEmail && selectedEmail?.message ?
                    <div>
                        {selectedEmail?.message}
                    </div>
                    :
                    <div className='bg-light-info p-50 rounded-3' style={{ fontWeight: 800 }}>
                        Уучлаарай илгээсэн мэдээлэл олдсонгүй.
                    </div>
                }
            </ModalBody>
        </Modal>
    )
}

export default Message
