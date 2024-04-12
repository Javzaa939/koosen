import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

function MessageModal({ messageModalHandler, messageModal }) {

    return (
        <Modal centered toggle={messageModalHandler} isOpen={messageModal}>
            <ModalHeader toggle={messageModalHandler}>
                Элсэгчид рүү мессеж илгээх
            </ModalHeader>
            <ModalBody>
            </ModalBody>
            <ModalFooter>
                <Button onClick={() => messageModalHandler()}>Гарах</Button>
            </ModalFooter>
        </Modal>
    )
}

export default MessageModal
