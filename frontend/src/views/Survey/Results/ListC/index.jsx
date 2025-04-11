import React from "react";
import { useNavigate } from "react-router-dom"

import {
  CardBody,
  CardTitle,
  Badge,
  CardFooter,
  CardHeader,

} from "reactstrap";

import "../style.css";

import { Chart as
    ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    ArcElement,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
);

import './list.css'
import DisplayQuill from "../../SurveyMain/Detail/components/DisplayQuill";

const KIND_STUDENT = 8;
const KIND_TEACHER = 5;

function ListC(props) {

    const dataa = props.datas;

    function TeacherBadge() {
        return <Badge color="light-success" pill>Багш</Badge>;
    }

    function StudentBadge() {
        return <Badge color="light-info" pill>Оюутан</Badge>;
    }

	const navigate = useNavigate()

    const handleNavigate = (id) => {
		navigate(`/survey/results/resultdetail/${id}/`)
	}

	return dataa.map((data, idx) => (
			<div className="customcard shadow-lg  cursor-pointer" key={`survey-${idx}`} id={`surveycard-${idx}`} onClick={() => handleNavigate(data?.id)}>
                <CardHeader>
                    <CardTitle tag="h5">{data.title}</CardTitle>
                </CardHeader>
                <CardBody>
                        Хамрах хүрээ: <br></br>
                        <div>
                            {data.scope_kind === KIND_STUDENT && (
                                <div className="">
                                    <StudentBadge />
                                </div>
                            )}
                            {data.scope_kind === KIND_TEACHER && (
                                <div className="">
                                    <TeacherBadge />
                                </div>
                            )}
                        </div>
                    <CardFooter className="ps-0 mt-1 customscroll" style={{ maxHeight: '200px', overflow: 'scroll' }}>
                        <DisplayQuill content={data.description} />
                    </CardFooter>
                </CardBody>
		    </div>
	));
}

export default ListC;