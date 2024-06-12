import { log } from "@craco/craco/lib/logger"
import { CheckCircle} from "react-feather"
import { Badge, UncontrolledTooltip } from "reactstrap"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, page_count, addModalHandler, STATE_LIST) {

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
						row?.health_up_user_data?.state == 1 ? '4px solid rgba(20, 78, 151, 1)'
						: row?.health_up_user_data?.state == 2 ? '4px solid rgba(40, 199, 111, 1)'
						: row?.health_up_user_data?.state == 3 ? '4px solid #EA5455' : '4px solid transparent'
					tableRow.style.borderLeft = `${border}`
				}

				return (currentPage-1) * rowsPerPage + index + 1
			},
			minWidth: '100px',
			maxWidth: '100px',
		},
		{
			header: 'user__first_name',
			name: <div className="px-1">Нэр</div>,
			minWidth: '160px',
			maxWidth: '160px',
			sortable: true,
			selector: (row) => row?.full_name || ''
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
			name: "Үзлэгийн төлөв",
			selector: (row) => (
				<Badge
					color={`${row?.health_up_user_data?.state == 1 ? 'primary' : row?.health_up_user_data?.state == 2 ? 'success' : row?.health_up_user_data?.state == 3 ? 'danger' : 'primary'}`}
					pill
				>
					{row.health_up_user_data ?

						STATE_LIST.find(val => val.id === row?.health_up_user_data?.state).name

					:
						''
						// STATE_LIST.find(val => val.id === 1)?.name
					}
				</Badge>),
			center: true,
		},

		{
			header: 'description',
			name: <div className="px-1">Тайлбар</div>,
			selector: (row) => row?.health_up_user_data?.description || '',
			minWidth: '140px',
			maxWidth: '140px',
		},
		{
			header: 'turnik',
			name: <div className="px-1">Савлуурт суниах</div>,
			selector: (row) => row?.health_up_user_data?.turnik || '',
			minWidth: '140px',
			maxWidth: '140px',
		},
		{
			header: 'belly_draught',
			name: <div className="px-1">Гэдэсний даралт</div>,
			selector: (row) => row?.health_up_user_data?.belly_draught || '',
			minWidth: '140px',
			maxWidth: '140px',
		},
		{
			header: 'patience_1000m',
			name: <div className="px-1">Тэсвэр 1000м</div>,
			selector: (row) => row?.health_up_user_data?.patience_1000m || '',
			minWidth: '140px',
			maxWidth: '140px',
		},
		{
			header: 'speed_100m',
			name: <div className="px-1">Хурд 100м</div>,
			selector: (row) => row?.health_up_user_data?.speed_100m || '',
			minWidth: '140px',
			maxWidth: '140px',
		},
		{
			header: 'quickness',
			name: <div className="px-1">Авхаалж самбаа</div>,
			selector: (row) => row?.health_up_user_data?.quickness || '',
			minWidth: '140px',
			maxWidth: '140px',
		},
		{
			header: 'flexible',
			name: <div className="px-1">Уян хатан</div>,
			selector: (row) => row?.health_up_user_data?.flexible || '',
			minWidth: '140px',
			maxWidth: '140px',
		},
		{
			header: 'total_score',
			name: <div className="px-1">Нийт оноо</div>,
			selector: (row) => row?.health_up_user_data?.total_score || '',
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
					{/* <a
						id={`requestLeaveDatatableDetails${row.id}`}
						onClick={() => console.log(row?.id, row)}
						className="me-50"
					>
						<Badge color="light-info" pill><Book width={"15px"} /></Badge>
					</a>

					<UncontrolledTooltip placement='top' target={`requestLeaveDatatableDetails${row.id}`}>Дэлгэрэнгүй</UncontrolledTooltip> */}

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
