// ** Icons Import

// Өргөдөл цэсэнд цэс нэмэхдээ  id -г дарааллаар нь бичих back руу хадгалж байгаа
import { Circle, GitPullRequest,Send } from 'react-feather'
export default [
    {
        id: 'complaint',
        title: 'Өргөдөл',
        icon: <GitPullRequest size={20} />,
        navLink: "/request",
        children: [
            // {
            //     id: 'request1',
            //     title: 'Хүсэлтийн төрөл',
            //     icon: <Circle size={8} />,
            //     navLink: "request/type/"
            // },
            {
                id: 'complaint1',
                title: 'Шийдвэрлэх нэгж',
                icon: <Circle size={8} />,
                navLink: "request/unit/"
            },
            {
                id: 'complaint2',
                title: 'Өргөдөл',
                icon: <Circle size={8} />,
                navLink: "request/complaint"
            },
            {
                id: 'complaint3',
                title: 'Дүнгийн дүйцүүлэлт',
                icon: <Circle size={8} />,
                navLink: "request/correspond"
            },
            {
                id: 'complaint4',
                title: 'Чөлөөний хүсэлт',
                icon: <Circle size={8} />,
                navLink: "request/leave"
            },
            {
                id: 'complaint5',
                title: 'Тойрох хуудас',
                icon: <Circle size={8} />,
                navLink: "request/routingslip"
            },
        ]
    },
    {
        id: 'request',
        title: 'Хүсэлт',
        icon: <Send size={20} />,
        navLink: "/request",
        children: [
            {
                id: 'request1',
                title: 'Олон нийтийн ажилд оролцох',
                icon: <Circle size={8} />,
                navLink: "request/volunteer"
            },
            {
                id: 'request2',
                title: 'Клуб',
                icon: <Circle size={8} />,
                navLink: "request/club"
            },
            {
                id: 'request3',
                title: 'Багшийн туслахаар ажиллах',
                icon: <Circle size={8} />,
                navLink: "request/tutor"
            },
        ]
    }
]
