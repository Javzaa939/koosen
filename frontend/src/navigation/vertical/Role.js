import { Circle } from 'react-feather'
import { t } from 'i18next';

export default [
    {
        id: 'role',
        title: 'Хандах эрх',
        icon: <i className="far fa-universal-access"></i>,
        navLink: "/role",
        navChildren: [
            // {
            //     id: 'role1',
            //     title: 'Багшийн дүнгийн эрх',
            //     icon: <Circle size={8} />,
            //     navLink: "role/teacher/"
            // },
            // {
            //     id: 'role2',
            //     title: 'Оюутны сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх',
            //     icon: <Circle size={8} />,
            //     navLink: "role/student/"
            // },
            {
                id: 'role3',
                title: 'Дүнгийн эрх',
                icon: <Circle size={8} />,
                navLink: "role/busad/"
            },
            // {
            //     id: 'role4',
            //     title: 'Мэдэгдэл илгээх тохиргоо',
            //     icon: <Circle size={8} />,
            //     navLink: "role/crontab/"
            // },
        ]
    }
]
