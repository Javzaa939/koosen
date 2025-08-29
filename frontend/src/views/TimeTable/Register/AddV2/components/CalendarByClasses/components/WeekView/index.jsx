import moment from "moment"
import { Table } from "reactstrap"
import { getFirstLetters, ti } from "@src/utility/Utils";
import { useEffect, useState } from "react";
import { excludeEventsByBeginDate } from "../../helpers";


export default function WeekView({
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
	handleEventClick,
	daysLimit = 7
}) {
	// to span rows
	let previousTimesCount = 0

	// #region postprocess event data
	function groupEventData() {
		const result = {}
		const columns = {}

		eventData.forEach(item => {
			// when calendar switching from kurats calendar then this became undefined so this avoids errors
			if (!item.addon_group_id) return

			const datetime = item.start
			let is_exist = true

			if (result.hasOwnProperty(datetime)) {
				if (result[datetime]) {
					if (result[datetime].hasOwnProperty(item.addon_group_id)) result[datetime][item.addon_group_id].push(item)
					else result[datetime][item.addon_group_id] = [item]
				} else is_exist = false
			} else is_exist = false

			if (!is_exist) result[datetime] = { [item.addon_group_id]: [item] }

			if (!columns.hasOwnProperty(item.addon_group_id)) columns[item.addon_group_id] = item.addon_group_name
		})

		return { result, columns: Object.entries(columns) }
	}

	const groupedEventData = groupEventData()
	// #endregion

	// #region to get season range datetimes
	const [seasonDatetimes, setSeasonDatetimes] = useState([])
	const [timesCountInDays, setTimesCountInDays] = useState()

	const lessonNumToTime = [
		'08:00:00',
		'09:30:00',
		'11:00:00',
		'12:30:00',
		'14:00:00',
		'15:30:00',
		'17:00:00',
		'18:30:00'
	]

	function getWeektimes(startDate, endDate) {
		const start = new Date(startDate);
		const end = new Date(endDate);
		const weektimes = []
		const timesCountInDaysLocal = {}

		for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
			if (date.getDay() !== 0 && date.getDay() !== 6) {
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');

				for (let i = 0; i < lessonNumToTime.length; i++) {
					const time = lessonNumToTime[i]
					weektimes.push(`${year}-${month}-${day}T${time}`);

					if (timesCountInDaysLocal.hasOwnProperty(`${year}-${month}-${day}`)) timesCountInDaysLocal[`${year}-${month}-${day}`] += 1
					else timesCountInDaysLocal[`${year}-${month}-${day}`] = 1
				}
			}
		}

		return { weektimes, timesCountInDaysLocal }
	}

	function getSeasonDatetimes() {
		if (seasonRange?.start && seasonRange?.end) {
			let subRange = null

			if (currentSubRange) subRange = currentSubRange
			else {
				const currentDateStart = new Date()
				const currentDateEnd = new Date()
				currentDateEnd.setDate(currentDateEnd.getDate() + daysLimit - 1)

				subRange = {
					start: currentDateStart,
					end: currentDateEnd
				}
			}

			const { weektimes: range, timesCountInDaysLocal: timesCount } = getWeektimes(subRange.start, subRange.end)
			setSeasonDatetimes(range)
			setTimesCountInDays(timesCount)
			setCurrentSubRange(subRange)
		}
	}

	useEffect(() => { getSeasonDatetimes() }, [seasonRange, currentSubRange])
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
					className='tt-r-dayView-event' style={{ display: 'block', width: '100%', padding: '3.5px' }}
					onClick={() => {
						setEditDatas(event_item);
						handleEventClick();
					}}
					role="button" tabIndex="0"
				>
					<div>
						{start_time} - {end_time}
					</div>
					<div>
						{event_item.lesson_name}, {event_item.type_name}, {getFirstLetters(event_item.room_name)} {event_item.room}
					</div>
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
						{ti('Өдөр')}
					</th>
					<th>
						{ti('Цаг')}
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
					seasonDatetimes.map((seasonDatetimes_item, seasonDatetimes_index) => {
						const weekDayIndex = new Date(seasonDatetimes_item).getDay()

						// to get from current week range because in parent component eventData start and end fields filled from that range
						const currentWeekDate = getDateOfWeek(weekDayIndex)

						const time = seasonDatetimes_item.split('T')[1]
						const day = seasonDatetimes_item.split('T')[0]
						const groups = excludeEventsByBeginDate(groupedEventData.result[`${currentWeekDate}T${time}`], day)
						const dayName = moment(seasonDatetimes_item).format('dddd')
						let isRowSpan = false

						if (seasonDatetimes_index === previousTimesCount) {
							isRowSpan = true
							previousTimesCount += timesCountInDays[day]
						}

						return (
							<tr key={`${seasonDatetimes_index}-${currentPage}`}>
								{
									isRowSpan &&
									<td rowSpan={timesCountInDays[day]} style={{ width: '70px', fontWeight: 'bold' }}>
										{dayName}
									</td>
								}
								<td style={{
									// to align correctly first child because default _tables.scss changes first child
									paddingLeft: '0.75rem',
									width: '56px'
								}}>
									{time}
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
													const date = moment(seasonDatetimes_item).format('MMMM D, YYYY')

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
												rest_event_data.push(singleEventsView(start_time, event_item, end_time, i, bgColor))
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
																result.push(singleEventsView(start_time, event_item, end_time, i, bgColor, textColor))

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
