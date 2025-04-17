import { Badge,UncontrolledTooltip } from 'reactstrap';

import { t } from 'i18next';

import { X, Edit, Edit2 } from 'react-feather'

import useModal from '@hooks/useModal'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, editModal, handleDelete, user, handleScoreEdit) {

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
			name: `${t('Индекс')}`,
            cell: (row) => row?.code,
			sortable: true,
			minWidth: "150px",
			center: true
		},
		{
			header: 'name',
			name: `${t('Нэр')}`,
			selector: (row) => <span title={row?.name}>{row?.name}</span>,
            sortable: true,
			minWidth: "300px",
			center: true,
			wrap: true
		},
		{
			header: 'kredit',
			name: `${t('Багц цаг')}`,
			selector: (row) => row?.ckredit,
            sortable: true,
			maxWidth: "150px",
			center: true
        },
		{
			name: `${t('Холбоотой хөтөлбөр')}`,
			selector: (row) => <span title={row?.professions}>{row?.professions}</span>,
			minWidth: "230px",
			width: "400px",
			wrap: true
        },
		{
			name: `${t('Дүнтэй эсэх')}`,
			selector: (row) => (
				<div>
					<Badge color={row?.is_score ? 'success' : 'primary'}>{row?.is_score ? 'Байгаа' : 'Байхгүй'}</Badge>
				</div>
			),
            left: true,
			minWidth: "150px",
        },
		{
			header: 'department__name',
			name: `${t('Тэнхим')}`,
			selector: (row) => <span title={row?.department?.name}>{row?.department?.name}</span>,
            sortable: true,
            center: true,
			minWidth: "180px",
			wrap: true,
        },
		{
			name: `${t('Заах багш')}`,
			selector: (row) => <span title={row?.teachers?.teacher_name}>{row?.teachers?.teacher_name}</span>,
            center: true,
			minWidth: "250px",
			wrap: true,
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
						user.permissions?.includes('lms-study-score-update')
						&&
						<>
							<a role="button" onClick={() => { handleScoreEdit(row)}} id={`groupScoreEdit${row?.id}`} className="me-1">
								<Badge color="light-secondary" pill><Edit2  width={"15px"}/></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`groupScoreEdit${row.id}`} >Дүн шилжүүлэх</UncontrolledTooltip>
						</>
					}

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
