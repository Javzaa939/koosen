// ** Icons Import
import { Circle } from 'react-feather'

// All menu for student login in one place
export default [
    {
        id: 'lesson',
        title: 'Cургалт',
        icon: <i className="fal fa-book"></i>,
        navLink: "/lesson",
        children: [

            {
                id: 'lesson-schedule',
                title: 'Хичээлийн хуваарь',
                icon: <Circle size={8} />,
                navLink: "user-student/lesson/lesson-schedule/"
            },
            {
                id: 'examination-schedule',
                title: 'Шалгалтын хуваарь',
                icon: <Circle size={8} />,
                navLink: "user-student/lesson/examination-schedule"
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
                navLink: "user-student/student/offer-study-plan"
            },
            {
                id: 'score-teacher',
                title: 'Явцын дүн',
                icon: <Circle size={8} />,
                navLink: "user-student/student/score-teacher/"
            },
            {
                id: 'score-information',
                title: 'Дүнгийн мэдээлэл',
                icon: <Circle size={8} />,
                navLink: "user-student/student/score-information/"
            },
            {
                id: "student-attendance",
                title: "Оюутны ирц",
                icon: <Circle size={8} />,
                navLink: "user-student/student/student-attendance/"
            },
            {
                id: 'student-graduation',
                title: 'Төгсөлт',
                icon: <Circle size={8} />,
                navLink: "user-student/student/graduate/",
            }
        ]
    },

]
