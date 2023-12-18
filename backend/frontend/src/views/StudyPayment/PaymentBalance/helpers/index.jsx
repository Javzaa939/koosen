import { Trash2 } from "react-feather";

import { Badge } from 'reactstrap'

import css from '@mstyle/style.module.css'

import { t } from 'i18next'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, page_count, handleEditModal, handleDelete, showWarning, user, isClosedValue) {

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
		{
			name: "№",
			selector: (row, index) => (
				row?.id
				?
					((currentPage-1) * rowsPerPage + index + 1)
				:
					<a className='fw-bolder'>{t('Нийт дүн')}</a>
			),
			minWidth: "20px",
			center: true
		},
		{
			header: 'student',
			name: t("Оюутан"),
			cell: (row) => (
                <p className={`${css.hrefHover} mb-0` }>
                    <a role="button" onClick={() => { handleEditModal(row.id)} }>
						{row?.student?.code}
                    </a>
                </p>
            ),
			minWidth: "80px",
			sortable: true,
			center: true
		},
		{
			name: t("Овог нэр"),
			selector: (row) => row?.student && `${row?.student?.first_name} ${row?.student?.last_name}`,
			center: true,
			minWidth: "80px",
			center: 'true'
		},
		{
			header: 'balance_date',
			name: t("Гүйлгээний огноо"),
			selector: (row) => row?.balance_date,
			sortable: true,
			minWidth: "80px",
			center: 'true'
		},
		{
			header: 'balance_amount',
			name: t("Гүйлгээний дүн"),
			selector: (row) => row?.balance_amount,
            sortable: true,
			minWidth: "80px",
			center: 'true'
		},
		{
			header: 'balance_desc',
			name: t("Гүйлгээний дүн"),
			selector: (row) => row?.balance_desc,
            sortable: true,
			minWidth: "80px",
		},
		{
			header: 'flag',
			name: t("Орлого зарлагын аль нь болох"),
			selector: (row) => (
				row?.flag && (
					row?.flag === 1
					?
						<Badge color="light-success" pill>
							Төлсөн төлбөр
						</Badge>
					:
						<Badge color="light-primary" pill>
							Буцаасан төлбөр
						</Badge>
				)
			),
            sortable: true,
			minWidth: "190px",
			wrap: true
		},
	]

	if(Object.keys(user).length > 0 && !isClosedValue && user.permissions.includes('lms-payment-balance-delete')) {
		var delete_column = {
			name: t("Устгах"),
			maxWidth: "80px",
			selector: (row) => (
				row.id &&
					<div className="text-center" style={{ width: "auto" }}>
						<a role="button"
							onClick={() => showWarning({
								header: {
									title: t(`Сургалтын төлбөрийн гүйлгээ устгах`),
								},
								question: t(`Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?`),
								onClick: () => handleDelete(row.id),
								btnText: t('Устгах'),
							})}
						>
							<Trash2 color="red" width={"15px"} />
						</a>
					</div>
			),
		}
		columns.push(delete_column)
	}

    return columns

}
