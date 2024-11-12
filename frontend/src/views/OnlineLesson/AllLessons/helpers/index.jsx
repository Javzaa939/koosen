import { t } from "i18next";
import { Book } from "react-feather";
import { Link } from "react-router-dom";
import { Badge, UncontrolledTooltip } from "reactstrap";
// Хүснэгтийн баганууд
export function getColumns(currentPage, rowsPerPage, total_count) {

	const page_count = Math.ceil(total_count / rowsPerPage)

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
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
			name: `${t('Хичээлийн нэр')}`,
			selector: (row) => row?.lesson_name,
			sortable: true,
			minWidth: "280px",
			center: true
		},
		{
			name: `${t('Багш')}`,
			cell: (row) => row?.teacher?.full_name,
			minWidth: "280px",
			center: true
		},
		{
			name: `${t('Оюутны тоо')}`,
			cell: (row) => row?.student_count,
			minWidth: "280px",
			center: true
		},
		{
			name: `${t('Хичээл')}`,
			cell: (row) => row?.total_homeworks_and_exams.week_count,
			minWidth: "280px",
			center: true
		},
		{
			name: `${t('Даалгавар')}`,
			cell: (row) => row?.total_homeworks_and_exams.homework_count,
			minWidth: "280px",
			center: true
		},
		{
			name: `${t('Шалгалт')}`,
			cell: (row) => row?.total_homeworks_and_exams.challenge_count,
			minWidth: "280px",
			center: true
		},
		{
			name: `${t('Үйлдэл')}`,
			selector: (row) => {
				return (
					<>
						<Link to={`/online_lesson/${row.id}`} id={`detail${row.id}`}>
							<Badge color="light-info" pill><Book width={"15px"} /></Badge>
						</Link>
						<UncontrolledTooltip placement="top" target={`detail${row.id}`} >
							Дэлгэрэнгүй
						</UncontrolledTooltip>
					</>
				)
			},
			sortable: false,
			center: true
		},
	]

	return columns

}
