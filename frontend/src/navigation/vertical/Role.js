import { Circle, GlassesIcon } from 'lucide-react'
import { t } from 'i18next';

export default [
    {
        id: 'role',
        title: 'Хандах эрх',
        icon: <GlassesIcon />,
        navLink: "/role",
        navChildren: [
            {
                id: 'role1',
                title: 'Багшийн дүнгийн эрх',
                icon: <Circle size={8} />,
                navLink: "role/teacher/"
            },
            // {
            //     id: 'role2',
            //     title: 'Оюутны сонголтыг төлбөрөөс хамааралгүйгээр хийх эрх',
            //     icon: <Circle size={8} />,
            //     navLink: "role/student/"
            // },
            {
                id: 'role3',
                title: 'Системийн хугацаа',
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
