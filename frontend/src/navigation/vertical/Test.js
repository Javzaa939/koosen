import { Circle } from 'react-feather'

export default [
    {
        id: 'test',
        title: 'Шалгалт',
        icon: <i className="fas fa-biohazard"></i>,
        navLink: "/test",
        children: [
            {
                id: 'question',
                title: 'Асуулт бэлдэх',
                icon: <Circle size={8} />,
                navLink: "test/create_question/"
            },
            {
                id: 'create',
                title: 'Шалгалт үүсгэх',
                icon: <Circle size={8} />,
                navLink: "test/create_test/"
            },
        ]
    }
]
