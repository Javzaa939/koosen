import { useRef } from 'react';
import { Badge, Input, UncontrolledTooltip }  from 'reactstrap';
import { Edit, Eye, Type } from "react-feather";
import { t } from 'i18next'

import moment from 'moment'
import useApi from '@hooks/useApi';
import useLoader from "@hooks/useLoader";

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, page_count) {

	const { fetchData } = useLoader({ isFullScreen: false })
	const focusData = useRef(undefined)
	const gpaApi = useApi().elselt.gpa

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
		{
			name: "№",
			selector: (row, index) => {
				let tableRow = document.getElementById(`row-${row.id}`)

				// Тэнцсэн тэнцээгүйгээс хамаарж border-left-д улаан ногоон border өгөх
				if (tableRow)
				{
					let border = row.state == 1 ? '' : row.state == 2 ? '4px solid rgba(40, 199, 111, 1)' : '4px solid #EA5455'
					tableRow.style.borderLeft = `${border}`
				}

				return (currentPage-1) * rowsPerPage + index + 1
			},
			center: true,
			maxWidth: "80px",
			minWidth: "80px",
		},
		{
			minWidth: "150px",
			header: 'user__last_name',
			name: t("Овог"),
			cell: (row) => (row?.data?.lastName),
			sortable: true,
			reorder: true,
			center: true,
			wrap: true,
		},
		{
			minWidth: "150px",
			header: 'user__first_name',
			name: t("Нэр"),
			cell: (row) => (row?.data?.firstName),
			sortable: true,
			reorder: true,
			center: true,
			wrap: true,
		},
        {
			maxWidth: "180px",
			minWidth: "180px",
			header: 'register',
			name: t("РД"),
			reorder: true,
			selector: (row) => row?.data?.registerNo,
			center: true
		}
	]

    return columns

}
