import React, { Fragment, useState } from "react";
import { Loader, X } from "react-feather";
import { Controller, useForm } from "react-hook-form";
import useApi from "@hooks/useApi";
import {
  Modal,
  Row,
  Col,
  Label,
  ModalHeader,
  ModalBody,
  Form,
  Input,
  Button,
} from "reactstrap";
import useLoader from "@hooks/useLoader";
import { t } from "i18next";
import { convertDefaultValue } from "@utils";

const Addmodal = ({ open, handleModal, refreshDatas, type, userId }) => {
  const closeBtn = (
    <X className="cursor-pointer" size={15} onClick={handleModal} />
  );

  // Api
  const materialApi = useApi().material;

  // Loader
  const { isLoading } = useLoader({ isFullScreen: false });

  // Form
  const { control, handleSubmit, reset, setError } = useForm();

  // State
  const [featurefile, setFeaturedImg] = useState([]);
  const [is_new_upload_file, setUploadNewFile] = useState(false);

  //Label
  const LabelType = (type)=>
  {
    switch (type){
      case 1 :
      return "файл"
      case 2 :
      return "зураг"
      case 3 :
      return "бичлэг"
      case 4 :
      return "дуу авиа"
    }
  }

  //
  const getAcceptableTypes = (type)=>{
    switch (type) {
      case 1:
        return ".docx,.pdf,.html,.ppt,.xls,.txt,.notes";
      case 2:
        return ".png,.jpg,.jpeg";
      case 4:
        return ".mp3,.wav,.mpc,.msv,.nmf";
      case 3:
        return ".mp4,.avi,.mov,.WebM";
    }
  }
  // Handle form submission
  const onSubmit = async (cdata) => {
    cdata["user"] = userId;
    cdata["material_type"] = type;
    cdata = convertDefaultValue(cdata);

    const formData = new FormData();

    if (featurefile && featurefile.length > 0) {
      featurefile.forEach((file) => {
        if (is_new_upload_file) {
          formData.append("path", file.file);
        }
      });
    }

    // Append other form data
    for (const key in cdata) {
      formData.append(key, cdata[key]);
    }
    const { success, errors } = await materialApi.post(formData);
    if (success) {
      reset();
      refreshDatas();
      handleModal();
    } else {
      for (let key in errors) {
        setError(key, { type: "custom", message: errors[key][0] });
      }
    }
  };

  const onChangeFile = (e, action) => {
    setUploadNewFile(true);

    //action 0 үед файлыг устгана.
    if (action === 0) {
      setFeaturedImg([]);
    } else {
      const selectedFile = e.target.files[0];

      //Хэрвээ оруулсан файлын төрөл image гэж эхэлсэн үед тус файлыг авна бусад үед алерт илгээнэ.
      if (selectedFile) {
        //Анхны удаа файл оруулхад ажилна.
        if (featurefile.length === 0) {
          if (action == "Get_File") {
            const files = Array.prototype.slice.call(e.target.files);
            const hereFiles = [...featurefile];
            files.map((file) => {
              if (file) hereFiles.push({ file: file});
            });
            setFeaturedImg(hereFiles);
          }
        }
      } else {
        //алерт илгээгээд input-ээ хоосон утгатай болгоно.
        alert("Зөв оруулна уу .");
        e.target.value = "";
      }
    }
  };

  return (
    <Fragment>
      {isLoading && Loader}
      <Modal
        isOpen={open}
        toggle={handleModal}
        className="modal-dialog-centered modal-sm"
        contentClassName="pt-0"
      >
        <ModalHeader
          className="mb-1 d-flex justify-content-between"
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
                <Label for="path">Хичээлийн {LabelType(type)} оруулах</Label>
                <Controller
                  name="path"
                  control={control}
                  defaultValue=""
                  render={({ field }) => {
                    field.value = field.value ? field.value : "";
                    return (
                      <Input
                        {...field}
                        id="path"
                        type="file"
                        bsSize="sm"
                        accept={getAcceptableTypes(type)}
                        onChange={(e) => onChangeFile(e, "Get_File")}
                      />
                    );
                  }}
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
