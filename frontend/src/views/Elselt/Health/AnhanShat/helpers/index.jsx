import { Book, CheckCircle, Type } from "react-feather"
import { Badge, UncontrolledTooltip } from "reactstrap"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, page_count, addModalHandler) {

    // /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
		{
			name: "№",
			selector: (row, index) => {
				// let tableRow = document.getElementById(`row-${row.id}`)

				// // Тэнцсэн тэнцээгүйгээс хамаарж border-left-д улаан ногоон border өгөх
				// if (tableRow)
				// {
				// 	let border = row.state == 1 ? '' : row.state == 2 ? '4px solid rgba(40, 199, 111, 1)' : '4px solid #EA5455'
				// 	tableRow.style.borderLeft = `${border}`
				// }

				// console.log((currentPage-1) * rowsPerPage + index + 1)
				return (currentPage-1) * rowsPerPage + index + 1
			},
			minWidth: '80px',
			maxWidth: '80px',
		},
		{
			header: 'full_name',
			name: <div className="px-1">Нэр</div>,
			minWidth: '160px',
			maxWidth: '160px',
			selector: (row) => row?.full_name || ''
		},
		{
			header: 'register',
			name: <div className="px-1">РД</div>,
			selector: (row) => row?.user_register || '',
            sortable: true,
			minWidth: '140px',
			maxWidth: '140px',
		},
		{
			header: 'gender',
			name: <div className="px-1">Хүйс</div>,
			selector: (row) => row?.gender_name || '',
            sortable: true,
			minWidth: '140px',
			maxWidth: '140px',
		},
        {
			maxWidth: "200px",
			minWidth: "200px",
			header: 'state',
			reorder: true,
			sortable: true,
			name: "Үзлэгийн төлөв",
			selector: (row) => (
				<Badge
					color={`${row?.health_user?.state == 1 ? 'gradient-primary' : row?.state == 2 ? 'gradient-success' : row?.state == 3 ? 'gradient-danger' : 'gradient-primary'}`}
					pill
				>
					{row?.state_name}
				</Badge>),
			center: true,
		},
		{
			header: 'height',
			name: <div className="px-1">Өндөр</div>,
			selector: (row) => row?.health_user?.height || '',
            sortable: true,
			minWidth: '140px',
			maxWidth: '140px',
		},
		{
			header: 'weight',
			name: <div className="px-1">Жин</div>,
			selector: (row) => row?.health_user?.weight || '',
            sortable: true,
			minWidth: '140px',
			maxWidth: '140px',
		},
		{
			header: 'is_chalk',
			name: <div className="px-1">Шарх сорвитой эсэх</div>,
			selector: (row) => (
				row?.health_user &&
				<div className="p-25 px-50 rounded-4 bg-light-secondary">
					{row?.health_user?.is_chalk ? 'Тийм' : 'Үгүй'}
				</div>
			),
            sortable: true,
			minWidth: '200px',
			maxWidth: '200px',
		},
		{
			header: 'is_tattoo',
			name: <div className="px-1">Шивээстэй эсэх</div>,
			selector: (row) => (
				row?.health_user &&
				<div className="p-25 px-50 rounded-4 bg-light-secondary">
					{row?.health_user?.is_tattoo ? 'Тийм' : 'Үгүй'}
				</div>
			),
            sortable: true,
			minWidth: '140px',
			maxWidth: '140px',
		},
		{
			header: 'is_drug',
			name: <div className="px-1">Сэтгэцэд нөлөөт бодисын хамаарал</div>,
			selector: (row) => (
				row?.health_user &&
				<div className="p-25 px-50 rounded-4 bg-light-secondary">
					{row?.health_user?.is_drug ? 'Тийм' : 'Үгүй'}
				</div>
			),
            sortable: true,
			minWidth: '220px',
			maxWidth: '220px',
		},
		{
			name: "Үйлдэл",
			center: true,
			maxWidth: "120px",
			minWidth: "120px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a
						id={`requestLeaveDatatableDetails${row.id}`}
						onClick={() => console.log(row?.id, row)}
						className="me-50"
					>
						<Badge color="light-info" pill><Book width={"15px"} /></Badge>
					</a>

					<UncontrolledTooltip placement='top' target={`requestLeaveDatatableDetails${row.id}`}>Дэлгэрэнгүй</UncontrolledTooltip>

					<a role="button" onClick={(e) => { addModalHandler(e, row)} }
						id={`description${row?.id}`}
						className="me-1"
					>
						<Badge color="light-success" pill><CheckCircle  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`description${row.id}`}>Мэдээлэл оруулах</UncontrolledTooltip>
				</div>
			),
		},
	]
    return columns

}
