import { Circle } from 'react-feather'

export default [
    {
        id: 'test',
        title: 'Шалгалт',
        icon: <i className="fa fa-book"></i>,
        navLink: "/test",
        navChildren: [
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
