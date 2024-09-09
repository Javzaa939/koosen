import { Circle } from "react-feather";
import React from "react";
import { MdPlayLesson } from "react-icons/md";
const OnlineLessonRoutes = [
  {
    id: "onlinelesson",
    title: "Онлайн хичээл",
    icon: <MdPlayLesson />,
    navLink: "/online_lessons",
    navChildren:[
      {
        id: "onlinelesson1",
        title: "Хичээлүүд",
        icon: <Circle size={8} />,
        navLink: "online_lesson",
      },
      {
        id:'onlinelesson2',
        title:'Хичээлийн материал',
        icon: <Circle size={8} />,
        navLink:"material"
      },
    ]
  },
];

export default OnlineLessonRoutes;
