import { X, Edit } from 'react-feather'
import { Badge, UncontrolledTooltip } from 'reactstrap';
import { t } from "i18next";
import useModal from '@hooks/useModal'

import css from '@mstyle/style.module.css'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, user, handleEditModal, handleDelete) {

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
			header: 'student',
			name: `${t('Оюутан')}`,
			cell: (row) => (row?.student?.code + ' ' + row?.student?.full_name),
			minWidth: "180px",
			sortable: true,
			center: true,
			wrap: true,
		},
		{
			header: 'lesson',
			name: `${t('Хичээл')}`,
            cell: (row) => row?.lesson?.code + ' ' + row?.lesson?.name,
			minWidth: "180px",
			sortable: true,
			left: true,
		},
		{
			header: 'status',
			name: `${t('Шалгалтын төлөв')}`,
            cell: (row) => row?.status_name,
			minWidth: "150px",
			sortable: true,
			left: true
		},
	]
	// role нэр өөрөөр шалгагдана дахин шалгалтын permission
    if(Object.keys(user).length > 0) {
		var delete_column = {
			name: t("Үйлдэл"),
			maxWidth: "180px",
			minWidth: "180px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
	                <a role="button" onClick={() => { handleEditModal(row.id)} }
						id={`complaintListDatatableEdit${row?.id}`}
						className="me-1"
					>
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
					{
						user.permissions.includes('lms-timetable-examrepeat-delete')&&
						<>
						<a role="button"
							onClick={() => showWarning({
								header: {
									title: t(`Дахин шалгалт устгах`),
								},
								question: t("Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?"),
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
