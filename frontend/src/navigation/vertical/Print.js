import { Circle } from 'react-feather'

export default [
    {
        id: 'print',
        title: 'Хэвлэх',
        icon: <i className="far fa-print"></i>,
        navLink: "/print",
        navChildren: [
            {
                id: 'print1',
                title: 'Хичээл сонголтын нэрс',
                icon: <Circle size={8} />,
                navLink: "print/lessonchoice/"
            },
            {
                id: 'print2',
                title: 'Хичээлийн хуваарь',
                icon: <Circle size={8} />,
                navLink: "print/schedule/"
            },
            // {
            //     id: 'print4',
            //     title: 'Дүнгийн жагсаалт',
            //     icon: <Circle size={8} />,
            //     navLink: "print/list/"
            // },
            {
                id: 'print5',
                title: 'Голч дүн',
                icon: <Circle size={8} />,
                navLink: "print/gpa/"
            },
            {
                id: 'print6',
                title: 'Төгсөлтийн тушаал',
                icon: <Circle size={8} />,
                navLink: "print/graduation/"
            },
        ]
    }
]
