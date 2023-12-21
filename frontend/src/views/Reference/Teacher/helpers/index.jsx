import { t } from 'i18next';

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas) {

	// const page_count = Math.ceil(datas.length / rowsPerPage)
	//  /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-с эхлэнэ */
    // if (currentPage > page_count) {
    //     currentPage = 1
    // }

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			name: `${t("Код")}`,
			selector: (row) => row?.code,
			maxWidth: "100px",
			center: true
		},
		{
			header: 'last_name',
			name: `${t("Овог")}`,
			selector: (row) => row?.last_name,
            sortable: true,
			minWidth: "100px",
			center: true,
		},
		{
			header: 'name',
			name: `${t("Нэр")}`,
			selector: (row) => {
				return <a className='text-decoration-underline' href={`/reference/teachers/${row.id}/info/`} target="_blank" >{row?.first_name}</a>
			},
            sortable: true,
			minWidth: "100px",
			center: true,
		},
        {
			header: 'last_name',
			name: `${t("Албан тушаал")}`,
			selector: (row) => row?.org_position,
            sortable: true,
			minWidth: "30px",
			center: true,
		},
        {
			name: `${t("Тэнхим")}`,
			selector: (row) => row?.salbar?.name,
			minWidth: "30px",
			center: true,
			wrap: true,
		},
		{
			name: `${t("Бүрэлдэхүүн сургууль")}`,
			selector: (row) => row?.sub_org?.name,
			minWidth: "30px",
			center: true,
			wrap: true,
		},
	]
    return columns
}

