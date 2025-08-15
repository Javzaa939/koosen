import { ListChecksIcon, Circle } from 'lucide-react';

export default [
    {
        id: 'survey',
        title: 'Судалгаа',
        icon: <ListChecksIcon />,
        navLink: '/survey',
        navChildren: [
            {
                id: 'takesurvey',
                title: 'Судалгааны жагсаалт',
                icon: <Circle size={8} />,
                navLink: 'survey/surveymain',
            },
            {
                id: 'surveyreg',
                title: 'Үр дүн',
                icon: <Circle size={8} />,
                navLink: 'survey/results/',
            },
        ],
    },
];
