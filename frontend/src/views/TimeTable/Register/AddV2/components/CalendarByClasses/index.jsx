import moment from "moment"
import 'moment/locale/mn';
import { useEffect, useRef, useState } from "react";
import useApi from "@src/utility/hooks/useApi";
import useLoader from "@src/utility/hooks/useLoader";
import { ti } from "@src/utility/Utils";
import MonthView from "./components/MonthView";
import WeekView from "./components/WeekView";
import { ChevronLeft, ChevronRight } from "react-feather";


export default function CalendarByClasses({ eventData = [], currentPage, setEditDatas, handleEventClick }) {
	moment.locale('mn');
	const parentRef = useRef(null);

	// #region tabs (toolbar)
	const timeRanges = ['month', 'week', 'day']
	const [selectedTimeRange, setSelectedTimeRange] = useState(timeRanges[0])
	// #endregion

	// #region to get season range
	const activeYearApi = useApi().settings.activeyear
	const { fetchData } = useLoader({})
	const [seasonRange, setSeasonRange] = useState([])

	async function getSeasonRange() {
		const { success, data } = await fetchData(activeYearApi.getActiveYear())

		if (success) {
			setSeasonRange({ start: data?.start_date, end: data?.finish_date })
		}
	}

	useEffect(() => { getSeasonRange() }, [])
	// #endregion

	// to expand same events per week
	function getDateOfWeek(dayIndex) {
		const currentDate = new Date();
		const currentDayOfWeek = currentDate.getDay();
		const diff = dayIndex - currentDayOfWeek;
		const targetDate = new Date(currentDate);
		targetDate.setDate(currentDate.getDate() + diff);
		const year = targetDate.getFullYear();
		const month = String(targetDate.getMonth() + 1).padStart(2, '0');
		const day = String(targetDate.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	}

	// #region tooltip
	const [tooltipStyle, setTooltipStyle] = useState({});
	const [visible, setVisible] = useState(null);
	const [tooltipBody, setTooltipBody] = useState(null);
	const hideTimeout = useRef();

	// #region if tooltip "hover" display mode is using
	// to freeze tooltip on mouse hover
	function freezeTooltip() {
		clearTimeout(hideTimeout.current);
	}

	// to close tooltip by timeout
	function hideTooltip() {
		if (hideTimeout.current) {
			clearTimeout(hideTimeout.current);
		}

		hideTimeout.current = setTimeout(() => setVisible(false), 500);
	}
	// #endregion

	function showTooltip(e, children) {
		clearTimeout(hideTimeout.current);
		setVisible(true);
		const tooltipWidth = 570;
		const { clientX, clientY } = e;
		const { left, right, top } = parentRef.current.getBoundingClientRect();
		let leftPosition = clientX - left;

		if (leftPosition + tooltipWidth > right - left) {
			leftPosition = right - left - tooltipWidth;
		}

		if (leftPosition < 0) {
			leftPosition = 0;
		}

		setTooltipStyle({
			top: clientY - top,
			left: leftPosition,
		});

		setTooltipBody(children)
	}

	// #region if tooltip "click" display mode is using
	const tooltipRef = useRef(null);

	// to close tooltip if click was in outside
	function handleClickOutside(e) {
		if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
			setVisible(false);
		}
	}

	function handleCloseTooltip() {
		setVisible(false);
	}

	// to add listener to close tooltip if click was in outside
	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);

		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);
	// #endregion
	// #endregion tooltip

	// #region currentSubRange
	const [currentSubRange, setCurrentSubRange] = useState('')

	function handleCurrentSubRange(diff) {
		if (!diff || !currentSubRange) return
		let start = new Date(currentSubRange.start)
		let end = new Date(currentSubRange.end)

		if (selectedTimeRange === 'month') {
			start.setMonth(start.getMonth() + diff)

			// to correctly setmonth because if date not equal 1 then month start jumping
			end.setDate(1)
			end.setMonth(end.getMonth() + diff)
			end = new Date(end.getFullYear(), end.getMonth() + 1, 0)

		} else {
			start.setDate(start.getDate() + diff)
			end.setDate(end.getDate() + diff)
		}

		const currentSubRangeLocal = {
			start: start,
			end: end
		}

		setCurrentSubRange(currentSubRangeLocal)
	}

	useEffect(() => {
		setCurrentSubRange('')
	}, [selectedTimeRange])
	// endregion

	return (
		<>
			<style>
				{`
					.tt-r-table {
						text-align: center;
					}

					.tt-r-event:hover {
						background-color: #eeeeee;
					}

					.tt-r-dayView-event:hover {
						background-color: #a3a3a3;
					}

					/* #region tooltip close */
					.tt-r-event-tooltip-header {
						display: flex;
						justify-content: space-between;
					}

					.tt-r-event-tooltip-close {
						cursor: pointer;
						display: inline-block;
						width: 1em;
						height: 1em;
						line-height: 1;
						text-align: center;
						color: #5e5873;
					}

					.tt-r-event-tooltip-icon-x::before {
						content: "X";
						font-size: 1.1em;
					}
					/* #endregion */

					/* #region toolbar */
					.tt-r-toolbar {
						padding-top: 0.55rem;
						padding-bottom: 0.55rem;
						text-align: right;
					}

					.tt-r-toolbar button {
					    padding: 0.55rem 1.5rem;
						color: #036C86;
						border: 1px solid transparent;
						border-color: #036C86;
						border-radius: 0.358rem;
					}

					button.tt-r-toolbar-first {
						border-top-right-radius: 0;
						border-bottom-right-radius: 0;
					}

					button.tt-r-toolbar-between {
						margin-left: -1px;
						border-top-left-radius: 0;
						border-bottom-left-radius: 0;
						border-top-right-radius: 0;
						border-bottom-right-radius: 0;
					}

					button.tt-r-toolbar-last {
					    margin-left: -1px;
						border-top-left-radius: 0;
						border-bottom-left-radius: 0;
					}

					.tt-r-toolbar-active {
						background-color: rgba(3, 108, 134, 0.2);
					}
					/* #endregion */

					/* next prev time range */
					.tt-r-toolbar-timerange button {
						border: 0;
						background-color: transparent;
						color: #6e6b7b;
					}
				`}
			</style>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					paddingLeft: '1.5rem',
					paddingRight: '1.5rem',
					alignItems: 'center'
				}}
			>
				<div className="tt-r-toolbar-timerange">
					<button type="button" onClick={() => handleCurrentSubRange(-1)}>
						<ChevronLeft size={21} />
					</button>
					<button type="button" onClick={() => handleCurrentSubRange(1)}>
						<ChevronRight size={21} />
					</button>
				</div>
				<div>
					<h2 style={{ fontSize: '1.45rem', margin: '0' }}>
						{
							currentSubRange === ''
								?
								''
								:
								moment(currentSubRange?.start).format('YYYY-MM-DD') === moment(currentSubRange?.end).format('YYYY-MM-DD')
									?
									moment(currentSubRange?.start).format('YYYY-MM-DD')
									:
									`${moment(currentSubRange?.start).format('YYYY-MM-DD')}...${moment(currentSubRange?.end).format('DD')}`
						}
					</h2>
				</div>
				<div className="tt-r-toolbar">
					<button type="button"
						className={`tt-r-toolbar-first${selectedTimeRange === 'month' ? ' tt-r-toolbar-active' : ''}`}
						onClick={() => setSelectedTimeRange('month')}>
						{ti('Сар')}
					</button>
					<button type="button"
						className={`tt-r-toolbar-between${selectedTimeRange === 'week' ? ' tt-r-toolbar-active' : ''}`}
						onClick={() => setSelectedTimeRange('week')}>
						{ti('7 хоног')}
					</button>
					<button type="button"
						className={`tt-r-toolbar-last${selectedTimeRange === 'day' ? ' tt-r-toolbar-active' : ''}`}
						onClick={() => setSelectedTimeRange('day')}>
						{ti('Өдөр')}
					</button>
				</div>
			</div>
			{
				eventData.length > 0 &&
				<div ref={parentRef}>
					{
						selectedTimeRange === 'month'
							?
							<MonthView
								seasonRange={seasonRange}
								currentPage={currentPage}
								getDateOfWeek={getDateOfWeek}
								showTooltip={showTooltip}
								hideTooltip={hideTooltip}
								handleCloseTooltip={handleCloseTooltip}
								eventData={eventData}
								setCurrentSubRange={setCurrentSubRange}
								currentSubRange={currentSubRange}
								setEditDatas={setEditDatas}
								handleEventClick={handleEventClick}
							/>
							:
							selectedTimeRange === 'week'
								?
								<WeekView
									key={selectedTimeRange}
									seasonRange={seasonRange}
									currentPage={currentPage}
									getDateOfWeek={getDateOfWeek}
									showTooltip={showTooltip}
									hideTooltip={hideTooltip}
									handleCloseTooltip={handleCloseTooltip}
									eventData={eventData}
									setCurrentSubRange={setCurrentSubRange}
									currentSubRange={currentSubRange}
									setEditDatas={setEditDatas}
									handleEventClick={handleEventClick}
								/>
								:
								selectedTimeRange === 'day'
									?
									<WeekView
										key={selectedTimeRange}
										seasonRange={seasonRange}
										currentPage={currentPage}
										getDateOfWeek={getDateOfWeek}
										showTooltip={showTooltip}
										hideTooltip={hideTooltip}
										handleCloseTooltip={handleCloseTooltip}
										eventData={eventData}
										daysLimit={1}
										setCurrentSubRange={setCurrentSubRange}
										currentSubRange={currentSubRange}
										setEditDatas={setEditDatas}
										handleEventClick={handleEventClick}
									/>
									:
									<></>
					}
					{
						visible &&
						<div
							ref={tooltipRef}
							className="p-1 rounded"
							style={{
								...tooltipStyle,
								zIndex: 9999,
								width: '570px',
								fontSize: '0.8rem',
								fontWeight: '600',
								maxHeight: '590px',
								overflow: 'auto',
								backgroundColor: '#ffffff',
								position: 'absolute'
							}}
						// onMouseEnter={freezeTooltip} onMouseLeave={hideTooltip}
						>
							{tooltipBody}
						</div>
					}
				</div>
			}
		</>
	)
}
