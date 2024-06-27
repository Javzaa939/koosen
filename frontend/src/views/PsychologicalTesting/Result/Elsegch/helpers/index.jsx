import {Badge, UncontrolledTooltip} from 'reactstrap'
import {state_flag_color} from '@utils'
import {Eye} from 'react-feather'
import {t} from 'i18next';

export function getColumns (currentPage, rowsPerPage, total_count)
{
	const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			header: 'title',
			name: t("Сорилын нэр"),
			selector: (row) => (row?.title),
            sortable: true,
			minWidth: "80px",
			center: true
		},
		{
			header: 'description',
			name: t("Тайлбар"),
			selector: (row) =>{
				return(
					row?.description
					?
						<>{row?.description}</>
					:
						<></>
				)
			},
            sortable: true,
			center: true
        },
		{
			header: 'start_date',
			name: t("Эхлэх огноо"),
			selector: (row) => row?.start_date,
            sortable: true,
			center: true
        },
		{
			header: 'end_date',
			name: t("Дуусах огноо"),
			selector: (row) => row?.end_date,
            sortable: true,
			center: true
        },
        {
			header: 'duration',
			name: t("Үргэлжлэх хугацаа"),
			selector: (row) =>{
				return(
					row?.duration
					?
						<>{row?.duration}&nbsp;минут</>
					:
						<></>
				)
			},
            sortable: true,
			center: true
        },
        {
            name: `${'Төлөв'}`,
            selector: (row) => {
				if (row?.state) {
					return state_flag_color(row?.state)
				} else ''
			},
            minWidth: "100px",
            center: true
        },
        {
            name: t("Үйлдэл"),
			width: "160px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a	role="button"
						id={`requestVolunteerDetail${row.id}`}
						className="me-1"
						href={`psychologicaltesting/showparticipants/${row?.id}`}
					>
						<Badge color="light-info" pill><Eye  width={"15px"} /></Badge>
					</a>
                   <UncontrolledTooltip placement='top' target={`requestVolunteerDetail${row.id}`} >Ороцогчид</UncontrolledTooltip>
				</div>
			),
            center: true,
        },
	]

    return columns
}