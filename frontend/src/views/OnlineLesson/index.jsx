import useApi from "@src/utility/hooks/useApi";
import { useEffect, useState } from "react";
import AllLessons from "./AllLessons";
import useLoader from "@src/utility/hooks/useLoader";

function OnlineLesson() {
	// States
	const [lessons, setLessons] = useState([]);
	const { fetchData, isLoading } = useLoader({})

	// API
	const onlineLessonApi = useApi().online_lesson;

	const getLessons = async () => {
		const { success, data } = await fetchData(onlineLessonApi.get_lessons());
		if (success) {
			setLessons(data)
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