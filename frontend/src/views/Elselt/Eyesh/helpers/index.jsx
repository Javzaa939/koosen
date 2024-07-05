import { useRef } from 'react';
import { Badge, Input, UncontrolledTooltip }  from 'reactstrap';
import { Edit, Eye, Type } from "react-feather";
import { t } from 'i18next'

import moment from 'moment'
import useApi from '@hooks/useApi';
import useLoader from "@hooks/useLoader";
import { wrap } from 'highcharts';

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, page_count) {

	const { fetchData } = useLoader({ isFullScreen: false })
	const focusData = useRef(undefined)
	const gpaApi = useApi().elselt.gpa

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
				if (tableRow)
				{
					let border = row.state == 1 ? '' : row.state == 2 ? '4px solid rgba(40, 199, 111, 1)' : '4px solid #EA5455'
					tableRow.style.borderLeft = `${border}`
				}

				return (currentPage-1) * rowsPerPage + index + 1
			},
			center: true,
			maxWidth: "80px",
			minWidth: "80px",
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
			maxWidth: "180px",
			minWidth: "180px",
			header: 'register',
			name: t("ЭЕШ"),
			reorder: true,
			selector: (row) => row?.score_avg,
			center: true
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
					color={`${row?.yesh_state == 1 ? 'primary' : row?.yesh_state == 2 ? 'success' : row?.yesh_state == 3 ? 'danger' : 'primary'}`}
					pill
				>
					{row?.yesh_state == 1 ? 'Бүртгүүлсэн' : row?.yesh_state == 2 ? 'Тэнцсэн' : row?.yesh_state == 3 ? 'Тэнцээгүй' : 'Бүртгүүлсэн'}
				</Badge>),
			center: true,
		},
		{
			maxWidth: "180px",
			minWidth: "180px",
			header: 'order',
			name: t("Байр"),
			reorder: true,
			selector: (row) => row?.order_no,
			center: true
		},
		{
			minWidth: "250px",
			name: 'Мэдээллийн тайлбар',
			reorder: true,
			selector: (row) => <span title={row?.yesh_description} style={{fontSize:'10px'}}>{row?.yesh_description}</span>,
			wrap:true
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
	]

    return columns

}
