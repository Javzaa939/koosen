import { Book, CheckCircle } from "react-feather"
import { Badge, UncontrolledTooltip } from "reactstrap"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, page_count, STATE_LIST, detailHandler) {

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
					{row ?

						STATE_LIST.find(val => val.id === row?.health_up_user_data?.state)?.name

					:
						''
						// STATE_LIST.find(val => val.id === 1)?.name
						}
				</Badge>),
			center: true,
		},

		{
			name: <div className="px-1">Дотор</div>,
			selector: (row) => <span title={row?.health_up_user_data?.belly}>{row?.health_up_user_data?.belly || ''} </span>,
			minWidth: '300px',
			maxWidth: '300px',
		},
		{
			name: <div className="px-1">Мэдрэл</div>,
			selector: (row) => <span title={row?.health_up_user_data?.nerve}>{row?.health_up_user_data?.nerve || ''} </span>,
			minWidth: '300px',
			maxWidth: '300px',
		},
		{
			name: <div className="px-1">Чих хамар хоолой</div>,
			selector: (row) => <span title={row?.health_up_user_data?.ear_nose}>{row?.health_up_user_data?.ear_nose || ''} </span>,
			minWidth: '300px',
			maxWidth: '300px',
		},
		{
			name: <div className="px-1">Нүд</div>,
			selector: (row) => <span title={row?.health_up_user_data?.eye}>{row?.health_up_user_data?.eye || ''} </span>,
			minWidth: '300px',
			maxWidth: '300px',
		},
		{
			name: <div className="px-1">Шүд</div>,
			selector: (row) => <span title={row?.health_up_user_data?.teeth}>{row?.health_up_user_data?.teeth || ''} </span>,
			minWidth: '300px',
			maxWidth: '300px',
		},
		{
			name: <div className="px-1">Мэс засал</div>,
			selector: (row) => <span title={row?.health_up_user_data?.surgery || ''}>{row?.health_up_user_data?.surgery || ''}</span>,
			minWidth: '300px',
			maxWidth: '300px',
		},
		{
			name: <div className="px-1">Эмэгтэйчүүд</div>,
			selector: (row) => <span title={row?.health_up_user_data?.femini || ''}>{row?.health_up_user_data?.femini || ''}</span>,
			minWidth: '300px',
			maxWidth: '300px',
		},
		{
			name: <div className="px-1">Зүрх судас</div>,
			selector: (row) => <span title={row?.health_up_user_data?.heart || ''}> {row?.health_up_user_data?.heart || ''}</span> ,
			minWidth: '300px',
			maxWidth: '300px',
		},
		{
			name: <div className="px-1">Сүрьеэ</div>,
			selector: (row) => <span title={row?.health_up_user_data?.phthisis || ''}> {row?.health_up_user_data?.phthisis || ''}</span>,
			minWidth: '300px',
			maxWidth: '300px',
		},
		{
			name: <div className="px-1">Арьс харшил</div>,
			selector: (row) => <span title={row?.health_up_user_data?.allergies || ''}> {row?.health_up_user_data?.allergies || ''}</span>,
			minWidth: '300px',
			maxWidth: '300px',
		},
		{
			name: <div className="px-1">Халдварт өвчин</div>,
			selector: (row) => <span title={row?.health_up_user_data?.contagious || ''}> {row?.health_up_user_data?.contagious || ''}</span>,
			minWidth: '300px',
			maxWidth: '300px',
		},
		{
			name: <div className="px-1">Сэтгэц мэдрэл</div>,
			selector: (row) => <span title={row?.health_up_user_data?.neuro_phychic || ''}> {row?.health_up_user_data?.neuro_phychic || ''}</span>,
			minWidth: '300px',
			maxWidth: '300px',
		},
		{
			name: <div className="px-1">Гэмтэл</div>,
			selector: (row) => <span title={row?.health_up_user_data?.injury || ''}> {row?.health_up_user_data?.injury || ''}</span>,
			minWidth: '300px',
			maxWidth: '300px',
		},
		{
			name: <div className="px-1">БЗДХ</div>,
			selector: (row) => <span title={row?.health_up_user_data?.bzdx || ''}> {row?.health_up_user_data?.bzdx || ''}</span>,
			minWidth: '300px',
			maxWidth: '300px',
		},
		{
			name: <div className="px-1">Үйлдэл</div>,
			selector: (row) => (
			<div className="text-center" style={{ width: "auto" }}>
				<a
					role="button"
					onClick={(e) => { detailHandler(e, row)} }
				>
					<Badge color="light-success" pill><CheckCircle  width={"15px"} /></Badge>
				</a>
				<UncontrolledTooltip target="email_button">төлөв солих</UncontrolledTooltip>
			</div>
			),
			// minWidth: '300px',
			// maxWidth: '300px',
		},
	]
    return columns

}
