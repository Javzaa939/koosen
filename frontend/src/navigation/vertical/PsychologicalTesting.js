
// import { Circle } from 'react-feather'
// export default [
//     {
//         id: 'psychologicaltesting',
//         title: 'Сэтгэлзүйн сорил',
//         icon: <i className="fas fa-user-graduate"></i>,
//         navLink: "/psychologicaltesting",
//         navChildren: [
//             {
//                 id: 'psychologicaltesting0',
//                 title: 'Сорилын асуулт',
//                 icon: <Circle size={8} />,
//                 navLink: "psychologicaltesting/create_questions"
//             },
//             {
//                 id: 'psychologicaltesting1',
//                 title: 'Сэтгэлзүйн сорил',
//                 icon: <Circle size={8} />,
//                 navLink: "psychologicaltesting/exam"
//             },
//         ]
//     }
// ]

import { Circle, UserCheck } from 'react-feather'

export default [
    {
        id: 'psychologicaltesting',
        title: 'Сэтгэлзүйн сорил',
        icon: <UserCheck size={20} />,
        navLink: "/psychologicaltesting",
        navChildren: [
            {
                id: 'psychologicaltesting0',
                title: 'Сорилын асуулт',
                icon: <Circle size={8} />,
                navLink: "psychologicaltesting/create_questions/"
            },
            {
                id: 'psychologicaltesting1',
                title: 'Сэтгэлзүйн сорил',
                icon: <Circle size={8} />,
                navLink: "psychologicaltesting/exam"
            },
            {
                id: 'psychologicaltesting2',
                title: 'Үр дүн',
                icon: <Circle size={8} />,
                navLink: "psychologicaltesting/result"
            },
        ]
    }
]