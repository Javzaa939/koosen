import React, { useState, useEffect } from 'react';
import moment from 'moment';
import {
    Row,
    Modal,
    ModalHeader,
    ModalBody,
    Table,
    Button,
    Input
} from 'reactstrap';

import useLoader from '@src/utility/hooks/useLoader';
import useApi from '@src/utility/hooks/useApi';
import StudentModal from './Modal';
import { useTranslation } from 'react-i18next';

const LectureModal = ({ open, handleModal, homework }) => {
    const { t } = useTranslation();
    const [datas, setDatas] = useState([]);
    const [modal, setModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const studentApi = useApi().sent_lecture_file;
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
        setSelectedStudent(student);
        setModal(!modal);
    };

    const handleCheckboxChange = (id) => {
        const updatedSelectedRows = new Set(selectedRows);
        if (updatedSelectedRows.has(id)) {
            updatedSelectedRows.delete(id);
        } else {
            updatedSelectedRows.add(id);
        }
        setSelectedRows(updatedSelectedRows);
    };

    const handleSelectAllChange = () => {
        if (selectAll) {
            setSelectedRows(new Set());
        } else {
            const allIds = datas.map(item => item.student.id);
            setSelectedRows(new Set(allIds));
        }
        setSelectAll(!selectAll);
    };

    async function Dvgneh() {
        const { success, data } = await fetchData(studentApi.putAll(homework, Array.from(selectedRows)));
        if (success) {
            getDatas()
        }
    }

    return (
        <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-lg" onClosed={handleModal} backdrop='static'>
            <ModalHeader className='bg-transparent pb-0' toggle={handleModal}>
                <h5>{t('Лекцийн тэмдэглэл илгээсэн сурагчид')}</h5>
            </ModalHeader>
            <ModalBody className="">
                <Row>
                    <Table size='sm' bordered responsive>
                        <thead>
                            <tr>
                                <th>
                                    <Input
                                        type='checkbox'
                                        checked={selectAll}
                                        onChange={handleSelectAllChange}
                                    />
                                </th>
                                <th>#</th>
                                <th>Нэр</th>
                                <th>ID</th>
                                <th>Төлөв</th>
                                <th className='text-center'>Файл</th>
                                <th>Илгээсэн хугацаа</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datas.map((item, idx) => {
                                const isChecked = selectedRows.has(item.student.id);
                                return (
                                    <tr key={idx}>
                                        <td>
                                            <Input
                                                type='checkbox'
                                                checked={isChecked}
                                                onChange={() => handleCheckboxChange(item.student.id)}
                                            />
                                        </td>
                                        <td>{idx + 1}</td>
                                        <td>{item?.student?.fullName}</td>
                                        <td>{item?.student?.code}</td>
                                        <td>{item?.status === 1 ? 'Илгээсэн' : 'Дүгнэгдсэн'}</td>
                                        <td className='d-flex justify-content-center align-items-center'>
                                            {
                                                item?.status == 2
                                                ?
                                                'Шалгасан'
                                                :
                                                <Button color='primary' size='sm' onClick={() => handleStudentModal(item)}>шалгах</Button>
                                            }
                                        </td>
                                        <td>{moment(item.created_at).format('YYYY-MM-DD HH:mm:ss')}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Row>
                {selectedRows.size > 0 && (
                    <Button color='primary' size='sm' onClick={Dvgneh}>Дүгнэх</Button>
                )}
            </ModalBody>
            {modal && <StudentModal open={modal} handleModal={handleStudentModal} studentData={selectedStudent} refresh={getDatas} />}
        </Modal>
    );
};

export default LectureModal;
