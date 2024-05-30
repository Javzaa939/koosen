import React, { Fragment, useState } from "react";
import { X } from "react-feather";
import "quill/dist/quill.snow.css";
import { Controller, useForm } from "react-hook-form";
import {
  Modal,
  Row,
  Col,
  Label,
  ModalHeader,
  ModalBody,
  Form,
  Input,
  Button
} from "reactstrap";
import useLoader from "@hooks/useLoader";
import { t } from "i18next";

const Addmodal = ({ open, handleModal }) => {
  const closeBtn = (
    <X className="cursor-pointer" size={15} onClick={handleModal} />
  );

  // Loader
  const { Loader, isLoading } = useLoader({ isFullScreen: false });

  // ** Hook
  const { control, handleSubmit, formState: { errors }, reset, setError } = useForm();

  // State
  const [is_new_upload_file, setUploadNewFile] = useState(false);
  const [featurefile, setFeaturedImg] = useState([]);

  // Handle form submission
  const onSubmit = data => {
    // Handle form data here
    console.log(data);
  };

  return (
    <Fragment>
      {Loader && isLoading}
      <Modal
        isOpen={open}
        toggle={handleModal}
        className="sidebar-xl hr-register"
        modalClassName="modal-slide-in"
        contentClassName="pt-0"
      >
        <ModalHeader
          className="mb-1"
          toggle={handleModal}
          close={closeBtn}
          tag="div"
        >
          <h5 className="modal-title">{t("Хичээлийн материал нэмэх")}</h5>
        </ModalHeader>
        <ModalBody className="flex-grow-1">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Row className="gy-1">
              <Col md={12}>
                <Label className="form-label" for="title">
                  {t("Нэр")}
                </Label>
                <Controller
                  control={control}
                  defaultValue=""
                  name="title"
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      id="title"
                      placeholder={t("Нэр")}
                      bsSize="sm"
                    />
                  )}
                />
              </Col>
              <Col md={12}>
                <Label for="image">Хичээлийн файл оруулах</Label>
                <Controller
                  control={control}
                  name="image"
                  defaultValue=""
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="image"
                      type="file"
                      bsSize="sm"
                      accept="image/*"
                    />
                  )}
                />
              </Col>
              <Col md={12} className="mt-2">
                <Button className="me-2" color="primary" type="submit">
                  {t("Хадгалах")}
                </Button>
                <Button
                  color="secondary"
                  outline
                  type="reset"
                  onClick={handleModal}
                >
                  {t("Буцах")}
                </Button>
              </Col>
            </Row>
          </Form>
        </ModalBody>
      </Modal>
    </Fragment>
  );
};

export default Addmodal;
