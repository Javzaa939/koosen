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
			minWidth: '200px',
			maxWidth: '200px',
			selector: (row) => row?.full_name
		},
		{
			header: 'register',
			name: <div className="px-1">РД</div>,
			selector: (row) => row?.user?.register || '',
            sortable: true,
			minWidth: '140px',
			maxWidth: '140px',
		},
        {
			maxWidth: "150px",
			minWidth: "150px",
			header: 'state',
			reorder: true,
			sortable: true,
			name: "Төлөв",
			selector: (row) => (
				<Badge
					color={`${row?.state == 1 ? 'primary' : row?.state == 2 ? 'success' : row?.state == 3 ? 'danger' : 'primary'}`}
					pill
				>
					{row?.state_name}
				</Badge>),
			center: true,
		},
		{
			name: "Үйлдэл",
			center: true,
			maxWidth: "250px",
			minWidth: "250px",
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
