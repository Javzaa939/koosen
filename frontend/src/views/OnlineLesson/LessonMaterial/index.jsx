import React, { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Input, Button, Col, Card, CardBody, CardHeader } from "reactstrap";
import { Search, File, Camera, Film, Headphones, User } from "react-feather";
import ReactPaginate from "react-paginate";
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

function LessonMaterial() {
  const [datas, setDatas] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });
  const materialApi = useApi().material;

  async function getDatas() {
    const { success, data} = await fetchData(materialApi.get());
    if (success) {
      setDatas(data);
      setTotalCount(data.length);
    }
  }

  useEffect(() => {
    getDatas();
  }, [currentPage, rowsPerPage]);

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  function handlePagination({ selected }) {
    setCurrentPage(selected + 1);
  }

  function handlePerPage(e) {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  }

  const displayedLessons = datas.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <Fragment>
      {Loader && isLoading}
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
                placeholder="Хайх"
              />
              <Button size="sm" className="ms-50 mb-50" color="primary">
                <Search size={15} />
              </Button>
            </Col>
          </Row>
        </CardHeader>
        <CardBody className="">
          <Row>
            {displayedLessons.map((lesson) => (
              <Col key={lesson.id} xl={3} md={6} className="mb-1">
                <Link to={`/online_lesson/detail/${lesson.user}`}>
                  <Card className="lesson-card bg-white border rounded-lg shadow-sm">
                    <CardBody>
                      <h5 className="fw-bold">{lesson.school_name}</h5>
                      <div className="mt-1">
                        <div className="role-heading">
                          <div className="d-flex flex-row justify-content-between">
                            <h4 className="fw-bolder mb-1">{lesson.full_name}</h4>
                          </div>
                          <small>Details</small>
                          <br />
                          <div className="d-flex justify-content-between">
                            <div className="d-flex align-items-center">
                              <small className="fw-bolder text-primary">
                              </small>
                              <small className="fw-bold">
                              {lesson.file_count.File}-<File width={"15px"} />
                              </small>
                            </div>
                            <div className="d-flex align-items-center">
                              <small className="fw-bolder text-primary">
                              </small>
                              <small className="fw-bold">
                              {lesson.file_count.Picture}-<Camera width={"15px"} />
                              </small>
                            </div>
                            <div className="d-flex align-items-center">
                              <small className="fw-bolder text-primary">
                              </small>
                              <small className="fw-bold">
                              {lesson.file_count.Video}-<Film width={"15px"} />
                              </small>
                            </div>
                            <div className="d-flex align-items-center">
                              <small className="fw-bolder text-primary">
                              </small>
                              <small className="fw-bold">
                              {lesson.file_count.Audio}-<Headphones width={"15px"} />
                              </small>
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
