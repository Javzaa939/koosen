import { Circle } from 'react-feather'

export default [
    {
        id: 'survey',
        title: 'Судалгаа',
        icon: <i className="fal fa-ballot-check"></i>,
        navLink: "/survey",
        children: [
            {
                id: 'takesurvey',
                title: 'Судалгааны жагсаалт',
                icon: <Circle size={8} />,
                navLink: "survey/surveymain"
            },
            {
                id: 'surveyreg',
                title: 'Үр дүн',
                icon: <Circle size={8} />,
                navLink: "survey/results/"
            },

        ]
    }
]
