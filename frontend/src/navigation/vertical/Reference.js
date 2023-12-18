// ** Icons Import
import { Circle } from 'react-feather'

export default [
    {
        id: 'reference',
        title: 'Лавлах сан',
        icon: <i className="far fa-address-book"></i>,
        navLink: "/reference",
        children: [
            {
                id: 'reference1',
                title: 'Сургууль',
                icon: <Circle size={8} />,
                navLink: "reference/school/"
            },
            {
                id: 'reference2',
                title: 'Хөтөлбөрийн баг',
                icon: <Circle size={8} />,
                navLink: "reference/departments/"
            },
            {
                id: 'reference3',
                title: 'Багш',
                icon: <Circle size={8} />,
                navLink: "reference/teachers/"
            },
        ]
    }
]
