import { Book, CheckCircle, Type } from "react-feather"
import { Badge, UncontrolledTooltip } from "reactstrap"
import moment from 'moment'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, addModalHandler, STATE_LIST, user) {
    const page_count = Math.ceil(total_count / rowsPerPage)

    // /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
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
					let border =
						row?.health_user_data?.state == 1 ? '4px solid rgba(20, 78, 151, 1)'
						: row?.health_user_data?.state == 2 ? '4px solid rgba(40, 199, 111, 1)'
						: row?.health_user_data?.state == 3 ? '4px solid #EA5455' : '4px solid transparent'
					tableRow.style.borderLeft = `${border}`
				}

				return (currentPage-1) * rowsPerPage + index + 1
			},
			minWidth: '100px',
			maxWidth: '100px',
		},
		{
			minWidth: "150px",
			header: 'user__last_name',
			name:"Овог",
			cell: (row) => (row?.user?.last_name),
			sortable: true,
			reorder: true,
			center: true,
			wrap: true,
		},
		{
			minWidth: "150px",
			header: 'user__first_name',
			name: "Нэр",
			cell: (row) => (row?.user?.first_name),
			sortable: true,
			reorder: true,
			center: true,
			wrap: true,
		},
		{
			header: 'gender',
			name: <div className="px-1">Хүйс</div>,
			selector: (row) => row?.gender_name || '',
            sortable: true,
			minWidth: '140px',
			maxWidth: '140px',
		},

		// SORT ERROR
        {
			maxWidth: "200px",
			minWidth: "200px",
			header: 'state',
			name: "Үзлэгийн төлөв",
			selector: (row) => (
				<Badge
					color={`${row?.health_user_data?.state == 1 ? 'primary' : row?.health_user_data?.state == 2 ? 'success' : row?.health_user_data?.state == 3 ? 'danger' : 'primary'}`}
					pill
				>
					{row?.health_user_data ?

						STATE_LIST.find(val => val.id === row?.health_user_data?.state).name

					:
						''
						// STATE_LIST.find(val => val.id === 1)?.name
						}
				</Badge>),
			center: true,
		},
		{
			header: 'gender',
			name: <div className="px-1">Үзлэгийн огноо</div>,
			selector: (row) => row?.updated_at? moment(row?.updated_at).format("YYYY-MM-DD h:mm") : '',
            sortable: true,
			minWidth: '200px',
		},

		// TODO: SORT ALDAA ZASAH
		{
			header: 'height',
			name: <div className="px-1">Өндөр / см</div>,
			selector: (row) => row?.health_user_data?.height || '',
            // sortable: true,
			minWidth: '140px',
			maxWidth: '140px',
		},
		{
			header: 'weight',
			name: <div className="px-1">Жин / кг</div>,
			selector: (row) => row?.health_user_data?.weight || '',
            // sortable: true,
			minWidth: '140px',
			maxWidth: '140px',
		},
		{
			header: 'is_chalk',
			name: <div className="px-1">Шарх сорвитой эсэх</div>,
			selector: (row) => (
				row?.health_user_data &&
				<div className="p-25 px-50 rounded-4 bg-light-secondary">
					{row?.health_user_data?.is_chalk ? 'Тийм' : 'Үгүй'}
				</div>
			),
			minWidth: '200px',
			maxWidth: '200px',
		},
		{
			header: 'is_tattoo',
			name: <div className="px-1">Шивээстэй эсэх</div>,
			selector: (row) => (
				row?.health_user_data &&
				<div className="p-25 px-50 rounded-4 bg-light-secondary">
					{row?.health_user_data?.is_tattoo ? 'Тийм' : 'Үгүй'}
				</div>
			),
			minWidth: '140px',
			maxWidth: '140px',
		},
		{
			header: 'is_drug',
			name: <div className="px-1">Сэтгэцэд нөлөөт бодисын хамаарал</div>,
			selector: (row) => (
				row?.health_user_data &&
				<div className="p-25 px-50 rounded-4 bg-light-secondary">
					{row?.health_user_data?.is_drug ? 'Тийм' : 'Үгүй'}
				</div>
			),
			minWidth: '220px',
			maxWidth: '220px',
		},
		{
			header: 'user__register',
			name: <div className="px-1">РД</div>,
			selector: (row) => row?.user_register || '',
            sortable: true,
			minWidth: '140px',
			maxWidth: '140px',
		},
		{
			name: "Үйлдэл",
			center: true,
			maxWidth: "120px",
			minWidth: "120px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a
						role="button"
						style={{pointerEvents: user?.permissions?.includes('lms-elselt-health-create') ? '' : 'none'}}
						onClick={(e) => { addModalHandler(e, row)} }
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
