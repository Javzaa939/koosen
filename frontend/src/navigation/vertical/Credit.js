// ** Icons Import
import { ClipboardClockIcon, Circle } from 'lucide-react';

export default [
    {
        id: 'credit',
        title: 'Цагийн тооцоо',
        icon: <ClipboardClockIcon />,
        navLink: '/credit',
        navChildren: [
            {
                id: 'credit3',
                title: 'Хичээл тулгалт',
                icon: <Circle size={8} />,
                navLink: 'credit/confrontation',
            },
            {
                id: 'credit1',
                title: 'Цагийн ачаалал',
                icon: <Circle size={8} />,
                navLink: 'credit/volume',
            },
            {
                id: 'credit2',
                title: 'А цагийн тооцоо',
                icon: <Circle size={8} />,
                navLink: 'credit/a_estimation',
            },
            {
                id: 'credit5',
                title: 'Цагийн багшийн тооцоо',
                icon: <Circle size={8} />,
                navLink: 'credit/part-time',
            },
            {
                id: 'credit4',
                title: 'Цагийн тооцоо тохиргоо',
                icon: <Circle size={8} />,
                navLink: 'credit/settings',
            },
        ],
    },
];
