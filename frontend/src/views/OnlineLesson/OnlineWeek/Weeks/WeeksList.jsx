import { useEffect, useMemo, useState } from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";

import { CardBody, Nav, NavItem, NavLink, TabPane } from "reactstrap";

import useApi from "@hooks/useApi";
import useLoader from '@hooks/useLoader';

import WeekMaterial from "../WeekMaterial";
import AddHomework from "../Homework/AddHomework";
import OnlineExamModal from "../OnlineExamModal/index"

export default function WeeksList({ lesson, isFresh }) {
	const [data, setData] = useState([]);
	const onlineWeekAPI = useApi().online_week;
	const { fetchData } = useLoader({})

	const [active, setActive] = useState(1)

	const nav_menus = [
        {
            active_id: 1,
            name: 'Лекцийн материал',
        },
        {
            active_id: 2,
            name: 'Шалгалт',
        },
		{
            active_id: 3,
            name: 'Гэрийн даалгавар',
        },
    ]

	async function getWeeks() {
		const { success, data } = await fetchData(onlineWeekAPI.get(lesson?.id));
		if (success) {
			setData(data);

			if(!active) {
				const activeIdx = `${data[0]?.id}-1`
				setActive(activeIdx)
			}
		}
	}

	const toggle = (menu, item) => {
		const active_id = `${item?.id}-${menu.active_id}`

        if (active !== active_id) {
            setActive(active_id)
        }
    }

	useEffect(() => {
		if (lesson?.id) getWeeks()
	},[isFresh, lesson]);

	const weeksDisplay = useMemo(() => {
		return(
			data.map((item, idy) => {
			return(
				<Accordion key={item.id}>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls="panel3-content"
						id="panel3-header"
					>
						{`${item.week_number}-р долоо хоног`}
					</AccordionSummary>
					<AccordionDetails style={{ backgroundColor:"#f2f2f2" }}>
						<Nav pills>
							{
								nav_menus.map((menu, idx) => {
									return(
										<NavItem key={`${idy}-${idx}`}>
											<NavLink
												active={(active == `${item?.id}-${menu.active_id}`) || (active === menu.active_id)}
												onClick={() => {
													toggle(menu, item)
												}}
											>
												{menu.name}
											</NavLink>
										</NavItem>
									)
								})
							}
						</Nav>
						<TabPane tabId={active}>
							{
								`${item?.id}-${2}` === active
								?
									<OnlineExamModal item={item} refresh={getWeeks}/>
								:
									`${item?.id}-${3}` === active
									?
										<CardBody>
											<AddHomework item={item} refresh={getWeeks} />
										</CardBody>
									:
										<WeekMaterial week={item} lesson={lesson} refresh={getWeeks}/>
							}
						</TabPane>
					</AccordionDetails>
				</Accordion>
			)
		}))
	}, [data, active])

	return (
		<div className="m-1">
			{weeksDisplay}
		</div>
	);
}
