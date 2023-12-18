import { Badge,UncontrolledTooltip } from 'reactstrap';

import { t } from 'i18next';

import { X, Edit } from 'react-feather'

import useModal from '@hooks/useModal'


// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, editModal, handleDelete, user) {

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
			name: `${t('нэр')}`,
			selector: (row) => row?.name,
			minWidth: "100px",
			center: true
        },
		{
			name: `${t('оноо')}`,
			selector: (row) => row?.point,
			center: true
        },
	]

	// Сургуультай байх эсэх
	if(Object.keys(user).length > 0 ) {
		var delete_column = {
			name: `${t('Үйлдэл')}`,
			maxWidth: "180px",
			minWidth: "180px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a role="button" onClick={() => { editModal(row)}} id={`complaintListDatatableEdit${row?.id}`} className="me-1">
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>

					{/* {
						user.permissions.includes('lms-credit-settings-delete')&& */}
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: `${t('Тохиргоо устгах')}`,
									},
									question: `Та "${row.name}"  тохиргоог устгахдаа итгэлтэй байна уу?`,
									onClick: () => handleDelete(row.id),
									btnText: 'Устгах',
								})}
								id={`complaintListDatatableCancel${row?.id}`}
							>
								<Badge color="light-danger" pill><X width={"100px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
						</>
					{/* } */}

				</div>
			),
		}
		columns.push(delete_column)
	}
    return columns

}