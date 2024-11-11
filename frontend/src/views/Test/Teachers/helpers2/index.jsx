import { t } from 'i18next';
import { Badge, UncontrolledTooltip } from 'reactstrap'
import { FileText} from 'react-feather'

// Хүснэгтийн баганууд
export function getColumnsLesson(currentPage, rowsPerPage, total_count, handleDetail) {
	const page_count = Math.ceil(total_count / rowsPerPage)
	if (currentPage > page_count) {
		currentPage = 1
	}

	const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			name: `${t("Хичээл")}`,
			selector: (row) => <span title={row?.lesson}>{row?.lesson}</span>,
			maxWidth: "300px",
			center: true
		},
		{
			name: `${t("Багц асуултын сэдэв")}`,
			selector: (row) => <span title={row?.name}>{row?.name}</span>,
			maxWidth: "300px",
			center: true
		},
		{
			name: `${t("Асуултын тоо")}`,
			selector: (row) => row?.challengequestions_count,
			maxWidth: "300px",
			center: true
		},
		{
			name: `${t('Үйлдэл')}`,

			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
						<>
							<FileText id={`questionDetail${row.id}`} className='text-primary me-50 cursor-pointer' onClick={() => {
								handleDetail(row?.id)
							}} size={14} />
							<UncontrolledTooltip placement='top' target={`questionDetail${row.id}`} >Дэлгэрэнгүй</UncontrolledTooltip>
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

