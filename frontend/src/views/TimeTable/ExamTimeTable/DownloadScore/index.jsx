// ** React imports
import React, { Fragment } from 'react'

import { useTranslation } from 'react-i18next';

import { Modal, ModalBody, ModalHeader, Table } from "reactstrap";

const DownloadScore = ({ open, handleModal, studentDatas }) => {

    const { t } = useTranslation()

	return (
        <Fragment>
            <Modal isOpen={open} toggle={handleModal} fullscreen onClosed={handleModal}>
                <ModalHeader className='bg-transparent pb-0' toggle={handleModal}></ModalHeader>
                <ModalBody className="px-sm-3 pt-50 pb-3">
                    <div className='text-center'>
                        <h4>{t('Шалгалтын дүн')}</h4>
                    </div>
                    <div >
                        <Table responsive color="primary" bordered>
                            <thead>
                                <tr>
                                    <th>Д/Д</th>
                                    <th>Оюутны код</th>
                                    <th>Оюутны нэр</th>
                                    <th>Авах оноо</th>
                                    <th>Авсан оноо</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    studentDatas && studentDatas?.length > 0
                                    ?
                                        studentDatas.map((data, idx) => {
                                            return (
                                                <tr key={idx}>
                                                    <th>{idx+1}</th>
                                                    <td>{data?.student_code}</td>
                                                    <td>{data?.student_name}</td>
                                                    <td>{data.take_score}</td>
                                                    <td>{data.score}</td>
                                                </tr>
                                            )
                                        })
                                    :
                                        <tr>
                                            <th colSpan={5} className="text-center">Мэдээлэл олдсонгүй</th>
                                        </tr>
                                }
                            </tbody>
                        </Table>
                    </div>
                </ModalBody>
            </Modal>
        </Fragment>
	);
};
export default DownloadScore;
