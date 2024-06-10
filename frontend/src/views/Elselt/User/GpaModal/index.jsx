import React, { useState } from "react";
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
import { auto } from "@popperjs/core";

function GpaModal({ gpaModalHandler, gpaModal, lesson_year , prof_id }) {
  const [selectedOption, setSelectedOption] = useState("gpa");
  const {
    formState: { errors },
    handleSubmit,
    control,
    reset,
  } = useForm();
  const { Loader, isLoading, fetchData } = useLoader({
    isFullScreen: true,
    bg: 2,
  });

  async function onSubmit(cdata) {
    if (selectedOption !== "gpa") {
      cdata.gpa = ""; // or whatever default value you want to assign
    }
    console.log(cdata);
  }

  return (
    <Modal centered toggle={gpaModalHandler} isOpen={gpaModal} size="lg">
      {isLoading && Loader}
      <ModalHeader toggle={gpaModalHandler}>Элсэгчидын голч шалгах</ModalHeader>
      <ModalBody
        className="d-flex flex-column "
        tag={Form}
        onSubmit={handleSubmit(onSubmit)}
      >
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
                  disabled
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
        <p className="d-flex justify-content-end mt-2">Тэнцээгүй элсэгч : <strong>100</strong></p>
        <Table responsive className="overflow-hidden" >
          <thead>
            <tr>
              <th>#</th>
              <th>Table heading</th>
              <th>Table heading</th>
              <th>Table heading</th>
              <th>Table heading</th>
              <th>Table heading</th>
              <th>Table heading</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">1</th>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
            </tr>
            <tr>
              <th scope="row">2</th>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
            </tr>
            <tr>
              <th scope="row">3</th>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
            </tr>
            <tr>
              <th scope="row">4</th>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
            </tr>
            <tr>
              <th scope="row">5</th>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
              <td>Table cell</td>
            </tr>
          </tbody>
        </Table>
        <div className="d-flex justify-content-end">
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
