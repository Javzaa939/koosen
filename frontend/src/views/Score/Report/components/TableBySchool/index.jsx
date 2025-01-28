import VerticalBarChartLoader from "@src/components/VerticalBarChart";
import { getAbbreviation } from "@src/utility/Utils";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardTitle } from "reactstrap";

export default function TableBySchool({ isLoading, subSchoolData, mainSchoolData }) {
	const { t } = useTranslation()
	const mainSchoolName = Object.keys(mainSchoolData)[0]
	const mainSchool = mainSchoolData[mainSchoolName]

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
									.s-r-tbs-table {
										border: 1px solid black;
									}

									.s-r-tbs-table th, .s-r-tbs-table td {
										border: 1px solid black;
										padding: 8px;
									}

									.s-r-tbs-table th {
										background-color: rgb(243, 242, 247)
									}
								`}
							</style>
							<table className="s-r-tbs-table" style={{ width: '100%' }}>
								<thead>
									<tr>
										<th rowSpan={2}>
											{t('Бүрэлдэхүүн сургууль')}
										</th>
										<th rowSpan={2}>
											{t('Шалгалтад хамрагдсан суралцагчийн тоо')}
										</th>
										<th colSpan={5}>
											{t('Үнэлгээ')}
										</th>
										<th rowSpan={2}>
											{t('Амжилт')}
										</th>
										<th rowSpan={2}>
											{t('Чанар')}
										</th>
									</tr>
									<tr><th>A</th><th>B</th><th>C</th><th>D</th><th>F</th></tr>
								</thead>
								<tbody>
									{
										Object.keys(subSchoolData).map((key, ind) => {
											const subSchool = subSchoolData[key]

											return (
												<tr key={ind}>
													<td>
														{getAbbreviation(key)}
													</td>
													<td>
														{subSchool.all}
													</td>
													<td>
														{subSchool.a}
													</td>
													<td>
														{subSchool.b}
													</td>
													<td>
														{subSchool.c}
													</td>
													<td>
														{subSchool.d}
													</td>
													<td>
														{subSchool.f}
													</td>
													<td>
														{subSchool.success}
													</td>
													<td>
														{subSchool.quality}
													</td>
												</tr>
											)
										})
									}
									<tr>
										<td>
											{mainSchoolName}
										</td>
										<td>
											{mainSchool.all}
										</td>
										<td>
											{mainSchool.a}
										</td>
										<td>
											{mainSchool.b}
										</td>
										<td>
											{mainSchool.c}
										</td>
										<td>
											{mainSchool.d}
										</td>
										<td>
											{mainSchool.f}
										</td>
										<td>
											{mainSchool.success}
										</td>
										<td>
											{mainSchool.quality}
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
