import { Fragment } from 'react'
import { useKeenSlider } from 'keen-slider/react'
import { Icon } from '@iconify/react'
import '../style.css'
import { Button, Col, Row } from 'reactstrap'
import { t } from 'i18next'
import StudentPayment from '../StudentPayment'

export default function ReportGroupPayment() {
    // ** Hook
    const [sliderRef, instanceRef] = useKeenSlider()

    return (
        <Fragment>
            <div className='order-2' style={{ marginBottom: '1rem' }}>
                <Button color='primary' outline size='sm' style={{ cursor: 'pointer', margin: '0.5rem' }} onClick={e => e.stopPropagation() || instanceRef.current?.prev()}>
                    <Icon
                        icon='tabler:chevron-left'
                    />
                    <span className='align-middle ms-50'>{t('Өмнөх')}</span>
                </Button>
                <Button color='primary' outline size='sm' style={{ cursor: 'pointer', margin: '0.5rem' }} onClick={e => e.stopPropagation() || instanceRef.current?.next()}>
                    <span className='align-middle ms-50'>{t('Дараах')}</span>
                    <Icon
                        icon='tabler:chevron-right'
                    />
                </Button>
            </div>
            <div ref={sliderRef} className='keen-slider order-3 w-100 mt-2"' style={{ maxHeight: '416px' }}>
                <div className="keen-slider__slide">
                    <Row>
                        <Col md={12} lg={12} xl={12} xs={12}>
                            <StudentPayment template='school' />
                        </Col>
                    </Row>
                </div>
                <div className="keen-slider__slide">
                    <Row>
                        <Col md={12} lg={12} xl={12} xs={12}>
                            <StudentPayment template='department' />
                        </Col>
                    </Row>
                </div>
                <div className="keen-slider__slide">
                    <Row>
                        <Col md={12} lg={12} xl={12} xs={12}>
                            <StudentPayment template='profession' />
                        </Col>
                    </Row>
                </div>
                <div className="keen-slider__slide">
                    <Row>
                        <Col md={12} lg={12} xl={12} xs={12}>
                            <StudentPayment template='group' />
                        </Col>
                    </Row>
                </div>
            </div>
        </Fragment>
    )
}
