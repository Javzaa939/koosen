import { Circle } from "react-feather";
import React from "react";

const OnlineLessonRoutes = [
  {
    id: "onlinelesson",
    title: "Онлайн хичээл",
    icon: <i className="far fa-user"></i>,
    navLink: "/online_lesson",
    navChildren:[
      {
        id:'onlinelesson1',
        title:'Хичээлийн материал',
        icon: <Circle size={8} />,
        navLink:"online_lesson/material"
      },
      {
        id:'onlinelesson2 ',
        title:'Хичээлийн материал',
        icon: <Circle size={8} />,
        navLink:"online_lesson/page"
      }
    ]
  },
];

export default OnlineLessonRoutes;
