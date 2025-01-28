import VerticalBarChartLoader from "@src/components/VerticalBarChart";
import { getAbbreviation } from "@src/utility/Utils";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardTitle } from "reactstrap";
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function TableBySchool({ scoreRanges, isLoading, examTypeData, mainSchoolData }) {
	const { t } = useTranslation()
	const [datas, setDatas] = useState({})

	// function toChartFormat(data) {
	// 	if (scoreRanges) {
	// 		const level1_key_name = level1_key[0]
	// 		const level2_key1_name = level2_key1[0]
	// 		const level2_key2_name = level2_key2[0]

	// 		const counts = data.reduce((acc, student) => {
	// 			const level1_key_value = student[level1_key_name]

	// 			if (!acc[level1_key_value]) {
	// 				acc[level1_key_value] = { [level2_key1_name]: 0, [level2_key2_name]: 0 }
	// 				const level1KeyData = data.filter(item => item[level1_key_name] === level1_key_value)

	// 				const students_count = level1KeyData.length
	// 				const a_students_count = level1KeyData.filter(item => scoreRanges.A.score_min <= item.score && item.score <= scoreRanges.A.score_max).length
	// 				const b_students_count = level1KeyData.filter(item => scoreRanges.B.score_min <= item.score && item.score <= scoreRanges.B.score_max).length
	// 				const c_students_count = level1KeyData.filter(item => scoreRanges.C.score_min <= item.score && item.score <= scoreRanges.C.score_max).length
	// 				const d_students_count = level1KeyData.filter(item => scoreRanges.D.score_min <= item.score && item.score <= scoreRanges.D.score_max).length
	// 				const f_students_count = level1KeyData.filter(item => scoreRanges.F.score_min <= item.score && item.score <= scoreRanges.F.score_max).length

	// 				acc[level1_key_value][level2_key1_name] = ((f_students_count + b_students_count) * 100) / students_count
	// 				acc[level1_key_value][level2_key2_name] = ((a_students_count + b_students_count + c_students_count) * 100) / students_count
	// 			}

	// 			return acc;
	// 		}, {});

	// 		// to add main school stats
	// 		const main_school_name = Object.keys(mainSchoolData)[0]
	// 		counts[main_school_name] = mainSchoolData[main_school_name]

	// 		const result = Object.entries(counts).map(([key, value]) => ({
	// 			[level1_key_name]: key === main_school_name ? main_school_name : getAbbreviation(key),
	// 			[level2_key1_name]: value[level2_key1_name],
	// 			[level2_key2_name]: value[level2_key2_name],
	// 		}));

	// 		return result
	// 	}

	// 	return null
	// }

	// useEffect(() => {
	// 	const chartData = toChartFormat(examTypeData)
	// 	setDatas(chartData)
	// }, [examTypeData])

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
						<table>
							<thead>
								<tr>
									<td>

									</td>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>

									</td>
								</tr>
							</tbody>
						</table>
				}
			</CardBody>
		</Card>
	)
}
