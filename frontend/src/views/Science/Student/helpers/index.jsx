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
			selector: (row) => (row?.teacher?.full_name),
			center: true,
		},
		{
			name: t("Багшийн албан тушаал"),
			selector: (row) => (row?.teacher?.org_position),
			center: true
		},
		{
			name: t("Нийт кредит цаг"),
			selector: (row) => (row?.score),
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
			name: t("Оюутан"),
			selector: (row) => (row?.code + ' '  + row?.first_name) ,
			center: true,
			width: '250px'
		},
		{
			name: t("Хөтөлбөр"),
			selector: (row) => (row?.profession_name),
			center: true
		},
		{
			name: t("Анги"),
			selector: (row) => (row?.group_name),
			center: true
		},
		{
			name: t("Төгсөлтийн ажлын сэдэв"),
			selector: (row) => (row?.title),
			center: true
		},
	]

    return columns

}
