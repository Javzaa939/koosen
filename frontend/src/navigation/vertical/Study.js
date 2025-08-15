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
        ],
    },
];
