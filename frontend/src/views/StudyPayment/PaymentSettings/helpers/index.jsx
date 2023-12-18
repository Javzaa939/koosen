import { useContext } from 'react'
import { Badge, UncontrolledTooltip } from 'reactstrap'
import { X, Edit } from "react-feather";

import useModal from '@hooks/useModal'
import SchoolContext from "@context/SchoolContext"

import css from '@mstyle/style.module.css'

import { t } from 'i18next'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, page_count, handleEditModal, handleDelete, user, isClosedValue) {

	const { showWarning } = useModal()
	const { school_id } = useContext(SchoolContext)

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
			header: 'group',
			name: t("Анги"),
			cell: (row) => (
					row?.group?.name
            ),
			minWidth: "200px",
			sortable: true,
			center: 'true'
		},
		// {
		// 	header: 'lesson_year',
		// 	name: t("Хичээлийн жил"),
		// 	selector: (row) => row?.lesson_year,
        //     sortable: true,
		// 	minWidth: "200px",
		// },
		// {
		// 	header: 'lesson_season',
		// 	name: t("Улирал"),
		// 	selector: (row) => row?.lesson_season?.season_name,
        //     sortable: true,
		// 	minWidth: "100px",
		// },
		{
			header: 'payment',
			name: t("Багц цагийн төлбөр"),
			selector: (row) => row?.payment,
            sortable: true,
			minWidth: "200px",
			center: 'true'
		},
		{
			header: 'school',
			name: t("Сургууль"),
			selector: (row) => row?.school?.name,
            sortable: true,
			minWidth: "200px",
			center: 'true'
		},
	]

	if(Object.keys(user).length > 0 && school_id && !isClosedValue) {
		var delete_column = {
			name: t("Үйлдэл"),
			maxWidth: "80px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
						(user.permissions.includes('lms-payment-settings-update'))&&
						<a role="button" onClick={() => { handleEditModal(row.id)} }>
							<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
						</a>
					}
					{
						(user.permissions.includes('lms-payment-settings-delete'))&&
						<a role="button"
							onClick={() => showWarning({
								header: {
									title: t(`Төлбөрийн тохиргоо устгах`),
								},
								question: t(`Та "${row.group.name}" анги устгахдаа итгэлтэй байна уу?`),
								onClick: () => handleDelete(row.id),
								btnText: t('Устгах'),
							})}
						>
							<Badge color="light-danger" pill><X width={"100px"} /></Badge>
						</a>
					}
			</div>
			),
		}
		columns.push(delete_column)
	}

    return columns

}
