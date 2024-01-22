import { Circle } from 'react-feather'

export default [
    {
        id: 'evaluation',
        title: 'Багшийн үнэлгээ',
        icon:<i className="fal fa-question-circle"></i>,
        navLink: "evaluation/question",
        navChildren: [
            {
                id: 'evaluation1',
                title: 'Үнэлгээний асуулт',
                icon: <Circle size={8} />,
                navLink: "evaluation/question"
            }
        ]
    }
]
