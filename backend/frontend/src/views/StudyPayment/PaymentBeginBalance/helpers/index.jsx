import { Trash2 } from "react-feather";

import css from '@mstyle/style.module.css'
import { Row, Col } from "reactstrap";

import { t } from 'i18next'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, page_count, handleEditModal, handleDelete, showWarning, user) {

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
			maxWidth: "120px",
			center: true
		},
		{
			header: 'student',
			name: t("Оюутан"),
			cell: (row) => (
                <p className={`${css.hrefHover} mb-0 ms-0` }>
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
			header: 'full_name',
			name: t("Овог нэр"),
			selector: (row) => row?.student && `${row?.student?.last_name} ${row?.student?.first_name}`,
			minWidth: "80px",
			center: true,
		},
		{
			header: 'first_balance',
			name: t("Эхний үлдэгдэл илүү"),
			selector: (row) => row?.first_balance_iluu,
			minWidth: "80px",
			center: true,
		},
		{
			header: 'first_balance',
			name: t("Эхний үлдэгдэл дутуу"),
			selector: (row) => row?.first_balance_dutuu,
			minWidth: "80px",
			center: true,
		},

		{
			header: 'lesson_year',
			name: t("Хичээлийн жил"),
			selector: (row) => row?.lesson_year,
            sortable: true,
			minWidth: "80px",
			center: true
		},
		{
			header: 'lesson_season',
			name: t("Улирал"),
			selector: (row) => row?.lesson_season?.season_name,
            sortable: true,
			minWidth: "80px",
		},
	]

	if(Object.keys(user).length > 0 && user.permissions.includes('lms-payment-beginbalance-delete')) {
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

