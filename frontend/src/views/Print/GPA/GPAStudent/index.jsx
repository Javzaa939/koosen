import { Fragment, useState, useEffect, useContext } from "react";

import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import {
  Row,
  Col,
  Card,
  Input,
  Label,
  CardTitle,
  CardHeader,
  Spinner,
  Button,
} from "reactstrap";

import { ChevronDown, Printer, Search } from "react-feather";

import { useTranslation } from "react-i18next";

import Select from "react-select";

import DataTable from "react-data-table-component";

import useApi from "@hooks/useApi";

import useLoader from "@hooks/useLoader";

import SchoolContext from "@context/SchoolContext";

import { getColumns } from "./helpers";

import { getPagination, ReactSelectStyles, generateLessonYear } from "@utils";

const GPAStudent = () => {
  var values = {
    department: "",
    degree: "",
    profession: "",
    group: "",
    lesson_year: "",
    lesson_season: "",
    status: "",
  };

  const navigate = useNavigate();

  const [sortField, setSort] = useState("");

  const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: true });
  const {
    Loader: TableLoader,
    isLoading: tableLoading,
    fetchData: tableFetchData,
  } = useLoader({});

  const [currentPage, setCurrentPage] = useState(1);

  const { school_id } = useContext(SchoolContext);

  const { t } = useTranslation();
  const {
    control,
    formState: { errors },
  } = useForm({});
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [searchValue, setSearchValue] = useState("");
  const [select_value, setSelectValue] = useState(values);
  const [datas, setDatas] = useState([]);

  const [total_count, setTotalCount] = useState(1);
  const default_page = [10, 20, 50, 75, 100, "Бүгд"];

  // Api
  const gpaApi = useApi().print.gpa;

  const handleFilter = (e) => {
    const value = e.target.value.trimStart();
    setSearchValue(value);
  };

  async function getDatas() {
    const department = select_value.department;
    const degree = select_value.degree;
    const profession = select_value.profession;
    const group = select_value.group;
    const lesson_year = select_value.lesson_year;
    const lesson_season = select_value.lesson_season;
    const { success, data } = await tableFetchData(
      gpaApi.get(
        rowsPerPage,
        currentPage,
        sortField,
        searchValue,
        degree,
        department,
        group,
        profession,
        lesson_year,
        lesson_season,
        select_value?.status
      )
    );
    if (success) {
      setDatas(data?.results);
      setTotalCount(data?.count);
    }
  }

  useEffect(() => {
    getProfessionOption();
    getGroupOption();
  }, [select_value]);

  // useEffect(() => {
  //   if (select_value){
  //     getDatas();
  //   }
  // }, [select_value, currentPage, rowsPerPage]);

  const handleSearchButton = () => {
    if (select_value) {
      getDatas();
    }
  };

  async function handleSearch() {
    getDatas();
  }

  const handlePagination = (page) => {
    setCurrentPage(page.selected + 1);
  };

  function handleSort(column, sort) {
    if (sort === "asc") {
      setSort(column.header);
    } else {
      setSort("-" + column.header);
    }
  }

  const [degreeOption, setDegreeOption] = useState([]);
  const [seasonOption, setSeasonOption] = useState([]);
  const [lesson_yearOption, setLesson_yearOption] = useState([]);
  const [groupOption, setGroupOption] = useState([]);
  const [departmentOption, setDepartmentOption] = useState([]);
  const [professionOption, setProfessionOption] = useState([]);

  const degreeApi = useApi().settings.professionaldegree;
  const seasonApi = useApi().settings.season;
  const groupApi = useApi().student.group;
  const departmentApi = useApi().hrms.department;
  const professionApi = useApi().study.professionDefinition;

  async function getDegreeOption() {
    const { success, data } = await fetchData(degreeApi.get());
    if (success) {
      setDegreeOption(data);
    }
  }
  async function getSeasonOption() {
    const { success, data } = await fetchData(seasonApi.get());
    if (success) {
      setSeasonOption(data);
    }
  }
  async function getGroupOption() {
    const department = select_value.department;
    const degree = select_value.degree;
    const profession = select_value.profession;
    const { success, data } = await fetchData(
      groupApi.getList(department, degree, profession)
    );
    if (success) {
      setGroupOption(data);
    }
  }
  async function getDepartmentOption() {
    const { success, data } = await fetchData(departmentApi.get());
    if (success) {
      setDepartmentOption(data);
    }
  }
  async function getProfessionOption() {
    const degreeId = select_value.degree;
    const department = select_value.department;
    const { success, data } = await fetchData(
      professionApi.getList(degreeId, department)
    );
    if (success) {
      setProfessionOption(data);
    }
  }

  useEffect(() => {
    getDegreeOption();
    getSeasonOption();
    setLesson_yearOption(generateLessonYear(5));
    getGroupOption();
    getDepartmentOption();
    getProfessionOption();
  }, []);

  // ** Function to handle per page
  function handlePerPage(e) {
    setRowsPerPage(
      e.target.value === "Бүгд" ? e.target.value : parseInt(e.target.value)
    );
  }

  return (
    <Fragment>
      <Card>
        {isLoading && Loader}
        <div className="d-flex mx-1 justify-content-end">
          <div>
            <Button
              color="primary"
              onClick={() => {
                navigate(`/print/gpa/print`, { state: datas });
              }}
              disabled={datas?.length === 0 && isLoading}
            >
              <Printer size={15} />
              <span className="align-middle ms-50">{t("Хэвлэх")}</span>
            </Button>
          </div>
        </div>
        <Row className=" mx-0 mb-1 mt-1">
          <Col md={4}>
            <Label className="form-label" for="department">
              {t("Хөтөлбөрийн баг")}
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
                    className="react-select"
                    placeholder={t("-- Сонгоно уу --")}
                    options={departmentOption || []}
                    value={departmentOption.find((c) => c.id === value)}
                    noOptionsMessage={() => t("Хоосон байна.")}
                    onChange={(val) => {
                      onChange(val?.id || "");
                      setSelectValue((current) => {
                        return {
                          ...current,
                          department: val?.id || "",
                        };
                      });
                    }}
                    styles={ReactSelectStyles}
                    getOptionValue={(option) => option.id}
                    getOptionLabel={(option) => option.name}
                  />
                );
              }}
            />
          </Col>
          <Col md={4}>
            <Label className="form-label" for="degree">
              {t("Боловсролын зэрэг")}
            </Label>
            <Controller
              control={control}
              defaultValue=""
              name="degree"
              render={({ field: { value, onChange } }) => {
                return (
                  <Select
                    name="degree"
                    id="degree"
                    classNamePrefix="select"
                    isClearable
                    className="react-select"
                    placeholder={t("-- Сонгоно уу --")}
                    options={degreeOption || []}
                    value={degreeOption.find((c) => c.id === value)}
                    noOptionsMessage={() => t("Хоосон байна.")}
                    onChange={(val) => {
                      onChange(val?.id || "");
                      setSelectValue((current) => {
                        return {
                          ...current,
                          degree: val?.id || "",
                        };
                      });
                    }}
                    styles={ReactSelectStyles}
                    getOptionValue={(option) => option.id}
                    getOptionLabel={(option) => option.degree_name}
                  />
                );
              }}
            />
          </Col>
          <Col md={4}>
            <Label className="form-label" for="profession">
              {t("Мэргэжил")}
            </Label>
            <Controller
              control={control}
              defaultValue=""
              name="profession"
              render={({ field: { value, onChange } }) => {
                return (
                  <Select
                    name="profession"
                    id="profession"
                    classNamePrefix="select"
                    isClearable
                    className="react-select"
                    placeholder={t("-- Сонгоно уу --")}
                    options={professionOption || []}
                    value={professionOption.find((c) => c.id === value)}
                    noOptionsMessage={() => t("Хоосон байна.")}
                    onChange={(val) => {
                      onChange(val?.id || "");
                      setSelectValue((current) => {
                        return {
                          ...current,
                          profession: val?.id || "",
                        };
                      });
                    }}
                    styles={ReactSelectStyles}
                    getOptionValue={(option) => option.id}
                    getOptionLabel={(option) => option.name}
                  />
                );
              }}
            />
          </Col>
          <Col md={4}>
            <Label className="form-label mt-1" for="group">
              {t("Анги")}
            </Label>
            <Controller
              control={control}
              defaultValue=""
              name="group"
              render={({ field: { value, onChange } }) => {
                return (
                  <Select
                    name="group"
                    id="group"
                    classNamePrefix="select"
                    isClearable
                    className="react-select"
                    placeholder={t("-- Сонгоно уу --")}
                    options={groupOption || []}
                    value={groupOption.find((c) => c.id === value)}
                    noOptionsMessage={() => t("Хоосон байна.")}
                    onChange={(val) => {
                      onChange(val?.id || "");
                      setSelectValue((current) => {
                        return {
                          ...current,
                          group: val?.id || "",
                        };
                      });
                    }}
                    styles={ReactSelectStyles}
                    getOptionValue={(option) => option.id}
                    getOptionLabel={(option) => option.name}
                  />
                );
              }}
            />
          </Col>
          <Col md={4}>
            <Label className="form-label mt-1" for="lesson_year">
              {t("Хичээлийн жил")}
            </Label>
            <Controller
              control={control}
              defaultValue=""
              name="lesson_year"
              render={({ field: { value, onChange } }) => {
                return (
                  <Select
                    name="lesson_year"
                    id="lesson_year"
                    classNamePrefix="select"
                    isClearable
                    className="react-select"
                    placeholder={t("-- Сонгоно уу --")}
                    options={lesson_yearOption || []}
                    value={lesson_yearOption.find((c) => c.id === value)}
                    noOptionsMessage={() => t("Хоосон байна.")}
                    onChange={(val) => {
                      onChange(val?.id || "");
                      setSelectValue((current) => {
                        return {
                          ...current,
                          lesson_year: val?.id || "",
                        };
                      });
                    }}
                    styles={ReactSelectStyles}
                    getOptionValue={(option) => option.id}
                    getOptionLabel={(option) => option.name}
                  />
                );
              }}
            />
          </Col>
          <Col md={3}>
            <Label className="form-label mt-1" for="lesson_season">
              {t("Хичээлийн улирал")}
            </Label>
            <Controller
              control={control}
              defaultValue=""
              name="lesson_season"
              render={({ field: { value, onChange } }) => {
                return (
                  <Select
                    name="lesson_season"
                    id="lesson_season"
                    classNamePrefix="select"
                    isClearable
                    className="react-select"
                    placeholder={t("-- Сонгоно уу --")}
                    options={seasonOption || []}
                    value={seasonOption.find((c) => c.id === value)}
                    noOptionsMessage={() => t("Хоосон байна.")}
                    onChange={(val) => {
                      onChange(val?.id || "");
                      setSelectValue((current) => {
                        return {
                          ...current,
                          lesson_season: val?.id || "",
                        };
                      });
                    }}
                    styles={ReactSelectStyles}
                    getOptionValue={(option) => option.id}
                    getOptionLabel={(option) => option.season_name}
                  />
                );
              }}
            />
          </Col>
          <Col
            md={1}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              height: "100px",
            }}
          >
            <Button
              color="primary"
              style={{
                height: "30px",
                display: "flex",
                alignItems: "center",
              }}
              onClick={handleSearchButton}
              disabled={datas?.length === 0 && isLoading}
            >
              <span className="align-middle">{t("Xайх")}</span>
            </Button>
          </Col>
          <Col sm={4} md={4} className="d-flex align-items-center mt-1">
            <Label className="form-label" for="status">
              {t("Төгсөлтийн голч эсэх")}
            </Label>
            <Input
              className="ms-1"
              type="checkbox"
              defaultChecked={select_value.status}
              onChange={(e) =>
                setSelectValue((current) => {
                  return {
                    ...current,
                    status: e.target.checked,
                  };
                })
              }
            />
          </Col>
        </Row>
        <Row className="justify-content-between mx-0 mb-1">
          <Col
            className="d-flex align-items-center justify-content-start"
            md={6}
            sm={12}
          >
            <Col md={2} sm={3} className="pe-1">
              <Input
                type="select"
                bsSize="sm"
                style={{ height: "30px" }}
                value={rowsPerPage}
                onChange={(e) => handlePerPage(e)}
              >
                {default_page.map((page, idx) => (
                  <option key={idx} value={page}>
                    {page}
                  </option>
                ))}
              </Input>
            </Col>
            <Col md={10} sm={3}>
              <Label for="sort-select">{t("Хуудсанд харуулах тоо")}</Label>
            </Col>
          </Col>
          <Col
            className="d-flex align-items-center mobile-datatable-search mt-1"
            md={4}
            sm={12}
          >
            <Input
              className="dataTable-filter mb-50"
              type="text"
              bsSize="sm"
              id="search-input"
              placeholder={t("Хайх")}
              value={searchValue}
              onChange={handleFilter}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              size="sm"
              className="ms-50 mb-50"
              color="primary"
              onClick={handleSearch}
            >
              <Search size={15} />
              <span className="align-middle ms-50"></span>
            </Button>
          </Col>
        </Row>
        <div className="react-dataTable react-dataTable-selectable-rows">
          <DataTable
            noHeader
            pagination
            paginationServer
            className="react-dataTable"
            progressPending={tableLoading}
            progressComponent={<h5>{t("Түр хүлээнэ үү...")}</h5>}
            noDataComponent={
              <div className="my-2">
                <h5>{t("Өгөгдөл байхгүй байна")}</h5>
              </div>
            }
            onSort={handleSort}
            sortIcon={<ChevronDown size={10} />}
            columns={getColumns(currentPage, rowsPerPage, total_count)}
            paginationPerPage={rowsPerPage}
            paginationDefaultPage={currentPage}
            paginationComponent={getPagination(
              handlePagination,
              currentPage,
              rowsPerPage,
              total_count
            )}
            data={datas}
            fixedHeader
            fixedHeaderScrollHeight="62vh"
          />
        </div>
      </Card>
    </Fragment>
  );
};
export default GPAStudent;
