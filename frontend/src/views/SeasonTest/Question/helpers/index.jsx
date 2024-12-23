import { t } from 'i18next';
import { Badge, UncontrolledTooltip} from 'reactstrap'
import { Lock, Edit, X} from 'react-feather'
import useModal from "@hooks/useModal"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, handleNext) {
	const page_count = Math.ceil(total_count/ rowsPerPage)
	if (currentPage > page_count) {
        currentPage = 1
    }
	const { showWarning } = useModal()

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			name: `${t("Нэр")}`,
			selector: (row) => <span title={row?.last_name}>{row?.last_name + ' ' + row?.first_name } <span>{row?.code ? '/' + row?.code + '/' : ''}</span></span>,
			maxWidth: "300px",
			center: true
		},
		{
			name: `${t("И-мэйл")}`,
			selector: (row) => row?.email,
			maxWidth: "300px",
			center: true
		},
        {
			header: 'org_position',
			name: `${t("Албан тушаал")}`,
			selector: (row) => <span title={row?.org_position_name}>{row?.org_position_name}{row?.rank_name ? ' ' + row?.rank_name  : ''}</span>,
			minWidth: "30px",
			center: true,
		},
        {
			name: `${t("Тэнхим")}`,
			selector: (row) => row?.salbar?.name,
			minWidth: "30px",
			center: true,
			wrap: true,
		},
		{
			name: `${t("Асуулт үүсгэсэн хичээлүүд")}`,
			selector: (row) => row?.lesson_names,
			minWidth: "30px",
			center: true,
			wrap: true,
		},
		{
            name: `${t('Асуултууд')}`,

            selector:  (row) => (
                <div className="text-center" style={{ width: "auto" }}>
                    {
                        <>
                            <a role="button"
                                onClick={() => handleNext(row)}
                                id={`updateSchool${row?.id}`}
                            >
                                <Badge color="light-primary" pill><Edit width={"100px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`updateSchool${row?.id}`}>Асуултууд харах</UncontrolledTooltip>
						</>
                    }
				</div>
            ),
            minWidth: "200px",
            maxWidth: "200px",
            center: true,
        },
	]
    return columns
}

