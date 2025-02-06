// ** Icons Import
import { Circle } from 'react-feather'

export default [
    {
        id: 'score',
        title: 'Дүнгийн бүртгэл',
        icon: <i className="far fa-award"></i>,
        navLink: "/score",
        navChildren: [
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
                title: 'Дүнгийн нэгтгэл',
                icon: <Circle size={8} />,
                navLink: "score/preview-score/"
            },
            {
                id: 'score5',
                title: 'Явцын оноо',
                icon: <Circle size={8} />,
                navLink: "score/progress-score/"
            },
            {
                id: 'score6',
                title: 'Явцын дүн тайлан',
                icon: <Circle size={8} />,
                navLink: "score/report/"
            }
        ]
    }
]
