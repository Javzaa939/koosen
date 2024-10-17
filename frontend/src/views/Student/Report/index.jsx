import { Fragment } from 'react'
import { useKeenSlider } from 'keen-slider/react'

import { Icon } from '@iconify/react'

import './style.css'
import { Button, Col, Row } from 'reactstrap'

import Group from './Group'
import Student from './Student'
import StudentCourse from './StudentCourse'
import StudentProfession from './StudentProfession'
import StudentProvince from './StudentProvince'
import StudentSchool from './StudentSchool'

const Report = () => {
	// ** Hook
	const [sliderRef, instanceRef] = useKeenSlider()

	return (
		<Fragment>
			<div style={{ display: 'flex', justifyContent: 'end', marginBottom: '1rem'}}>
                <Button color='primary' outline size='sm' style={{ cursor: 'pointer', margin: '0.5rem' }} onClick={e => e.stopPropagation() || instanceRef.current?.prev()}>
                    <Icon
                        icon='tabler:chevron-left'
                    />
                    <span className='align-middle ms-50'>Өмнөх</span>
                </Button>
                <Button color='primary' outline size='sm' style={{ cursor: 'pointer', margin: '0.5rem' }} onClick={e => e.stopPropagation() || instanceRef.current?.next()}>
                    <span className='align-middle ms-50'>Дараах</span>
                    <Icon
                        icon='tabler:chevron-right'
                    />
                </Button>
			</div>
            <div ref={sliderRef} className='keen-slider' style={{ maxHeight: '416px' }}>
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
  	)
}

export default Report