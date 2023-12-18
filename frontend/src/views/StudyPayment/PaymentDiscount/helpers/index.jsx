import { useContext } from 'react'
import { X,Edit } from "react-feather";
import useModal from '@hooks/useModal'
import SchoolContext from "@context/SchoolContext"

import css from '@mstyle/style.module.css'
import {  Badge } from 'reactstrap'

import { t } from 'i18next'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, page_count,handleEditModal, handleDelete, user, isClosedValue) {

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
			header: 'student',
			name: t("Оюутан"),
			cell: (row) => (
            	row?.student?.full_name
            ),
			sortable: true,
			minWidth: "80px",
			center: true
		},
		{
			header: 'stipent_type ',
			name: t("Хөнгөлөлтийн төрөл"),
			selector: (row) => row?.stipent_type?.name,
            sortable: true,
			minWidth: "80px",
			center: 'true'

		},
		{
			header: 'discount',
			name: t("Хөнгөлөлтийн хувь"),
			selector: (row) => row?.discount,
            sortable: true,
			minWidth: "80px",
			center: 'true'
		},
	]

	if(Object.keys(user).length > 0 && school_id && !isClosedValue) {
		var delete_column = {
			name: t("Устгах"),
			maxWidth: "80px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
						user.permissions.includes('lms-payment-discount-update')&&
						<a role="button" onClick={() => { handleEditModal(row.id)} }>
							<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
						</a>
					}
					{
						user.permissions.includes('lms-payment-discount-delete')&&
						<a role="button"
							onClick={() => showWarning({
								header: {
									title: t(`Төлбөрийн хөнгөлөлт устгах`),
								},
								question: t(`Та "${row.student?.code}" оюутан устгахдаа итгэлтэй байна уу?`),
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
