import { t } from 'i18next'
import { X, Edit } from 'react-feather'
import { Badge,UncontrolledTooltip } from 'reactstrap'

import AuthContext from "@context/AuthContext"
import { useContext } from 'react'

import useModal from '@hooks/useModal'

export function getColumns (currentPage, rowsPerPage, total_count, editModal, handleDelete) {

    const page_count = Math.ceil(total_count / rowsPerPage)
    const { user } = useContext(AuthContext)
	const { showWarning } = useModal()

    if (currentPage > page_count) {
        currentPage =1
    }

    const columns = [
        {
            name: "№",
            selector: (row, index) => (currentPage-1) * rowsPerPage + 1 + index,
            maxWidth: "30px",
            center: "true"
        },
        {
            sortField: "name",
            name: `${t('Өрөөний төрлийн нэр')}`,
            selector: (row) => (row?.name),
            minWidth: "150px",
            center: "true",
            sortable: true,
        },
        {
            sortField: "name",
            name: `${t('Түрээсийн хэлбэр')}`,
            selector: (row) => (
                row?.rent_type === 1 ? 'Оюутан /Хичээлийн жилээр/'
                : 'Айл /Сар өдрөөр/'
            ),
            minWidth: "150px",
            center: "true",
            sortable: true,
        },
        {
            sortField: "volume",
            name: `${t('Өрөөний багтаамж')}`,
            selector: (row) => row?.volume,
            minWidth: "150px",
            center: "true",
            sortable: true,
        }
    ]
    if(Object.keys(user).length > 0) {
		var delete_column = {
			name: t("Үйлдэл"),
			maxWidth: "180px",
			minWidth: "180px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a role="button" onClick={() => { editModal(row.id)} }
							id={`complaintListDatatableEdit${row?.id}`}
                            className='me-1'
                        >
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
					{
						user.permissions.includes('lms-dormitory-roomtype-delete')&&
						<>
						<a role="button"
							onClick={() => showWarning({
								header: {
									title: t(`Ангийн бүртгэл устгах`),
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
