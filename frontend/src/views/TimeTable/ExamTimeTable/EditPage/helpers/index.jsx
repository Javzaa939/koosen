import { Edit, Eye, Minus, X } from "react-feather";

import { Badge, UncontrolledTooltip } from "reactstrap";

import useModal from '@hooks/useModal'

import { t } from 'i18next'


// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, activeHandler) {

    const page_count = Math.ceil(total_count / rowsPerPage)

    // /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }
    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
		},
		{
			header: 'code',
			name: `${t("Оюутны код")}`,
			selector: (row) => (row?.code),
			center: true,
			minwidth: '130px'
		},
		{
			header: 'last_name',
			name: `${t("Овог")}`,
			selector: (row) => (row?.last_name),
			center: true,
		},
		{
			header: 'first_name',
			name: t("Нэр"),
			selector: (row) => row?.first_name,
            center: true,
		},
	]

		columns.push(
        	{
				name: t("Хасах"),
				maxWidth: "100px",
				minWidth: "100px",
				center: true,
				selector: (row) => (
					<div className="text-center" role="button" style={{ width: "auto" }}>
						<Badge color="light-danger" onClick = {() => {activeHandler(row?.id)}} pill><Minus width={"15px"} /></Badge>
					</div>
				),
			}
		)


    return columns

}
