
import { Circle } from 'react-feather'
export default [
    {
        id: 'elselt',
        title: 'Элсэлтийн тохиргоо',
        icon: <i className="fas fa-user-graduate"></i>,
        navLink: "/elselt",
        navChildren: [
            {
                id: 'elselt1',
                title: 'Элсэлт бүртгэх',
                icon: <Circle size={8} />,
                navLink: "elselt/register"
            },
            {
                id: 'elselt2',
                title: 'Үндсэн мэдээлэл',
                icon: <Circle size={8} />,
                navLink: "elselt/sysinfo"
            },
        ]
    }
]
