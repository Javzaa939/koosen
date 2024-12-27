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
export default function StudentsQuestionsTable({ data, handleSort }) {
	const { t } = useTranslation()

	return (
		<table>
			<thead>
				<tr>
					<td>
						{t('Оюутан')}
					</td>
					{data?.questions?.map((item, key) =>
						<td key={key} className={`tooltip ${get_question_title_color(item.title)}`}>
							{key}
							<span className="tooltiptext">{item.question_text}</span>
						</td>
					)}
				</tr>
			</thead>
			<tbody>
				{data?.students?.map((student, key) =>
					<tr>
						<td key={key}>
							{student.full_name}
						</td>
						{item?.answers.map((answer, key) =>
							<td key={key}>
								{item.answer?.is_right ? 'X' : 'O'}
							</td>
						)}
					</tr>
				)}
			</tbody>
			<tfoot>
				<tr>
					<td>
						{t('Нийт')}
					</td>
					{data?.questions_summary?.map((item, key) =>
						<td key={key}>
							{item.total_correct} {item.total_wrong}
						</td>
					)}
				</tr>
			</tfoot>
		</table>
	)
}
