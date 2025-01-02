import { t } from "i18next";

export function getColumns(currentPage, rowsPerPage) {
	const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
			minWidth: "80px",
			maxWidth: "80px",
			center: true,
			header: 'id'
		},
		{
			name: '%',
			selector: (row) => Number(row.reliability).toFixed(0) + '%',
			maxWidth: "80px",
			sortable: true,
			center: true,
			header: 'reliability'
		},
		{
			name: t('Асуулт'),
			selector: (row) => row.question,
			sortable: true,
			header: 'question'
		},
	]

	return columns

}
