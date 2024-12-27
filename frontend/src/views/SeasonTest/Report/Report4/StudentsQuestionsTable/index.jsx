import './style.scss'
import { useTranslation } from "react-i18next"

function get_question_title_color(title) {
	switch (title.trim().toLowerCase()) {
		case 'мэдлэг': return 'qtc1'
		case 'чадвар': return 'qtc2'
		case 'хандлага': return 'qtc3'
		default: return ''
	}
}

// TODO: add sorting
export default function StudentsQuestionsTable({ data, aggregatedData, handleSort }) {
	const { t } = useTranslation()

	return (
		<table className='studentsQuestionsTable'>
			<thead align='center'>
				<tr>
					<td>
						№
					</td>
					<td>
						{t('Оюутан')}
					</td>
					{aggregatedData?.questions?.map((item, key) =>
						<td
							key={key}
							className={`ctooltip ${get_question_title_color(item.question_title)}`}
						>
							{key + 1}
							<span className="ctooltiptext bg-primary text-white fw-bold">{item.question_text}</span>
						</td>
					)}
				</tr>
			</thead>
			<tbody align='center'>
				{data?.map((student, student_key) =>
					<tr key={student_key}>
						<td>
							{student_key + 1}
						</td>
						<td align='left'>
							{student.full_name}
						</td>
						{student?.answers.map((answer, answer_key) =>
							<td key={answer_key}>
								{answer?.is_answered_right ? 'X' : 'O'}
							</td>
						)}
					</tr>
				)}
			</tbody>
			<tfoot align='center'>
				<tr>
					<td colSpan={2}>
						{t('Нийт (Зөв/Буруу)')}
					</td>
					{aggregatedData?.questions_summary && Object.keys(aggregatedData?.questions_summary).map((key, ind) => {
						const item = aggregatedData?.questions_summary[key]
						const total_correct = item.correct
						const total_wrong = item.total - item.correct

						return (
							<td key={ind}>
								{total_correct}/{total_wrong}
							</td>
						)
					})}
				</tr>
			</tfoot>
		</table>
	)
}
