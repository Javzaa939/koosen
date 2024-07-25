import AuthContext from "@src/utility/context/AuthContext";
import useApi from "@src/utility/hooks/useApi";
import { useContext, useEffect, useState } from "react";
import AllLessons from "./AllLessons";

function OnlineLesson() {
	// States
	const [lessons, setLessons] = useState([]);
	const [isLoading, setIsLoading] = useState(true);	
	// APi
	const onlineLessonApi = useApi().online_lesson;
	const studyApi = useApi().study.lessonStandart;
	const userApi = useApi().user;
	const { loading, user, setUser, menuVisibility, setMenuVisibility } = useContext(AuthContext);

	const getLessons = async () => {
    try {
    	const response = await onlineLessonApi.get_lessons();
		// console.log(response)
		// const names = await Promise.all(
		// 	response.map(async (item) => {
		// 	const lessonStandartResponse = await studyApi.getOne(item.lesson);
		// 	return {
		// 		...item,
		// 		standartid: item?.lesson,
		// 		name: lessonStandartResponse?.data?.name,
		// 		credit: lessonStandartResponse?.data?.kredit,
		// 	};
		// 	})
		// );

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
        <AllLessons lessons={lessons} />;
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