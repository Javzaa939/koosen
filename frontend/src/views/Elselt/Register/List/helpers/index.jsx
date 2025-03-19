import { useContext } from 'react';
import moment from 'moment';
import { X, Edit, PlusCircle } from "react-feather";

import useModal from '@hooks/useModal'

import { Badge, UncontrolledTooltip } from "reactstrap";

import { t } from 'i18next'

import SchoolContext from "@context/SchoolContext"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, page_count, editModal, handleDelete, user, handleAdd) {

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
			name: t("Элсэлтийн нэр"),
			cell: (row) => (row?.name),
			minWidth: "200px",
			sortable: true,
			left: true,
			wrap: true,
		},
		{
			header: 'begin_date',
			name: t("Эхлэх хугацаа"),
			selector: (row) => row?.begin_date ? moment(row?.begin_date).format('YYYY-MM-DD HH:mm:ss') : '',
            sortable: true,
			minWidth: "80px",
			left: true,
			wrap: true
		},
		{
			header: 'end_date',
			name: t("Дуусах хугацаа"),
			selector: (row) => row?.end_date ? moment(row?.end_date).format('YYYY-MM-DD HH:mm:ss') : '',
			minWidth: "200px",
			center: true
		},
		{
			name: t("Боловсролын зэрэг"),
			selector: (row) => row?.degree_name,
			center: true
		},
		{
			name: t("Хичээлийн жил"),
			selector: (row) => row?.lesson_year,
			center: true
		},
		{
			name: t("Идэвхтэй эсэх"),
			selector: (row) => (
				row?.is_active
				?
					<Badge color="light-success" pill>
						{'Идэвхтэй'}
					</Badge>
				:
					<Badge color="light-primary" pill>
						{'Идэвхгүй'}
					</Badge>
			),
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
					<a role="button" onClick={() => { editModal(row)} }
						id={`edit${row?.id}`}
						className="me-1"
					>
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`edit${row.id}`} >Засах</UncontrolledTooltip>
					<a role="button" onClick={() => { handleAdd(row)} }
						id={`complaintListDatatableEdit${row?.id}`}
						className="me-1"
					>
						<Badge color="light-primary" pill><PlusCircle  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`}>Хөтөлбөр нэмэх</UncontrolledTooltip>
					{
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
