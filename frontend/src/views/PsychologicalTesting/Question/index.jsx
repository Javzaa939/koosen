import React, { Fragment, useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "@context/AuthContext";
import {  ChevronsRight, Edit, PlusCircle, Trash } from "react-feather";

import {
    Row,
    Card,
    Button,
    Col,
    CardHeader,
    CardTitle,
    CardBody,
} from "reactstrap";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import QuestionsList from "./QuestionsList";
import AddTitle from "./AddTitle";
import useModal from "@hooks/useModal";

const Question = () => {


    const [datas, setDatas] = useState([]);
    const [titleModal, setTitleModal] = useState({type: false, editId: null})
    const [activeTitle, setActiveTitle] = useState(0)

    const { t } = useTranslation();
    const { isLoading, fetchData } = useLoader({})
    const { showWarning } = useModal()

    const questionAPI = useApi().challenge.psychologicalTest

    async function getAllTitle() {
        const { success, data } = await fetchData(questionAPI.getTitle())
        if (success) {
            setDatas(data)
        }
    }

    useEffect(() => {

        getAllTitle()

    }, [])

    async function deleteTitle(id) {
        const { success, data } = await fetchData(questionAPI.deleteTitle(id))
        if (success) {
            getAllTitle()
            setActiveTitle(0)
        }
    }

    return (
        <Fragment>
            <Row className="g-1 ">
                <Col lg={4} xxl={3} className="">
                    <Card className="m-0 mb-1">
                        <CardHeader className="px-1 py-1">
                            <Row className="g-50 w-100">
                                <Col sm={12} className="d-flex justify-content-between p-0">
                                    <CardTitle className="mb-0" style={{ fontSize: "16px" }}>
                                        {
                                            t('Багц асуултын сэдэв')
                                        }
                                    </CardTitle>
                                    <Button className="px-50 py-25" color="primary" outline onClick={() => { setTitleModal({type: true, editId: null}) }} size="sm">
                                        <PlusCircle size={16} />
                                    </Button>
                                </Col>
                            </Row>
                        </CardHeader>
                        <CardBody className="p-0 ">
                            <div className="p-1  d-flex ">
                                <ul className="m-0 p-0 w-100" style={{ listStyle: "none", }}>
                                    <li style={{ textDecoration: "underline" }} className={`p-0 my-25 cursor-pointer ${activeTitle == 0 ? "text-primary fw-bolder" : ""}`}
                                        onClick={() => setActiveTitle(0)}
                                    >
                                        <span>
                                            Бүх
                                        </span>
                                        {
                                            activeTitle == 0 ?
                                                <ChevronsRight className="" size={16} />
                                                :
                                                ''
                                        }
                                    </li>
                                    {
                                        datas.map((title, idx) => {
                                            return (
                                                <li
                                                    className={`p-0 my-25  d-flex justify-content-between ${activeTitle == title.id ? "text-primary fw-bolder" : ""}`}
                                                    key={idx}
                                                    style={{ textDecoration: "underline" }}
                                                >
                                                    <div className="cursor-pointer" onClick={() => setActiveTitle(title.id)}>
                                                        <span>
                                                            {title.name}
                                                        </span>
                                                        {
                                                            activeTitle == title.id ?
                                                                <ChevronsRight size={16} />
                                                                :
                                                                ''
                                                        }
                                                    </div>
                                                    <div className="">
                                                        <Edit className="text-info cursor-pointer me-50" size={13} onClick={() => {setTitleModal({type: true, editId: title.id})}}/>
                                                        <Trash className="text-danger cursor-pointer" size={14} onClick={() => {
                                                            showWarning({
                                                                header: {
                                                                    title: `Та энэ асуултыг устгахдаа итгэлтэй байна уу ?`,
                                                                },
                                                                question: title.name,
                                                                onClick: () => deleteTitle(title.id),
                                                                btnText: 'Устгах',
                                                            })
                                                        }} />
                                                    </div>
                                                </li>
                                            )
                                        })
                                    }

                                    <li style={{ textDecoration: "underline" }} className={`p-0 my-25 cursor-pointer ${activeTitle == -1 ? "text-primary fw-bolder" : ""}`}
                                        onClick={() => setActiveTitle(-1)}
                                    >
                                        <span>
                                            Багцлагдаагүй асуултууд
                                        </span>
                                        {
                                            activeTitle == -1 ?
                                                <ChevronsRight size={16} />
                                                :
                                                ''
                                        }
                                    </li>

                                </ul>
                            </div>
                        </CardBody>
                    </Card>
                    {/* <Topic lessonId={lessonInfo?.id} lessonName={lessonInfo?.name} /> */}
                </Col>

                <Col lg={8} xxl={9}>
                    <QuestionsList filterId={activeTitle} />
                </Col>

            </Row>
            {titleModal.type && (
                <AddTitle
                    open={titleModal}
                    setOpen={setTitleModal}
                    getAllTitle={getAllTitle}
                    setActiveTitle={setActiveTitle}
                />
            )}
        </Fragment>
    );
};

export default Question;

