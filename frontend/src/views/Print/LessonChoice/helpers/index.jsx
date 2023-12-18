import { Printer } from "react-feather";

import useModal from '@hooks/useModal'

import css from '@mstyle/style.module.css'

import { t } from 'i18next'


// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count) {

	const { showWarning } = useModal()

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
			center: true
		},
		{
			header: 'student__code',
			name: t("Оюутны код"),
			selector: (row) => row?.code,
            sortable: true,
            center: true,
			minWidth: "80px",
		},
		{
			header: 'student__first_name',
			name: t("Овог Нэр"),
			selector: (row) => row?.last_name + ' ' + row?.first_name,
            sortable: true,
            center: true,
        },
	]


    return columns

}
