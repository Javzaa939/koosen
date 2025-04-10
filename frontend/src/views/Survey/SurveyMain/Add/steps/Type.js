import { Fragment, useEffect, useState } from 'react';
import {
    Button,
    Col,
    Row,
} from "reactstrap";

import { BookOpen, ChevronLeft, ChevronRight, Feather } from "react-feather";
import { useTranslation } from 'react-i18next';
import './transition.css';


export default function Type({ setSubmitDatas, stepper, setSurveyType, surveyType }) {
    const { t } = useTranslation()
    const [buttonTheme, setButtonTheme] = useState('primary')

    const handleChoice = (selectedChoice) => {
        setSurveyType(selectedChoice)
    };

    function handleNextButton() {
        const stepDataForNextStep = { surveyType: surveyType }
        if (surveyType === 'satisfaction') stepDataForNextStep.isAllStudent = true
        setSubmitDatas(stepDataForNextStep)
        stepper.next()
    }

    useEffect(() => {
        if (window.localStorage.skin === '"dark"') {
            setButtonTheme('light')
        } else {
            setButtonTheme('primary')
        }
    }, [])

    return (
        <Fragment>
            <Row>
                <Col className="min-height-800px">
                    <div className='d-flex justify-content-center flex-wrap align-items-center mb-1'>
                        <div>
                            <Button
                                onClick={() => handleChoice('regular')}
                                outline
                                color={buttonTheme}
                                className={`button-transition p-3 m-1 ${surveyType === 'regular' ? 'active' : ''}`}
                            >
                                {t('Энгийн')} <BookOpen />
                            </Button>
                        </div>
                        <div>
                            <Button
                                onClick={() => handleChoice('satisfaction')}
                                outline
                                color={buttonTheme}
                                className={`button-transition p-3 m-1 ${surveyType === 'satisfaction' ? 'active' : ''}`}
                            >
                                {t('Сэтгэл ханамжийн')} <Feather />
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>
            <Col md={12} className="text-center mt-2">
                <div className='d-flex justify-content-between mt-3'>
                    <Button color='secondary' className='btn-prev' outline onClick={() => stepper.previous()}>
                        <ChevronLeft size={14} className='align-middle me-sm-25 me-0'></ChevronLeft>
                        <span className='align-middle d-sm-inline-block d-none'>{t('Өмнөх')}</span>
                    </Button>
                    <Button color='primary' className='btn-next' onClick={handleNextButton}>
                        <span className='align-middle d-sm-inline-block d-none'>{t('Дараах')}</span>
                        <ChevronRight size={14} className='align-middle ms-sm-25 ms-0'></ChevronRight>
                    </Button>
                </div>
            </Col>
        </Fragment>
    )
}
