import Weeks from "../Weeks/index";

import Announcement from "../Announcement";
import Plan from "../Plan";
import WeekExam from "../WeekExam";
import Performance from "../Performance";


const RenderLessonCards = ({ lesson }) => {
	return(
		<>
			<div>
				<Weeks lesson = { lesson }/>
			</div>
		</>
	)
}

const RenderAnnouncementList = ({ lesson }) => {

	return<>
		<div>
			<Announcement lesson = { lesson }/>
		</div>
	</>
}

const RenderExamForm = () => {
	return (
		<WeekExam/>
	)
}

const LessonTable = ({ lesson, selectedContent, getLesson }) => {
	const id = selectedContent;
	if (!id) return null;

	switch (id) {
		case 1:
			return <RenderAnnouncementList lesson={lesson} getLesson={getLesson}/>;
		case 2:
			return <Plan lesson={lesson} getLesson={getLesson}/>;
		case 3:
			return <RenderLessonCards lesson={lesson} getLesson={getLesson}/>;
		case 4:
			return <RenderExamForm getLesson={getLesson}/>;
		case 5:
			return <Performance lesson={lesson} getLesson={getLesson}/>
		default:
			return null;
	}
};

export default LessonTable;