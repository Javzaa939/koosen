import { t } from 'i18next';

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
		},
		{
			name: `${t("Овог")}`,
			selector: (row) => (row?.last_name),
			center: true,
			width: '350px'
		},
		{
			header: 'Нэр',
			name: t("Нэр"),
			selector: (row) => row?.first_name,
			center: true,
		},
		{
			header: 'Email хаяг',
			name: t("Email хаяг"),
			selector: (row) => row?.email,
			center: true,
		},
		{
			header: 'Оюутны код',
			name: t("Оюутны код"),
			selector: (row) => row?.code,
			center: true,
		},
		{
			header: 'Анги',
			name: t("Анги"),
			selector: (row) => row?.group_name,
			center: true,
		},
	]

    return columns
}
