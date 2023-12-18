import { t } from 'i18next';
import { Badge } from "reactstrap";

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count) {

	const page_count = Math.ceil(total_count / rowsPerPage)

	 /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-с эхлэнэ */
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
			header: 'last_name',
			name: `${t("Овог")}`,
			selector: (row) => row?.last_name,
            sortable: true,
			minWidth: "80px",
			center: true,
		},
		{
			header: 'first_name',
			name: `${t("Нэр")}`,
			selector: (row) => row?.first_name,
            sortable: true,
			minWidth: "30px",
			center: true,

		},
		{
			header: 'register_num',
			name: t("Регистрийн дугаар"),
			selector: (row) => row?.register_num,
            sortable: true,
			center: true,
			minWidth: "280px"
        },
        {
			header: 'score',
			name: `${t("ЭЕШ оноо")}`,
			selector: (row) => row?.score?.scores ? row.score.scores.toFixed(2) : "",
            minWidth: "30px",
			center: true,
		},
        {
			header: 'score_code',
			name: `${t("Голч дүн")}`,
			selector: (row) => row?.score_code,
			minWidth: "30px",
			center: true,
		},
		{
			header: 'degree_code',
			name: `${t("Зэрэг")}`,
			selector: (row) => row?.degree_code,
			minWidth: "30px",
			center: true,
		},
		{
			header: 'is_finish',
			name: t("Төгссөн эсэх"),
			selector: (row) => {
				return (
					row.is_finish
					?
						<Badge color="light-success" pill>
							{t('Төгссөн')}
						</Badge>
					:
						<Badge color="light-info" pill>
							{t('Суралцаж буй')}
						</Badge>
				)
			},
			minWidth: "120px",
			center: true
		},
	]

    return columns
}
