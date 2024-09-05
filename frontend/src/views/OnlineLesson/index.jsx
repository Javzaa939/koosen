import useApi from "@src/utility/hooks/useApi";
import { useEffect, useState } from "react";
import AllLessons from "./AllLessons";

function OnlineLesson() {
	// States
	const [lessons, setLessons] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	// API
	const onlineLessonApi = useApi().online_lesson;

	const getLessons = async () => {
		try {
			const response = await onlineLessonApi.get_lessons();
			setLessons(response);
			setIsLoading(false);
		} catch (error) {
			console.error("Error fetching lessons or lesson names:", error);
			setIsLoading(false);
		}
  	};

	useEffect(() => {
		getLessons();
	}, []);

	if (isLoading) {
		return <LoadingSkelethon />;
	} else {
		return (
			<>
				<AllLessons lessons={lessons} getLessons={getLessons}/>;
			</>
		);
	}
}

export default OnlineLesson;

function LoadingSkelethon() {
	return (
		<>
		<div className="card" aria-hidden="true">
			<h1 className="card-title placeholder-glow">
				<span className="placeholder col-12"></span>
			</h1>
		</div>
		</>
	);
}