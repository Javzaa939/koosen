// ** Icons Import
import { Circle } from 'react-feather'

export default [
    {
        id: 'student',
        title: 'Оюутан',
        icon: <i className="fas fa-user-graduate"></i>,
        navLink: "/student",
        navChildren: [
            {
                id: 'student1',
                title: 'Анги бүлгийн бүртгэл',
                icon: <Circle size={8} />,
                navLink: "student/group/"
            },
            {
                id: 'student2',
                title: 'Оюутны бүртгэл',
                icon: <Circle size={8} />,
                navLink: "student/register"
            },
            {
                id: 'student3',
                title: 'Чөлөөний бүртгэл',
                icon: <Circle size={8} />,
                navLink: "student/leave/"
            },
            {
                id: 'student4',
                title: 'Шилжилт хөдөлгөөний бүртгэл',
                icon: <Circle size={8} />,
                navLink: "student/shift"
            },
            {
                id: 'student5',
                title: 'Төгсөлт',
                icon: <Circle size={8} />,
                navLink: "student/graduation"
            },
            {
                id: 'student10',
                title: 'Хавсралт',
                icon: <Circle size={8} />,
                navLink: "student/attachment"
            },
            {
                id: 'student7',
                title: 'Боловсролын зээлийн сан',
                icon: <Circle size={8} />,
                navLink: "student/educational-loan-fund"
            },
            {
                id: 'student11',
                title: 'Тодорхойлолт',
                icon: <Circle size={8} />,
                navLink: "student/specification"
            },
            // {
            //     id: 'student12',
            //     title: 'Виз',
            //     icon: <Circle size={8} />,
            //     navLink: "student/viz-status"
            // },
            // {
            //     id: 'student12',
            //     title: 'Дотуур байранд амьдрах хүсэлт',
            //     icon: <Circle size={8} />,
            //     navLink: "student/dormitory"
            // },
        ]
    }
]
