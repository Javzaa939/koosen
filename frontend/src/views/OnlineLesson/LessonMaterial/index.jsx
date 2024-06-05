import React, { Fragment, useState, useEffect, useContext } from "react";
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
  CardFooter,
} from "reactstrap";
import { Search, File, Camera, Film, Headphones } from "react-feather";
import ReactPaginate from "react-paginate";
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import Select from "react-select";
import classnames from "classnames";
import { useTranslation } from "react-i18next";
import { ReactSelectStyles } from "@utils";
import { useForm, Controller } from "react-hook-form";
import SchoolContext from "@context/SchoolContext";

function LessonMaterial() {
  const { t } = useTranslation();

  const { schoolName } = useContext(SchoolContext);
  // ** Hook
  const {
    control,
    formState: { errors },
  } = useForm({});

  // Хайлт хийхэд ажиллах хувьсагч
  const [searchValue, setSearchValue] = useState("");
  const [depId, setDepId] = useState("");
  const [depOption, setDepOption] = useState([]);
  const [datas, setDatas] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });

  //Api
  const materialApi = useApi().material;
  const departmentApi = useApi().hrms.department;

  /**Тэнхимын жагсаалт */
  async function getDepartment() {
    const { success, data } = await fetchData(departmentApi.get());
    if (success) {
      setDepOption(data);
      console.log(data);
    }
  }

  //Data avah
  async function getDatas() {
    const { success, data } = await fetchData(
      materialApi.get({
        full_name: searchValue,
        salbar: depId,
        school_name: schoolName,
      })
    );
    if (success) {
      let sortedData = [...data];
      if (depId) {
        sortedData = sortedData.filter((lesson) => lesson.salbar === depId);
      }
      if (schoolName) {
        sortedData = sortedData.filter(
          (lesson) => lesson.school_name === schoolName
        );
      }
      if(searchValue){
        sortedData = sortedData.filter(lesson=> lesson.full_name.toLowerCase().includes(searchValue.toLowerCase()))
      }
      setDatas(sortedData);
      setTotalCount(sortedData.length);
    }
  }

  useEffect(() => {
    getDepartment();
    getDatas();
  }, [currentPage, rowsPerPage, searchValue, depId, schoolName]);

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  function handlePagination({ selected }) {
    setCurrentPage(selected + 1);
  }

  function handlePerPage(e) {
    setRowsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  }

  // Хайлт хийх үед ажиллах хэсэг
  const handleFilter = (e) => {
    const value = e.target.value.trimStart();
    setSearchValue(value);
  };

  const displayedLessons = datas.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <Fragment>
      {Loader && isLoading}
      <Card>
        <CardHeader className="d-flex justify-content-between">
          <Col md={6} sm={12}>
            <h3>Багшийн мэдээлэл</h3>
          </Col>
          <Col md={6} sm={3} className="d-flex align-items-center gap-5 ">
            <Col className="d-flex flex-column">
              <Label className="form-label me-2" for="department">
                {t("Тэнхим")}
              </Label>
              <Controller
                control={control}
                defaultValue=""
                name="department"
                render={({ field: { value, onChange } }) => {
                  return (
                    <Select
                      name="department"
                      id="department"
                      classNamePrefix="select"
                      isClearable
                      className={classnames("react-select", "w-100")}
                      isLoading={isLoading}
                      placeholder={t("-- Сонгоно уу --")}
                      options={depOption || []}
                      value={depOption.find((c) => c.name === value)}
                      noOptionsMessage={() => t("Хоосон байна.")}
                      onChange={(val) => {
                        onChange(val?.name || "");
                        setDepId(val?.name || "");
                      }}
                      styles={ReactSelectStyles}
                      getOptionValue={(option) => option.id}
                      getOptionLabel={(option) => option.name}
                    />
                  );
                }}
              />
            </Col>
            <Col md={4} sm={12} className="d-flex mt-2">
              <Input
                className="dataTable-filter mb-50"
                type="text"
                bsSize="sm"
                id="search-input"
                placeholder={t("Хайх")}
                value={searchValue}
                onChange={handleFilter}
              />
              <Button
                size="sm"
                className="ms-50 mb-50"
                color="primary"
                onClick={getDatas}
              >
                <Search size={15} />
              </Button>
            </Col>
          </Col>
        </CardHeader>

        <CardBody>
          <Row>
            {displayedLessons.map((lesson) => (
              <Col key={lesson.id} xl={3} md={6} className="mb-1">
                <Link to={`/online_lesson/detail/${lesson.user}`}>
                  <Card className="lesson-card bg-white border rounded-lg shadow-sm">
                    <CardBody>
                      <h5 className="fw-bold">{lesson.school_name}</h5>
                      <small className="d-flex flex-nowrap text-truncate">
                        {lesson.salbar}
                      </small>
                      <div className="mt-1">
                        <div className="role-heading">
                          <div className="d-flex flex-row justify-content-between">
                            <h4 className="fw-bolder mb-1">
                              {lesson.full_name}
                            </h4>
                          </div>
                          <CardFooter className="p-0">
                            <small>Тоо хэмжээ</small>
                            <br />
                            <div className="d-flex justify-content-between">
                              <div className="d-flex align-items-center">
                                <small className="fw-bold d-flex align-items-center">
                                  <File
                                    width={"15px"}
                                    className="text-primary"
                                  />
                                  {lesson.file.find(
                                    (file) => file.material_type === 1
                                  ) && (
                                    <span>
                                      -{" "}
                                      {
                                        lesson.file.find(
                                          (file) => file.material_type === 1
                                        ).count
                                      }
                                    </span>
                                  )}
                                </small>
                              </div>
                              <div className="d-flex align-items-center">
                                <small className="fw-bold d-flex align-items-center">
                                  <Camera
                                    width={"15px"}
                                    className="text-primary"
                                  />
                                  {lesson.file.find(
                                    (file) => file.material_type === 2
                                  ) && (
                                    <span>
                                      -{" "}
                                      {
                                        lesson.file.find(
                                          (file) => file.material_type === 2
                                        ).count
                                      }
                                    </span>
                                  )}
                                </small>
                              </div>
                              <div className="d-flex align-items-center">
                                <small className="fw-bold  align-items-center">
                                  <Film
                                    width={"15px"}
                                    className="text-primary"
                                  />
                                  {lesson.file.find(
                                    (file) => file.material_type === 3
                                  ) && (
                                    <span>
                                      -{" "}
                                      {
                                        lesson.file.find(
                                          (file) => file.material_type === 3
                                        ).count
                                      }
                                    </span>
                                  )}
                                </small>
                              </div>
                              <div className="d-flex align-items-center">
                                <small className="fw-bold d-flex align-items-center">
                                  <Headphones
                                    width={"15px"}
                                    className="text-primary"
                                  />
                                  {lesson.file.find(
                                    (file) => file.material_type === 4
                                  ) && (
                                    <span>
                                      -{" "}
                                      {
                                        lesson.file.find(
                                          (file) => file.material_type === 4
                                        ).count
                                      }
                                    </span>
                                  )}
                                </small>
                              </div>
                            </div>
                          </CardFooter>
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

export default LessonMaterial;
