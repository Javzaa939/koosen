import { Circle } from 'react-feather'

export default [
    {
        id: 'dormitory',
        title: 'Дотуур байр',
        icon: <i className="far fa-building"></i>,
        navLink: "/dormitory",
        children: [
            {
                id: 'dormitory1',
                title: 'Өрөөний төрөл',
                icon: <Circle size={8} />,
                navLink: "dormitory/room-types/"
            },
            {
                id: 'dormitory2',
                title: 'Өрөө',
                icon: <Circle size={8} />,
                navLink: "dormitory/rooms/"
            },
            {
                id: 'dormitory3',
                title: 'Төлбөрийн тохиргоо',
                icon: <Circle size={8} />,
                navLink: "dormitory/payment-config/"
            },
            {
                id: 'dormitory4',
                title: 'Дотуур байрны бүртгэл',
                icon: <Circle size={8} />,
                navLink: "dormitory/dormitory-registration/"
            },
            {
                id: 'dormitory5',
                title: 'Төлбөрийн тооцоо',
                icon: <Circle size={8} />,
                navLink: "dormitory/dormitory-estimate/"
            },
            {
                id: 'dormitory6',
                title: 'Төлбөрийн гүйлгээ',
                icon: <Circle size={8} />,
                navLink: "dormitory/dormitory-transaction/"
            },
            {
                id: 'dormitory7',
                title: 'Шаардах хуудас',
                icon: <Circle size={8} />,
                navLink: "dormitory/Request/"
            },

        ]
    }
]

