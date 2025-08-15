// ** Icons Import
import { ContactIcon, Circle } from 'lucide-react';

export default [
    {
        id: 'reference',
        title: 'Лавлах сан',
        icon: <ContactIcon />,
        navLink: '/reference',
        navChildren: [
            {
                id: 'reference0',
                title: 'Сургууль',
                icon: <Circle size={8} />,
                navLink: 'reference/school/',
            },
            {
                id: 'reference1',
                title: 'Салбар сургуулиуд',
                icon: <Circle size={8} />,
                navLink: 'reference/subschool/',
            },
            {
                id: 'reference2',
                title: 'Салбар / Тэнхим',
                icon: <Circle size={8} />,
                navLink: 'reference/departments/',
            },
            {
                id: 'reference4',
                title: 'Албан тушаал',
                icon: <Circle size={8} />,
                navLink: 'reference/position/',
            },
            {
                id: 'reference3',
                title: 'Багш / Ажилчид',
                icon: <Circle size={8} />,
                navLink: 'reference/teachers/',
            },
        ],
    },
];
