import { useContext } from 'react';

import { X, Edit, PlusCircle } from "react-feather";

import useModal from '@hooks/useModal'

import { Badge, UncontrolledTooltip } from "reactstrap";

import css from '@mstyle/style.module.css'

import { t } from 'i18next'

import SchoolContext from "@context/SchoolContext"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, page_count, editModal, handleDelete, user) {

	const { school_id } = useContext(SchoolContext)

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
			header: 'name',
			name: t("Мэргэжлийн нэр"),
			cell: (row) => (row?.name),
			minWidth: "200px",
			sortable: true,
			left: true,
			wrap: true,
			left: true
		},
		{
			header: 'profession',
			name: t("Эхлэх хугацаа"),
			selector: (row) => <span title={row?.profession?.name}>{row?.profession?.name}</span>,
            sortable: true,
			minWidth: "80px",
			left: true
		},
		{
			header: 'degree',
			name: t("Дуусах хугацаа"),
			selector: (row) => row?.degree?.degree_name,
			minWidth: "200px",
			center: true
		},
		{
			name: t("Суралцах жил"),
			selector: (row) => row?.level,
			center: true
		},
	]

	if(Object.keys(user).length > 0) {
		var delete_column = {
			name: t("Үйлдэл"),
			center: true,
			maxWidth: "180px",
			minWidth: "180px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a role="button" onClick={() => { editModal(row.id)} }
						id={`edit${row?.id}`}
						className="me-1"
					>
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`edit${row.id}`} >Засах</UncontrolledTooltip>
					<a role="button" onClick={() => { editModal(row.id)} }
						id={`complaintListDatatableEdit${row?.id}`}
						className="me-1"
					>
						<Badge color="light-primary" pill><PlusCircle  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`}>Шалгуур нэмэх</UncontrolledTooltip>
					{
						user.permissions.includes('lms-student-group-delete') &&
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: t(`Элсэлт устгах`),
									},
									question: t(`Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?`),
									onClick: () => handleDelete(row.id),
									btnText: t('Устгах'),
								})}
								id={`complaintListDatatableCancel${row?.id}`}
							>
								<Badge color="light-danger" pill><X width={"100px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
						</>
					}
				</div>
			),
		}
		columns.push(delete_column)
	}

    return columns

}
