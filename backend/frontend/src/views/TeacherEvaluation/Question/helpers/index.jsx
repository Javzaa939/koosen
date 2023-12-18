import { X, Edit, Book } from "react-feather";

import { Badge, UncontrolledTooltip } from "reactstrap";

import useModal from '@hooks/useModal'

import { t } from 'i18next'


// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count,  editModal, handleDelete, user) {

	const { showWarning } = useModal()

    const page_count = Math.ceil(total_count / rowsPerPage)

    // /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
		},
		{
			name: "Асуулт",
			selector: (row) => (row?.question),
		},
		{
			header: 'stipend_type',
			name: `${t("Асуултын төрөл")}`,
			selector: (row) => (row?.kind_name),
            sortable: true,
		},
	]

	if(Object.keys(user).length > 0) {
		columns.push(
        	{
				name: t("Үйлдэл"),
				maxWidth: "180px",
				minWidth: "180px",
				center: true,
				selector: (row) => (
					<div className="text-center" style={{ width: "auto" }}>
						<a role="button" onClick={() => { editModal(row)} }
							id={`complaintListDatatableEdit${row?.id}`}
							className='me-1 ms-1'
						>
							<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
						</a>
						<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>

						{
							user.permissions.includes('lms-stipend-delete')&&
							<>
								<a role="button"
									onClick={() => showWarning({
										header: {
											title: t(`Багшийн үнэлгээ`),
										},
										question: t(`Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?`),
										onClick: () => handleDelete(row.id),
										btnText: t('Устгах'),
									})}
									id={`complaintListDatatableCancel${row?.id}`}
							>
								<Badge color="light-danger" pill><X width={"15px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
							</>
						}
					</div>
				),
			}
		)
	}


    return columns

}
