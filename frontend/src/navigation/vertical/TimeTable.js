// ** Icons Import
import { CalendarClockIcon, Circle } from 'lucide-react';

export default [
    {
        id: 'timetable',
        title: 'Цагийн хуваарь',
        icon: <CalendarClockIcon />,
        navLink: '/timetable',
        navChildren: [
            {
                id: 'timetable3',
                title: 'Хичээлийн хуваарь',
                icon: <Circle size={8} />,
                navLink: 'timetable/register/',
            },
            {
                id: 'timetable4',
                title: 'Шалгалтын хуваарь',
                icon: <Circle size={8} />,
                navLink: 'timetable/exam-register',
            },
            {
                id: 'timetable5',
                title: 'Давтан шалгалт',
                icon: <Circle size={8} />,
                navLink: 'timetable/exam-re',
            },
        ],
    },
];
