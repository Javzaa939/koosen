import { Edit, Eye, X } from "react-feather";

import { Badge, UncontrolledTooltip } from "reactstrap";

import useModal from '@hooks/useModal'

import { t } from 'i18next'


// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, editModal, handleDelete, handleSend,  user) {

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
			name: `${t("Судалгааны нэр")}`,
			selector: (row) => (row?.title),
			center: true,
			width: '350px'
		},
		{
			name: `${t("Хамрах хүрээ")}`,
			selector: (row) => (row?.scope),
			center: true,
		},
		{
			header: 'start_date',
			name: t("Эхлэх хугацаа"),
			selector: (row) => row?.start_date,
            center: true,
		},
		{
			header: 'finish_date',
			name: t("Дуусах хугацаа"),
			selector: (row) => row?.end_date,
			center: true,
		},
		{
			name: `${t("Үүсгэсэн хэрэглэгч")}`,
			selector: (row) => (row?.created_by?.user?.last_name + '. ' + row?.created_by?.user?.first_name),
			center: true,
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
						<a
							id={`complaintListDatatableDetail${row.id}`}
							onClick = {
								() => {handleSend(row)}}
							>
							<Badge color="light-info" className="p-50" pill><Eye width={"15px"} /></Badge>
						</a>
                    	<UncontrolledTooltip placement='top' target={`complaintListDatatableDetail${row.id}`}>Загвар харах</UncontrolledTooltip>
						{
							user.permissions.includes('lms-stipend-delete') &&
							<>
								<a role="button"
									onClick={() => showWarning({
										header: {
											title: t(`Судалгаа устгах`),
										},
										question: t(`Та энэ судалгааг устгахдаа итгэлтэй байна уу?`),
										btnText: t('Устгах'),
										onClick: () => handleDelete(row.id),
									})}
									id={`complaintListDatatableCancel${row?.id}`}
							>
								<Badge color="light-danger" className="ms-50 p-50" pill><X width={"15px"} /></Badge>
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
