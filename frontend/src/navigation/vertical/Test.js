import { Circle } from 'react-feather'

export default [
    {
        id: 'test',
        title: 'Шалгалт',
        icon: <i className="fas fa-user-check"></i>,
		navChildren: [
			{
				id: "season-challenge",
				title: "Улирлын шалгалт",
				icon: <Circle size={8} />,
				children: [
					{
						id: "season-equistion",
						title: "Асуултын сан",
						icon: <Circle size={8} />,
						navLink: "challenge-question/",
					},
					{
						id: "season-test",
						title: "Онлайн шалгалт",
						icon: <Circle size={8} />,
						navLink: "challenge-season/",
					},
					{
						id: "examreport",
						title: "Тайлан",
						icon: <Circle size={8} />,
						navLink: "challenge-report/",
					},
				]
			},
			// {
			// 	id: "admission-challenge",
			// 	title: "Элсэлтийн шалгалт",
			// 	icon: <Circle size={8} />,
			// 	children: [
			// 		{
			// 			id: "admission-challenge-question",
			// 			title: "Асуултын сан",
			// 			icon: <Circle size={8} />,
			// 			navLink: "admission-challenge/question/",
			// 		},
			// 	]
			// },
			{
				id: "just-challenge",
				title: "Явцын шалгалт",
				icon: <Circle size={8} />,
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
				]
			},
			{
				id: "graduate-challenge",
				title: "Төгсөлтийн шалгалт",
				icon: <Circle size={8} />,
				children: [
					{
						id: "graduate-question",
						title: "Асуултын сан",
						icon: <Circle size={8} />,
						navLink: "graduate-question/",
					},
					{
						id: "graduate-test",
						title: "Онлайн шалгалт",
						icon: <Circle size={8} />,
						navLink: "challenge-graduate/",
					},
					// {
					// 	id: "examreport",
					// 	title: "Тайлан",
					// 	icon: <Circle size={8} />,
					// 	navLink: "challenge-report/",
					// },
				]
			},
		]
    },
]
