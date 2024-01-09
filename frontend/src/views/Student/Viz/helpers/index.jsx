import { useContext } from 'react';

import { X, Edit } from 'react-feather'
import {Badge, UncontrolledTooltip} from 'reactstrap'

import useModal from "@hooks/useModal"
import { t } from 'i18next';

import SchoolContext from "@context/SchoolContext"
import { status} from '@utils'
import css from '@mstyle/style.module.css'
import { defaultThemes } from 'react-data-table-component';

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas) {

	const page_count = Math.ceil(datas.length / rowsPerPage)

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
		{
			sortField: 'id',
            name: '№',
            center: true,
            width: '11%',
			selector: (row, idx) => (
				<div>
                    {rowsPerPage * (currentPage > 1 && currentPage - 1) + idx + 1}
                </div>),
			style: {
                textAlign: 'left'
            },
		},
		{
			header: 'student__profession',
			name: t("Хөтөлбөр"),
			selector: (row) =>
				<span title={row?.student?.group?.profession?.prof_name}>{row?.student?.group?.profession?.prof_name}</span>,
            sortable: true,
			center: true,
			maxWidth:"400px",
			minWidth:"150px",

        },
		{
			header: 'student__group',
			name: t("Анги"),
			selector: (row) => <span>{row?.student?.group?.name}</span>,
            sortable: true,
			maxWidth:"400px",
			minWidth:"150px",
			center: true
        },
		{
			name: t("Курс"),
			selector: (row) => row?.student?.group?.level,
			center: true,
			maxWidth:"400px",
			minWidth:"150px",
        },
		{
			header: 'code',
			name: t("Оюутны код"),
			selector: (row) => (row?.student?.code + " " +row?.student?.first_name ),
            sortable: true,
			center: true,
			maxWidth:"400px",
			minWidth:"150px",
		},
		{
			header: 'status',
			name: t("төлөв"),
			selector: (row) =>
				(status(row?.status)),
            sortable: true,
			center: true,
			maxWidth:"400px",
			minWidth:"150px",
        },
	]

    return columns

}
export const customStyles = {
    header: {
		style: {
            fontSize: "14px",
		},
	},
	headRow: {
		style: {
            color: "white",
            fontSize: "11px",
            backgroundColor: "#008cff",
			borderTopStyle: 'solid',
			borderTopWidth: '1px',
			borderTopColor: defaultThemes.default.divider.default,
		},
	},
	headCells: {
		style: {
            minHeight: "42px",
			'&:not(:last-of-type)': {
				borderRightStyle: 'solid',
				borderRightWidth: '1px',
				borderRightColor: defaultThemes.default.divider.default,
			},
		},
	},
	cells: {
		style: {
			'&:not(:last-of-type)': {
				borderRightStyle: 'solid',
				borderRightWidth: '1px',
				borderRightColor: defaultThemes.default.divider.default,
			},
		},
	},
};
