
import { Input } from 'reactstrap'

export function getColumns(checkScore, allCheck)
{
    const columns = [
		{
			name: (
				<Input
					className='me-50'
					type='checkbox'
					id='allChecked'
					onChange={allCheck}
				/>
			),
			selector: (row, index) =>
				<Input
					className='me-50'
					type='checkbox'
					id={`${row.lesson?.id}lesson`}
					name={`lesson`}
					onChange={() => checkScore(row.lesson?.id)}
					value={row.lesson?.id}
				/>,
			center: true,
			width: '70px',
		},
		{
			name: "№",
			selector: (row, index) => <span>{index + 1}</span>,
			center: true,
			width: '60px',
		},
		{
			name: "Хич.код",
			selector: (row, index) => <span title={row?.lesson?.code}>{row?.lesson?.code}</span>,
			center: true,
			width: '150px'
		},
		{
			name: "Хич.нэр",
			selector: (row, index) => <span title={row?.lesson?.name}>{row?.lesson?.name}</span>,
		},
		{
			name: "Кр",
			selector: (row, index) => <span>{row?.lesson?.kredit}</span>,
			center: true,
			width: '60px'
		},
		{
			name: "Хич.жил",
			selector: (row, index) => <span>{row?.lesson_year}</span>,
			center: true,
			width: '130px'
		},
		{
			name: "Улирал",
			selector: (row, index) => <span>{row?.lesson_season?.season_name}</span>,
			center: true,
			width: '110px'
		},
		{
			name: "70 оноо",
			selector: (row, index) => <span>{row?.teacher_score || 0}</span>,
			center: true,
			width: '100px'
		},
		{
			name: "30 оноо",
			selector: (row, index) => <span>{row?.exam_score || 0}</span>,
			center: true,
			width: '100px'
		},
		{
			name: "Нийт оноо",
			selector: (row, index) => <span>{(row?.teacher_score || 0) + (row?.exam_score || 0)}</span>,
			center: true,
			width: '118px'
		},
		{
			name: "Үнэлгээ",
			selector: (row, index) => <span>{row?.assessment}</span>,
			center: true,
			width: '100px'
		},
	]

    return columns
}
