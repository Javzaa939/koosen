import { t } from 'i18next'
import { Col, Row } from 'reactstrap'
import '../style.scss'

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
			minWidth: "30px",
			maxWidth: "70px",
			center: true
		},
		{
			header: 'student_code',
			name: `${t('Оюутны код')}`,
			selector: (row) => row?.student_code,
			sortable: true,
			wrap: true,
			left: true,
		},
		{
			header: 'student__first_name',
			name: `${t('Оюутны нэр')}`,
			selector: (row) => row?.student_full_name,
			sortable: true,
			wrap: true,
			left: true,
		},
		{
			header: 'group_name',
			name: `${t('Ангийн нэр')}`,
			selector: (row) => row?.group_name,
			sortable: true,
			wrap: true,
			left: true,
		},
		{
			header: 'teacher_name',
			name: `${t('Багшийн нэр')}`,
			selector: (row) => row?.teacher_name,
			sortable: true,
			wrap: true,
			left: true,
		},
		{
			header: 'teach_score',
			name: `${t('Багшийн оноо')}`,
			selector: (row) => row?.teach_score,
			maxWidth: "180px",
			sortable: true,
			center: true,
		},
		{
			header: 'exam_score',
			name: `${t('Шалгалтын оноо')}`,
			selector: (row) => row?.exam_score,
			maxWidth: "180px",
			sortable: true,
			center: true,
		},
		{
			name: `${t('Нийт')}`,
			selector: (row) => (row?.exam_score + row?.teach_score) ,
			maxWidth: "180px",
			center: true,
		},
		{
			header: 'assessment',
			name: `${t('Үсгэн үнэлгээ')}`,
			selector: (row) => row?.assessment,
			maxWidth: "180px",
			sortable: true,
			center: true,
		},
	]

	return columns
}

export function getFooter(data) {
	const counts = data.reduce((acc, item) => {
		const key = item.assessment;
		acc[key] = (acc[key] || 0) + 1;

		return acc;
	}, {});

	const sortedCounts = Object.keys(counts)
		.sort()
		.reduce((acc, key) => {
			acc[key] = counts[key];

			return acc;
		}, {});

	return (
		<div className='react-dataTable'>
			<div className='rdt_TableHead'>
				<Row className='m-0 p-1 s-ps-cborder s-ps-clight rdt_TableHeadRow' align='center'>
					{Object.entries(sortedCounts).map(([key, value], index) =>
						<Col key={index} className='p-0 rdt_TableCol'>
							<div className='rdt_TableCol_Sortable'>
								{key}
							</div>
						</Col>
					)}
				</Row>
			</div>
			<div className='rdt_TableBody'>
				<Row className='m-0 p-1 s-ps-cborder s-ps-clight rdt_TableRow' align='center'>
					{Object.entries(sortedCounts).map(([key, value], index) =>
						<Col key={index} className='p-0'>
							{value}
						</Col>
					)}
				</Row>
			</div>
		</div>
	)
}