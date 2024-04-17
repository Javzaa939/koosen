import React from 'react'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'

function ImportModal({ importModal, importModalHandler }) {
    return (
        <Modal
            isOpen={importModal}
            toggle={importModalHandler}
            centered
        >
            <ModalHeader toggle={importModalHandler}>
                Импорт
            </ModalHeader>
            <ModalBody>
                Энд файл импорт хийгдэнэ.
            </ModalBody>
        </Modal>
    )
}

export default ImportModal

