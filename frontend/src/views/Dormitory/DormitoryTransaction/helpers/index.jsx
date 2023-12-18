import { t } from 'i18next'

import { Badge } from 'reactstrap'

import { formatDate } from '@utils'

export function getColumns (currentPage, rowsPerPage, total_count) {

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
			header: 'student',
			name: t("Харилцагч"),
			selector: (row) => {
                const name = (row?.user_name && row?.user_name !== '. ') ? row?.user_name : row?.student_name
                return (
                    <span title={name}>{name}</span>
                )
            },
            sortable: true,
            center: true,
            minWidth: "180px"
        },
        {
            header: 'payed_date',
            name: t("Гүйлгээний огноо"),
            selector: (row) => formatDate(row?.payed_date, "YYYY-MM-DD HH:MM:SS"),
            sortable: true,
            center: true,
            minWidth: '200px',
        },
        {
            header: 'payment',
            name: t("Гүйлгээний дүн"),
            selector: (row) => {
                var amount = 0
                if(!row?.is_qpay && (row?.dt_amount || row?.kt_amount)) {
                    amount = row?.dt_amount ? row?.dt_amount : row?.kt_amount
                } else if(row?.paid_rsp) {
                    const paid_rsp = JSON.parse(row.paid_rsp);
                    if(paid_rsp && Object.keys(paid_rsp).length > 0) {
                        let rows = paid_rsp.rows
                        if(rows && rows.length > 0) {
                            rows.map((val) => {
                                let trx_fee = val.trx_fee || 0
                                amount += parseFloat(trx_fee)
                            })
                        }
                    }
                }
                return amount
            },
            sortable: true,
            center: true,
            minWidth: '200px',
        },
        {
            header: 'description',
            name: t("Гүйлгээний утга"),
            selector: (row) => <span title={row?.description}>{row?.description}</span>,
            center: true
        },
		{
			header: 'is_qpay',
			name: t("Гүйлгээний төрөл"),
			selector: (row) => {
                return (
                    row?.is_qpay
                    ?
						<Badge color="light-primary" pill>
							{t('Qpay')}
						</Badge>
                    :
                        <Badge color="light-info" pill>
							{t('Хуулга')}
						</Badge>
                )
            },
            sortable: true,
            center: true,
            minWidth: '230px'
        },
        {
			header: 'solved_flag',
			name: t("Орлого зарлагын аль нь болох"),
			selector: (row) => {
                return (
                    row?.kt_amount
                    ?
                        <Badge color="light-primary" pill>
                            {t('Буцаасан')}
                        </Badge>
                    :
                        <Badge color="light-success" pill>
                            {t('Төлсөн')}
                        </Badge>
                )
            },
            sortable: true,
            center: true,
            minWidth: '230px'
        },
	]

    return columns;

}
