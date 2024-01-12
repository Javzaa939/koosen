import { Circle } from 'react-feather'

export default
[
    {
        id: 'student12',
            title: 'Төгсөлт',
            icon: <i className="far fa-graduation-cap"></i>,
            navLink: "/student",
            children:
            [
                {
                    id:'student17',
                    title:'Төгсөгчид',
                    icon: <Circle size={8} />,
                    navLink:"student/graduates"
                },
                {
                    id: 'student16',
                    title: 'Төгсөлтийн ажил',
                    icon: <Circle size={8} />,
                    navLink: "student/graduation"
                },
                {
                    id: 'student10',
                    title: 'Хавсралт',
                    icon: <Circle size={8} />,
                    navLink: "student/attachment"
                },
                
            ]
    },
]