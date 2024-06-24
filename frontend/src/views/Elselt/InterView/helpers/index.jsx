
import { Badge, Input ,UncontrolledTooltip}  from 'reactstrap';
import { t } from 'i18next'
import moment from 'moment'
import { CheckCircle} from "react-feather"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, page_count,stateop,stateModalHandler,user) {

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
					let border =
						row?.conversation_data?.state == 1 ? '4px solid 	rgb(255,165,0)'
						: row?.conversation_data?.state == 2 ? '4px solid rgba(40, 199, 111, 1)'
						: row?.conversation_data?.state== 3 ? '4px solid #EA5455' : '4px solid transparent'
					tableRow.style.borderLeft = `${border}`
				}

				return (currentPage-1) * rowsPerPage + index + 1
			},
			minWidth: '100px',
			maxWidth: '100px',
		},
		{
			maxWidth: "200px",
			minWidth: "200px",
			header: 'state',
			name: "Үзлэгийн төлөв",
			selector: (row) => (
				<Badge
					color={`${row?.conversation_data?.state == 1 ? 'warning	' : row?.conversation_data?.state == 2 ? 'success' : row?.conversation_data?.state == 3 ? 'danger' : 'primary'}`}
					pill
				>
					{row?.conversation_data ?
						stateop	.find(val => val.id === row?.conversation_data?.state).name

						:
						''
						}
				</Badge>),
			center: true,
		},

		{
			minWidth: "150px",
			header: 'description',
			name: t("Тайлбар"),
			cell: (row) => (row?.conversation_data?.description),
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
			header: 'user_age',
			name: t("Нас"),
			reorder: true,
			selector: (row) => row?.user_age,
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
								className={'text-center'}
								step="0.1"
								min='0'
								max='4'
								bsSize='sm'
								placeholder={(`Голч дүн`)}
								defaultValue={row?.userinfo?.gpa}
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
			minWidth: "150px",
			name: t("А / байгууллага"),
			selector: (row) => <span title={row?.userinfo?.work_organization}>{row?.userinfo?.work_organization}</span>,
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
			name: "Үйлдэл",
			center: true,
			maxWidth: "120px",
			minWidth: "120px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a
						role="button"
						onClick={(e) => { stateModalHandler(e,row)} }
						// onClick={() => stateModalHandler()}
						id={`description${row?.id}`}
						className="me-1"
						// style={{pointerEvents: user?.permissions?.includes('lms-elselt-physque-create') ? '' : 'none'}}
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
