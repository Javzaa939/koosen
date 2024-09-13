import React, { useState, useEffect } from 'react';
import moment from "moment";
// ** Reactstrap Imports
import {
    Row,
    Form,
    Modal,
    ModalHeader,
    ModalBody,
    Table,
    Button
} from 'reactstrap'

import useLoader from "@src/utility/hooks/useLoader";
import useApi from "@src/utility/hooks/useApi";
import StudentModal from './Modal';
import { useTranslation } from 'react-i18next'

const DetailModal = ({ open, handleModal, homework }) => {

    // Translation hook
    const { t } = useTranslation();
    const [datas, setDatas] = useState([]);
    const [modal, setModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null); // State to hold selected student data
    const studentApi = useApi().sent_home_work;
    const { fetchData } = useLoader({});

    async function getDatas() {
        const { success, data } = await fetchData(studentApi.get(homework));
        if (success) {
            setDatas(data);
        }
    }

    useEffect(() => {
        getDatas();
    }, [homework]);

    const handleStudentModal = (student) => {
        setSelectedStudent(student); // Set the selected student data
        setModal(!modal);
    };

    return (
        <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-lg" onClosed={handleModal} backdrop='static'>
            <ModalHeader className='bg-transparent pb-0' toggle={handleModal} ><h5>{t('Гэрийн даалгавар илгээсэн сурагчид')}</h5></ModalHeader>
            <ModalBody className="">
                <Row tag={Form} >
                    <Table size='sm' bordered responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Нэр</th>
                                <th>ID</th>
                                <th>Дүн</th>
                                <th className='text-center'>Үйлдэл</th>
                                <th>Илгээсэн хугацаа</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datas.map((item, idx) => {
                                return (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>{item?.student?.fullName}</td>
                                        <td>{item?.student?.code}</td>
                                        <td>{item?.score ? item.score : "Шалгаагүй"}</td>
                                        <td className='d-flex justify-content-center align-items-center'>
                                            {item?.score
                                                ? <Button color='primary' size='sm' onClick={() => handleStudentModal(item)}>Засах</Button>
                                                : <Button color='primary' size='sm' onClick={() => handleStudentModal(item)}>шалгах</Button>}
                                        </td>
                                        <td>{moment(item.created_at).format('YYYY-MM-DD HH:MM:SS')}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Row>
            </ModalBody>
            {
                modal && <StudentModal open={modal} handleModal={handleStudentModal} studentData={selectedStudent} refresh={getDatas} />
            }
        </Modal>
    );
};

export default DetailModal;
