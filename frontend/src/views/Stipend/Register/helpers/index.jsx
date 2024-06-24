import { X, Edit, Book } from "react-feather";

import { Badge, UncontrolledTooltip } from "reactstrap";

import useModal from '@hooks/useModal'

import { t } from 'i18next'


// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, handleRequestDetail, editModal, handleDelete, user) {

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
			maxWidth: "30px"
		},
		{
			header: 'is_own',
			name: `${t("Тэтгэлгийн төрөл")}`,
			selector: (row) => (row?.is_own===1 ? "Дотоод тэтгэлэг" : "Гадны тэтгэлэг"),
            sortable: true,
			minWidth: "150px",
			maxWidth: "300px"
		},
		{
			header: 'stipend_type',
			name: `${t("Тэтгэлгийн нэр")}`,
			selector: (row) => (row?.stipend_type?.name),
            sortable: true,
			minWidth: "150px",
			maxWidth: "300px"
		},
		{
			header: 'start_date',
			name: t("Эхлэх хугацаа"),
			selector: (row) => row?.start_date,
			minWidth: "150px",
			maxWidth: "300px",
            sortable: true,
		},
		{
			header: 'finish_date',
			name: t("Дуусах хугацаа"),
			selector: (row) => row?.finish_date,
			minWidth: "150px",
			maxWidth: "300px",
            sortable: true,
		},
		{
			header: 'is_open',
			name: t("Нээлттэй эсэх"),
			selector: (row) => {
				return (
					row.is_open
					?
						<Badge color="light-success" pill>
							{t('Тийм')}
						</Badge>
					:
						<Badge color="light-danger" pill>
							{t('Үгүй')}
						</Badge>
				)
			},
			minWidth: "150px",
			maxWidth: "250px",
			sortable: true,
		},
	]

	if(Object.keys(user).length > 0) {
		columns.push(
        	{
				name: t("Үйлдэл"),
				maxWidth: "210px",
				minWidth: "180px",
				center: true,
				selector: (row) => (
					<div className="text-center" style={{ width: "auto" }}>
						<a
							id={`complaintListDatatableDetail${row.id}`}
							onClick = {
								() => handleRequestDetail(row?.id, row)}
							>
							<Badge color="light-info" pill><Book width={"15px"} /></Badge>
						</a>
                    	<UncontrolledTooltip placement='top' target={`complaintListDatatableDetail${row.id}`}>Дэлгэрэнгүй</UncontrolledTooltip>

						<a role="button" onClick={() => { editModal(row.id)} }
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
											title: t(`Тэтгэлэг устгах`),
										},
										question: t(`${row?.is_own===1 ? "Дотоод тэтгэлэг" : "Гадны тэтгэлэг"} мэдээлэл устгахдаа итгэлтэй байна уу?`),
										onClick: () => handleDelete(row.id),
										btnText: t('Устгах'),
									})}
									id={`complaintListDatatableCancel${row?.id}`}
							>
								<Badge color="light-danger" pill><X width={"15px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row?.id}`} >Устгах</UncontrolledTooltip>
							</>
						}
					</div>
				),
			}
		)
	}


    return columns

}
