// ** Icons Import
import { Circle } from 'react-feather'

import { FaCalendarAlt } from 'react-icons/fa'

export default [
    {
        id: 'timetable',
        title: 'Цагийн хуваарь',
        icon: <FaCalendarAlt size={20} />,
        navLink: "/timetable",
        navChildren: [
            {
                id: 'timetable3',
                title: 'Хичээлийн хуваарь',
                icon: <Circle size={8} />,
                navLink: "timetable/register/"
            },
            {
                id: 'timetable4',
                title: 'Шалгалтын хуваарь',
                icon: <Circle size={8} />,
                navLink: "timetable/exam-register"
            },
            {
                id: 'timetable5',
                title: 'Дахин шалгалт',
                icon: <Circle size={8} />,
                navLink: "timetable/exam-re"
            }
        ]
    }
]
