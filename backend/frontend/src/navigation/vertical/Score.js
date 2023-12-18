// ** Icons Import
import { Circle } from 'react-feather'

export default [
    {
        id: 'score',
        title: 'Дүнгийн бүртгэл',
        icon: <i className="far fa-award"></i>,
        navLink: "/score",
        children: [
            {
                id: 'score1',
                title: 'Дүнгийн бүртгэл',
                icon: <Circle size={8} />,
                navLink: "score/score-register/"
            },
            {
                id: 'score2',
                title: 'Дүйцүүлсэн дүн',
                icon: <Circle size={8} />,
                navLink: "score/correspond/"
            },
            {
                id: 'score3',
                title: 'Дахин шалгалтын дүн',
                icon: <Circle size={8} />,
                navLink: "score/re-examscore/"
            },
            {
                id: 'score4',
                title: 'Өмнөх улирлын дүн',
                icon: <Circle size={8} />,
                navLink: "score/preview-score/"
            }
        ]
    }
]
