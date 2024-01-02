import { t } from 'i18next'

// Хүснэгтийн баганууд
export function getColumns(currentPage, rowsPerPage, total_count)
{

	if (rowsPerPage == 'Бүгд')
	{
		rowsPerPage = total_count
	}
	const page_count = Math.ceil(total_count / rowsPerPage)

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			width: "100px",
			center: true,
		},
		{
			header: 'teacher',
			name: t("Багш"),
			selector: (row) => row?.teacher?.full_name,
            sortable: true,
			left: true,
			minWidth: '200px',
			wrap: true,
        },
		{
			header: 'lesson',
			name: t("Хичээл"),
			selector: (row) => row?.lesson?.name,
            sortable: true,
			minWidth: "230px",
			center: true,
			wrap: "true",
		},
		{
			header: 'room',
			name: t("Өрөө"),
			selector: (row) => row?.room?.full_name,
            sortable: true,
			center: true,
			minWidth: '200px',
			wrap: true,
        },
		{
			header: 'day',
			name: t("Өдөр"),
			selector: (row) => row?.day,
            sortable: true,
			center: true,
        },
		{
			header: 'time',
			name: t("Цаг"),
			selector: (row) => row?.time,
            sortable: true,
			center: true,
        },
	]

    return columns

}
