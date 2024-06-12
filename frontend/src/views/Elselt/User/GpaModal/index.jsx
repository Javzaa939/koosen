import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  UncontrolledTooltip,
  Table,
} from "reactstrap";
import { MdMailOutline } from "react-icons/md";
import { BiMessageRoundedError } from "react-icons/bi";
import useLoader from "@hooks/useLoader";
import useApi from "@hooks/useApi";
import "./style.scss";
import { ChevronDown, Search } from "react-feather";
import { t } from "i18next";
import useModal from "@hooks/useModal";

function GpaModal({
  gpaModalHandler,
  gpaModal,
  lesson_year,
  prof_id,
  gplesson_year,
  profession_name,
}) {
  const [selectedOption, setSelectedOption] = useState("gpa");
  const {
    formState: { errors },
    handleSubmit,
    control,
    reset,
  } = useForm();
  const { Loader, isLoading, fetchData } = useLoader({
    isFullScreen: false,
    bg: 2,
  });
  const { showWarning } = useModal();

  //State
  const [datas, setDatas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [cdata, setCData] = useState([]);

  //API
  const gpaApi = useApi().elselt.admissionuserdata.gpa;
  const eyeshApi = useApi().elselt.admissionuserdata.eyesh;
  const saveApi = useApi().elselt.admissionuserdata.gpaconfirm;
  const admissionStateChangeApi = useApi().elselt.admissionuserdata.email;

  //Шалгах функц
  async function onSubmit(cdata) {
    setCData(cdata);
    const apiCall =
      selectedOption === "gpa"
        ? gpaApi.get(cdata.count, lesson_year, prof_id, cdata.gpa)
        : eyeshApi.get(cdata.count, lesson_year, prof_id);

    const { success, data } = await fetchData(apiCall);
    if (success) {
      setDatas(data);
      setFilteredData(data);
    }
  }
  //Mail илгээх функц
  async function sendMail() {
  //   const edata = {
  //     students: filteredData.map((val) => val?.user?.id) || [],
  //     email_list: filteredData.map((val) => val?.user?.email) || [],
  //     description: filteredData.map((val) => val?.gpa_description) || []
  // };
  //   if (edata.students.length > 0) {
  //     const { success } = await fetchData(admissionStateChangeApi.post(edata));
  //     if (success) {
  //       reset();
  //       edata = {};
  //     }
  //   }
  }
  //Төлөв өөрчлөх
  async function saveData(cdata) {
    if (cdata) {
      const { success, data } = await fetchData(
        saveApi.get(cdata.count, lesson_year, prof_id, cdata.gpa)
      );
      if (success) {
        reset();
      }
    }
  }

  useEffect(() => {
    const filtered = datas.filter((data) =>
      Object.values(data.user).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
  }, [searchTerm, datas]);

  return (
    <Modal centered toggle={gpaModalHandler} isOpen={gpaModal} size="lg">
      {isLoading && Loader}
      <ModalHeader toggle={gpaModalHandler}>
        <div>
          <h5>Элсэгчидын голч шалгах</h5>
        </div>
      </ModalHeader>
      <ModalBody
        className="d-flex flex-column "
        tag={Form}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="d-flex justify-content-end gap-4">
          {" "}
          <p>{gplesson_year}</p>
          <p>{profession_name}</p>
        </div>
        <Col md={12}>
          <div className="modal-content-container">
            <Form className="d-flex">
              <FormGroup check inline>
                <Input
                  type="radio"
                  name="checkOption"
                  value="gpa"
                  checked={selectedOption === "gpa"}
                  onChange={() => setSelectedOption("gpa")}
                />
                <Label check>Голч Дүн</Label>
              </FormGroup>
              <FormGroup check inline>
                <Input
                  type="radio"
                  name="checkOption"
                  value="eyesh"
                  disabled={true}
                  checked={selectedOption === "eyesh"}
                  onChange={() => setSelectedOption("eyesh")}
                />
                <Label check>ЭЕШ</Label>
              </FormGroup>
            </Form>
            <div className="d-flex  align-items-center gap-2">
              <Col md={4}>
                <Label className="form-label" for="gpa">
                  Голч
                </Label>
                <Controller
                  control={control}
                  defaultValue=""
                  name="gpa"
                  disabled={selectedOption !== "gpa"}
                  rules={{
                    validate: (value) => {
                      const number = parseFloat(value);
                      return (
                        (!isNaN(number) && number >= 0 && number <= 4) ||
                        "Утга 0 ээс 4 хооронд"
                      );
                    },
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      size="sm"
                      type="textarea"
                      name="gpa"
                      id="gpa"
                      invalid={errors?.gpa}
                      value={value}
                      onChange={(e) => onChange(e.target.value || "")}
                      className="gpa-input"
                      style={{ maxHeight: 25, overflow: "hidden" }}
                      disabled={selectedOption !== "gpa"}
                    />
                  )}
                />
              </Col>
              <Col md={4}>
                <Label className="form-label" for="count">
                  Шалгах тоо
                </Label>
                <Controller
                  control={control}
                  defaultValue=""
                  name="count"
                  rules={{
                    validate: (value) => {
                      const number = parseFloat(value);
                      return (
                        (!isNaN(number) && number >= 0 && number <= 500) ||
                        "Утга 0 ээс 500 хооронд"
                      );
                    },
                  }}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      size="sm"
                      type="textarea"
                      name="count"
                      id="count"
                      invalid={errors?.count}
                      value={value}
                      onChange={(e) => onChange(e.target.value || "")}
                      className="count-input"
                      style={{ maxHeight: 25, overflow: "hidden" }}
                    />
                  )}
                />
              </Col>
              <Col md={1} className="mt-2">
                <div className="text-center my-50">
                  <Button
                    className="m-50"
                    color="primary"
                    type="submit"
                    id="gpa_button"
                    disabled={isLoading}
                  >
                    Шалгах
                  </Button>
                  <UncontrolledTooltip target="gpa_button">
                    Голч дүнгээр шалгах
                  </UncontrolledTooltip>
                </div>
              </Col>
            </div>
            <div className="d-flex">
              <div>
                <Button
                  color="primary"
                  className="d-flex align-items-center px-75"
                  id="email_button"
                  onClick={sendMail}
                >
                  <MdMailOutline className="me-25" />
                  Email илгээх
                </Button>
                <UncontrolledTooltip target="email_button">
                  Сонгосон элсэгчид руу имейл илгээх
                </UncontrolledTooltip>
              </div>
              <div className="px-1">
                <Button
                  color="primary"
                  disabled
                  className="d-flex px-75"
                  id="message_button"
                >
                  <BiMessageRoundedError className="me-25" />
                  Мессеж илгээх
                </Button>
                <UncontrolledTooltip target="message_button">
                  Сонгосон элсэгчид руу мессеж илгээх
                </UncontrolledTooltip>
              </div>
            </div>
          </div>
        </Col>
        <div className="d-flex justify-content-between mt-3 align-items-center">
          <Col
            className="d-flex align-items-center mobile-datatable-search"
            md={4}
            sm={12}
          >
            <Input
              className="dataTable-filter mb-50"
              type="text"
              bsSize="sm"
              id="search-input"
              placeholder={"Хайх үг...."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button size="sm" className="ms-50 mb-50" color="primary">
              <Search size={15} />
              <span className="align-middle ms-50"></span>
            </Button>
          </Col>
          <p className="d-flex">
            Тэнцээгүй элсэгч : <strong>{filteredData.length}</strong>
          </p>
        </div>
        <div className="table-container">
          <Table responsive className="small-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Овог</th>
                <th>Нэр</th>
                <th>РД</th>
                <th>Утас</th>
                <th>Email</th>
                <th>Тайлбар</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((data, index) => (
                <tr key={index}>
                  <th scope="row">{index + 1}</th>
                  <td>{data.user.last_name}</td>
                  <td>{data.user.first_name}</td>
                  <td>{data.user.register}</td>
                  <td>{data.user.mobile}</td>
                  <td>{data.user.email}</td>
                  <td>{data.gpa_description}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <div className="d-flex justify-content-between">
          <div className="text-center my-50">
            <Button
              color="primary"
              className="m-50"
              disabled={isLoading}
              onClick={() =>
                showWarning({
                  header: {
                    title: `${t(
                      "Бүртгүүлэгчийн онооны мэдээлэл , төлөв өөрчлөх"
                    )}`,
                  },
                  question: `Та хадгалахдаа итгэлтэй байна уу?`,
                  onClick: () => saveData(cdata),
                  btnText: "Хадгалах",
                })
              }
            >
              Хадгалах
            </Button>
          </div>
          <div className="text-center my-50">
            <Button
              className="m-50"
              onClick={gpaModalHandler}
              disabled={isLoading}
            >
              Буцах
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}

export default GpaModal;
