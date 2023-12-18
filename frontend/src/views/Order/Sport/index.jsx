// ** React imports
import React, { Fragment, useState, useEffect } from 'react'

import { Card, Row, Col, Label, CardBody } from 'reactstrap';

import useApi from "@hooks/useApi"
import useLoader from '@hooks/useLoader';

import Select from 'react-select'

import { ReactSelectStyles } from '@utils'

import classnames from 'classnames'

import { useTranslation } from 'react-i18next'

import Calendar from './Calendar';
import AddEventSidebar from './Add';
import moment from 'moment';

const Sports = () => {

	const { t } = useTranslation()

	// Loader
	const{ fetchData } = useLoader({ })

	// Usestate
    const [addSidebarOpen, setAddSidebarOpen] = useState(false)
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)

	const [datas, setDatas] = useState([])
	const [room_option, setRoomOption] = useState([])
    const [dates, setDates] = useState([])
    const [room_id, setRoomId] = useState('')
	const [calendar, setCalendar] = useState('')

    // ** AddEventSidebar Toggle Function
    const handleAddEventSidebar = () => setAddSidebarOpen(!addSidebarOpen)

    // ** LeftSidebar Toggle Function
    const toggleSidebar = val => setLeftSidebarOpen(val)

	// Api
	const sportApi = useApi().order.sports
    const roomApi = useApi().timetable.room

    async function getRooms() {
		// Төрлөөс хамаарч өрөөний жагсаалтын авна (room_type = 4-заалны төрөл)
		const room_type = 4
        const { success, data } = await fetchData(roomApi.getList(room_type))
        if(success) {
            setRoomOption(data)
        }
    }

    useEffect(() => {
        getRooms()
    },[])

    async function getDatas() {
        const { success, data } = await fetchData(sportApi.get(room_id))
        if(success) {
            setDatas(data)
        }
    }

    useEffect(() => {
        getDatas()
    },[room_id])

	useEffect(() => {
		if(!room_id) {
			handleEventsClear()
		}
	},[room_id, calendar])

	function handleEventsClear() {
		// Шинээр нэмсэн event-г устгана
		if(calendar) {
			setDates([])
			var listEvent = calendar.getEvents();
			listEvent.forEach(event => {
				const events = event._def.extendedProps
				const check_event = events.block
				if(check_event) {
					event.remove()
				}
			});
		}
	}

    function getDateRange(info, checked) {
        const new_date = [...dates]
		if(checked) {
			const start = info.startStr
			const end = info.endStr
			var range_date = {
				start: start,
				end: end
			}
			new_date.push(range_date)
		} else {
			new_date.map((date, idx) => {
				var new_start = new Date(info.startStr).toISOString().replace('.000Z', '')
				new_start = moment(new_start).format('YYYY-MM-DD HH:mm:ss')
				const old_start = moment(date.start).format('YYYY-MM-DD HH:mm:ss')

				if(old_start === new_start) {
					new_date.splice(idx, 1)
				}
			})
		}
        setDates([...new_date])
    }

	return (
        <Fragment>
			<Card>
				<CardBody>
					<Row className='gy-1'>
						<Col md={12}>
							<Label className='form-label' for='room'>
								Заал
							</Label>
							<Select
								name="room"
								id="room"
								classNamePrefix='select'
								isClearable
								className={classnames('react-select')}
								placeholder={t(`-- Сонгоно уу --`)}
								options={room_option || []}
								value={room_option.find((c) => c.id === room_id)}
								noOptionsMessage={() => t('Хоосон байна.')}
								onChange={(val) => {
									setRoomId(val?.id || '')
								}}
								isSearchable={true}
								styles={ReactSelectStyles}
								getOptionValue={(option) => option.id}
								getOptionLabel={(option) => option.full_name}
							/>
						</Col>
						<Col md={12}>
							<Calendar
                                room_id={room_id}
								eventDatas={datas}
								refreshDatas={getDatas}
								setCalendar={setCalendar}
                                getDateRange={getDateRange}
								toggleSidebar={toggleSidebar}
                                handleAddEventSidebar={handleAddEventSidebar}
							/>
						</Col>
                        <div
                            className={classnames('body-content-overlay', {
                                show: leftSidebarOpen === true
                            })}
                            onClick={() => toggleSidebar(false)}
                        ></div>
					</Row>
                    <AddEventSidebar
                        dates={dates}
                        roomId={room_id}
                        open={addSidebarOpen}
                        refreshDatas={getDatas}
						handleEventsClear={handleEventsClear}
                        handleAddEventSidebar={handleAddEventSidebar}
                    />
				</CardBody>
			</Card>
		</Fragment>
	);
};

export default Sports;
