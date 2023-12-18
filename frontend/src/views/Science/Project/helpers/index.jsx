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
			name: t("Төслийн нийт оноо"),
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
			header: 'name',
			name: t("Төслийн нэр"),
			selector: (row) => (row?.name),
			center: true
		},
		{
			header: 'category__name',
			name: t("Төслийн ангилал"),
			selector: (row) => (row?.category?.name),
            sortable: true,
			center: true
		},
		{
			header: 'start_date',
			name: t("Эхлэх хугацаа"),
			selector: (row) => (row?.start_date),
			center: true
		},
		{
			header: 'leader_name',
			name: t("Төслийн удирдагч"),
			selector: (row) => (row?.leader_name),
			center: true
		},
		{
			header: 'school',
			name: t("Төсөл хэрэгжүүлэгч сургууль"),
			selector: (row) => (row?.school?.name),
			center: true
		},
		{
			header: 'client_name',
			name: t("Захиалагчийн нэр"),
			selector: (row) => (row?.client_name),
			center: true
		},
	]

    return columns

}
