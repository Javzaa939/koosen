import { t } from "i18next";

export function getColumns (currentPage, rowsPerPage) {
    const columns = [
		{
			name: "№",
			selector: (row,index) => (currentPage-1) * rowsPerPage + index + 1,
			minWidth: "80px",
			maxWidth: "80px",
			center: true
		},
		{
			name: t('%'),
			selector: (row) => row.question_reliability ? row.question_reliability + '%' : '',
			maxWidth: "80px",
            sortable: true,
			center: true
		},
		{
			name: t('Асуулт'),
			selector: (row) => row.question_text,
            sortable: true,
		},
	]

    return columns

}
