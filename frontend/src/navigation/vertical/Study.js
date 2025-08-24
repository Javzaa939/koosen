// ** Icons Import
import { BookOpenCheckIcon, Circle } from 'lucide-react';

export default [
    {
        id: 'study',
        title: 'Сургалт',
        icon: <BookOpenCheckIcon />,
        navLink: '/study',
        navChildren: [
            {
                id: 'study1',
                title: 'Хичээлийн стандарт',
                icon: <Circle size={8} />,
                navLink: 'study/lessonStandart/',
            },
            {
                id: 'study2',
                title: 'Хөтөлбөр',
                icon: <Circle size={8} />,
                navLink: 'study/profession-definition/',
            },
            {
                id: 'lesson-schedule',
                title: 'Хичээлийн хуваарь',
                icon: <Circle size={8} />,
                navLink: "lesson/lesson-schedule/"
            },
            {
                id: 'examination-schedule',
                title: 'Шалгалтын хуваарь',
                icon: <Circle size={8} />,
                navLink: "lesson/examination-schedule"
            },
            // {
            //     id: 'study-plan',
            //     title: 'Сургалтын төлөвлөгөө',
            //     icon: <Circle size={8} />,
            //     navLink: "student/study-plan"
            // },
            {
                id: 'offer-study-plan',
                title: 'Өвөл зуны сургалт',
                icon: <Circle size={8} />,
                navLink: "student/offer-study-plan"
            },
            {
                id: 'score-teacher',
                title: 'Явцын дүн',
                icon: <Circle size={8} />,
                navLink: "student/score-teacher/"
            },
            {
                id: 'score-information',
                title: 'Дүнгийн мэдээлэл',
                icon: <Circle size={8} />,
                navLink: "student/score-information/"
            },
            {
                id: "student-attendance",
                title: "Оюутны ирц",
                icon: <Circle size={8} />,
                navLink: "student/student-attendance/"
            },
            {
                id: 'student-graduation',
                title: 'Төгсөлт',
                icon: <Circle size={8} />,
                navLink: "student/graduate/",
            }
        ],
    },
];
