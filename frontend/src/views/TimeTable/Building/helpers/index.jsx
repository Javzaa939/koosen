import { X, Edit } from "react-feather";

import { Badge, UncontrolledTooltip } from "reactstrap";

import useModal from '@hooks/useModal'

import { t } from "i18next";

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas, handleDelete, user, handleModal) {

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
			name: `${t('Код')}`,
            cell: (row) => row?.code,
			minWidth: "80px",
			sortable: true,
			center: true
		},
		{
			name: `${t('Хичээлийн байрны нэр')}`,
			selector: (row) => row?.name,
            sortable: true,
			minWidth: "80px",
		},
	]

	if(Object.keys(user).length > 0 && user.permissions.includes('lms-timetable-building-delete')) {
		var delete_column =  {
			name: `${t('Үйлдэл')}`,
			maxWidth: "150px",
			minWidth: '150px',
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
						<a role="button" onClick={() => { handleModal(row.id)} }
                                id={`complaintListDatatableEdit${row?.id}`}
                                className='me-1'
                            >
                            <Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
                        </a>
                        <UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
						<a role="button"
							onClick={() => showWarning({
								header: {
									title: `${t('Хичээлийн байр устгах')}`,
								},
								question: `Та "${row.name}" нэртэй хичээлийн байрыг устгахдаа итгэлтэй байна уу?`,
								onClick: () => handleDelete(row.id),
								btnText: 'Устгах',
							})}
							id={`complaintListDatatableCancel${row?.id}`}
							>
								<Badge color="light-danger" pill><X width={"100px"} /></Badge>
							</a>
						<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
				</div>
			),
		}
		columns.push(delete_column)
	}

    return columns

}
