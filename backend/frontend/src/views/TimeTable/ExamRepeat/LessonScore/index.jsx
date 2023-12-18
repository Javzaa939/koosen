import React from 'react';

import { Modal, ModalBody, ModalHeader, Table, Row, Popover, PopoverHeader, PopoverBody, Button, Tooltip } from 'reactstrap';

import { X } from 'react-feather'

import { useTranslation } from 'react-i18next';

import css from '@mstyle/style.module.css'

const LessonScoreModal = ({ open, handleScoreModal, datas}) => {

    const { t } = useTranslation()

    return (
        <Popover placement="left" isOpen={open} target="Popover1" toggle={handleScoreModal}>
            <PopoverHeader>Дүнгийн жагсаалт</PopoverHeader>
            <PopoverBody>
                {
                    datas && datas.length > 0
                    ?
                        <div className={`${css.customSize}`}>
                            <Table size='sm' responsive>
                                <thead>
                                    <tr>
                                        <th>{t('Багшийн оноо')}</th>
                                        <th>{t('Шалгалтын оноо')}</th>
                                        <th>{t('Үсгэн үнэлгээ')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        datas && datas.length > 0 &&
                                        datas.map((data, idx) => {
                                            return (
                                                <tr key={idx}>
                                                    <td>{data.teach_score}</td>
                                                    <td>{data.exam_score}</td>
                                                    <td>{data.assessment}</td>
                                                </tr>
                                            )
                                        })
                                    }

                                </tbody>
                            </Table>
                        </div>
                    :
                        <a>Дүнгийн мэдээлэл олдсонгүй</a>
                }
            </PopoverBody>
        </Popover>
    );
};

export default LessonScoreModal;
