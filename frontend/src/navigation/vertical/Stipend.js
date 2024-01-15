// ** Icons Import
import { Circle } from 'react-feather'

export default [
    {
        id: 'stipend',
        title: 'Тэтгэлэг',
        icon: <i className="far fa-award"></i>,
        navLink: "/stipend",
        navChildren: [
            {
                id: 'stipend1',
                title: 'Тэтгэлэгийн бүртгэл',
                icon: <Circle size={8} />,
                navLink: "stipend/register/"
            },
            {
                id: 'stipend2',
                title: 'Тэтгэлэг хүсч буй оюутны жагсаалт',
                icon: <Circle size={8} />,
                navLink: "stipend/request/"
            },
        ]
    }
]
