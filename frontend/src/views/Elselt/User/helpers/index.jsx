import { useRef } from 'react';
import { Badge, Input, UncontrolledTooltip }  from 'reactstrap';
import { Edit, Eye, Type } from "react-feather";
import { t } from 'i18next'

import moment from 'moment'
import useApi from '@hooks/useApi';
import useLoader from "@hooks/useLoader";

import './style.css'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, page_count, editModal, handleDelete, user, handleDetail, handleDescModal) {

	const { fetchData } = useLoader({ isFullScreen: false })
	const focusData = useRef(undefined)
	const gpaApi = useApi().elselt.gpa

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

	const focusOut = (event) => {
		if (focusData.current || focusData.current == '')
		{
			event.target.value = focusData.current
		}
	}

	const handleSetGpaResult = async(event, id, index, key) => {

		var value = event.target.value

		if(event.key === 'Enter'){
			let cdata = {
				[key]: parseFloat(value),
				'gpa_state': 2
			}
			if (id){
				const { success } = await fetchData(gpaApi.put(cdata, id))
				if (success){
					focusData.current = undefined

					var nextElementId = `${key}-${index + 1}-input`
					var element = document.getElementById(`${nextElementId}`)

					if (element) element.focus()
				}
			}
		}
	};

    const columns = [
		{
			name: "№",
			selector: (row, index) => {
				let tableRow = document.getElementById(`row-${row.id}`)

				// Тэнцсэн тэнцээгүйгээс хамаарж border-left-д улаан ногоон border өгөх
				if (tableRow)
				{
					let border = row.state == 1 ? '' : row.state == 2 ? '2px solid rgba(40, 199, 111, 1)' : '2px solid #EA5455'
					tableRow.style.borderLeft = `${border}`
				}

				return (currentPage-1) * rowsPerPage + index + 1
			},
			center: true,
			maxWidth: "80px",
			minWidth: "80px",
		},
		{
			name: t("Үйлдэл"),
			center: true,
			maxWidth: "250px",
			minWidth: "250px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
						row?.state == 1
						&&
						<>
							<a role="button"
								onClick={() => editModal(row)}
								id={`edit${row?.id}`}
								className={`me-1`}
							>
								<Badge color="light-secondary" pill><Edit disabled={row?.state !== 1} width={"15px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`edit${row.id}`}>Хөтөлбөр солих</UncontrolledTooltip>
						</>
					}
					<a role="button" onClick={() => { handleDetail(row)} }
						id={`detail${row?.id}`}
						className="me-1"
					>
						<Badge color="light-secondary" pill><Eye width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`detail${row.id}`} >Дэлгэрэнгүй</UncontrolledTooltip>
					<a role="button" onClick={() => { handleDescModal(row)} }
						id={`description${row?.id}`}
						className="me-1"
					>
						<Badge color="light-primary" pill><Type  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`description${row.id}`}>Тайлбар оруулах</UncontrolledTooltip>
				</div>
			),
		},
		{
			minWidth: "150px",
			header: 'user__last_name',
			name: t("Овог"),
			cell: (row) => (row?.user?.last_name),
			sortable: true,
			reorder: true,
			center: true,
			wrap: true,
		},
		{
			minWidth: "150px",
			header: 'user__first_name',
			name: t("Нэр"),
			cell: (row) => (row?.user?.first_name),
			sortable: true,
			reorder: true,
			center: true,
			wrap: true,
		},
        {
			maxWidth: "180px",
			minWidth: "180px",
			header: 'register',
			name: t("РД"),
			reorder: true,
			selector: (row) => row?.user?.register,
			center: true
		},
		{
			maxWidth: "250px",
			minWidth: "250px",
			header: 'profession__profession__name',
			name: 'Хөтөлбөр',
			reorder: true,
			selector: (row) => <span title={row?.profession}>{row?.profession}</span>,
            sortable: true,
			center: true,
		},
		{
			maxWidth: "200px",
			minWidth: "200px",
			header: 'gpa',
			sortable: true,
			name: t("Голч дүн"),
			reorder: true,
			selector: (row) => {
				return(
					<>
						<div className={`d-flex`}>
							<Input
								className={`text-center ${row?.userinfo?.gpa_state === 1 ? 'border-success' : 'border-danger'}`}
								// id={`gpa-${row.id}-input`}
								type="number"
								step="0.1"
								min='0'
								max='4'
								bsSize='sm'
								placeholder={(`Голч дүн`)}
								defaultValue={row?.userinfo?.gpa}
								onBlur={focusOut}
								onFocus={(e) => focusData.current = (e.target.value)}
								disabled={(Object.keys(user).length > 0 && user?.is_superuser) ? false : true}
								onKeyPress={(e) => {
									handleSetGpaResult(e, `${row?.userinfo?.id}`, row?.gpa, 'gpa')
								}}
							/>
						</div>
					</>
				)
			},
			center: true,
		},
		{
			minWidth: "250px",
			name: 'Мэдээллийн тайлбар',
			reorder: true,
			selector: (row) => <span title={row?.userinfo?.info_description} style={{fontSize:'10px'}}>{row?.userinfo?.info_description}</span>,
			wrap:true
		},
		{
			name: t("Хүйс"),
			selector: (row) => row?.gender_name,
			center: true,
			reorder: true,
		},
		{
			minWidth: "120px",
			name: t("Утас"),
			selector: (row) => row?.user?.mobile,
			wrap: true,
			reorder: true,
			center: true
		},
		{
			minWidth: "200px",
			name: t("Имэйл"),
			selector: (row) => <span style={{fontSize:'11px'}}>{row?.user?.email}</span>,
			wrap: true,
			reorder: true,
			center: true
		},
        {
			maxWidth: "350px",
			minWidth: "350px",
			wrap: true,
			name: t("Төгссөн сургууль"),
			selector: (row) => <span title={row?.userinfo?.graduate_school}>{row?.userinfo?.graduate_school}</span>,
			center: true,
			reorder: true,

		},
		{
			maxWidth: "350px",
			minWidth: "350px",
			wrap: true,
			name: t("Мэргэжил"),
			selector: (row) => <span title={row?.userinfo?.graduate_profession}>{row?.userinfo?.graduate_profession}</span>,
			center: true,
			reorder: true,
		},
		{
			name: t("Цол"),
			selector: (row) => {
				return (
					<span className='text-truncate-container' title={row?.userinfo?.tsol_name}>{row?.userinfo?.tsol_name}</span>
				)
			},
			wrap: true,
			reorder: true,
			left: true,
			minWidth: "250px",
		},
		{
			minWidth: "120px",
			name: t("Яаралтай холбогдох утас"),
			selector: (row) => row?.user?.parent_mobile,
			wrap: true,
			center: true
		},
		{
			sortField: 'created_at',
			header: 'created_at',
			maxWidth: "300px",
			minWidth: "300px",
			reorder: true,
			sortable: true,
			name: t("Бүрт/огноо"),
			selector: (row) => row?.created_at? moment(row?.created_at).format("YYYY-MM-DD h:mm") : '',
			center: true,
		},
        {
			maxWidth: "150px",
			minWidth: "150px",
			header: 'state',
			reorder: true,
			sortable: true,
			name: t("Төлөв"),
			selector: (row) => (
				<Badge
					color={`${row?.state == 1 ? 'primary' : row?.state == 2 ? 'success' : row?.state == 3 ? 'danger' : 'primary'}`}
					pill
				>
					{row?.state_name}
				</Badge>),
			center: true,
		},
	]

    return columns

}
