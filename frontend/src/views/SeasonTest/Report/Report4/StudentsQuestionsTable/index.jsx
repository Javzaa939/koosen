import './style.scss'
import { useTranslation } from "react-i18next"

function get_question_title_color(title) {
	switch (title) {
		case 'Мэдлэг': return 'qtc1'
		case 'Чадвар': return 'qtc2'
		case 'Хандлага': return 'qtc3'
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
							className={`ctooltip ${get_question_title_color(item.title)}`}
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
						{t('Нийт')}
					</td>
					{aggregatedData?.questions_summary?.map((item, key) =>
						<td key={key}>
							{item.total_correct} {item.total_wrong}
						</td>
					)}
				</tr>
			</tfoot>
		</table>
	)
}
