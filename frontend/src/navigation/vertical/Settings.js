// ** Icons Import
import { Circle, Settings } from 'react-feather'

export default [
    {
        id: 'settings',
        title: 'Тохиргоо',
        icon: <Settings size={20} />,
        navLink: "/settings",
        navChildren: [
            {
                id: 'settings_employee',
                title: 'Ажилчдын тохиргоо',
                icon: <Circle size={8} />,
                navLink: "settings/teacher/"
            },
            {
                id: 'settings_student',
                title: 'Оюутнуудын тохиргоо',
                icon: <Circle size={8} />,
                navLink: "settings/student/"
            },
            {
                id: 'settingsLevel15',
                title: 'Эрх',
                icon: <Circle size={8} />,
                navLink: "settings/permission/"
            },
            {
                id: 'settingsLevel16',
                title: 'Role',
                icon: <Circle size={8} />,
                navLink: "settings/role/"
            },
        ]
    }
]
