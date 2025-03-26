
import { t } from 'i18next'
import moment from 'moment'
import { moneyFormat } from '@src/utility/Utils'

import { Col, Row, Badge } from 'reactstrap'

// Хүснэгтийн баганууд
export function getColumns(currentPage, rowsPerPage, page_count) {

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
	if (currentPage > page_count) {
		currentPage = 1
	}
	const columns = [
		{
			name: "№",
			selector: (row, index) => {
				return (currentPage-1) * rowsPerPage + index + 1
			},
			center: true,
			maxWidth: "80px",
			minWidth: "80px",
		},
		{
			minWidth: "150px",
			header: 'last_name',
			name: t("Овог, Нэр"),
			cell: (row) => (row?.full_name),
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
			selector: (row) => row?.register,
			center: true
		},
		{
			minWidth: "150px",
			header: 'total_amount',
			name: t("Төлөх дүн"),
			cell: (row) => (row?.total_amount),
			sortable: true,
			reorder: true,
			right: true,
			wrap: true,
		},
		{
			minWidth: "150px",
			header: 'qpay_total_amount',
			name: t("Төлсөн дүн"),
			cell: (row) => (row?.qpay_total_amount),
			sortable: true,
			reorder: true,
			right: true,
			wrap: true,
		},
		{
			maxWidth: "300px",
			minWidth: "300px",
			header: 'profession__name',
			name: 'Хөтөлбөр',
			reorder: true,
			wrap: true,
			selector: (row) => <span title={row?.profession_name?.join(", ")}>{row?.profession_name?.join(", ") || 'Хоосон байна'}</span>,
			sortable: true,
			center: true,
		},
		{
			sortField: 'payed_date',
			header: 'payed_date',
			maxWidth: "200px",
			minWidth: "200px",
			reorder: true,
			sortable: true,
			name: t("Төлсөн огноо"),
			selector: (row) => row?.payed_date ? moment(row?.payed_date).format("YYYY-MM-DD HH:mm:ss") : '',
			center: true,
		},
	]
    return columns
}


export function getFooter(data) {
	return (
		<div className='react-dataTable'>
			<div className='rdt_TableBody'>
				<Row className='m-0 p-1 s-ps-cborder s-ps-clight rdt_TableRow' align="center" style={{ fontSize: '13px' }}>
					<Col className='p-0 fw-bolder text-center'>Нийт дүн</Col>
					<Col></Col>
					<Col className='p-0 fw-bolder' align="right">{moneyFormat(data?.tuluh_dun)}</Col>
					<Col className='p-0 fw-bolder' align="right">{moneyFormat(data?.tulsun_dun)}</Col>
					<Col></Col>
					<Col></Col>
				</Row>
			</div>
		</div>
	)
}