import React, { Fragment, useState, useEffect } from "react";
import { useParams ,useNavigate} from "react-router-dom";
import useModal from '@hooks/useModal'
import {
  Row,
  Col,
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  ListGroup,
  ListGroupItem,
  Badge,
  UncontrolledTooltip,
} from "reactstrap";
import { Search, Plus, File, Camera, Film, Headphones, X ,ChevronsLeft} from "react-feather";
import Addmodal from "../Add";
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import { t } from 'i18next'

const DetailPage = () => {
  const { showWarning } = useModal()
  const { index } = useParams();
  const navigate = useNavigate()
  const [modal, setModal] = useState(false);
  const [MaterialType , setMaterialType] = useState("");
  const [datas, setDatas] = useState([]);
  const { Loader, isLoading, fetchData } = useLoader({ isFullScreen: false });
  const materialApi = useApi().material;
  const [selectedContent, setSelectedContent] = useState(null);

  const handleModal = (type) => {
    setModal(!modal);
    setMaterialType(type);
  };
  const handleNavigate = () => {
    navigate(`/online_lesson`)
}
  const getOneDatas = async () => {
    const { success, data } = await fetchData(materialApi.getOne(index));
    if (success) {
      setDatas(data);
    }
  };

  useEffect(() => {
    getOneDatas();
  }, []);

  const handleDelete = async(id)=>{
    console.log(id)
    const {success} = await fetchData(materialApi.delete(id))
    if(success){
      getOneDatas()
    }
  }
  const item = datas.length > 0 ? datas[0] : null;

  const renderTable = (content, item) => {
    if (!item || !item.file) return null;

    const materialMap = {
      1: File,
      2: Camera,
      3: Film,
      4: Headphones,
    };

    const materialType = materialMap[content];

    if (materialType === undefined) return null;

    const filesForType = item.file.find(
      (fileGroup) => fileGroup.material_type === content
    );

    if (!filesForType) return null;
    return (
      <ListGroup>
        {filesForType.files.map((file, index) => (
          <ListGroupItem key={index} className="align-items-center">
            <div className="d-flex justify-content-between gap-2 mt-1">
              <div className="d-flex gap-2">
                <p>{index + 1}.</p>
                <a href={file.path} download>
                  {file.path}
                </a>
                <img width={200} height={100} src={file.path}></img>
              </div>
              <div className="d-flex gap-4">
                <p>{file.created_at}</p>
                <a
                  className="ms-1"
                  role="button"
                  onClick={() =>
                    showWarning({
                      header: {
                        title: t(`Хичээлийн Материал`),
                      },
                      question: t(`Хичээлийн Материал устгах уу?`),
                      onClick: () => handleDelete(file.id),
                      btnText: t("Устгах"),
                    })
                  }
                  id={`complaintListDatatableCancel${file?.id}`}
                >
                  <Badge color="light-danger" pill>
                    <X width={"100px"} />
                  </Badge>
                </a>
                <UncontrolledTooltip
                  placement="top"
                  target={`complaintListDatatableCancel${file.id}`}
                >
                  Устгах
                </UncontrolledTooltip>
              </div>
            </div>
          </ListGroupItem>
        ))}
      </ListGroup>
    );
  };

  const contentTypes = ["Файл", "Зураг", "Бичлэг", "Дуу авиа"];

  return (
    <Fragment>
      {isLoading && Loader}
      <Card>
        <CardHeader>
        <div className="cursor-pointer" onClick={() => handleNavigate()}><ChevronsLeft /> Буцах</div>
          <div className="d-flex gap-1 align-items-center">
            <h5>{item && item.school_name}</h5>
            <h4>{item && item.full_name}</h4>
          </div>
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
            {contentTypes.map((type, idx) => (
              <Col xl={3} md={6} className="mb-4" key={idx}>
                <Card className="bg-white border rounded-lg shadow-sm">
                  <CardBody>
                    <div className="d-flex justify-content-between">
                      <div className="d-flex gap-1 cursor-pointer">
                        <h4>{type}</h4>
                      </div>
                      <Button
                        size="sm"
                        color="primary"
                        onClick={()=>handleModal(idx+1)}
                        className=""
                      >
                        <Plus size={15} />
                      </Button>
                    </div>
                    <div className="mt-1 pt-25">
                      <div className="d-flex justify-content-between role-heading">
                        {item &&
                          item.file.map((file) => {
                            if (file.material_type === idx + 1) {
                              return (
                                <small
                                  className="text-primary"
                                  key={file.material_type}
                                >
                                  Нийт тоо : {file.count}
                                </small>
                              );
                            }
                            return null;
                          })}
                        <br />
                        <small className="text-primary">
                          Нийт хэмжээ : 500MB
                        </small>
                      </div>
                      <div className="d-flex justify-content-between mt-1">
                        <div className="d-flex flex-row gap-1 cursor-pointer">
                          {type === "Файл" && <File width={"25px"} />}
                          {type === "Зураг" && <Camera width={"25px"} />}
                          {type === "Бичлэг" && <Film width={"25px"} />}
                          {type === "Дуу авиа" && <Headphones width={"25px"} />}
                        </div>
                        <small
                          className="text-primary cursor-pointer fw-bold fst-italic"
                          onClick={() =>
                            setSelectedContent(
                              selectedContent === idx + 1 ? "" : idx + 1
                            )
                          }
                        >
                          Дэлгэрэнгүй...
                        </small>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
          {selectedContent && renderTable(selectedContent, item)}
        </CardBody>
        {modal && <Addmodal open={modal} handleModal={handleModal} type={MaterialType} userId={index}/>}
      </Card>
    </Fragment>
  );
};

export default DetailPage;
