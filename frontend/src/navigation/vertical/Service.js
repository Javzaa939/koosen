// ** Icons Import
import { Circle,CreditCard } from 'react-feather'

export default [
    {
        id: 'service',
        title: 'Үйлчилгээ',
        icon: <CreditCard size={20} />,
        navLink: "/service",
        children: [
            {
                id: 'service',
                title: 'Зар мэдээ',
                icon: <Circle size={8} />,
                navLink: "service/news"
            }
        ]
    }
]
