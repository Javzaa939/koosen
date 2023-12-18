import { t } from "i18next";

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

export function getExpandedColumns() {

	const columns = [
		{
			name: "№",
			selector: (row, index) => index + 1,
			maxWidth: "30px",
			center: "true",
		},
		{
			name: `${t("Эшлэгдсэн бүтээлийн нэр")}`,
			selector: (row) => row?.name,
			sortable: true,
		},
		{
			name: `${t("Эшлэлйн ангилал")}`,
			selector: (row) => row?.category.name,
			center: "true",
		},
		{
			name: `${t("DOI дугаар")}`,
			selector: (row) => row?.doi_number,
			center: "true",
		},
		{
			name: `${t("Эшлэлийн тоо")}`,
			selector: (row) => row?.quotation_number,
			center: "true",
		},
		{
			name: `${t("Эшлэлд татагдсан он")}`,
			selector: (row) => row?.quotation_year,
			center: "true",
		},
		{
			name: `${t("Бүтээлийн холбоос")}`,
			selector: (row) => row?.quotation_link,
			center: "true",
		},
	];
	return columns;
}
