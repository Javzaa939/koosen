import {Badge, UncontrolledTooltip} from 'reactstrap'
import {state_flag_color} from '@utils'
import {Eye} from 'react-feather'
import {t} from 'i18next';
import { RiDownloadFill } from 'react-icons/ri';
import { IQresultExcelReport, resultExcelReport, TYPE_IQ, TYPE_PSY } from '../../helpers';

export function getColumns (currentPage, rowsPerPage, total_count, adm, active, excelApi, fetchData)
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
			maxWidth: "300px",
			minWidth: "250px",
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
			maxWidth: "550px",
			minWidth: "300px",
            sortable: true,
			center: true
        },
		{
			header: 'start_date',
			name: t("Эхлэх огноо"),
			selector: (row) => row?.start_date,
            sortable: true,
			maxWidth: "200px",
			minWidth: "100px",
        },
		{
			header: 'end_date',
			name: t("Дуусах огноо"),
			selector: (row) => row?.end_date,
            sortable: true,
			maxWidth: "200px",
			minWidth: "100px",
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
			maxWidth: "200px",
			minWidth: "100px",
        },
        {
            name: `${'Төлөв'}`,
            selector: (row) => {
				if (row?.state) {
					return state_flag_color(row?.state)
				} else ''
			},
			maxWidth: "150px",
			minWidth: "100px",
            center: true,
        },
        {
            name: t("Үйлдэл"),
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<span>
						<a	role="button"
							id={`requestVolunteerDetail${row.id}`}
							className="me-1"
							href={`psychologicaltesting/showparticipants/${row?.id}`}
						>
							<Badge color="light-info" pill><Eye  width={"15px"} /></Badge>
						</a>
					<UncontrolledTooltip placement='top' target={`requestVolunteerDetail${row.id}`} >Ороцогчид</UncontrolledTooltip>
					</span>
					{
						row.test_type === TYPE_IQ &&
							<span>
								<a role="button"
									id={`iqTestTooltip${row.id}`}
									className="me-1"
									onClick={() => { IQresultExcelReport(active, excelApi, adm, row, fetchData) }}
									disabled={!(adm || active !== 2)}
								>
									<Badge color="primary" pill><RiDownloadFill width={"15px"} /></Badge>
								</a>
								<UncontrolledTooltip placement='top' target={`iqTestTooltip${row.id}`} >IQ test өгсөн оролцогчдын үр дүнг татах</UncontrolledTooltip>
							</span>
					}
					{
						row.test_type === TYPE_PSY &&
							<span>
								<a role="button"
									id={`psyTestTooltip${row.id}`}
									className="me-1"
									onClick={() => { resultExcelReport(active, excelApi, adm, row, fetchData) }}
									disabled={!(adm || active !== 2)}
								>
									<Badge color="primary" pill><RiDownloadFill width={"15px"} /></Badge>
								</a>
								<UncontrolledTooltip placement='top' target={`psyTestTooltip${row.id}`} >Сэтгэлзүйн сорил өгсөн оролцогчдын үр дүнг татах</UncontrolledTooltip>
							</span>
					}
				</div>
			),
            center: true,
			maxWidth: "150px",
			minWidth: "100px",
        },
	]

    return columns
}