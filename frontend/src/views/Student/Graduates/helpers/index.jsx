import { useContext } from 'react';

import { X, Edit } from 'react-feather'
import {Badge, UncontrolledTooltip} from 'reactstrap'

import useModal from "@hooks/useModal"
import { t } from 'i18next';

import SchoolContext from "@context/SchoolContext"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, editModal, handleDelete, user) {

	const { school_id } = useContext(SchoolContext)

	const page_count = Math.ceil(total_count / rowsPerPage)

	const { showWarning } = useModal()

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
			name: t("Төгссөн он"),
			selector: (row) => row?.join_year,
			sortable: true,
			width: '250px',
		},
	]

    return columns

}
