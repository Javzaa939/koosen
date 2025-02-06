import React, { Fragment, useState, useEffect } from 'react';
import { Modal, Card, CardBody, ModalBody, ModalHeader, Table, Spinner } from 'react-bootstrap';
import { X } from 'react-feather';
import useLoader from '@hooks/useLoader';
import useApi from '@hooks/useApi';

const DetailModal = ({ open, handleModal, datas }) => {
    const [studentData, setStudentData] = useState([]);
    const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true });
    const scoreApi = useApi().score.teacher;

    async function getDatas() {
        if (datas) {
            const lesson = datas?.lesson?.id;
            const group = datas?.group?.id;
            const teacher = datas?.teacher?.id;

            const { success, data } = await fetchData(scoreApi.getStudentData(lesson, teacher, group));
            if (success) {
                setStudentData(data);
            }
        }
    }

    useEffect(() => {
        if (open) {
            getDatas();
        }
    }, [open, datas]);

    return (
        <Fragment>
            <Modal show={open} onHide={handleModal} size="lg" centered>
                <ModalHeader closeButton>
                    <h3 className='text-primary'>Дүнгийн дэлгэрэнгүй</h3>
                </ModalHeader>
                <ModalBody>
                    <Card className="invoice-preview-card">
                        <CardBody className="invoice-padding pb-0">
                            {isLoading ? (
                                <div className="d-flex justify-content-center">
                                    <Spinner animation="border" variant="primary" />
                                </div>
                            ) : (
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '10%' }}>№</th>
                                            <th style={{ width: '60%' }}>Сурагчийн нэр</th>
                                            <th style={{ width: '30%' }}>Дүн</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentData.length > 0 ? (
                                            studentData.map((student, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{student.student_name}</td>
                                                    <td>{student.total_score}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="2">Сурагч байхгүй</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            )}
                        </CardBody>
                    </Card>
                </ModalBody>
            </Modal>
        </Fragment>
    );
};

export default DetailModal;
