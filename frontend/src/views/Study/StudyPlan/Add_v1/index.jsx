import React, { useEffect, useState } from 'react';

import { Card, Row, Col, Form, Modal, ModalBody, ModalHeader } from 'reactstrap';

import { useTranslation } from 'react-i18next';

import useApi from "@hooks/useApi";
import useModal from '@hooks/useModal'
import useLoader from "@hooks/useLoader";

import classnames from 'classnames'

import Diplom from './Diplom';
import BasicLesson from './BasicLesson';
import ProfBasicLesson from './ProfBasicLesson';
import ProfessionLesson from './ProfessionLesson';

const StudyPlanAdd = ({ open, handleModal, mergejil_id }) => {

    const { t } = useTranslation()
    const { showWarning } = useModal()

    const [datas, setDatas] = useState({})
    const [is_basic_lesson, setBasicLesson] = useState(false)
    const [is_profbasic_lesson, setIsProfBasicLesson] = useState(false)
    const [is_profession_lesson, setIsProfessionLesson] = useState(false)
    const [is_diplom, setIsDiplom] = useState(false)
    const [degree, setDegree] = useState(1)

    // Loader
	const { isLoading, Loader, fetchData } = useLoader({});

    // Api
    const definationApi = useApi().study.professionDefinition

    async function getDatas() {
        if(mergejil_id) {
            const { success, data } = await fetchData(definationApi.getOne(mergejil_id))
            if(success) {
                if(data?.degree?.degree_name.toUpperCase() === 'БАКАЛАВР') {
                    setDegree(1)
                    setBasicLesson(true)
                } else if(data?.degree?.degree_name.toUpperCase() === 'МАГИСТР') {
                    setDegree(2)
                    setIsProfBasicLesson(true)
                } else if(data?.degree?.degree_name.toUpperCase() === 'ДОКТОР') {
                    setDegree(3)
                }
                setDatas(data)
            }
        }
    }

    useEffect(() => {
        getDatas()
    },[mergejil_id])

    function exitModal() {
        showWarning({
            header: {
                title: `${t('Буцах')}`,
            },
            question: `Та буцахдаа итгэлтэй байна уу? Хадгалахгүй буцсанаар таны хийсэн өөрчлөлтүүд хадгалагдахгүй болохыг анхаарна уу !!!`,
            onClick: () => handleModal(),
            btnText: 'Тийм',
        })
    }

    return (
        <Modal
            isOpen={open}
            toggle={handleModal}
            fullscreen
            className="modal-dialog-centered"
            onClosed={handleModal}
        >
            {isLoading && Loader}
            <ModalHeader className='bg-transparent pb-0' toggle={exitModal}></ModalHeader>
            <ModalBody className="flex-grow-1">
                <Card body>
                    <h4 className='text-center mb-3'>Сургалтын төлөвлөгөө</h4>
                    <Row tag={Form} md={12} className="gy-1">
                        <Col md={6}>
                            <Row tag="dl" className="mb-0">
                                <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                    Ерөнхий чиглэл:
                                </Col>
                                <Col tag="dd" sm="8" className="mb-1">{datas?.gen_direct_type_name}</Col>
                                <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                    Төрөлжсөн чиглэл:
                                </Col>
                                <Col tag="dd" sm="8" className="mb-1">{datas?.dep_name}</Col>
                                <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                    Нарийвчилсан чиглэл:
                                </Col>
                                <Col tag="dd" sm="8" className="mb-1" >{datas?.name}</Col>
                                <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                    Хөтөлбөрийн нэр:
                                </Col>
                                <Col tag="dd" sm="8" className="mb-1" >{datas?.name}</Col>
                            </Row>
                        </Col>
                        <Col md={6}>
                            <Row tag="dl" className="mb-0">
                                <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                    Индекс:
                                </Col>
                                <Col tag="dd" sm="8" className="mb-1" >{datas?.code}</Col>
                                <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                    Суралцах хэлбэр:
                                </Col>
                                <Col tag="dd" sm="8" className="mb-1">Өдөр</Col>
                                <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                    Суралцах хугацаа:
                                </Col>
                                <Col tag="dd" sm="8" className="mb-1" >4 жил</Col>
                                <Col tag="dt" sm="4" className="fw-bolder mb-1" >
                                    Боловсролын зэрэг:
                                </Col>
                                <Col tag="dd" sm="8" className="mb-1" >{datas?.degree?.degree_name}</Col>
                            </Row>
                        </Col>
                        {
                            degree === 1 &&
                            <>
                                <div className='added-cards'>
                                    <div className={classnames('cardMaster rounded border p-1')} role="button" id="toggler" onClick={() => setBasicLesson(!is_basic_lesson)}>
                                        1. Дээд боловсролын суурь хичээл
                                        {datas?.general_base && <a className='ms-1 fw-bolder'>({datas?.general_base})</a>}
                                    </div>
                                </div>
                                {
                                    is_basic_lesson &&
                                    <BasicLesson datas={datas} isOpen={is_basic_lesson} mergejil_id={mergejil_id} degree={degree}/>
                                }
                            </>
                        }
                        <div className='added-cards'>
                            <div className={classnames('cardMaster rounded border p-1')} role="button" id="toggler2" onClick={() => setIsProfBasicLesson(!is_profbasic_lesson)}>
                                { degree === 1 ? 2 : 1}{'. ' + 'Мэргэжлийн суурь хичээл'}
                                {datas?.professional_base && <a className='ms-1 fw-bolder'>({datas?.professional_base})</a>}
                            </div>
                        </div>
                        {
                            is_profbasic_lesson &&
                            <ProfBasicLesson datas={datas} isOpen={is_profbasic_lesson} mergejil_id={mergejil_id} degree={degree} />
                        }
                        <div className='added-cards'>
                            <div className={classnames('cardMaster rounded border p-1')} role="button" id="toggler3" onClick={() => setIsProfessionLesson(!is_profession_lesson)}>
                                { degree === 1 ? 3 : 2}{'. ' + 'Мэргэжлийн хичээл'}
                                {datas?.professional_lesson && <a className='ms-1 fw-bolder'>({datas?.professional_lesson})</a>}
                            </div>
                        </div>
                        {
                            is_profession_lesson &&
                            <ProfessionLesson datas={datas} isOpen={is_profession_lesson} mergejil_id={mergejil_id} degree={degree} />
                        }
                        <div className='added-cards' onClick={() => setIsDiplom(!is_diplom)}>
                            <div className={classnames('cardMaster rounded border p-1')} role="button" id="toggler4">
                                {
                                    degree === 1
                                    ?
                                        '4. Диплом'
                                    :
                                        degree === 2
                                    ?
                                        '3. Эрдэм шинжилгээ, судалгааны ажил, мэргэжлийн шалгалт'
                                    :
                                        '3. Эрдэм шинжилгээ, судалгааны ажил'
                                }
                            </div>
                        </div>
                        {
                            is_diplom &&
                            <Diplom datas={datas} isOpen={is_diplom} mergejil_id={mergejil_id} degree={degree} />
                        }
                    </Row>
                </Card>
            </ModalBody>
        </Modal>
    );
};

export default StudyPlanAdd;
