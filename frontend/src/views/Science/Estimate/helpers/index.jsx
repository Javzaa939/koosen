import { t } from 'i18next';

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count) {
	const page_count = Math.ceil(total_count / rowsPerPage)

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
		{
			name: "№",
			selector: (row, index) => {
                return (
                    (currentPage-1) * rowsPerPage + index + 1
                )
            },
			maxWidth: "30px",
			center: true
		},
		{
			name: t("Багшийн овог нэр"),
			selector: (row) => (row?.full_name),
			center: true
		},
		{
			name: t("Албан тушаал"),
			selector: (row) => (row?.org_position),
			center: true
		},
		{
			name: t("Б цагийн кредит цаг"),
			selector: (row) => (row?.score),
			center: true
		},
	]
    return columns
}