import { X, Edit } from "react-feather";
import { Badge, UncontrolledTooltip } from 'reactstrap';

import useModal from '@hooks/useModal'

import { t } from 'i18next';

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas, handleDelete, editModal, user) {

    const { showWarning } = useModal()

    const page_count = Math.ceil(datas.length / rowsPerPage)

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
			name: `${t('Хичээлийн байрны нэр')}`,
			selector: (row) => row?.building?.name,
			sortable: true,
			minWidth: "80px",
		},
		{
			name: `${t('Сургуулийн нэр')}`,
			selector: (row) => row?.school?.name,
			sortable: true,
			minWidth: "80px",
		},
		{
			name: `${t('Өрөөний дугаар')}`,
			header: 'code',
			cell: (row) => (row?.code),
			minWidth: "80px",
			sortable: true,
			center: true
		},
		{
			name: `${t('Өрөөний нэр')}`,
            cell: (row) => row?.name,
			minWidth: "80px",
			sortable: true,
			center: true
		},
		{
			name: `${t('Багтаамж')}`,
            cell: (row) => row?.volume,
			minWidth: "80px",
			sortable: true,
			center: true
		},
		{
			name: `${t('Өрөөний төрөл')}`,
            cell: (row) => row?.type,
			minWidth: "80px",
			sortable: true,
			center: true
		},
	]

	if(Object.keys(user).length > 0) {
		var delete_column =  {
			name: `${t('Үйлдэл')}`,
			maxWidth: "180px",
			minWidth: "180px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a role="button" onClick={() => { editModal(row.id)} }
						id={`complaintListDatatableEdit${row?.id}`}
						className="me-1"
					>
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
					{
					user.permissions.includes('lms-timetable-room-delete')&&
					<>
						<a role="button"
							onClick={() => showWarning({
								header: {
									title: `${t('Өрөө устгах')}`,
								},
								question: `Та "${row.name}" нэртэй өрөөг устгахдаа итгэлтэй байна уу?`,
								onClick: () => handleDelete(row.id),
								btnText: 'Устгах',
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
