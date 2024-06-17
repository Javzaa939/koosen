import { Badge, UncontrolledTooltip }  from 'reactstrap';
import { Edit, Eye, Mail, Type } from "react-feather";
import { t } from 'i18next'
import moment from 'moment'
import './style.css'

export function getColumns ( currentPage, rowsPerPage, page_count, emailModalHandler ) {

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
					let border = row?.state_name?.state == 1 ? '' : row?.state_name?.state == 2 ? '4px solid rgba(40, 199, 111, 1)' : '4px solid #EA5455'
					tableRow.style.borderLeft = `${border}`
				}

				return (currentPage-1) * rowsPerPage + index + 1
			},
			center: true,
			maxWidth: "80px",
			minWidth: "80px",
		},
		{
			name: t("И / мессеж"),
			center: true,
			maxWidth: "150px",
			minWidth: "150px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a role="button" onClick={(e) => { emailModalHandler(e, row) }}
						id={`detail${row?.id}`}
						className="me-1"
					>
						<Badge color="light-secondary" pill><Mail width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`detail${row.id}`} >Дэлгэрэнгүй</UncontrolledTooltip>
				</div>
			),
		},
		{
			minWidth: "150px",
			header: 'user__last_name',
			name: t("И / хугацаа"),
			cell: (row) => (row?.send_date? moment(row?.send_date).format("YYYY-MM-DD hh:mm") : ''),
			sortable: true,
			reorder: true,
			center: true,
			wrap: true,
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
			selector: (row) => <span title={row?.state_name?.profession_name}>{row?.state_name?.profession_name}</span>,
            // sortable: true,
			center: true,
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
			maxWidth: "150px",
			minWidth: "150px",
			header: 'state',
			reorder: true,
			sortable: true,
			name: t("Төлөв"),
			selector: (row) => (
				<Badge
					color={`${row?.state_name?.state == 1 ? 'primary' : row?.state_name?.state == 2 ? 'success px-1' : row?.state_name?.state == 3 ? 'danger' : 'primary'}`}
					pill
				>
					{row?.state_name?.state_name}
				</Badge>),
			center: true,
		},
	]

    return columns

}

