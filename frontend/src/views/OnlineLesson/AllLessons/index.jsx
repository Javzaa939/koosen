import { PieChart } from "@mui/x-charts/PieChart";
import { Fragment, useState } from "react";
import { GoDotFill } from "react-icons/go";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import AddLesson from "../Add/index";
import useApi from "@src/utility/hooks/useApi";

function AllLessons({ lessons }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  //API
  const deleteLessonAPI = useApi().online_lesson

  const totalPages = Math.ceil(lessons.length / rowsPerPage);

  function handlePagination({ selected }) {
    setCurrentPage(selected + 1);
  }

  const displayedLessons = lessons.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  async function deleteLesson(id){
    try{
        const {success, error} = await deleteLessonAPI.delete_lesson(id)
        console.log(success)
        if(error){
            console.log(error)
        }
    }catch(err){
        console.log(err)
    }
  }
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
                        <button onClick={()=>deleteLesson(lesson?.id)}>delete</button>
                            <Card className="lesson-card border rounded-lg shadow-sm">
                                <CardBody>
                                    <div className="d-flex justify-content-between">
                                        <h4 className="role-heading">{lesson?.name}</h4>
                                        Оюутны тоо: <span className="text-primary">{"??"}</span>
                                    </div>
                                    <div>
                                        <div className="flex flex-md-row flex-column">
                                        <Stats lesson={lesson} />
                                        <div>
                                            <div className="d-flex flex-column flex-md-row">
                                                <Row className="w-100">
                                                    <Col xs={6}>
                                                        {" "}
                                                        <GoDotFill />
                                                        Хичээл
                                                    </Col>
                                                    <Col xs={3}>15/30</Col>
                                                    <Col xs={3}>28.5%</Col>
                                                </Row>
                                            </div>
                                            <div className="mt-2">
                                                <GoDotFill />
                                                <span>даалгавар</span>
                                            </div>
                                            <div className="mt-2">
                                                <GoDotFill />
                                            <span>Шалгалт</span>
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

function Stats({ lesson }) {
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
    <div style={{ position: "relative", width: "200px", height: "200px" }}>
        <PieChart colors={palette} series={seriess} {...pieParams} />
        <span
            style={{
            position: "absolute",
            top: "43%",
            left: "52%",
            transform: "translate(-50%, -50%)",
            padding: "4px 8px",
            borderRadius: "50%",
            fontWeight: "bold",
            }}
        >
        {lesson?.total_score + "/" + lesson?.total_score}
        </span>
    </div>
  );
}
