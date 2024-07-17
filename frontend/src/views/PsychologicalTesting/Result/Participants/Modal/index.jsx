import React, { Fragment } from 'react';
import { Modal, ModalBody, ModalHeader, Card, CardBody } from "reactstrap";

const renderJsonData = (data) => {
    return (
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {JSON.stringify(data, null, 2)}
        </pre>
    );
};

export default function ResultModal({ open, handleModal, datas }) {
    return (
        <Fragment>
            <Modal
                isOpen={open}
                toggle={handleModal}
                className="modal-dialog-centered modal-lg"
                contentClassName="pt-0"
                scrollable={true}
            >
                <ModalHeader
                    className='bg-transparent pb-0'
                    toggle={handleModal}>
                </ModalHeader>
                <ModalBody className="">
                    <Card className='invoice-preview-card'>
                        <CardBody className='invoice-padding pb-0'>
                            <div className='d-flex justify-content-between flex-md-row flex-column invoice-spacing mt-0'>
                                <div>
                                    <div className='logo-wrapper'>
                                        <h3 className='text-primary invoice-logo'>Сорилын үр дүн</h3>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                        <hr className='invoice-spacing' />
                        <CardBody className='invoice-padding pt-0'>
                            {datas?.answer ? renderJsonData(datas.answer) : "Үр дүн байхгүй байна"}
                        </CardBody>
                    </Card>
                </ModalBody>
            </Modal>
        </Fragment>
    );
}
