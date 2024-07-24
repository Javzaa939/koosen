import { PieChart } from "@mui/x-charts/PieChart";
import { Fragment, useState } from "react";
import { GoDotFill } from "react-icons/go";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import AddLesson from "../Add/index";

function AllLessons({ lessons }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const totalPages = Math.ceil(lessons.length / rowsPerPage);

  function handlePagination({ selected }) {
    setCurrentPage(selected + 1);
  }

  const displayedLessons = lessons.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  console.log(lessons);
  return (
    <Fragment>
      <Card>
        <CardHeader>
          <h3>Хичээлүүд</h3>
          <Row>
            <Col
              className="d-flex align-items-center mobile-datatable-search mt-1"
              md={12}
              sm={12}
            >
              <AddLesson />
            </Col>
          </Row>
        </CardHeader>
        <CardBody className="">
          <Row>
            {displayedLessons.map((lesson, index) => (
              <Col key={index} xl={3} md={6} className="mb-1">
                <Link to={`/online_lesson/${lesson.id}`}>
                  <Card className="lesson-card border rounded-lg shadow-sm">
                    <CardBody>
                      <div className="d-flex justify-content-between">
                        <h4 className="role-heading">{lesson?.name}</h4>
                          Оюутны тоо:{" "}
                          <span className="text-primary">{"??"}</span>
                      </div>
                      <div className="mt-1 d-flex flex-col justify-content-between align-items-center">
                          <Stats />
                        <div>
                         <div className="d-flex flex-row">
                           <div> <GoDotFill />Хичээл</div>
                           <div> 15/30</div>
                           <div>28.5%</div>
                         </div>
                         <div><GoDotFill />даалгавар</div>
                         <div> <GoDotFill />Шалгалт</div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
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
    </Fragment>
  );
}

export default AllLessons;

function Stats() {
  const pieParams = { height: 180, margin: { right: 0 } };
  const palette = ["#14B8A6", "#3B82F6", "#6366F1"];
  const seriess = [
    {
      data: [{ value: 10 }, { value: 15 }, { value: 20 }],
      innerRadius: 60,
      outerRadius: 80,
      paddingAngle: 2,
      cornerRadius: 5,
      startAngle: -50,
      endAngle: 250,
      cx: 100,
      cy: 80,
    },
  ];
  return (
    <>
      <PieChart colors={palette} series={seriess} {...pieParams} />
    </>
  );
}