import moment from "moment"
import { Table } from "reactstrap"
import { ti } from "@src/utility/Utils";
import { useEffect, useState } from "react";
import { excludeEventsByBeginDate } from "../../helpers";


export default function MonthView({
	seasonRange,
	currentPage,
	getDateOfWeek,
	showTooltip,
	hideTooltip,
	handleCloseTooltip,
	eventData,
	setCurrentSubRange,
	currentSubRange,
	setEditDatas,
	handleEventClick
}) {
	// to span rows
	let previousDaysCount = 0

	// #region postprocess event data
	function groupEventData() {
		const result = {}
		const columns = {}

		eventData.forEach(item => {
			// when calendar switching from kurats calendar then this became undefined so this avoids errors
			if (!item.addon_group_id) return

			const date = item.start.split('T')[0]
			let is_exist = true

			if (result.hasOwnProperty(date)) {
				if (result[date]) {
					if (result[date].hasOwnProperty(item.addon_group_id)) result[date][item.addon_group_id].push(item)
					else result[date][item.addon_group_id] = [item]
				} else is_exist = false
			} else is_exist = false

			if (!is_exist) result[date] = { [item.addon_group_id]: [item] }

			if (!columns.hasOwnProperty(item.addon_group_id)) columns[item.addon_group_id] = item.addon_group_name
		})

		return { result, columns: Object.entries(columns) }
	}

	const groupedEventData = groupEventData()
	// #endregion

	// #region to get season range dates
	const [seasonDates, setSeasonDates] = useState([])
	const [daysCountInMonths, setDaysCountInMonths] = useState()

	function getWeekdays(startDate, endDate) {
		const start = new Date(startDate);
		const end = new Date(endDate);
		const weekdays = []
		const daysCountInMonthsLocal = {}

		for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
			if (date.getDay() !== 0 && date.getDay() !== 6) {
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				weekdays.push(`${year}-${month}-${day}`);

				if (daysCountInMonthsLocal.hasOwnProperty(`${year}-${month}`)) daysCountInMonthsLocal[`${year}-${month}`] += 1
				else daysCountInMonthsLocal[`${year}-${month}`] = 1
			}
		}

		return { weekdays, daysCountInMonthsLocal }
	}

	function getSeasonDates() {
		if (seasonRange?.start && seasonRange?.end) {
			let subRange = null

			if (currentSubRange) subRange = currentSubRange
			else {
				const currentDateStart = new Date()
				currentDateStart.setDate(1)

				// to get last day of month "0" day is used
				const currentDateEnd = new Date(currentDateStart.getFullYear(), currentDateStart.getMonth() + 1, 0)

				subRange = {
					start: currentDateStart,
					end: currentDateEnd
				}
			}

			const { weekdays: range, daysCountInMonthsLocal: daysCount } = getWeekdays(subRange.start, subRange.end)
			setSeasonDates(range)
			setDaysCountInMonths(daysCount)
			setCurrentSubRange(subRange)
		}
	}

	useEffect(() => { getSeasonDates() }, [seasonRange, currentSubRange])
	// #endregion

	// #region to define each cell appearance
	const eventsLimitInCell = 5

	function singleEventsView(start_time, event_item, end_time, key, bgColor, textColor) {
		return (
			<div key={key} style={{
				textAlign: 'left',
				color: textColor,
				backgroundColor: bgColor,
			}}>
				<a
					className='tt-r-event' style={{ display: 'block', width: '100%', padding: '3.5px' }}
					onClick={() => {
						setEditDatas(event_item);
						handleEventClick();
					}}
					role="button" tabIndex="0"
				>
					{start_time} {event_item.lesson_name}, {event_item.lesson_code} {start_time} - {end_time}
				</a>
			</div>
		)
	}

	function multipleEventsView(start_time, event_item, end_time, key, bgColor) {
		return (
			<div key={key} style={{
				textAlign: 'left'
			}}>
				<a
					className='tt-r-event' style={{ display: 'block', width: '100%', padding: '3.5px' }}
					onClick={() => {
						setEditDatas(event_item);
						handleEventClick();
					}}
					role="button" tabIndex="0"
				>
					<span style={{
						width: '8px',
						height: '8px',
						borderRadius: '50%',
						backgroundColor: bgColor,
						marginRight: '8px',
						border: '1px solid #999999',
						display: 'inline-block'
					}} /> {start_time} {event_item.lesson_name}, {event_item.lesson_code} {start_time} - {end_time}
				</a>
			</div>
		)
	}
	// #endregion

	return (
		<Table
			bordered
			className="table-light tt-r-table"
			// dark
			hover
			responsive
			size="sm"
			striped
		>
			<thead>
				<tr>
					<th>
						{ti('Сар')}
					</th>
					<th>
						{ti('Өдөр')}
					</th>
					{
						groupedEventData.columns.map(([key, item], index) => {
							return (
								<th key={index}>
									{item}
								</th>
							)
						})
					}
				</tr>
			</thead>
			<tbody>
				{
					seasonDates.map((seasonDates_item, seasonDates_index) => {
						const weekDayIndex = new Date(seasonDates_item).getDay()

						// to get from current week range because in parent component eventData start and end fields filled from that range
						const currentWeekDate = getDateOfWeek(weekDayIndex)

						const groups = excludeEventsByBeginDate(groupedEventData.result[currentWeekDate], seasonDates_item)
						const month = seasonDates_item.split('-').slice(0, 2).join('-')
						const monthName = moment(seasonDates_item).format('MMM')
						const day = seasonDates_item.split('-')[2]
						let isRowSpan = false

						if (seasonDates_index === previousDaysCount) {
							isRowSpan = true
							previousDaysCount += daysCountInMonths[month]
						}

						return (
							<tr key={`${seasonDates_index}-${currentPage}`}>
								{
									isRowSpan &&
									<td rowSpan={daysCountInMonths[month]} style={{ width: '70px' }}>
										{monthName}
									</td>
								}
								<td style={{
									// to align correctly first child because default _tables.scss changes first child
									paddingLeft: '0.75rem',
									width: '56px'
								}}>
									{day}
								</td>
								{
									groupedEventData.columns.map(([columns_key, columns_item], columns_index) => {
										let events = null
										let rest_event_data = []
										let rest_event_count = ''

										if (groups && groups[columns_key]) {
											events = groups[columns_key]

											for (let i = eventsLimitInCell; i < events.length; i++) {
												const event_item = events[i]
												const start_time = event_item.start.split('T')[1].split(':').slice(0, 2).join(':')
												const end_time = event_item.end.split('T')[1].split(':').slice(0, 2).join(':')
												const bgColor = event_item.color

												// to add header in tooltip
												if (i === eventsLimitInCell) {
													const date = moment(seasonDates_item).format('MMMM D, YYYY')

													rest_event_data.push(
														<div key={`${i}-tooltip-header`} className="tt-r-event-tooltip-header">
															<div style={{ fontSize: '1em', fontWeight: '400' }}>{date}</div>
															<span
																className="tt-r-event-tooltip-close tt-r-event-tooltip-icon-x"
																title="Close"
																onClick={handleCloseTooltip}
															/>
														</div>
													)
												}

												// to define tooltip body
												rest_event_data.push(multipleEventsView(start_time, event_item, end_time, i, bgColor))
											}

											rest_event_count = `+${events.length - eventsLimitInCell} ${ti('Илүү')}`
										}

										return (
											<td key={columns_key}>
												{events &&
													<div style={{
														fontSize: '0.8rem',
														fontWeight: '600',
													}}>
														{(() => {
															const result = []

															for (let i = 0; i < events.length; i++) {
																if (i === eventsLimitInCell) break
																const event_item = events[i]
																const start_time = event_item.start.split('T')[1].split(':').slice(0, 2).join(':')
																const end_time = event_item.end.split('T')[1].split(':').slice(0, 2).join(':')
																const bgColor = event_item.color
																const textColor = event_item.textcolor

																if (events.length === 1) {
																	result.push(singleEventsView(start_time, event_item, end_time, i, bgColor, textColor))
																} else {
																	result.push(multipleEventsView(start_time, event_item, end_time, i, bgColor))
																}

																// to add "more..." function
																if (events.length > eventsLimitInCell && i === eventsLimitInCell - 1) {
																	result.push(
																		<div key={`${i}-tooltip`} onClick={(e) => showTooltip(e, rest_event_data)}
																		// onMouseEnter={(e) => showTooltip(e, rest_event_data)} onMouseLeave={hideTooltip}
																		>
																			{rest_event_count}
																		</div>
																	)
																}
															}

															return result
														})()}
													</div>
												}
											</td>
										)
									})
								}
							</tr>
						)
					})
				}
			</tbody>
		</Table>
	)
}
