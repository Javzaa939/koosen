import { useNavigate } from "react-router-dom";

import { useContext } from "react";

import { Badge } from "reactstrap"

import css from '@mstyle/style.module.css'

import AuthContext from '@context/AuthContext'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage) {
    const usenavigate = useNavigate()
	const { user } = useContext(AuthContext)

    const columns = [
		{
			name: "№",
			selector: (row,index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			name: "Нэвтрэх нэр",
            cell: (row) => (
				user.is_superuser ?
					<p className={`${css.hrefHover} mb-0` }>
						<a role="button" onClick={() => {usenavigate(`/user/${row.id}/`)}}>
							{row.username}
						</a>
					</p>
                :
					row.username
            ),
			minWidth: "80px",
			sortable: true,
			center: true
		},
		{
			name: "Овог",
			selector: (row) => row.last_name,
            sortable: true,
			minWidth: "80px",
		},
        {
			name: "Нэр",
			selector: (row) => row.first_name,
            sortable: true,
        },
        {
			name: "Хандах эрхийн түвшин",
			selector: (row) => {
				return (
					row.is_superuser
					?
						<Badge color="light-success" pill>
							Админ
						</Badge>
					:
						<Badge color="light-primary" pill>
							Хэрэглэгч
						</Badge>
				)
			},
			minWidth: "120px",
			sortable: true,
			center: true
		},
        {
			name: "Бүртгэсэн огноо",
			selector: (row) =>row.date_joined,
			minWidth: "120px",
			sortable: true,
			center: true
		},
	]

    return columns

}
