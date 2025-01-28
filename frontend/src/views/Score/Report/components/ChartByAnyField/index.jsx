import VerticalBarChartLoader from "@src/components/VerticalBarChart";
import { getAbbreviation } from "@src/utility/Utils";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardTitle } from "reactstrap";
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function ChartByAnyField({ scoreRanges, isLoading, examTypeData, mainSchoolData, level2_key1, level2_key2, level1_key, chartTitle }) {
	const { t } = useTranslation()
	const [datas, setDatas] = useState({})

	function toChartFormat(data) {
		if (scoreRanges) {
			const level1_key_name = level1_key[0]
			const level2_key1_name = level2_key1[0]
			const level2_key2_name = level2_key2[0]

			const counts = data.reduce((acc, student) => {
				const level1_key_value = student[level1_key_name]

				if (!acc[level1_key_value]) {
					acc[level1_key_value] = { [level2_key1_name]: 0, [level2_key2_name]: 0 }
					const level1KeyData = data.filter(item => item[level1_key_name] === level1_key_value)

					const students_count = level1KeyData.length
					const a_students_count = level1KeyData.filter(item => scoreRanges.A.score_min <= item.score && item.score <= scoreRanges.A.score_max).length
					const b_students_count = level1KeyData.filter(item => scoreRanges.B.score_min <= item.score && item.score <= scoreRanges.B.score_max).length
					const c_students_count = level1KeyData.filter(item => scoreRanges.C.score_min <= item.score && item.score <= scoreRanges.C.score_max).length
					const d_students_count = level1KeyData.filter(item => scoreRanges.D.score_min <= item.score && item.score <= scoreRanges.D.score_max).length
					const f_students_count = level1KeyData.filter(item => scoreRanges.F.score_min <= item.score && item.score <= scoreRanges.F.score_max).length

					acc[level1_key_value][level2_key1_name] = ((f_students_count + b_students_count) * 100) / students_count
					acc[level1_key_value][level2_key2_name] = ((a_students_count + b_students_count + c_students_count) * 100) / students_count
				}

				return acc;
			}, {});

			// to add main school stats
			const main_school_name = Object.keys(mainSchoolData)[0]
			counts[main_school_name] = mainSchoolData[main_school_name]

			const result = Object.entries(counts).map(([key, value]) => ({
				[level1_key_name]: key === main_school_name ? main_school_name : getAbbreviation(key),
				[level2_key1_name]: value[level2_key1_name],
				[level2_key2_name]: value[level2_key2_name],
			}));

			return result
		}

		return null
	}

	const CustomTooltip = data => {
		if (data?.active && data?.payload && data?.payload.length > 0) {
			return (
				<div className='recharts_custom_tooltip shadow p-2 rounded-3'>
					<p className='fw-bold mb-0'>{data.label}</p>
					<hr />
					<div className='active'>
						<div className='d-flex align-items-center'>
							<span
								className='bullet bullet-sm bullet-bordered me-50'
								style={{
									backgroundColor: 'black'
								}}
							></span>
							<span className='text-capitalize me-75'>
								Нийт : {data?.payload?.map(i => i.payload[i.dataKey]).reduce((accumulator, currentValue) => accumulator + currentValue)}
							</span>
						</div>
						{data.payload.map(i => {
							return (
								<div className='d-flex align-items-center' key={i.dataKey}>
									<span
										className='bullet bullet-sm bullet-bordered me-50'
										style={{
											backgroundColor: i?.fill ? i.fill : '#fff'
										}}
									></span>
									<span className='text-capitalize me-75'>
										{i.dataKey == level2_key1[0] ? level2_key1[1] : level2_key2[1]} : {i.payload[i.dataKey]}
									</span>
								</div>
							)
						})}
					</div>
				</div>
			)
		}
		return null
	}

	useEffect(() => {
		const chartData = toChartFormat(examTypeData)
		setDatas(chartData)
	}, [examTypeData])

	return (
		<Card>
			<CardTitle tag="h5" style={{ textAlign: 'center' }}>
				{t(chartTitle)}
			</CardTitle>
			<CardBody>
				{
					isLoading
						?
						<VerticalBarChartLoader />
						:
						<div className='recharts-wrapper bar-chart' style={{ height: '350px' }}>
							<ResponsiveContainer>
								<BarChart height={100} data={datas} barSize={14}>
									<CartesianGrid strokeOpacity={0.3} />

									<XAxis dataKey={level1_key[0]} />
									<YAxis label={{ value: t('Хувь'), angle: -90, position: 'insideLeft' }} domain={[0, 120]} />

									<Legend />
									<Tooltip content={CustomTooltip} cursor={{ fill: 'rgba(148, 148, 148, 0.1)' }} />

									<Bar dataKey={level2_key1[0]} name={level2_key1[1]} fill='rgb(40, 66, 184)' radius={[50, 50, 0, 0]}>
										<LabelList
											dataKey={level2_key1[0]}
											position="top"
											formatter={(value) => isNaN(value) ? '0%' : `${parseFloat(value.toFixed(2))}%`}
										/>
									</Bar>
									<Bar dataKey={level2_key2[0]} name={level2_key2[1]} fill='rgb(32, 148, 41)' radius={[50, 50, 0, 0]}>
										<LabelList
											dataKey={level2_key2[0]}
											position="top"
											formatter={(value) => isNaN(value) ? '0%' : `${parseFloat(value.toFixed(2))}%`}
										/>
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
				}
			</CardBody>
		</Card>
	)
}
