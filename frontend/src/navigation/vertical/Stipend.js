// ** Icons Import
import { AwardIcon, Circle } from 'lucide-react';

export default [
    {
        id: 'stipend',
        title: 'Тэтгэлэг',
        icon: <AwardIcon />,
        navLink: '/stipend',
        navChildren: [
            {
                id: 'stipend1',
                title: 'Тэтгэлэгийн бүртгэл',
                icon: <Circle size={8} />,
                navLink: 'stipend/register/',
            },
            {
                id: 'stipend2',
                title: 'Тэтгэлэг хүсч буй оюутны жагсаалт',
                icon: <Circle size={8} />,
                navLink: 'stipend/request/',
            },
        ],
    },
];
