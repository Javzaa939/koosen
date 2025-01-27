import VerticalBarChartLoader from "@src/components/VerticalBarChart";
import useApi from "@src/utility/hooks/useApi";
import useLoader from "@src/utility/hooks/useLoader";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardTitle } from "reactstrap";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function ChartBySchool({ examType }) {
	const { t } = useTranslation()
	const { isLoading, fetchData } = useLoader({})
	const teacherScoreReportApi = useApi().score.teacherScore

	// states
	const [datas, setDatas] = useState({})

	// test
	const datatest = [{
		"name": "Аюулгүй байдал-дотоодын цэрэг 2025",
		"total": 16,
		"male": 16,
		"female": 10
	}, {
		"name": "Аюулгүй байдал судлал /4 өдөр/",
		"total": 14,
		"male": 10,
		"female": 14
	},]

	const key1 = ['male', 'Чанар']
	const key2 = ['female', 'Амжилт']
	const key3 = ['name']

	async function getData() {
		const { success, data } = await fetchData(teacherScoreReportApi.getReportSchool())

		if (success) {console.log(data)
			setDatas(datatest)
		}
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
										{i.dataKey == key1[0] ? key1[1] : key2[1]} : {i.payload[i.dataKey]}
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
		getData()
	}, [])

	return (
		<Card>
			<CardTitle tag="h5" style={{ textAlign: 'center' }}>
				{t('Бүрэлдэхүүн сургууль, институт')}
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

									<XAxis dataKey={key3[0]} />
									<YAxis label={{ value: t('Хувь'), angle: -90 }} />

									<Legend />
									<Tooltip content={CustomTooltip} cursor={{ fill: 'rgba(148, 148, 148, 0.1)' }} />

									<Bar dataKey={key1[0]} name={key1[1]} fill='rgb(40, 66, 184)' radius={[50, 50, 0, 0]} />
									<Bar dataKey={key2[0]} name={key2[1]} fill='rgb(32, 148, 41)' radius={[50, 50, 0, 0]} />

								</BarChart>
							</ResponsiveContainer>
						</div>
				}
			</CardBody>
		</Card>
	)
}