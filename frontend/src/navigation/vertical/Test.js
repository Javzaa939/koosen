import { Circle } from 'react-feather'

export default [
    {
        id: 'test',
        title: 'Шалгалт',
        icon: <i className="fas fa-user-check"></i>,
        navLink: "/challenge",
		children: [
			{
				id: "e-challenge",
				title: "Асуултын сан",
				icon: <Circle size={8} />,
				navLink: "challenge/teacher/",
			},
			{
				id: "testchallenge",
				title: "Онлайн шалгалт",
				icon: <Circle size={8} />,
				navLink: "challenge/test/",
			},
			// {
			// 	id: "exam-timetable",
			// 	title: "Шалгалтын хуваарь",
			// 	icon: <Circle size={8} />,
			// 	navLink: "challenge/exam_schedule/",
			// },
		]
    },
]
