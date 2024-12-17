import React, { Fragment, useState, useEffect } from "react";

import { Card, CardBody, Col, Button, Row, Table, Alert, Badge } from 'reactstrap'
import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";
import { ChevronLeft, ChevronRight } from 'react-feather'

export default function Students({stepper, setSubmitDatas, selectedLesson, onSubmit}) {
    const [studensOption, setStudents] = useState([]);
    const [challengeStudents, setChallengeStudents] = useState([])
    const {fetchData } = useLoader({});

    const scoreApi = useApi().score.register;

    async function getStudents() {
        const { success, data } = await fetchData(scoreApi.challenge(selectedLesson))
        if (success) {
            setStudents(data)
        }
    }

    useEffect(
        () =>
        {
            if(selectedLesson) {
                getStudents()
            }
        },
        [selectedLesson]
    )

    const handleAddStudent = () => {
        var data = studensOption?.filter((c) => c.total_score > 42)
        setChallengeStudents(data)
    }

    const handleSubmit = () => {

        var students = challengeStudents?.map((c) => c.id)

        onSubmit(students)
    }

    return (
        <Card>
            <CardBody>
                <Row>
                    <Col md={12}>
                        <Alert className='p-1' color="primary">
                            <p className="text-primary">
                                42-иос доош дүнтэй суралцагчид шалгалтад орох боломжгүй.
                            </p>
                        </Alert>
                        <div className="d-flex justify-content-between mb-1">
                            <h5>Дүнтэй оюутны жагсаалт</h5>
                            <Button size="sm" color="primary" onClick={() => handleAddStudent()}>Шалгалт руу нэмэх</Button>
                        </div>
                        <Table responsive color="primary" bordered>
                            <thead>
                                <tr>
                                    <th>№</th>
                                    <th>Код</th>
                                    <th>Овог</th>
                                    <th>Нэр</th>
                                    <th>Регистр</th>
                                    <th>Дүн</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    studensOption?.map((student, idx) =>
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td>{student?.code}</td>
                                            <td>{student?.last_name}</td>
                                            <td>{student?.first_name}</td>
                                            <td>{student?.register_num}</td>
                                            <td>{student?.total_score}</td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </Table>
                        <hr/>
                        <h5>Шалгалтанд орох  оюутны жагсаалт</h5>
                        <Table responsive color="primary" bordered>
                            <thead>
                                <tr>
                                    <th>№</th>
                                    <th>Код</th>
                                    <th>Овог</th>
                                    <th>Нэр</th>
                                    <th>Регистр</th>
                                    <th>Дүн</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    challengeStudents?.map((student, idx) =>
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td>{student?.code}</td>
                                            <td>{student?.last_name}</td>
                                            <td>{student?.first_name}</td>
                                            <td>{student?.register_num}</td>
                                            <td>{student?.total_score}</td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </Table>
                    </Col>
                    <Col md={12} className='d-flex justify-content-between mt-3 mb-1'>
                        <Button color='secondary' className='btn-prev' outline onClick={() => stepper.previous()}>
                            <ChevronLeft size={14} className='align-middle me-sm-25 me-0'></ChevronLeft>
                            <span className='align-middle d-sm-inline-block d-none'>Өмнөх</span>
                        </Button>
                        <Button color='primary' className='btn-next' type="submit">
                            <span className='align-middle d-sm-inline-block d-none' onClick={() => handleSubmit()}>Хадгалах</span>
                            <ChevronRight size={14} className='align-middle ms-sm-25 ms-0'></ChevronRight>
                        </Button>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    )
}
