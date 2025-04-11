import React, { Fragment, useState } from "react";
import { X } from "react-feather";
import { Modal, ModalBody, ModalHeader, Row, Collapse, Button, Badge } from "reactstrap";
import './detail.css'
import DisplayQuestions from "./DisplayQuestions"
import Scope from './Scope'
import DisplayQuill from "./components/DisplayQuill";



function Detail({ open, openModal, data }){

    function YesBadge() {
        return(
            <Badge color="light-success" pill>Тийм</Badge>
        )
    }
    function NoBadge() {
        return(
            <Badge color="light-danger" pill>Үгүй</Badge>
        )
    }

    const [colOpen, setOpen] = useState(false);
    const [questions, setQuestions] = useState(true);
    const [scope, setScope] = useState(false);

    const [outlined, setOutlined] = useState(true)
    const [outlineq, setOutlineq] = useState(false)
    const [outlines, setOutlines] = useState(true)


    const asuultuud = data.questions


    function handleOpen(){
        setOpen(!colOpen)
        setOutlined(!outlined)
    }

    function handleQuestions(){
        setQuestions(!questions)
        setOutlineq(!outlineq)
    }

    function handleScope(){
        setScope(!scope)
        setOutlines(!outlines)
    }
    const closeBtn = (
        <X className="cursor-pointor" size={15} onClick={openModal} style={{cursor: "pointer"}} />
    )
    return(
            <Modal
                isOpen={open}
                toggle={openModal}
                className="modal-dialog-centered modal-lg"
            >
                <ModalHeader close={closeBtn} style={{ justifyContent: 'space-between' }}>Судалгааны мэдээлэл</ModalHeader>

                <ModalBody>
                    <div className="m-1">
                        <b>Гарчиг:</b> {data.title}
                    </div>
                    <div className="m-1">
                        <b>Дэлгэрэнгүй:</b> <DisplayQuill content={data.description} />
                    </div>
                    <Row className="d-flex justify-content-center mt-3 mb-3">
                    <Row className="d-flex flex-wrap justify-content-center">
                            <Button color="dark" outline={outlined} className="buttond" onClick={() => {
                                    handleOpen(!colOpen)
                                }}>
                                    Дэлгэрэнгүй мэдээлэл
                            </Button>
                            <Button color="dark" outline={outlineq} className="buttonq" onClick={() => {
                                    handleQuestions(!questions)
                                }}>
                                    Асуултууд
                            </Button>
                            <Button color="dark" outline={outlines} className="buttonq" onClick={() => {
                                    handleScope(!questions)
                                }}>
                                    Хамрах хүрээ
                            </Button>
                        </Row>
                        <Collapse isOpen={colOpen} className="mt-2">
                            <div className="d-flex flex-column align-items-center">
                                <div className="m-1">
                                    <b>Эхлэх хугацаа:</b>{data.start_date}
                                </div>

                                <div className="m-1">
                                    <b>Дуусах хугацаа:</b>{data.end_date}
                                </div>

                                <div className="m-1">
                                    <b>Заавал бөглөх эсэх:</b> {data.is_required ? <YesBadge/> : <NoBadge />}
                                </div>

                                <div className="m-1">
                                    <b>Нэр нуух эсэх:</b> {data.is_hide_employees ? <YesBadge/> : <NoBadge />}
                                </div>

                                <div className="m-1">
                                    <b>Үүсгэсэн огноо:</b>{data.created_at}
                                </div>
                            </div>
                        </Collapse>
                    </Row>

                    <Row className="d-flex justify-content-center mb-3">

  
                            <Collapse isOpen={questions} className="mt-2">
                                <Row>
                                    <div className="d-flex flex-column align-items-center z-3 ">
                                    <DisplayQuestions questions={asuultuud} />
                                    </div>
                                </Row>
                            </Collapse>
                    </Row>
                        <Collapse isOpen={scope} className="mt-2">
                                <Row className="d-flex justify-content-center ">
                                    <Scope data={data}/>
                                </Row>
                        </Collapse>
                </ModalBody>
            </Modal>
    )
}

export default Detail