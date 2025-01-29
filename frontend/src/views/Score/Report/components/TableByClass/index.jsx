import VerticalBarChartLoader from "@src/components/VerticalBarChart";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardTitle } from "reactstrap";

export default function TableByClass({ scoreRanges, isLoading, examTypeData, level2_key1, level2_key2 }) {
	const { t } = useTranslation()
	const level1_key_names = ['group_name', 'lesson_name', 'exam_type_name']
	const level2_key1_name = level2_key1[0]
	const level2_key2_name = level2_key2[0]
	const level2_key3_name = 'F дүгнэгдсан суралцагчийн хувь'
	const classLessonTypeData = {}
	const data = examTypeData
	const summaryRow = { a: 0, b: 0, c: 0, d: 0, f: 0, all: 0 }

	const counts = data.reduce((acc, student) => {
		const level1_key_value = `${student[level1_key_names[0]]}=_+${student[level1_key_names[1]]}=_+${student[level1_key_names[2]]}`

		if (!acc[level1_key_value]) {
			acc[level1_key_value] = { [level2_key1_name]: 0, [level2_key2_name]: 0 }
			const level1KeyData = data.filter(item => `${item[level1_key_names[0]]}=_+${item[level1_key_names[1]]}=_+${item[level1_key_names[2]]}` === level1_key_value)

			const students_count = level1KeyData.length
			const a_students_count = level1KeyData.filter(item => scoreRanges.A.score_min <= item.total_score && item.total_score <= scoreRanges.A.score_max).length
			const b_students_count = level1KeyData.filter(item => scoreRanges.B.score_min <= item.total_score && item.total_score <= scoreRanges.B.score_max).length
			const c_students_count = level1KeyData.filter(item => scoreRanges.C.score_min <= item.total_score && item.total_score <= scoreRanges.C.score_max).length
			const d_students_count = level1KeyData.filter(item => scoreRanges.D.score_min <= item.total_score && item.total_score <= scoreRanges.D.score_max).length
			const f_students_count = level1KeyData.filter(item => scoreRanges.F.score_min <= item.total_score && item.total_score <= scoreRanges.F.score_max).length

			acc[level1_key_value][level2_key1_name] = ((a_students_count + b_students_count) * 100) / students_count
			acc[level1_key_value][level2_key2_name] = ((a_students_count + b_students_count + c_students_count) * 100) / students_count
			acc[level1_key_value][level2_key3_name] = (f_students_count * 100) / students_count

			if (isNaN(acc[level1_key_value][level2_key1_name])) acc[level1_key_value][level2_key1_name] = 0
			if (isNaN(acc[level1_key_value][level2_key2_name])) acc[level1_key_value][level2_key2_name] = 0
			if (isNaN(acc[level1_key_value][level2_key3_name])) acc[level1_key_value][level2_key3_name] = 0

			acc[level1_key_value][level2_key1_name] = parseFloat(acc[level1_key_value][level2_key1_name].toFixed(2))
			acc[level1_key_value][level2_key2_name] = parseFloat(acc[level1_key_value][level2_key2_name].toFixed(2))
			acc[level1_key_value][level2_key3_name] = parseFloat(acc[level1_key_value][level2_key3_name].toFixed(2))

			classLessonTypeData[level1_key_value] = {
				[level2_key1_name]: acc[level1_key_value][level2_key1_name],
				[level2_key2_name]: acc[level1_key_value][level2_key2_name],
				[level2_key3_name]: acc[level1_key_value][level2_key3_name],
				all: students_count,
				a: a_students_count,
				b: b_students_count,
				c: c_students_count,
				d: d_students_count,
				f: f_students_count,
			}
		}

		return acc;
	}, {});

	return (
		<Card>
			<CardTitle tag="h5" style={{ textAlign: 'center' }}>
				{/* {t(chartTitle)} */}
			</CardTitle>
			<CardBody>
				{
					isLoading
						?
						<VerticalBarChartLoader />
						:
						<div style={{ overflow: 'auto' }}>
							<style>
								{`
									.s-r-tbc-table {
										border: 1px solid black;
									}

									.s-r-tbc-table th, .s-r-tbc-table td {
										border: 1px solid black;
										padding: 8px;
									}

									.s-r-tbc-table th {
										background-color: rgb(243, 242, 247)
									}
								`}
							</style>
							<table className="s-r-tbc-table" style={{ width: '100%' }}>
								<thead>
									<tr>
										<th>
											{t('№')}
										</th>
										<th>
											{t('Дамжаа')}
										</th>
										<th>
											{t('Шалгалт авсан хичээлийн нэр')}
										</th>
										<th>
											{t('Хэлбэр')}
										</th>
										<th>
											{t('Суралцагчийн тоо')}
										</th>
										<th>A</th><th>B</th><th>C</th><th>D</th><th>F</th>
										<th>
											{t(level2_key2[1])}
										</th>
										<th>
											{t(level2_key1[1])}
										</th>
										<th>
											{t(level2_key3_name)}
										</th>
									</tr>
								</thead>
								<tbody>
									{
										Object.keys(classLessonTypeData).map((key, ind) => {
											const classLessonType = classLessonTypeData[key]
											const classLessonTypeKeyArray = key.split('=_+')
											const group = classLessonTypeKeyArray[0]
											const lesson = classLessonTypeKeyArray[1]
											const exam_type = classLessonTypeKeyArray[2]
											summaryRow.all += classLessonType.all
											summaryRow.a += classLessonType.a
											summaryRow.b += classLessonType.b
											summaryRow.c += classLessonType.c
											summaryRow.d += classLessonType.d
											summaryRow.f += classLessonType.f

											return (
												<tr key={ind}>
													<td>
														{ind + 1}
													</td>
													<td>
														{group}
													</td>
													<td>
														{lesson}
													</td>
													<td>
														{exam_type === 'null' ? '' : exam_type}
													</td>
													<td>
														{classLessonType.all}
													</td>
													<td>
														{classLessonType.a}
													</td>
													<td>
														{classLessonType.b}
													</td>
													<td>
														{classLessonType.c}
													</td>
													<td>
														{classLessonType.d}
													</td>
													<td>
														{classLessonType.f}
													</td>
													<td>
														{classLessonType.success}
													</td>
													<td>
														{classLessonType.quality}
													</td>
													<td>
														{classLessonType[level2_key3_name]}
													</td>
												</tr>
											)
										})
									}
									<tr>
										<td colSpan={4}>
											{t('Нийт')}
										</td>
										<td>
											{summaryRow.all}
										</td>
										<td>
											{summaryRow.a}
										</td>
										<td>
											{summaryRow.b}
										</td>
										<td>
											{summaryRow.c}
										</td>
										<td>
											{summaryRow.d}
										</td>
										<td>
											{summaryRow.f}
										</td>
										<td>
											{getSuccess(summaryRow.a, summaryRow.b, summaryRow.c, summaryRow.all)}
										</td>
										<td>
											{getQuality(summaryRow.a, summaryRow.b, summaryRow.all)}
										</td>
										<td>
											{getFPercent(summaryRow.f, summaryRow.all)}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
				}
			</CardBody>
		</Card>
	)
}

function getSuccess(a, b, c, all) {
	return parseFloat((((a + b + c) * 100) / all).toFixed(2))
}

function getQuality(a, b, all) {
	return parseFloat((((a + b) * 100) / all).toFixed(2))
}

function getFPercent(f, all) {
	return parseFloat(((f * 100) / all).toFixed(2))
}
