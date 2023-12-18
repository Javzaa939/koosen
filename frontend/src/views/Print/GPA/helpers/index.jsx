import useModal from '@hooks/useModal'

import { t } from 'i18next'

export function getColumns (currentPage, rowsPerPage, total_count) {

	const { showWarning } = useModal()

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
			header: 'code',
			name: t("Оюутны код"),
			selector: (row) => row?.code,
            sortable: true,
            center: true,
			minWidth: "80px",
		},
        {
			header: 'first_name',
			name: t("Овог нэр"),
			selector: (row) => row?.full_name,
            sortable: true,
			center: true,
            left: true,
			minWidth: '220px',
			wrap: true,
        },
		{
			header: 'set_time',
			name: t("Багц цаг"),
			selector: (row) => row?.total_kr,
            center: true,
			sortable: true,
        },
        {
			header: 'point',
			name: t("Дүнгийн онооны дундаж"),
			selector: (row) => row?.total_avg,
            center: true,
			sortable: true,
        },
        {
			header: 'gpa',
			name: t("Голч дүн"),
			selector: (row) => row?.total_gpa,
            center: true,
			sortable: true,
        },
	]

    return columns;

}
