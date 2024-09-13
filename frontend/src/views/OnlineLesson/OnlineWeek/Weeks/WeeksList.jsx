import { useEffect, useMemo, useState } from "react";

import useModal from "@hooks/useModal"

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";

import { Badge, CardBody, Modal, ModalHeader, Nav, NavItem, NavLink, TabPane, UncontrolledTooltip } from "reactstrap";

import useApi from "@hooks/useApi";
import useLoader from '@hooks/useLoader';

import WeekMaterial from "../WeekMaterial";
import AddHomework from "../Homework/AddHomework";
import OnlineExamModal from "../OnlineExamModal/index"
import { Edit, X } from "react-feather";
import CreateWeekModal from "./CreateWeekModal";

export default function WeeksList({ lesson, isFresh }) {
	const { showWarning } = useModal()

	const [data, setData] = useState([]);
	const onlineWeekAPI = useApi().online_week;
	const { fetchData } = useLoader({})

	const [active, setActive] = useState(1)
	const [editId, setEditId] = useState('')
	const [editModal, setEditModal] = useState(false)

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

	const editToggle = () => setEditModal(!editModal)

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
	},[lesson]);

	async function handleDelete(id) {
		const { success, data } = await fetchData(onlineWeekAPI.delete(id))
		if(success) {
			getWeeks()
		}
	}

	const weeksDisplay = useMemo(() => {
		return(
			data.map((item, idy) => {
			return(
				<div className="d-flex justify-content-between mb-1">
					<div style={{ width: '90%' }}>
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
					</div>
					<div className="mt-1 ps-2" style={{ width: '10%' }}>
						<>
							<a
								role="button"
								onClick={() => {
									setEditId(item?.id)
									editToggle()
								}}
								id={`complaintListDatatableEdit${item?.id}`}
								className='me-1'
							>
								<Badge color="light-success" pill><Edit width={30} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${item.id}`} >Засах</UncontrolledTooltip>
						</>
						<>
							<a
								role="button"
								onClick={() => showWarning({
									header: {
										title: `${item.week_number}-р долоо хоног устгах`,
									},
									question: `Та ${item.week_number}-р долоо хоногийг устгахдаа итгэлтэй байна уу?`,
									onClick: () => handleDelete(item.id),
									btnText: 'Устгах',
								})}
								id={`complaintListDatatableCancel${item?.id}`}
							>
								<Badge color="light-danger" pill><X width={"100px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${item.id}`} >Устгах</UncontrolledTooltip>
						</>
					</div>
				</div>
			)
		}))
	}, [data, active])

	return (
		<div className="m-1">
			{weeksDisplay}
			{
				editModal &&
				<Modal
					className="modal-dialog-centered modal-lg"
					contentClassName="pt-0"
					backdrop="static"
					isOpen={editModal}
					toggle={() => {
						editToggle()
						setEditId('')
					}}
				>
					<ModalHeader toggle={() => {
						editToggle()
						setEditId('')
						}}
					>
						7 Хоног засах
					</ModalHeader>
					<CreateWeekModal
						toggle={() => {
							editToggle()
							setEditId('')
						}}
						lesson={lesson} isFresh={isFresh} setIsFresh={getWeeks} editId={editId} />
				</Modal>
			}
		</div>
	);
}
