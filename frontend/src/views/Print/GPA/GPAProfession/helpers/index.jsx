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
			name: t("Хөтөлбөр"),
			selector: (row) => (row?.profession_code + ' ' + row?.profession_name),
            center: true,
			minWidth: "220px",
		},
        {
			header: 'gpa',
			name: t("Голч дүн"),
			selector: (row) => row?.gpa,
            sortable: true,
            center: true,
        },
		{
			header: 'gpa_score',
			name: t("Голч дүн"),
			selector: (row) => row?.gpa_score,
            center: true,
			sortable: true,
        },
        {
			name: t("Оюутны тоо"),
			selector: (row) => row?.student_count,
            center: true,
			sortable: true,
        },
        {
			name: t("Хичээлийн жил"),
			selector: (row) => row?.lesson_year,
            center: true,
			sortable: true,
        },
		{
			name: t("Хичээлийн жил"),
			selector: (row) => row?.lesson_season_name,
            center: true,
			sortable: true,
        },
	]

    return columns;

}
