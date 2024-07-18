// OnlineLessonRoutes.js

import { lazy } from "react";

const LessonMaterial = lazy(() => import("@views/OnlineLesson/LessonMaterial"));
const DetailPage = lazy(() => import("@views/OnlineLesson/LessonMaterial/DetailPage"));

const OnlineLessonRoutes = [
  {
    path: "/online_lesson/material",
    element: <LessonMaterial />,
  },
  {
    path: "online_lesson/material/detail/:index",
    element: <DetailPage />,
  }
];

export default OnlineLessonRoutes;
