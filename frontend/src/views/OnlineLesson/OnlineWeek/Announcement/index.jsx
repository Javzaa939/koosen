import { useEffect, useState } from "react";
import { Button, Col, Modal, ModalHeader, Row } from "reactstrap";
import AddAnnouncementModal from "./AddAnnouncement";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";

import useApi from "@hooks/useApi";
import useLoader from '@hooks/useLoader';
import useModal from '@hooks/useModal';
import { useParams } from "react-router-dom";
import { Clock } from "react-feather";
import moment from "moment";


function Announcement({ lesson }) {
    const { index } = useParams()

    const [modal, setModal] = useState(false);
	const [editData, setEditData] = useState([]);
    const [data, setData] = useState([]);
    const announcementAPI = useApi().announcement;

    const { fetchData } = useLoader({})

    const { showWarning } = useModal();

    async function getAnnouncements() {
        const { success, data } = await fetchData(announcementAPI.get(index));
        if (success) {
            setData(data);
        }
    }

    const handleDelete = async(id) => {
        const { success, data } = await fetchData(announcementAPI.delete(id));
        if (success) {
            getAnnouncements()
        }
    }

    useEffect(() => {
        getAnnouncements();
    }, []);

    // const handleEdit = (item) => {
	// 	getAnnouncements();
    //     setEditData(item);
    // };

    const maxLength = 100;

	const toggle = () => {
        if (modal) {
            setEditData(null);
        }
        setModal(!modal);
    };

    // useEffect(() => {
    //     if (editData && Object.keys(editData).length > 0) {
    //         setModal(true);
    //     }
    // }, [editData]);

    return (
        <div>
            <div className="d-flex justify-content-end">
                <Button color="primary m-1" onClick={toggle}>
                    Зарлал оруулах
                </Button>
                <Modal
                    className="modal-dialog-centered modal-lg"
                    contentClassName="pt-0"
                    backdrop="static"
                    isOpen={modal}
                    toggle={toggle}
                    >
                    <ModalHeader toggle={toggle}>Зарлал оруулах</ModalHeader>
                    <AddAnnouncementModal toggle={toggle} lesson={lesson} editData={editData} refreshDatas={getAnnouncements}/>
                </Modal>
            </div>
            <div className="m-1">
                {data && data.length > 0 ? (
                    data.map((item, index) => (
                        <Accordion key={item.id}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel3-content"
                                id="panel3-header"
                            >
                                <Row>
                                    <Col>
                                        <Row>
                                            <Col>
                                                {index + 1}.  {`${item?.title}`}
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <Clock size={10} />
                                                <small className='ms-1' >
                                                    {moment(item?.created_at).format('YYYY-MM-DD HH:mm:ss')} - {item?.full_name}
                                                </small>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </AccordionSummary>
                            <AccordionDetails style={{ backgroundColor: "#E5E5E5" }}>
                                <div className="text-end">
                                    <Button
                                        size='sm'
                                        color='danger'
                                        onClick={() => showWarning({
                                            header: {
                                                title: 'Устгах үйлдэл',
                                            },
                                            question: 'Та энэхүү зарлалыг устгахдаа итгэлтэй байна уу?',
                                            onClick: () => handleDelete(item.id),
                                            btnText: 'Устгах',
                                        })}
                                        className="ms-1"
                                    >
                                        Устгах
                                    </Button>
                                </div>
                                <div className="d-flex">
                                    <div className={`width-auto`} id="announcements" dangerouslySetInnerHTML={{ __html: item?.body }} ></div>
                                </div>
                            </AccordionDetails>
                        </Accordion>
                    ))
                ) : (
                    <div>Зарлал байхгүй байна</div>
                )}
            </div>
        </div>
    );
}

export default Announcement;
