import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

function EmailModal({ emailModalHandler, emailModal }) {

    return (
        <Modal centered toggle={emailModalHandler} isOpen={emailModal}>
            <ModalHeader toggle={emailModalHandler}>
                Оюутнуудруу Имейл илгээх
            </ModalHeader>
            <ModalBody>
            </ModalBody>
            <ModalFooter>
                <Button onClick={() => emailModalHandler()}>Гарах</Button>
            </ModalFooter>
        </Modal>
    )
}

export default EmailModal
