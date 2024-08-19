import { useRef } from 'react';
import { Badge, UncontrolledTooltip } from 'reactstrap';
import { CheckCircle, Eye } from "react-feather";
import { t } from 'i18next'

import useApi from '@hooks/useApi';
import useLoader from "@hooks/useLoader";

// Хүснэгтийн баганууд
export function getColumns(currentPage, rowsPerPage, total_count, addModalHandler, handleDetail) {
	const page_count = Math.ceil(total_count / rowsPerPage)

	// const { fetchData } = useLoader({ isFullScreen: false })
	// const focusData = useRef(undefined)
	// const gpaApi = useApi().elselt.gpa

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
	if (currentPage > page_count) {
		currentPage = 1
	}

	const columns = [
		{
			name: "№",
			selector: (row, index) => {
				let tableRow = document.getElementById(`row-${row.id}`)

				// Тэнцсэн тэнцээгүйгээс хамаарж border-left-д улаан ногоон border өгөх
				if (tableRow) {
					let border = row.yesh_state == 1 ? '' : row.yesh_state == 2 ? '4px solid rgba(40, 199, 111, 1)' : '4px solid #EA5455'
					tableRow.style.borderLeft = `${border}`
				}

				return (currentPage - 1) * rowsPerPage + index + 1
			},
			center: true,
			maxWidth: "80px",
			minWidth: "80px",
		},
		{
			maxWidth: "180px",
			minWidth: "180px",
			header: 'register',
			name: t("РД"),
			reorder: true,
			selector: (row, index) => {
				let tableRow = document.getElementById(`row-${row.id}`)

				// Тэнцсэн тэнцээгүйгээс хамаарж border-left-д улаан ногоон border өгөх
				if (tableRow) {
					let border = row.yesh_state == 1 ? '' : row.yesh_state == 2 ? '4px solid rgba(40, 199, 111, 1)' : '4px solid #EA5455'
					tableRow.style.borderLeft = `${border}`
				}

				return row?.user?.register
			},
			center: true
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
			maxWidth: "180px",
			minWidth: "180px",
			header: 'age',
			name: t("Нас"),
			reorder: true,
			selector: (row) => row?.age,
			center: true
		},
		{
			maxWidth: "180px",
			minWidth: "180px",
			header: 'gender',
			name: t("Хүйс"),
			reorder: true,
			selector: (row) => row?.gender,
			center: true
		},
		{
			maxWidth: "180px",
			minWidth: "180px",
			name: t("Бүртгэлийн дугаар"),
			selector: (row) => row?.user?.code,
			center: true
		},
		{
			maxWidth: "180px",
			minWidth: "180px",
			name: t("МХ оноо"),
			reorder: true,
			header: 'score_avg',
			selector: (row) => row?.score_avg,
			center: true
		},
		{
			maxWidth: "180px",
			minWidth: "180px",
			header: 'order',
			name: t("Эрэмбэ"),
			reorder: true,
			sortable: true,
			selector: (row) => row?.order_no,
			center: true
		},
		{
			maxWidth: "180px",
			minWidth: "180px",
			header: 'phone',
			name: t("Утас"),
			reorder: true,
			selector: (row) => row?.user?.mobile,
			center: true
		},
		{
			maxWidth: "180px",
			minWidth: "180px",
			header: 'E-Mail',
			name: t("ИМЭЙЛ"),
			reorder: true,
			selector: (row) => row?.user?.email,
			center: true
		},
		{
			maxWidth: "180px",
			minWidth: "180px",
			header: 'gender',
			name: t("Овог нэр"),
			reorder: true,
			selector: (row) => row?.full_name,
			center: true
		},
		{
			name: "Төлөв солих",
			center: true,
			maxWidth: "120px",
			minWidth: "120px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a
						role="button"
						onClick={(e) => { addModalHandler(e, row)} }
						id={`description${row?.id}`}
						className="me-1"
					>
						<Badge color="light-success" pill><CheckCircle  width={"15px"} /></Badge>
					</a>
					<a role="button" onClick={() => { handleDetail(row)} }
						id={`detail${row?.id}`}
						className="me-1"
					>
						<Badge color="light-secondary" pill><Eye width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`detail${row.id}`} >Дэлгэрэнгүй</UncontrolledTooltip>
				</div>
			),
		}
	]

	return columns

}
