import React, { Fragment, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { t } from "i18next";
import {
  Row,
  Col,
  Button,
  Input,
  Card,
  CardBody,
  Spinner,
  ListGroup,
  ListGroupItem,
  CardHeader,
  Badge,
  UncontrolledTooltip,
} from "reactstrap";
import {
  Search,
  ChevronDown,
  Plus,
  X,
  File,
  Camera,
  Film,
  Headphones,
} from "react-feather";
import Addmodal from "../Add";
import DataTable from "react-data-table-component";
import { getPagination, ReactSelectStyles } from "@utils";
import { CardFooter } from "react-bootstrap";
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

function DetailPage() {
  const { index } = useParams();

  //Modal
  const [modal, setModal] = useState(false);

  //Add modal
  const handleModal = () => {
    setModal(!modal);
  };

  const [datas, setDatas] = useState([]);
  const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });
  const materialApi = useApi().material
  const [selectedContent, setSelectedContent] = useState("");
  const [file, setFile] = useState(null);

  async function getDatas(){
    const {success,data} = await fetchData(materialApi.getOne(index));
    if(success){
      setDatas(data)
      console.log(data)
    }
  }

  useEffect(() => {
    getDatas();
  }, []);

  const handleFileChange = (event) => {
    setFile(URL.createObjectURL(event.target.files[0]));
  };

  const renderTable = (content) => {
    switch (content) {
      case "File":
        return (
          <div
            className="react-dataTable react-dataTable-selectable-rows"
            id="datatableLeftTwoRightOne"
          >
            <DataTable
              noHeader
              pagination
              paginationServer
              className="react-dataTable"
              // progressPending={isTableLoading}
              progressComponent={
                <div className="my-2 d-flex align-items-center justify-content-center">
                  <Spinner className="me-1" color="" size="sm" />
                  <h5>Түр хүлээнэ үү...</h5>
                </div>
              }
              noDataComponent={
                <div className="my-2">
                  <h5>{"Өгөгдөл байхгүй байна"}</h5>
                </div>
              }
              // onSort={handleSort}
              sortIcon={<ChevronDown size={10} />}
              // columns={getColumns(currentPage, rowsPerPage, total_count, editModal, handleDelete, user)}
              // paginationPerPage={rowsPerPage}
              // paginationDefaultPage={currentPage}
              // paginationComponent={getPagination(handlePagination, currentPage, rowsPerPage, total_count)}
              // data={datas}
              fixedHeader
              fixedHeaderScrollHeight="62vh"
            />
          </div>
        );
      case "Photo":
        return (
          <ListGroup>
            <ListGroupItem className="d-flex flex-row justify-content-between align-items-center">
              <div className="d-flex gap-2 mt-1">
                <p>PhotoName</p>
                <p>PhotoURL</p>
              </div>
              <div className="d-flex align-items-center gap-2">
                <p className="mt-1">2024-06-01</p>
                <>
                  <a
                    role="button"
                    onClick={() =>
                      showWarning({
                        header: {
                          title: `${t("Хичээлийн материал устгах")}`,
                        },
                        question: `Та "" кодтой хичээлийн материалыг устгахдаа итгэлтэй байна уу?`,
                        // onClick: () => handleDelete(row.id),
                        btnText: "Устгах",
                      })
                    }
                    id={`complaintListDatatableCancel`}
                  >
                    <Badge color="light-danger" pill>
                      <X width={"100px"} />
                    </Badge>
                  </a>
                  <UncontrolledTooltip placement="top">
                    Устгах
                  </UncontrolledTooltip>
                </>
              </div>
            </ListGroupItem>

            <ListGroupItem className="d-flex flex-row justify-content-between align-items-center ">
              <div>Photo1</div>
              <div className="d-flex align-items-center gap-2">
                <p className="mt-1">2024-06-01</p>
                <>
                  <a
                    role="button"
                    onClick={() =>
                      showWarning({
                        header: {
                          title: `${t("Хичээлийн материал устгах")}`,
                        },
                        question: `Та "" кодтой хичээлийн материалыг устгахдаа итгэлтэй байна уу?`,
                        // onClick: () => handleDelete(row.id),
                        btnText: "Устгах",
                      })
                    }
                    id={`complaintListDatatableCancel`}
                  >
                    <Badge color="light-danger" pill>
                      <X width={"100px"} />
                    </Badge>
                  </a>
                  <UncontrolledTooltip
                    placement="top"
                    target={`complaintListDatatableCancel`}
                  >
                    Устгах
                  </UncontrolledTooltip>
                </>
              </div>
            </ListGroupItem>
            <ListGroupItem className="d-flex flex-row justify-content-between align-items-center ">
              <div>Photo1</div>
              <div className="d-flex align-items-center gap-2">
                <p className="mt-1">2024-06-01</p>
                <>
                  <a
                    role="button"
                    onClick={() =>
                      showWarning({
                        header: {
                          title: `${t("Хичээлийн материал устгах")}`,
                        },
                        question: `Та "" кодтой хичээлийн материалыг устгахдаа итгэлтэй байна уу?`,
                        // onClick: () => handleDelete(row.id),
                        btnText: "Устгах",
                      })
                    }
                    id={`complaintListDatatableCancel`}
                  >
                    <Badge color="light-danger" pill>
                      <X width={"100px"} />
                    </Badge>
                  </a>
                  <UncontrolledTooltip
                    placement="top"
                    target={`complaintListDatatableCancel`}
                  >
                    Устгах
                  </UncontrolledTooltip>
                </>
              </div>
            </ListGroupItem>
          </ListGroup>
        );
      case "Video":
        return (
          <ListGroup>
            <ListGroupItem className="d-flex flex-row justify-content-between px-5">
              <div>Video1</div>
              <div>2024-06-01</div>
            </ListGroupItem>
            <ListGroupItem className="d-flex flex-row justify-content-between px-5">
              <div>Video2</div>
              <div>2024-06-01</div>
            </ListGroupItem>
            <ListGroupItem className="d-flex flex-row justify-content-between px-5">
              <div>Video3</div>
              <div>2024-06-01</div>
            </ListGroupItem>
          </ListGroup>
        );
      case "Audio":
        return (
          <ListGroup>
            <ListGroupItem className="d-flex flex-row justify-content-between px-5">
              <div>Audio1</div>
              <div>2024-06-01</div>
            </ListGroupItem>
            <ListGroupItem className="d-flex flex-row justify-content-between px-5">
              <div>Audio2</div>
              <div>2024-06-01</div>
            </ListGroupItem>
            <ListGroupItem className="d-flex flex-row justify-content-between px-5">
              <div>Audio3</div>
              <div>2024-06-01</div>
            </ListGroupItem>
          </ListGroup>
        );
      default:
        return null;
    }
  };
  return (
    <Fragment>
      {Loader && isLoading}
      <Card>
        <CardHeader>
          <div className="d-flex gap-1 align-items-center"><h5>{}</h5><h4>{}</h4></div>
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
        <CardBody>
          <Row>
            <Col xl={3} md={6} className="mb-4">
              <Card className="bg-white border rounded-lg shadow-sm">
                <CardBody>
                  <div className="d-flex justify-content-between">
                    <div
                      className="d-flex gap-1"
                    >
                      <h4>Files</h4>
                    </div>
                    <Button
                      size="sm"
                      color="primary"
                      onClick={() => handleModal()}
                      className=""
                    >
                      <Plus size={15} />
                    </Button>
                  </div>
                  <div className="mt-1 pt-25">
                    <div className="d-flex justify-content-between role-heading">
                      <small className="text-primary">Нийт тоо : 50</small>
                      <br />
                      <small className="text-primary">
                        Нийт хэмжээ : 500MB
                      </small>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <div className="d-flex flex-row gap-1 cursor-pointer">
                        <File width={"25px"} />
                      </div>
                      <small className="text-primary cursor-pointer fw-bold fst-italic"  onClick={() =>
                        setSelectedContent(
                          selectedContent === "File" ? "" : "File"
                        )
                      }>
                        Дэлгэрэнгүй...
                      </small>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl={3} md={6} className="mb-4">
              <Card className="bg-white border rounded-lg shadow-sm">
                <CardBody>
                  <div className="d-flex justify-content-between">
                    <div
                      className="d-flex gap-1 cursor-pointer"
                    >
                      <h4>Photo</h4>
                    </div>
                    <Button
                      size="sm"
                      color="primary"
                      onClick={() => handleModal()}
                      className=""
                    >
                      <Plus size={15} />
                    </Button>
                  </div>
                  <div className="mt-1 pt-25">
                    <div className="d-flex justify-content-between role-heading">
                      <small className="text-primary">Нийт тоо : 50</small>
                      <br />
                      <small className="text-primary">
                        Нийт хэмжээ : 500MB
                      </small>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <div className="d-flex flex-row gap-1 cursor-pointer">
                        <Camera width={"25px"} />
                      </div>
                      <small className="text-primary cursor-pointer fw-bold fst-italic" onClick={() =>
                        setSelectedContent(
                          selectedContent === "Photo" ? "" : "Photo"
                        )
                      }>
                        Дэлгэрэнгүй...
                      </small>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl={3} md={6} className="mb-4">
              <Card className="bg-white border rounded-lg shadow-sm">
                <CardBody>
                  <div className="d-flex justify-content-between">
                    <div
                      className="d-flex gap-1 cursor-pointer"
                    >
                      <h4>Video</h4>
                    </div>
                    <Button
                      size="sm"
                      color="primary"
                      onClick={() => handleModal()}
                      className=""
                    >
                      <Plus size={15} />
                    </Button>
                  </div>
                  <div className="mt-1 pt-25">
                    <div className="d-flex justify-content-between role-heading">
                      <small className="text-primary">Нийт тоо : 50</small>
                      <br />
                      <small className="text-primary">
                        Нийт хэмжээ : 500MB
                      </small>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <div className="d-flex flex-row gap-1 cursor-pointer">
                        <Film width={"25px"} />
                      </div>
                      <small className="text-primary cursor-pointer fw-bold fst-italic"  onClick={() =>
                        setSelectedContent(
                          selectedContent === "Video" ? "" : "Video"
                        )
                      }>
                        Дэлгэрэнгүй...
                      </small>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl={3} md={6} className="mb-4">
              <Card className="bg-white border rounded-lg shadow-sm">
                <CardBody>
                  <div className="d-flex justify-content-between">
                    <div
                      className="d-flex gap-1 cursor-pointer"
                    >
                      <h4>Audio</h4>
                    </div>
                    <Button
                      size="sm"
                      color="primary"
                      onClick={() => handleModal()}
                      className=""
                    >
                      <Plus size={15} />
                    </Button>
                  </div>
                  <div className="mt-1 pt-25">
                    <div className="d-flex justify-content-between role-heading">
                      <small className="text-primary">Нийт тоо : 50</small>
                      <br />
                      <small className="text-primary">
                        Нийт хэмжээ : 500MB
                      </small>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between mt-1 px-2">
                    <div className="cursor-pointer">
                      <Headphones width={"25px"} />
                    </div>
                    <small className="text-primary cursor-pointer fw-bold fst-italic"  onClick={() =>
                        setSelectedContent(
                          selectedContent === "Audio" ? "" : "Audio"
                        )
                      }>
                      Дэлгэрэнгүй...
                    </small>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          {renderTable(selectedContent)}
        </CardBody>
        {modal && <Addmodal open={modal} handleModal={handleModal} />}
      </Card>
    </Fragment>
  );
}
export default DetailPage;
