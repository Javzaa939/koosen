import React, { Fragment, useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ChevronsRight, Edit, PlusCircle, Trash, HelpCircle } from "react-feather";

import {
    Row,
    Card,
    Button,
    Col,
    CardHeader,
    CardTitle,
    CardBody,
    Alert
} from "reactstrap";

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import QuestionsList from "./QuestionsList";
import AddTitle from "./AddTitle";
import useModal from "@hooks/useModal";
const EQuestions = ({ teacher_id, title_id, is_season, is_graduate=false }) => {
    const [datas, setDatas] = useState([]);
    const [titleModal, setTitleModal] = useState({ type: false, editId: null })
    const [activeTitle, setActiveTitle] = useState(title_id)

    const { t } = useTranslation();
    const { isLoading, fetchData } = useLoader({})
    const { showWarning } = useModal()
    const questionAPI = useApi().challenge.question

    async function getAllTitle() {
        const { success, data } = await fetchData(questionAPI.getTitle('', is_season, teacher_id, 'admission'))
        if (success) {
            setDatas(data)
        }
    }

    useEffect(() => {
        getAllTitle()
    }, [])

    useEffect(() => {
        if (title_id) {
            setActiveTitle(title_id);
        }
    }, [title_id]);

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
                {
                    !is_season
                    &&
                    <Col lg={4} xxl={3} className="">
                        <Card className="m-0 mb-1">
                            <CardHeader className="px-1 py-1">
                                <Row className="g-50 w-100">
                                    <Col sm={12} className="d-flex justify-content-between p-0">
                                        <CardTitle className="mb-0" style={{ fontSize: "16px" }}>
                                            {
                                                t('Асуултууд багцлагдсан сэдвүүд')
                                            }
                                        </CardTitle>
                                        <Button className="px-50 py-25" color="primary" outline onClick={() => { setTitleModal({ type: true, editId: null }) }} size="sm">
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
                                                Бүх асуултууд
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
                                                                {title.name + ' (' + title.lesson__code + ' ' + title.lesson__name + ')'}
                                                            </span>
                                                            {
                                                                activeTitle == title.id ?
                                                                    <ChevronsRight size={16} />
                                                                    :
                                                                    ''
                                                            }
                                                        </div>
                                                        <div className="">
                                                            <Edit className="text-info cursor-pointer me-50" size={13} onClick={() => { setTitleModal({ type: true, editId: title.id }) }} />
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
                                                Сэдэвт хамаарагдахгүй асуултууд
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
                }

                <Col lg={is_season ? 12 : 8} xxl={is_season ? 12 : 9}>
                    <QuestionsList filterId={activeTitle} teacher_id={teacher_id} season={is_season} is_graduate={is_graduate}/>
                </Col>

            </Row>

            <Card className={'mt-2'}>
                <CardHeader><div className="d-flex "><HelpCircle size={20} /><h5 className="ms-25 fw-bolder">Тусламж хэсэг</h5></div></CardHeader>
                <CardBody>
                    <Alert color='primary' className={'p-1 тме1'}>
                        Асуулт үүсгэх заавар мэдээлэл хүргэж байна.
                    </Alert>
                    <iframe
                        width="100%"
                        height="500"
                        title='Асуулт'
                        src={'https://www.youtube.com/embed/Bnvx2847K7M'}
                        sandbox='allow-same-origin allow-forms allow-popups allow-scripts allow-presentation'
                    />
                </CardBody>
            </Card>
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

export default EQuestions;

