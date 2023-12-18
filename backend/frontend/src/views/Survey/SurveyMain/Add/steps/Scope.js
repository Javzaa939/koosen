import React, { Fragment, useState, useEffect } from 'react'
import {
    Row,
    Col,
    Button,
} from "reactstrap";

import { ChevronLeft, ChevronRight, Feather, BookOpen, Target } from "react-feather"

import Student from "./hamrah/Student"
import Teacher from "./hamrah/Teacher"

import './transition.css'

const SCOPE_KIND_ALL = 7
const SCOPE_KIND_OYUTAN = 8
const SCOPE_KIND_EMPLOYEE = 5

const Scope = ({ setSubmitDatas, stepper, data, editData }) => {

    // Api
    const [choice, setChoice] = useState('');
    const [chosenScope, setChosenScope] = useState([])
    const [ buttonTheme, setButtonTheme ] = useState('primary')

    const handleChoice = (selectedChoice) => {
        setChoice(selectedChoice);
    };

    const handleChosenScopeChange = (newData) => {
        setChosenScope(newData);
    };

    function handleNextButton(){
        setSubmitDatas(chosenScope)
        stepper.next()
    }

    function setAllStudent() {
		const newData = {'is_all': true};

		setSubmitDatas(newData);
        stepper.next()
	}

    useEffect(
        () =>
        {
            if (Object.keys(editData).length > 0) {
                if (editData?.scope_kind === SCOPE_KIND_ALL) {
                    setChoice('is_all')
                } else if (editData?.scope_kind === SCOPE_KIND_OYUTAN) {
                    setChoice('student')
                } else if (editData?.scope_kind === SCOPE_KIND_EMPLOYEE) {
                    setChoice('teacher')
                }
            }

        },
        [editData]
    )

    function skin_detector() {
        if (window.localStorage.skin === '"dark"') {
            return 'light'
        } else {
            return 'primary'
        }
    }

    useEffect(()=>{
        if (window.localStorage.skin === '"dark"') {
            setButtonTheme('light')
        } else {
            setButtonTheme('primary')
        }
    },[])

    return (
            <Fragment>
                <Row>
                    <Col className="min-height-800px">
                        <div className='d-flex justify-content-center flex-wrap align-items-center mb-1'>
                            <div>
                                <Button
                                    onClick={() => handleChoice('teacher')}
                                    outline
                                    color={buttonTheme}
                                    className={`button-transition p-3 m-1 ${choice === 'teacher' ? 'active' : ''}`}
                                >
                                    Багш <BookOpen/>
                                </Button>
                            </div>
                            <div>
                                <Button
                                    onClick={() => handleChoice('student')}
                                    outline
                                    color={buttonTheme}
                                    className={`button-transition p-3 m-1 ${choice === 'student' ? 'active' : ''}`}
                                >
                                    Оюутан <Feather/>
                                </Button>
                            </div>
                            <div>
                                <Button
                                    onClick={() => { setAllStudent()}}
                                    outline
                                    color={buttonTheme}
                                    className={`button-transition p-3 m-1 ${choice === 'is_all' ? 'active' : ''}`}
                                >
                                    Бүгд
                                    <Target className='ms-1'/>
                                </Button>
                            </div>
                        </div>

                        {choice === 'student' && <Student onChosenScopeChange={handleChosenScopeChange} editData={editData}/>}
                        {choice === 'teacher' && <Teacher onChosenScopeChange={handleChosenScopeChange} editData={editData}/>}

                    </Col>
                </Row>
                <Col md={12} className="text-center mt-2">
                    <div className='d-flex justify-content-between mt-3'>
                        <Button color='secondary' className='btn-prev' outline onClick={() => stepper.previous()}>
                            <ChevronLeft size={14} className='align-middle me-sm-25 me-0'></ChevronLeft>
                            <span className='align-middle d-sm-inline-block d-none'>Өмнөх</span>
                        </Button>
                        <Button color='primary' className='btn-next' onClick={handleNextButton}>
                            <span className='align-middle d-sm-inline-block d-none'>Дараах</span>
                            <ChevronRight size={14} className='align-middle ms-sm-25 ms-0'></ChevronRight>
                        </Button>
                    </div>
                </Col>
            </Fragment>
    )
}
export default Scope;


