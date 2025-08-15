// ** Icons Import
import { Circle } from 'react-feather'

export default [
    {
        id: 'reference',
        title: 'Лавлах сан',
        icon: <i className="far fa-address-book"></i>,
        navLink: "/reference",
        navChildren: [
            {
                id: 'reference0',
                title: 'Сургууль',
                icon: <Circle size={8} />,
                navLink: "reference/school/"
            },
            {
                id: 'reference1',
                title: 'Салбар сургуулиуд',
                icon: <Circle size={8} />,
                navLink: "reference/subschool/"
            },
            {
                id: 'reference2',
                title: 'Салбар / Тэнхим',
                icon: <Circle size={8} />,
                navLink: "reference/departments/"
            },
            {
                id: 'reference3',
                title: 'Багш / Ажилчид',
                icon: <Circle size={8} />,
                navLink: "reference/teachers/"
            },
            {
                id: 'reference4',
                title: 'Албан тушаал',
                icon: <Circle size={8} />,
                navLink: "reference/position/"
            },
        ]
    }
]
