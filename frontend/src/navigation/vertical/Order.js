// ** Icons Import
import { Circle, Clock } from 'react-feather'

export default [
    {
        id: 'order',
        title: 'Захиалга',
        icon: <Clock size={20} />,
        navLink: "/order",
        navChildren: [
            {
                id: 'order1',
                title: 'Номын сан',
                icon: <Circle size={8} />,
                navLink: "order/library/"
            },
            {
                id: 'order2',
                title: 'Спорт заал',
                icon: <Circle size={8} />,
                navLink: "order/sport"
            },
            {
                id: 'order3',
                title: 'Фитнес',
                icon: <Circle size={8} />,
                navLink: "order/gym"
            },
            {
                id: 'order4',
                title: 'Эмнэлэг',
                icon: <Circle size={8} />,
                navLink: "order/hospital"
            },
        ]
    }
]
