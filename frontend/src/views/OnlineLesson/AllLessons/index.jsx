// import { PieChart } from "@mui/x-charts/PieChart";
import { Fragment, useState } from "react";
import { GoDotFill } from "react-icons/go";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";

import { Card, CardBody, CardHeader, Col, Row, Button, Modal, UncontrolledTooltip, Badge, Alert } from "reactstrap";
import useModal from '@hooks/useModal';
import useApi from "@src/utility/hooks/useApi";
import useLoader from '@hooks/useLoader'

import AddLessonForm from "./AddLessonForm";
import { ChevronsRight, HelpCircle, X } from 'react-feather'

function AllLessons({ lessons, getLessons }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(12);

    const [modal, setModal] = useState(false);
  	const toggle = () => setModal(!modal);

    // console.log(lessons)

    const { showWarning } = useModal();

    //API
    const deleteLessonAPI = useApi().online_lesson
    const { fetchData } = useLoader({})

    const totalPages = Math.ceil(lessons?.length / rowsPerPage);

    function handlePagination({ selected }) {
        setCurrentPage(selected + 1);
    }

    const displayedLessons = lessons?.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    async function deleteLesson(id){
        const {success, error} = await fetchData(deleteLessonAPI.delete_lesson(id))
        if (success) {
            getLessons()
        }
    }

    return (
        <Fragment>
            <Card>
                <CardHeader>
                    <h3>Цахим хичээлүүд</h3>
                    <Row>
                        <Col
                            className="d-flex align-items-center mobile-datatable-search mt-1"
                            md={12}
                            sm={12}
                        >
                            <div>
                                <Button color="primary" onClick={toggle}>
                                    Хичээл үүсгэх
                                </Button>
                                <Modal
                                    className="modal-dialog-centered modal-xl"
                                    contentClassName="pt-0"
                                    backdrop="static"
                                    isOpen={modal}
                                    toggle={toggle}
                                >
                                        <AddLessonForm toggle={toggle} open={modal} getLessons={getLessons}/>
                                </Modal>
                            </div>
                        </Col>
                    </Row>
                </CardHeader>
                <CardBody className="">
                    <Row>
                        {displayedLessons.map((lesson, index) => (
                            <Col key={index} xl={3} md={6} className="mb-1">
                                <div className="border rounded-lg shadow">
                                    <CardBody>
                                        <div className="d-flex justify-content-between mb-1">
                                            <h6 className="">{lesson?.lesson_name}</h6>
                                            <div>
                                                <X
                                                    color='red'
                                                    size={15}
                                                    id={`delete${index}`}
                                                    onClick={() => showWarning({
                                                        header: {
                                                            title: 'Устгах үйлдэл',
                                                        },
                                                        question: 'Та энэхүү хичээлийг устгахдаа итгэлтэй байна уу?',
                                                        onClick: () => deleteLesson(lesson.id),
                                                        btnText: 'Устгах',
                                                    })}
                                                />
                                                <UncontrolledTooltip placement='top' target={`delete${index}`} >{'Устгах'}</UncontrolledTooltip>
                                            </div>
                                        </div>
                                        <h6 className="mb-1">{'Багш:'}<span className="ms-1">{lesson?.teacher?.full_name}</span></h6>
                                        <h6 className="mb-1">{'Оюутны тоо:'}<span className="ms-1">{lesson?.student_count}</span></h6>
                                        <div>
                                            <div className="flex flex-md-row flex-column">
                                                <div>
                                                    <div className="d-flex flex-column flex-md-row">
                                                        <Row className="w-100">
                                                            <Col xs={9}>
                                                                {" "}
                                                                <GoDotFill style={{ color: "#14B8A6", fontSize: "2rem" }} />
                                                                Хичээл
                                                            </Col>
                                                            <Col xs={3}>{lesson?.total_homeworks_and_exams.week_count}</Col>
                                                        </Row>
                                                    </div>
                                                    <div className="d-flex flex-column flex-md-row">
                                                        <Row className="w-100">
                                                            <Col xs={9}>
                                                                {" "}
                                                                <GoDotFill style={{ color: "#3B82F6", fontSize: "2rem" }} />
                                                                Даалгавар
                                                            </Col>
                                                            <Col xs={3}>{lesson?.total_homeworks_and_exams.homework_count}</Col>
                                                        </Row>
                                                    </div>
                                                    <div className="d-flex flex-column flex-md-row">
                                                        <Row className="w-100">
                                                            <Col xs={9}>
                                                                {" "}
                                                                <GoDotFill style={{ color: "#6366F1", fontSize: "2rem" }} />
                                                                Шалгалт
                                                            </Col>
                                                            <Col xs={3}>{lesson?.total_homeworks_and_exams.challenge_count}</Col>
                                                        </Row>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-end mt-25">
                                            <Link to={`/online_lesson/${lesson.id}`}>
                                                дэлгэрэнгүй <ChevronsRight size={15}/>
                                            </Link>
                                        </div>
                                    </CardBody>
                                </div>
                            </Col>
                        ))}
                    </Row>
                    <Row className="d-flex justify-content-end mx-0 my-0" sm={12}>
                        <Col
                            className="d-flex align-items-center justify-content-end"
                            md={6}
                            sm={12}
                        >
                            <ReactPaginate
                                previousLabel={"←"}
                                nextLabel={"→"}
                                pageCount={totalPages}
                                onPageChange={handlePagination}
                                containerClassName={"pagination"}
                                activeClassName={"active"}
                                pageClassName={"page-item"}
                                pageLinkClassName={"page-link"}
                                previousClassName={"page-item"}
                                previousLinkClassName={"page-link"}
                                nextClassName={"page-item"}
                                nextLinkClassName={"page-link"}
                                breakClassName={"page-item"}
                                breakLinkClassName={"page-link"}
                                marginPagesDisplayed={2}
                                pageRangeDisplayed={5}
                            />
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            {/* <Card className={'mt-2'}>
                <CardHeader><div className="d-flex "><HelpCircle size={20}/><h5 className="ms-25 fw-bolder">Тусламж хэсэг</h5></div></CardHeader>
                <CardBody>
                    <Alert color='primary' className={'p-1 тме1'}>
                        Цахим хичээлийн заавар мэдээлэл хүргэж байна.
                    </Alert>
                    <iframe src="assets/Цахим хичээд.pdf" width="100%" height="640" allowfullscreen frameborder="0"></iframe>
                </CardBody>
            </Card> */}
        </Fragment>
    );
}

export default AllLessons;
