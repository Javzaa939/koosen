import { useState } from 'react'
import { useTranslation } from "react-i18next"
import ReactDOM from "react-dom";

function get_question_title_color(title) {
	if (typeof title === 'string') {
		switch (title.trim().toLowerCase()) {
			case 'мэдлэг': return 'qtc1'
			case 'чадвар': return 'qtc2'
			case 'хандлага': return 'qtc3'
			default: return ''
		}
	}
}

export default function StudentsQuestionsTable({ data, aggregatedData, handleSort }) {
	const { t } = useTranslation()
	const [tooltipStyle, setTooltipStyle] = useState({});
	const [visible, setVisible] = useState(false);
	const [tooltipText, setTooltipText] = useState("");

	const showTooltip = (e, text) => {
		const { top, left, width, height } = e.currentTarget.getBoundingClientRect();

		setTooltipStyle({
			top: top + height,
			left: left,
		});

		setTooltipText(text);
		setVisible(true);
	};

	const hideTooltip = () => setVisible(false);

	return (
		<div id='element_to_print' style={{ overflow: 'auto' }}>
			{/* to define styles directly on page (e.g. without importing scss file) to keep styles only in current page to avoid unexpected styles effects on other pages */}
			<style>{`
				.ctooltiptext {
					max-width: 400px;
					text-align: center;
					border-radius: 5px;
					padding: 5px;
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
				}

				.studentsQuestionsTable {
					width: 100%;
					border: 1px solid black;
					border-collapse: collapse;
					font-family: "Times New Roman";
					font-size: 11pt;
				}

				.studentsQuestionsTable td {
					border: 1px solid black;
					padding: 2px 6px;
				}

				.qtc1 {
					color: #fc7676;
				}

				.qtc2 {
					color: #9dd241;
				}

				.qtc3 {
					color: #4a87ff;
				}
			`}</style>
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
								className={`${get_question_title_color(item.question_title)}`}
								onMouseEnter={(e) => showTooltip(e, item.question_text)}
								onMouseLeave={hideTooltip}
							>
								{key + 1}
							</td>
						)}
						<td>
							{t('Нийт (Зөв)')}
						</td>
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
									{answer?.is_answered_right ? <span style={{ color: 'green' }}>O</span> : <span style={{ color: 'red' }}>X</span>}
								</td>
							)}
							<td>
								{student?.answers.reduce((acc, answer) => {
									return answer.is_answered_right ? acc + 1 : acc;
								}, 0)}
							</td>
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
						<td>
						</td>
					</tr>
				</tfoot>
			</table>
			{visible &&
				ReactDOM.createPortal(
					<span
						className="ctooltiptext bg-primary text-white fw-bold"
						style={{
							position: "fixed",
							...tooltipStyle,
							zIndex: 9999,
						}}
					>
						{tooltipText}
					</span>,
					document.body
				)}
		</div>
	)
}
