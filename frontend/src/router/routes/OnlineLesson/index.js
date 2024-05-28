import { lazy } from "react";

const OnlineLesson = lazy(() => import("@views/OnlineLesson/index"));
const OnlineLessonPage = lazy(() =>
  import("@views/OnlineLesson/OnlineLessonPage/index")
);
const OnlineLessonRoutes = [
  {
    path: "online_lesson/",
    element: <OnlineLesson />,
  },
];

export default OnlineLessonRoutes;
