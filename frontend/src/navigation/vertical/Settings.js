// ** Icons Import

// import ableLogo from "@src/assets/images/ableLogo.png"
import { SettingsIcon, Circle } from 'lucide-react';

export default [
    {
        id: 'settings',
        icon: <SettingsIcon />,
        title: 'Тохиргоо',
        navLink: '/settings',
        navChildren: [
            {
                id: 'settings_employee',
                title: 'Ажилчдын тохиргоо',
                icon: <Circle size={8} />,
                navLink: 'settings/teacher/',
            },
            {
                id: 'settings_student',
                title: 'Оюутнуудын тохиргоо',
                icon: <Circle size={8} />,
                navLink: 'settings/student/',
            },
            {
                id: 'settings_mail',
                title: 'Цахим шуудан тохиргоо',
                icon: <Circle size={8} />,
                navLink: 'settings/mail/',
            },
            {
                id: 'settingsLevel15',
                title: 'Эрх',
                icon: <Circle size={8} />,
                navLink: 'settings/permission/',
            },
            {
                id: 'settingsLevel16',
                title: 'Role',
                icon: <Circle size={8} />,
                navLink: 'settings/role/',
            },
            // {
            //     id: 'settingsLevel17',
            //     title: 'Able',
            //     icon: <img style={{ marginRight: '10px' }} width={20} height={20} src={ableLogo} />,
            //     navLink: "settings/able/"
            // },
            // {
            //     id: 'settingsLevel18',
            //     title: 'Дүрэм журмын файл',
            //     icon: <Circle size={8} />,
            //     navLink: "settings/rule/"
            // },
        ],
    },
];
