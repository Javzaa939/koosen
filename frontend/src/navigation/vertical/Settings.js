// ** Icons Import
import { Circle, Settings } from 'react-feather'

export default [
    {
        id: 'settings',
        title: 'Тохиргоо',
        icon: <Settings size={20} />,
        navLink: "/settings",
        children: [
            {
                id: 'settingsLevel14',
                title: 'Тодорхойлолтын гарын үсэг',
                icon: <Circle size={8} />,
                navLink: "settings/signature/"
            },
            {
                id: 'timetable1',
                title: 'Хичээлийн байр',
                icon: <Circle size={8} />,
                navLink: "timetable/building/"
            },
            {
                id: 'timetable2',
                title: 'Өрөөний бүртгэл',
                icon: <Circle size={8} />,
                navLink: "timetable/room/"
            },
            {
                id: 'settingsLevel0',
                title: 'Ажиллах жил',
                icon: <Circle size={8} />,
                navLink: "settings/activeyear/"
            },
            {
                id: 'settingsLevel1',
                title: 'Боловсролын зэрэг',
                icon: <Circle size={8} />,
                navLink: "settings/professionaldegree/"
            },
            {
                id: 'settingsLevel2',
                title: 'Суралцах хэлбэр',
                icon: <Circle size={8} />,
                navLink: "settings/learning/"
            },
            {
                id: 'settingsLevel3',
                title: 'Оюутны бүртгэлийн хэлбэр',
                icon: <Circle size={8} />,
                navLink: "settings/studentregitertype/"
            },
            {
                id: 'settingsLevel13',
                title: 'Төлбөрийн хөнгөлөлт',
                icon: <Circle size={8} />,
                navLink: "settings/discounttype/"
            },
            {
                id: 'settingsLevel4',
                title: 'Хичээлийн ангилал',
                icon: <Circle size={8} />,
                navLink: "settings/lessoncategory/"
            },
            {
                id: 'settingsLevel9',
                title: 'Хичээлийн бүлэг',
                icon: <Circle size={8} />,
                navLink: "settings/lessongroup/"
            },
            {
                id: 'settingsLevel10',
                title: 'Улирал',
                icon: <Circle size={8} />,
                navLink: "settings/season/"
            },
            {
                id: 'settingsLevel11',
                title: 'Үнэлгээний бүртгэл',
                icon: <Circle size={8} />,
                navLink: "settings/score/"
            },
            {
                id: 'settingsLevel12',
                title: 'ЭЕШ-ын хичээл',
                icon: <Circle size={8} />,
                navLink: "settings/admissionlesson/"
            },
            {
                id: 'settingsCountry13',
                title: 'Улс',
                icon: <Circle size={8} />,
                navLink: "settings/country/"
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
