import { Circle } from 'react-feather'

export default [
    {
        id: 'research',
        title: 'Судалгаа',
        icon: <i className="fal fa-ballot-check"></i>,
        navLink: "/research",
        navChildren: [
            {
                id: 'research1',
                title: 'Судалгаа бүртгэх',
                icon: <Circle size={8} />,
                navLink: "research/register"
            }
        ]
    }
]
