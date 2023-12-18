import React, { useState } from 'react';

// ** Reactstrap Imports
import {
    Row,
    Form,
    Modal,
    ModalHeader,
    ModalBody,
    Table
} from 'reactstrap'

import { Download } from 'react-feather';

import { useTranslation } from 'react-i18next'

const Files = ({ open, handleModal, datas }) => {

    // Орчуулга хийхэд ашиглах хувьсагч
    const { t } = useTranslation()

    const [all_files, setAllFiles] = useState(datas?.files || [])

    return (
        <Modal isOpen={open} toggle={handleModal} className="modal-dialog-centered modal-lg" onClosed={handleModal}>
            <ModalHeader className='bg-transparent pb-0' toggle={handleModal} ></ModalHeader>
            <ModalBody className="px-sm-3 pt-30 pb-3">
                <div className='text-center'>
                    <h4>{t('Хавсаргасан файлын жагсаалт')}</h4>
                </div>
                <Row tag={Form} className="gy-1">
                    <Table size='sm' bordered responsive>
                        <thead>
                            <tr>
                                <th>Тайлбар</th>
                                <th>Файл</th>
                                <th className='text-center'>Татах</th>
                            </tr>
                        </thead>
                        <tbody >
                            {
                                all_files && all_files.length > 0 &&
                                all_files.map((file, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{file?.description || t('Хоосон байна')}</td>
                                            <td>
                                                {file?.file.toString().split("/").pop()}
                                            </td>
                                            <td className='text-center'>
                                                <a href={file?.file} className="me-2">
                                                    <Download type="button" color='#1a75ff' width={'15px'}/>
                                                </a>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </Table>
                </Row>
            </ModalBody>
        </Modal>
    );
};

export default Files;
