import {useContext } from 'react'
import css from '@mstyle/style.module.css'
import { Badge,UncontrolledTooltip } from 'reactstrap';

import { t } from 'i18next';

import { X, Edit } from 'react-feather'

import useModal from '@hooks/useModal'

import SchoolContext from '@context/SchoolContext'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, editModal, handleDelete, user) {

	const { school_id } = useContext(SchoolContext)

	const { showWarning } = useModal()

	const page_count = Math.ceil(total_count / rowsPerPage)

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
			header: 'code',
			name: `${t('Хичээлийн код')}`,
            cell: (row) => (row?.code ),
			minWidth: "80px",
			sortable: true,
			center: true
		},
		{
			header: 'name',
			name: `${t('Хичээлийн нэр')}`,
			selector: (row) => <span title={row?.name}>{row?.name}</span>,

			// selector: (row) => row?.name,
            sortable: true,
			minWidth: "80px",
			center: true
		},
		{
			header: 'kredit',
			name: `${t('Багц цаг')}`,
			selector: (row) => row?.kredit,
            sortable: true,
			minWidth: "250px",
			maxWidth: "50px",
			center: true
        },
		{
			header: 'department__name',
			name: `${t('Хөтөлбөрийн баг')}`,
			selector: (row) => row?.department?.name,
            sortable: true,
			minWidth: "80px",
			center: true
        },
		{
			header: '',
			name: `${t('Заах багш')}`,
			selector: (row) => row?.teacher_name,
            center: true
        },
	]

	if(Object.keys(user).length > 0 ) {
		var delete_column = {
			name: `${t('Үйлдэл')}`,
			maxWidth: "180px",
			minWidth: "180px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a role="button" onClick={() => { editModal(row.id)}} id={`complaintListDatatableEdit${row?.id}`} className="me-1">
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>

					{
						user.permissions.includes('lms-study-lessonstandart-delete')&&
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: `${t('Хичээлийн стандарт устгах')}`,
									},
									question: `Та "${row.code}" кодтой хичээлийн стандартыг устгахдаа итгэлтэй байна уу?`,
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
