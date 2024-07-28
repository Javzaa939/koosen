// OnlineLessonRoutes.js

import { lazy } from "react";

const LessonMaterial = lazy(() => import("@views/OnlineLesson/LessonMaterial"));
const DetailPage = lazy(() => import("@views/OnlineLesson/LessonMaterial/DetailPage"));
const ExamPage = lazy(() => import("@src/views/OnlineLesson/OnlineWeek/LessonMenus/Exam"));
const LessonNotficationPage = lazy(() => import("@src/views/OnlineLesson/OnlineWeek/LessonMenus/LessonNotfication"));
const StatsPage = lazy(() => import("@src/views/OnlineLesson/OnlineWeek/LessonMenus/Stats"));
const OnlineLessonPage = lazy(() =>
  import("@src/views/OnlineLesson/OnlineWeek/index")
);
const MainPage = lazy(() => import("@views/OnlineLesson/index"));

const OnlineLessonRoutes = [
  {
    path: "/online_lesson/material",
    element: <LessonMaterial />,
  },
  {
    path: "online_lesson/material/detail/:index",
    element: <DetailPage />,
  },
  {
    path: "/online_lesson/",
    element: <MainPage />,
  },
  {
    path: "online_lesson/:index/material/",
    element: <LessonMaterial />,
  },
  {
    path: "online_lesson/:index/",
    element: <OnlineLessonPage />,
  },
  {
    path: "/online_lesson/:index",
    element: <OnlineLessonPage />,
  },
  {
    path: "/online_lesson/:index/exam",
    element: <ExamPage />,
  },
  {
    path: "/online_lesson/:index/notf",
    element: <LessonNotficationPage />,
  },
  {
    path: "/online_lesson/:index/stats",
    element: <StatsPage />,
  },
  {
    path: "online_lesson/:index/files/:index",
    element: <DetailPage />,
  },
];

export default OnlineLessonRoutes;
