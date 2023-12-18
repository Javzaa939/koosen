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
			selector: (row) => (row?.org_position_name),
			center: true
		},
		{
			name: t("Оноо"),
			selector: (row) => (row?.point),
			center: true
		},
	]
    return columns
}


export function getExpandedColumns () {

    const columns = [
		{
			name: "№",
			selector: (row, index) => {
                return (
                    index + 1
                )
            },
			maxWidth: "30px",
			center: true
		},
		{
			name: t("Бүтээлийн нэр"),
			selector: (row) => (row?.name),
			center: true
		},
		{
			name: t("Бүтээлийн  ангилал"),
			selector: (row) => (row?.category_name),
			center: true
		},
		{
			name: t("Хэвлэгдсэн он"),
			selector: (row) => (row?.published_year),
			center: true
		},
		{
			name: t("Хэвлэлийн хэмжээ"),
			selector: (row) => (row?.publishing_size_name),
			center: true
		},
		{
			name: t("Номын хуудасны тоо"),
			selector: (row) => (row?.pages_number),
			center: true
		},
	]
    return columns
}

