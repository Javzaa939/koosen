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


export function getExpandColumns () {

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
			verbose_name: t("Багш"),
			selector: (row) => (row?.user),
			center: true
		},
		{
			name: t("Шинэ бүтээлийн нэр"),
			selector: (row) => (row?.name),
			center: true
		},
		{
			name: t("Улсын бүртгэлийн дугаар"),
			selector: (row) => (row?.register_number),
			center: true
		},
		{
			name: t("Товч тайлбар"),
			selector: (row) => (row?.abstract),
			center: true
		},
		{
			name: t("ШУ-ы салбар"),
			selector: (row) => (row?.on_delete),
			center: true
		},
		{
			name: t("Патентийн хуулбар"),
			selector: (row) => (row?.patent_copy),
			center: true
		},
	]
    return columns
}

