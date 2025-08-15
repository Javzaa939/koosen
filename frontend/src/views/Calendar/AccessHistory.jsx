import { ListItem } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import {
    Col,
    ListGroup,
    ListGroupItem,
    Modal,
    ModalBody,
    ModalHeader,
} from 'reactstrap';

import useApi from '@src/utility/hooks/useApi';
import useLoader from '@src/utility/hooks/useLoader';
import { useTranslation } from 'react-i18next';
import ModalByStudent from './components/ModalByStudent';
import { CogIcon, EllipsisVerticalIcon } from 'lucide-react';

const AccessHistory = (props) => {
    const { t } = useTranslation();
    const [accessHistories, setAccessHistories] = useState([]);
    const [showAll, setShowAll] = useState(false);

    const { fetchData, isLoading, Loader } = useLoader({});
    const accessHistoryAPI = useApi().calendar;

    async function getAccess() {
        const { success, data } = await fetchData(accessHistoryAPI.getAccessHistory());
        if (success) {
            setAccessHistories(data);
        }
    }

    useEffect(() => {
        getAccess();
    }, []);

    const handleSeeMore = () => {
        setShowAll(true);
    };
    const handleClose = () => {
        setShowAll(false);
    };

    const Item = (props) => {
        const name = props.event.device_name;
        const date = props.event.in_time.slice(0, 10);
        const time = props.event.in_time.slice(11, 19);
        return (
            <ListGroupItem
                key={props.index}
                style={{
                    fontSize: '11px',
                    height: '65px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                icon is here <h6 className="align-middle">{name}</h6>
                    <span className="align-middle">
                        {date} {time}
                    </span>
                    <div className="align-middle">{props.event.ip}</div>
                </Col>
            </ListGroupItem>
        );
    };

    // #region access history by student
    const [showAllModalByStudent, setShowAllModalByStudent] = useState(false);

    const handleSeeMoreModalByStudent = () => {
        setShowAllModalByStudent((current) => !current);
    };
    // #endregion

    return (
        <Card>
            <CardHeader>
                <CardTitle tag={'h5'}>{t('Xандалтийн түүх')}</CardTitle>
            </CardHeader>
            <ListGroup>
                {(showAll ? accessHistories.slice(0, 5) : accessHistories.slice(0, 5)).map(
                    (event, index) => (
                        <Item key={index} event={event} />
                    ),
                )}
                {accessHistories.length > 5 && !showAll && (
                    <ListItem onClick={handleSeeMore} style={{ cursor: 'pointer' }}>
                        <EllipsisVerticalIcon />
                        <span className="align-middle ms-50">{t('Дэлгэрэнгүй үзэх')}</span>
                    </ListItem>
                )}
                <ListItem onClick={handleSeeMoreModalByStudent} style={{ cursor: 'pointer' }}>
                        <EllipsisVerticalIcon />
                    <span className="align-middle ms-50">{t('Оюутнаар')}</span>
                </ListItem>
            </ListGroup>
            <Modal
                isOpen={showAll}
                toggle={handleClose}
                style={{
                    height: '50vh',
                    content: {
                        maxHeight: '50vh',
                        overflow: 'auto',
                    },
                }}
            >
                <ModalHeader style={{ display: 'flex', justifyContent: 'space-between' }}>
            
                    <span
                        onClick={handleClose}
                        style={{ position: 'fixed', zIndex: 1, cursor: 'pointer' }}
                    >
                        <CogIcon />
                    </span>
                </ModalHeader>
                <ModalBody style={{ marginTop: '10px' }}>
                    <ListGroup>
                        {accessHistories.map((event, index) => (
                            <Item key={index} event={event} />
                        ))}
                    </ListGroup>
                </ModalBody>
            </Modal>
            {showAllModalByStudent && (
                <ModalByStudent
                    isOpen={showAllModalByStudent}
                    toggle={handleSeeMoreModalByStudent}
                />
            )}
        </Card>
    );
};
export default AccessHistory;
