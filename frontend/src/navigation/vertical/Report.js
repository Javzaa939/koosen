// ** Icons Import
import { Circle } from 'react-feather'

export default [
    {
        id: 'report',
        title: 'Тайлан',
        icon: <i className="far fa-file-chart-line"></i>,
        navLink: "/report",
        navChildren: [
            {
                id: 'report1',
                title: 'Дүнгийн тодорхойлолт',
                icon: <Circle size={8} />,
                navLink: "report/definition/"
            },
            {
                id: 'report2',
                title: 'Төлбөрийн карт',
                icon: <Circle size={8} />,
                navLink: "report/payment-card/"
            },
            {
                id: 'report3',
                title: 'Хавсралт',
                icon: <Circle size={8} />,
                navLink: "report/annex-report"
            },
        ]
    }
]
