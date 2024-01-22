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
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			header: 'code',
			name: t("Оюутны код"),
			selector: (row) => (row?.code),
            sortable: true,
			minWidth: "80px",
			center: true
		},
		{
			header: 'last_name',
			name: t("Овог"),
			selector: (row) => `${row?.last_name}`,
            sortable: true,
			center: true,
        },
		{
			header: 'first_name',
			name: t("Нэр"),
			selector: (row) => `${row?.first_name}`,
            sortable: true,
			center: true,
        },
		{
			header: 'register_num',
			name: t("Регистр дугаар"),
			selector: (row) => row?.register_num,
            sortable: true,
			center: true
        },
        {
			header: 'profession',
			name: t("Хөтөлбөр"),
			selector: (row) => <span title={row?.group?.profession?.name}>{row?.group?.profession?.name}</span>,
            sortable: true,
			left: true,
			wrap: true,
        },
		{
			header: 'graduated_year',
			name: t("Төгссөн он"),
			selector: (row) => row?.graduated_year,
			sortable: true,
			width: '250px',
			center: true,
		},
	]

    return columns

}
