import { t } from 'i18next'

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
			header: 'student_code',
			name: `${t('Оюутны код')}`,
			selector: (row) => row?.student?.code,
			sortable: true,
			minWidth: "80px",
			center: true,
		},
		{
			header: 'student',
			name: `${t('Оюутны нэр')}`,
			selector: (row) => row?.student?.last_name + '  ' + row?.student?.first_name,
			sortable: true,
			wrap: true,
			left: true,
		},
		{
			header: 'group',
			name: `${t('Ангийн нэр')}`,
			selector: (row) => row?.student?.group?.name,
			sortable: true,
			wrap: true,
			left: true,
		},
		{
			header: 'teach_score',
			name: `${t('Багшийн оноо')}`,
			selector: (row) => row?.teach_score,
			sortable: true,
			center: true,
		},
		{
			header: 'exam_score',
			name: `${t('Шалгалтын оноо')}`,
			selector: (row) => row?.exam_score,
			sortable: true,
			center: true,
		},
		{
			name: `${t('Үсгэн үнэлгээ')}`,
			selector: (row) => <p id={`assessment${row.lesson}${row?.id}`}>{row?.assessment?.assesment}</p>,
			center: true,
		},
	]

	return columns
}
