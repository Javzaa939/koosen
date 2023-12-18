import { Circle } from 'react-feather'


export default [
    {
        id: 'science',
        title: 'Эрдэм шинжилгээ',
        icon: <i className="far fa-book"></i>,
        navLink: "/science",
        children: [
            {
                id: 'science1',
                title: 'Б цагийн тохиргоо',
                icon: <Circle size={1} />,
                navLink: "science/bsettings/"
            },
            {
                id: 'science9',
                title: 'Б цагийн тооцоо нэгтгэл',
                icon: <Circle size={9} />,
                navLink: "science/b-estimate/"
            },
            {
                id: 'science2',
                title: 'Өгүүлэл',
                icon: <Circle size={2} />,
                navLink: "science/uguulel/"
            },
            {
                id: 'science3',
                title: 'Илтгэл',
                icon: <Circle size={3} />,
                navLink: "science/notes/"
            },
            {
                id: 'science4',
                title: 'Төсөл хөтөлбөр',
                icon: <Circle size={4} />,
                navLink: "science/project/"
            },
            {
                id: 'science5',
                title: 'Бүтээл',
                icon: <Circle size={5} />,
                navLink: "science/buteel/"
            },
            {
                id: 'science6',
                title: 'Эшлэл',
                icon: <Circle size={6} />,
                navLink: "science/quotation/"
            },
            {
                id: 'science7',
                title: 'Оюутан удирдсан байдал',
                icon: <Circle size={7} />,
                navLink: "science/student/"
            },
            {
                id: 'science8',
                title: 'Оюуны өмчийн байдал',
                icon: <Circle size={8} />,
                navLink: "science/patent/"
            },
            {
                id: 'science10',
                title: 'Тайлан',
                icon: <Circle size={8} />,
                navLink: "science/report/"
            }
        ]
    }
]
