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
			maxWidth: "30px",
			center: true
		},
		{
			header: 'student',
			name: `${t('Оюутны нэр')}`,
			selector: (row) => row?.student?.full_name,
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

export function getFooter(data) {
	const counts = data.reduce((acc, item) => {
		const key = item.assessment.assesment;
		acc[key] = (acc[key] || 0) + 1;
		return acc;
	}, {});

	return (
		<div className='react-dataTable'>
			<div className='rdt_TableHead'>
				<Row className='m-0 p-1 cborder clight rdt_TableHeadRow' align='center'>
					{Object.entries(counts).map(([key, value]) =>
						<Col className='p-0 rdt_TableCol'>
							<div className='rdt_TableCol_Sortable'>
								{key}
							</div>
						</Col>
					)}
				</Row>
			</div>
			<div className='rdt_TableBody'>
				<Row className='m-0 p-1 cborder clight rdt_TableRow' align='center'>
					{Object.entries(counts).map(([key, value]) =>
						<Col className='p-0'>
							{value}
						</Col>
					)}
				</Row>
			</div>
		</div>
	)
}