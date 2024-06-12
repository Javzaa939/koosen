
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
            {
                id: 'elselt3_1',
                title: 'Ял шийтгэл',
                icon: <Circle size={8} />,
                navLink: "elselt/ylshiitgel"
            },
            {
                id: 'elselt4',
                title: 'Эрүүл мэнд анхан шатны үзлэг',
                icon: <Circle size={8} />,
                navLink: "elselt/health/anhan"
            },
            {
                id: 'elselt5',
                title: 'Эрүүл мэнд мэргэжлийн үзлэг',
                icon: <Circle size={8} />,
                navLink: "elselt/health/mergejliin"
            },
            {
                id: 'elselt6',
                title: 'Бие бялдар',
                icon: <Circle size={8} />,
                navLink: "elselt/physical"
            },
            {
                id: 'elselt7',
                title: 'Тэнцсэн элсэгчид',
                icon: <Circle size={8} />,
                navLink: "student/enrollment"
            },
            {
                id: 'elselt8',
                title: 'Мэйл тайлан',
                icon: <Circle size={8} />,
                navLink: "elselt/tailan"
            },
        ]
    }
]
