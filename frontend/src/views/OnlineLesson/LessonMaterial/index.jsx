import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import {
  Row,
  Input,
  Button,
  Col,
  Card,
  CardBody,
  CardHeader,
  Label,
} from "reactstrap";
import { Search , File,Camera,Film,Headphones} from "react-feather";
import ReactPaginate from "react-paginate";


function LessonMaterial() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const lessons = Array.from({ length: 100}, (_, index) => ({
    id: index,
    name: `Lesson ${index + 1}`,
    teacher: "Name of Teacher",
    details: "Details",
    files: 50,
    photos: 11,
    videos: 12,
    audios: 3,
  }));

  const totalPages = Math.ceil(lessons.length / rowsPerPage);

  function handlePagination({ selected }) {
    setCurrentPage(selected + 1);
  }

  function handlePerPage(e) {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  }

  const displayedLessons = lessons.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <Fragment>
      <Card>
        <CardHeader>
          <h3>Хичээлийн материал</h3>
          <Row>
            <Col
              className="d-flex align-items-center mobile-datatable-search mt-1"
              md={12}
              sm={12}
            >
              <Input
                className="dataTable-filter mb-50"
                type="text"
                bsSize="sm"
                id="search-input"
                placeholder={"Хайх"}
              />
              <Button size="sm" className="ms-50 mb-50" color="primary">
                <Search size={15} />
                <span className="align-middle ms-50"></span>
              </Button>
            </Col>
          </Row>
        </CardHeader>
        <CardBody className="">
          <Row>
            {displayedLessons.map((lesson, index) => (
              <Col key={lesson.id} xl={3} md={6} className="mb-1">
                <Link to={`/online_lesson/detail/${lesson.id}`}>
                  <Card className="lesson-card bg-white border rounded-lg shadow-sm">
                    <CardBody>
                      <h4 className="fw-bold">School</h4>
                      <div className="mt-1">
                        <div className="role-heading">
                          <h4 className="fw-bolder mb-1">{lesson.teacher}</h4>
                          <small>{lesson.details}</small>
                          <br />
                          <div className="d-flex justify-content-between">
                            <div className="d-flex align-items-center">
                              <small className="fw-bolder text-primary">{lesson.files} </small>
                              <small className="fw-bold">-<File width={'15px'}/></small>
                            </div>
                            <div className="d-flex align-items-center">
                              <small className="fw-bolder text-primary">{lesson.photos} </small>
                              <small className="fw-bold">-<Camera width={'15px'}/></small>
                            </div>
                            <div className="d-flex align-items-center">
                              <small className="fw-bolder text-primary">{lesson.videos} </small>
                              <small className="fw-bold">-<Film width={'15px'}/></small>
                            </div>
                            <div className="d-flex align-items-center">
                              <small className="fw-bolder text-primary">{lesson.audios} </small>
                              <small className="fw-bold">-<Headphones width={'15px'}/></small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
          <Row className="d-flex justify-content-end mx-0 my-0" sm={12}>
            <Col className="d-flex align-items-center justify-content-end" md={6} sm={12}>
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
    </Fragment>
  );
}

export default LessonMaterial;
