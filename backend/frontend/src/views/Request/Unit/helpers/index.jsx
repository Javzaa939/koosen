import css from '@mstyle/style.module.css'

import { t } from 'i18next';

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, handleEditModal) {

	const page_count = Math.ceil(total_count / rowsPerPage)

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
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
			header: 'unit',
			name: `${t('Нэгж')}`,
            selector: (row) => (
				<p className={`${css.hrefHover} mb-0` }>
					<a role="button" onClick={() => { handleEditModal(row.id)} }>
						{row?.unit_name}
					</a>
				</p>
			),
			minWidth: "100px",
			sortable: true,
			center: true
		},
		{
			header: 'position',
			name: `${t('Албан тушаал')}`,
			center: true,
			selector: (row) => row?.positions,
            sortable: true,
			minWidth: "220px",
			wrap: true,
		},
		{
			name: `${t('Хандах цэс')}`,
			selector: (row) => row?.menus_names,
			center: true,
			minWidth: "220px",
			wrap: true,
		},
	]

    return columns

}
