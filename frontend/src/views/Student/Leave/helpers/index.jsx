import { useContext } from 'react';
import { X, Edit } from 'react-feather'
import { Badge, UncontrolledTooltip } from 'reactstrap';

import { t } from 'i18next';

import css from '@mstyle/style.module.css'

import useModal from "@hooks/useModal"
import SchoolContext from "@context/SchoolContext"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, editModal, handleDelete, user) {

    const { school_id } = useContext(SchoolContext)
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
			header: 'full_name',
			name: `${t('Оюутан')}`,
			selector: (row) =>row?.student?.full_name,
            sortable: true,
			minWidth: "180px",
			center: true
        },
		{
			header: 'learn_week',
			name: `${t('7 хоног')}`,
			selector: (row) => row?.learn_week,
            sortable: true,
			minWidth: "80px",
			center: true
        },
        {
			header: 'statement',
			name: `${t('Тушаал')}`,
			selector: (row) => row?.statement,
            sortable: true,
			minWidth: "140px",
			center: true
        },
		{
			header: 'statement_date',
			name: `${t('Тушаалын огноо')}`,
			selector: (row) => row?.statement_date,
            sortable: true,
			minWidth: "120px",
			center: true
        },
		{
			header: 'lesson_season',
			name: `${t('Чөлөө авсан улирал')}`,
			selector: (row) => row?.lesson_year + ' ' + row?.lesson_season?.season_name,
            sortable: true,
			minWidth: "250px",
			center: true
        },
	]

	if(Object.keys(user).length > 0 &&  school_id) {
		var delete_column = {
			name: `${t('Үйлдэл')}`,
			maxWidth: "180px",
			minWidth: "180px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
						user.permissions.includes('lms-student-leave-update') &&
						<>
							<a role="button" onClick={() => { editModal(row.id)} }
								id={`complaintListDatatableEdit${row?.id}`}
								className="me-1"
							>
								<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
						</>
					}
					{
						user.permissions.includes('lms-student-leave-delete') &&
						<>
						<a role="button"
							onClick={() => showWarning({
								header: {
									title: `${t('Чөлөөний бүртгэл устгах')}`,
								},
								question: `Та "${row?.student?.full_name}"-н чөлөөний бүртгэлийг устгахдаа итгэлтэй байна уу?`,
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
