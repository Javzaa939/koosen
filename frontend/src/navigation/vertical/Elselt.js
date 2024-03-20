
import { Circle } from 'react-feather'
export default [
    {
        id: 'elselt',
        title: 'Элсэлтийн тохиргоо',
        icon: <i className="fas fa-user-graduate"></i>,
        navLink: "/elselt",
        navChildren: [
            {
                id: 'elselt0',
                title: 'Дашбоард',
                icon: <Circle size={8} />,
                navLink: "elselt/dashboard"
            },
            {
                id: 'elselt1',
                title: 'Үндсэн мэдээлэл',
                icon: <Circle size={8} />,
                navLink: "elselt/sysinfo"
            },
            {
                id: 'elselt2',
                title: 'Элсэлт',
                icon: <Circle size={8} />,
                navLink: "elselt/register"
            },
            {
                id: 'elselt3',
                title: 'Бүртгүүлэгчид',
                icon: <Circle size={8} />,
                navLink: "elselt/user"
            },
        ]
    }
]
