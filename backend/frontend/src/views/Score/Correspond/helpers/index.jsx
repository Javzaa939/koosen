import { useContext } from 'react'
import { X, Edit } from 'react-feather'
import { Badge, UncontrolledTooltip } from 'reactstrap'

import { t } from 'i18next'

import useModal from '@hooks/useModal'
import SchoolContext from "@context/SchoolContext"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, handleDelete, handleEditModal, user) {

	const page_count = Math.ceil(total_count / rowsPerPage)
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
			center: true,
		},
		{
			header: 'student',
			name: `${t('Оюутан')}`,
			selector: (row) => row?.student?.code +' '+ row?.student?.last_name +' '+ row?.student?.first_name,
            sortable: true,
			minWidth: "250px",
			maxWidth: "400px",
			wrap: true,
			center: true,
        },
        {
			header: 'lesson',
			name: `${t('Дүйцүүлэх хичээл')}`,
			selector: (row) => row?.lesson?.full_name,
            sortable: true,
			minWidth: '250px',
			maxWidth: "400px",
			wrap: true,
			center: true,
        },
		{
			header: 'teach_score',
			name: `${t('Багшийн оноо')}`,
			selector: (row) => row?.teach_score,
            sortable: true,
			center: true,
			minWidth: '200px',
			maxWidth: "250px",
        },
        {
			header: 'exam_score',
			name: `${t('Шалгалтын оноо')}`,
			selector: (row) => row.exam_score,
			center: true,
            sortable: true,
			minWidth: '200px',
			maxWidth: "250px",
        },
        {
			header: 'assessment',
			name: `${t('Үсгэн үнэлгээ')}`,
			selector: (row) => row?.assessment?.assesment,
            sortable: true,
			center: true,
			minWidth: '200px',
			maxWidth: "250px",
        },
	]
	if(Object.keys(user).length > 0 && school_id) {
		var delete_column = {
			name: `${t('Үйлдэл')}`,
			maxWidth: "80px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
						user.permissions.includes('lms-score-correspond-update')&&
						<>
							<a role="button" onClick={() => handleEditModal(row.id) }
								id={`complaintListDatatableEdit${row?.id}`}>
								<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
						</>
					}
					{
						user.permissions.includes('lms-score-correspond-delete')&&
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: `${t('Дүйцүүлсэн дүнгийн мэдээлэл устгах')}`,
									},
									question: `Та "${row?.student?.first_name}" мэдээлэл устгахдаа итгэлтэй байна уу?`,
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
