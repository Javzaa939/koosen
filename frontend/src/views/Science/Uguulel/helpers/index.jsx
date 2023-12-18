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
			selector: (row) => (row?.name),
			center: true
		},
		{
			name: t("Нийт оноо"),
			selector: (row) => (row?.point),
			center: true
		},
	]

    return columns
}

export function getExpandedColumns() {
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
			name: t("Өгүүлэл нэр"),
			selector: (row) => (row?.name),
			center: true
		},
		{
			name: t("Өгүүлэл гарсан сэтгүүлийн нэр"),
			selector: (row) => (row?.magname),
			center: true
		},
		{
			name: t("Өгүүллийн ангилал"),
			selector: (row) => (row?.category?.name),
			center: true
		},
		{
			name: t("Эрхлэн гаргагч байгууллага"),
			selector: (row) => (row?.published_org),
			center: true
		},
		{
			name: t("Сэтгүүлийн холбоос"),
			selector: (row) => { return  ( <a type='link' target={'_blank'} href={row?.mag_link} className='text-decoration-underline'>{row?.mag_link}</a>)},
			center: true
		},
		{
			name: t("Хэвлэгдсэн он"),
			selector: (row) => (row?.published_year),
			center: true
		},
	]

	return columns
}
