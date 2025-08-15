import { Fragment } from 'react';
import { useKeenSlider } from 'keen-slider/react';

import '../style.css';
import { Button, Col, Row } from 'reactstrap';

import Group from '../Group';
import Student from '../Student';
import StudentCourse from '../StudentCourse';
import StudentProfession from '../StudentProfession';
import StudentProvince from '../StudentProvince';
import StudentSchool from '../StudentSchool';
import { t } from 'i18next';
import { SkipBackIcon } from 'lucide-react';
import { SkipForward } from 'react-feather';

export default function ReportGroupGender() {
    // ** Hook
    const [sliderRef, instanceRef] = useKeenSlider();

    return (
        <Fragment>
            <div className="order-2" style={{ marginBottom: '1rem' }}>
                <Button
                    color="primary"
                    outline
                    size="sm"
                    style={{ cursor: 'pointer', margin: '0.5rem' }}
                    onClick={(e) => e.stopPropagation() || instanceRef.current?.prev()}
                >
                    <SkipBackIcon />
                    <span className="align-middle">{t('Өмнөх')}</span>
                </Button>
                <Button
                    color="primary"
                    outline
                    size="sm"
                    style={{ cursor: 'pointer', margin: '0.5rem' }}
                    onClick={(e) => e.stopPropagation() || instanceRef.current?.next()}
                >
                    <span className="align-middle ms-50">{t('Дараах')}</span>
                    <SkipForward />
                </Button>
            </div>
            <div
                ref={sliderRef}
                className='keen-slider order-3 w-100 mt-2"'
                style={{ maxHeight: '416px' }}
            >
                <div className="keen-slider__slide">
                    <Row>
                        <Col md={12} lg={12} xl={12} xs={12}>
                            <Student />
                        </Col>
                    </Row>
                </div>
                <div className="keen-slider__slide">
                    <Group />
                </div>
                <div className="keen-slider__slide">
                    <Row>
                        <Col md={12} lg={12} xl={12} xs={12}>
                            <StudentProfession />
                        </Col>
                    </Row>
                </div>
                <div className="keen-slider__slide">
                    <Row>
                        <Col md={12} lg={12} xl={12} xs={12}>
                            <StudentCourse />
                        </Col>
                    </Row>
                </div>
                <div className="keen-slider__slide">
                    <Row>
                        <Col md={12} lg={12} xl={12} xs={12}>
                            <StudentSchool />
                        </Col>
                    </Row>
                </div>
                <div className="keen-slider__slide">
                    <Row>
                        <Col md={12} lg={12} xl={12} xs={12}>
                            <StudentProvince />
                        </Col>
                    </Row>
                </div>
                <div className="keen-slider__slide">
                    <Row>
                        <Col md={12} lg={12} xl={12} xs={12}>
                            <Student currentYear={true} />
                        </Col>
                    </Row>
                </div>
            </div>
        </Fragment>
    );
}
