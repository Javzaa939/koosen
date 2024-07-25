import { Badge }  from 'reactstrap';

import { t } from 'i18next'
import moment from 'moment'

import './style.css'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, user) {
	const page_count = Math.ceil(total_count / rowsPerPage)

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээ эхлэнэ */
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
					let border = row.justice_state == 1 ? '' : row.justice_state == 2 ? '4px solid rgba(40, 199, 111, 1)' : '4px solid #EA5455'
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
			header: 'user_age',
			name: t("Нас"),
			reorder: true,
			selector: (row) => row?.user_age,
			center: true
		},
		{
			maxWidth: "200px",
			minWidth: "200px",
			header: 'gpa',
			sortable: true,
			name: t("Голч дүн"),
			reorder: true,
			selector: (row) => row?.userinfo?.gpa,
			center: true,
		},
		{
			name: t("Хүйс"),
			selector: (row) => row?.gender_name,
			center: true,
			reorder: true,
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
			maxWidth: "200px",
			minWidth: "200px",
			header: 'justice_state',
			reorder: true,
			sortable: true,
			name: t("Төлөв"),
			selector: (row) => (
				<Badge
					color={`${row?.justice_state == 1 ? 'primary' : row?.justice_state == 2 ? 'success' : row?.justice_state == 3 ? 'danger' : 'primary'}`}
					pill
				>
					{row?.justice_state == 1 ? 'ХҮЛЭЭГДЭЖ БУЙ' : row?.justice_state_name}
				</Badge>),
			center: true,
		},
		{
			minWidth: "150px",
			header: 'justice_description',
			name: t("Тайлбар"),
			cell: (row) => (row?.justice_description),
			sortable: true,
			reorder: true,
			center: true,
			wrap: true,
		},
	]
    return columns
}