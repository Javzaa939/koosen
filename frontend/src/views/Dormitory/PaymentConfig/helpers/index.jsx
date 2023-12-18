import { t } from 'i18next'

import { Badge, UncontrolledTooltip } from 'reactstrap'
import { X, Edit } from 'react-feather'
import useModal from "@hooks/useModal"
import AuthContext from "@context/AuthContext"
import { useContext } from 'react'

import { moneyFormat } from '@utils'

export function getColumns (currentPage, rowsPerPage, total_count, editModal, handleDelete) {
    const page_count = Math.ceil(total_count / rowsPerPage)
    const { showWarning } = useModal()
    const { user } = useContext(AuthContext)

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
            name: `${t('Төлбөрийн тохиргооны нэр')}`,
            selector: (row) => <span title={row?.name}>{row?.name}</span>,
            minWidth: "250px",
            left: true
        },
        {
            sortField: "is_ourstudent",
            name: `${t('Өөрийн сургуулийн оюутан')}`,
            selector: (row) => {
				return (
					row?.is_ourstudent
					?
						<Badge color="light-success" pill>
							{t('Тийм')}
						</Badge>
					:
						<Badge color="light-primary" pill>
							{t('Үгүй')}
						</Badge>
				)
			},
            minWidth: "250px",
            center: "true",
        },
        {
            sortField: "room_type",
            name: `${t('Өрөөний төрөл')}`,
            selector: (row) => <span title={row?.room_type?.name+ " " + "("+row?.room_type?.rent_type_name+")"}>{row?.room_type?.name + " " + "("+row?.room_type?.rent_type_name+")"}</span>,
            minWidth: "150px",
            left: true,
        },
        {
            sortField: "payment",
            name: `${t('Жилийн төлбөр')}`,
            selector: (row) => moneyFormat(row?.payment),
            minWidth: "150px",
            center: "true"
        },
        {
            sortField: "ransom",
            name: `${t('Барьцаа төлбөр')}`,
            selector: (row) => moneyFormat(row?.ransom),
            minWidth: "150px",
            center: "true"
        },
        {
            sortField: "lesson_year",
            name: `${t('Хичээлийн жил')}`,
            selector: (row) => row?.lesson_year,
            minWidth: "130px",
            center: "true"
        }
    ]
    if(Object.keys(user).length > 0) {
		var delete_column = {
			name: t("Үйлдэл"),
			maxWidth: "180px",
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
						user.permissions.includes('lms-dormitory-paymentconfig-delete')&&
						<>
						<a role="button"
							onClick={() => showWarning({
								header: {
									title: t(`Төлбөрийн тохиргоо устгах`),
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



