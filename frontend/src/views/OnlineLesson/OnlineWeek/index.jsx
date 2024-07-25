import useApi from "@src/utility/hooks/useApi";
import { useEffect, useState } from "react";
import { BiArrowToLeft } from "react-icons/bi";
import { IoMdRefresh } from "react-icons/io";
import { Link, useParams } from "react-router-dom";
import { Button, Card, CardBody, CardHeader, Col, Row } from "reactstrap";

import LessonTable from "./LessontTable";

import CreateWeek from "./CreateWeek";

const menuOptions = [
	{
		name: "Зарлал",
		option: 1,
	},
	{
		name: "Хичээлийн 7 хоног",
		option: 3,
	},
	{
		name: "Шалгалт",
		option: 6,
	},
	{
		name: "Хичээлийн материал",
		option: 4,
	},
	{
		name: "Суралцагчдын гүйцэтгэл ",
		option: 5,
	},
	{
		name: "засвар оруулах",
		option: 2,
	},
];

function OnlineLessonPage() {
  // States
  	const [selectedContent, setSelectedContent] = useState(1);
  	const [lesson, setLesson] = useState(null);
  	const [lessonStandart, setLessonStandart] = useState(null);

  	// API
  	const onlineLessonApi = useApi().online_lesson;
  	const studyApi = useApi().study.lessonStandart;

  	// Hooks
  	const { index: lessonId } = useParams();

  	// Хичээлийн мэдээлэл
  	const getLesson = async () => {
		try {
			const res = await onlineLessonApi.getOne(lessonId);
			setLesson(res);
		} catch (error) {
			console.error("Failed to fetch lesson:", error);
		}
  	};

 	const getLessonStandart = async () => {
		try {
			const res = await studyApi.getOne(lesson?.lesson);
			setLessonStandart(res.data);
		} catch (error) {
		}
  	};

	useEffect(() => {
	  getLesson();
	},
	[lessonId]
	);

	useEffect(() => {
    	if (lesson) {
			getLessonStandart();
    	}
	},
	[lesson]
	);

  const refresh = () => {
    getLesson();
  };

  return (
    <div className="d-flex flex-row w-100">
		<Card className="w-100">
			<CardHeader className="p-1 w-100">
				<div className="d-flex flex-row justify-content-between w-100">
					<Link to="/online_lesson">
						<Button outline size="md">
						<BiArrowToLeft size={16} />
						</Button>
					</Link>
					<div className="col-10 p-0">
						<h4 className="m-0">{lessonStandart?.name}</h4>
						<span className="">кредит: {lessonStandart?.kredit}</span>
					</div>
					<div>
						<CreateWeek/>
					</div>
					<div className="col-1 p-0 d-flex justify-content-end">
						<Button outline size="sm" onClick={refresh}>
							<IoMdRefresh />
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardBody className="m-0 p-0">
				<Row className="m-0 p-0">
					{menuOptions.map((item, index) => (
						<Col xl={3} md={6} className="mb-0 cursor-pointer" key={index}>
							<Card className="border rounded-lg shadow-sm">
								<CardBody onClick={() => setSelectedContent(item.option)}>
									<div className="d-flex justify-content-between">
										<h4>{item.name}</h4>
									</div>
								</CardBody>
							</Card>
						</Col>
					))}
				</Row>
				<LessonTable lesson={lesson} selectedContent={selectedContent} />
			</CardBody>
		</Card>
    </div>
  );
}

export default OnlineLessonPage;