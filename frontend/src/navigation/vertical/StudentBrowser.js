// ** Icons Import
import { Circle } from 'react-feather'

export default [
    {
        id: 'browser',
        title: 'Суралцагчийн хөтөч',
        icon: <i className="far fa-award"></i>,
        navLink: "/browser",
        navChildren: [
            {
                id: 'b1',
                title: 'Их сургуулийн бүтэц зохион байгуулалт',
                icon: <Circle size={8} />,
                navLink: "browser/structure/"
            },
            {
                id: 'b2',
                title: 'Сургалтын хөтөлбөр, хичээлийн хуваарь',
                icon: <Circle size={8} />,
                navLink: "browser/surgalt/"
            },
            {
                id: 'b3',
                title: 'Дүрэм журам',
                icon: <Circle size={8} />,
                navLink: "browser/juram/"
            },
            {
                id: 'b4',
                title: 'Суралцагчийн хөгжил',
                icon: <Circle size={8} />,
                navLink: "browser/hugjil/"
            },
            {
                id: 'b5',
                title: 'Сэтгэл зүйн булан',
                icon: <Circle size={8} />,
                navLink: "browser/psychological/"
            },
            {
                id: 'b6',
                title: 'Номын сан',
                icon: <Circle size={8} />,
                navLink: "browser/library/"
            },
            {
                id: 'b7',
                title: 'Эрүүл мэнд',
                icon: <Circle size={8} />,
                navLink: "browser/health/"
            },
            {
                id: 'b8',
                title: 'Бусад',
                icon: <Circle size={8} />,
                navLink: "service/"
            },
        ]
    },
]