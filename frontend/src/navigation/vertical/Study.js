// ** Icons Import
import { Circle } from 'react-feather'

export default [
    {
        id: 'study',
        title: 'Сургалт',
        icon: <i className="fas fa-users-class"></i>,
        navLink: "/study",
        children: [
            {
                id: 'study1',
                title: 'Хичээлийн стандарт',
                icon: <Circle size={8} />,
                navLink: "study/lessonStandart/"
            },
            {
                id: 'study2',
                title: 'Хөтөлбөр',
                icon: <Circle size={8} />,
                navLink: "study/profession-definition/"
            },
            // {
            //     id: 'study3',
            //     title: 'Сургалтын төлөвлөгөө',
            //     icon: <Circle size={8} />,
            //     navLink: "study/plan/"
            // },
        ]
    }
]
