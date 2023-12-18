import { t } from 'i18next'

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
			name: t('Багшийн нэр'),
			selector: (row) => (row?.full_name),
			center: true,
		},
		{
			name: t("Багшийн албан тушаал"),
			selector: (row) => (row?.org_position_name),
            sortable: true,
			center: true
		},
		{
			name: t("Илтгэлийн нийт оноо"),
			selector: (row) => (row?.point),
			center: true
		},
	]
    return columns
}

export function getExpandColumns (){

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
            name: t("Хурлын нэр"),
            selector: (row) => (row?.meeting_name),
            center: true
        },
        {
			header: 'category',
			name: t("Ангилал"),
			selector: (row) => (row?.category_name),
            sortable: true,
			center: true
		},
        {
			header: 'abstract',
			name: t("Хураангуй"),
			selector: (row) => (row?.abstract),
            sortable: true,
			center: true
		},
        {
			header: 'date',
			name: t("Тавигдсан хугацаа"),
			selector: (row) => (row?.meeting_date),
            sortable: true,
			center: true
		},
        {
			header: 'country',
			name: t("Зохион байгуулагдсан улс"),
			selector: (row) => (row?.country_name),
            sortable: true,
			center: true
		},
    ]
    return columns
}
