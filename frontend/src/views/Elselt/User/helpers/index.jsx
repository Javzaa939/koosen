import { useContext } from 'react';

import { X, Edit, PlusCircle } from "react-feather";

import useModal from '@hooks/useModal'

import { Badge, UncontrolledTooltip } from "reactstrap";

import { t } from 'i18next'

import SchoolContext from "@context/SchoolContext"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, page_count, editModal, handleDelete, user, handleAdd) {

	const { school_id } = useContext(SchoolContext)

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
			header: 'user__first_name',
			name: t("Овог нэр"),
			cell: (row) => (row?.full_name),
			sortable: true,
			center: true,
			wrap: true,
		},
        {
			header: 'register',
			name: t("РД"),
			selector: (row) => row?.user?.register,
			center: true
		},
		{
			header: 'profession__profession__name',
			name: t("Хөтөлбөр"),
			selector: (row) => <span title={row?.profession}>{row?.profession}</span>,
            sortable: true,
			left: true
		},
		{
			name: t("Голч дүн"),
			selector: (row) => row?.userinfo?.gpa,
			center: true
		},
        {
			name: t("Төгссөн сургууль"),
			selector: (row) => row?.userinfo?.graduated_school,
			center: true
		},
        {
			name: t("Төлөв"),
			selector: (row) => row?.lesson_year,
			center: true
		},
	]

	// if(Object.keys(user).length > 0) {
	// 	var delete_column = {
	// 		name: t("Үйлдэл"),
	// 		center: true,
	// 		maxWidth: "180px",
	// 		minWidth: "180px",
	// 		selector: (row) => (
	// 			<div className="text-center" style={{ width: "auto" }}>
	// 				<a role="button" onClick={() => { editModal(row)} }
	// 					id={`edit${row?.id}`}
	// 					className="me-1"
	// 				>
	// 					<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
	// 				</a>
	// 				<UncontrolledTooltip placement='top' target={`edit${row.id}`} >Засах</UncontrolledTooltip>
	// 				<a role="button" onClick={() => { handleAdd(row)} }
	// 					id={`complaintListDatatableEdit${row?.id}`}
	// 					className="me-1"
	// 				>
	// 					<Badge color="light-primary" pill><PlusCircle  width={"15px"} /></Badge>
	// 				</a>
	// 				<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`}>Хөтөлбөр нэмэх</UncontrolledTooltip>
	// 				{
	// 					<>
	// 						<a role="button"
	// 							onClick={() => showWarning({
	// 								header: {
	// 									title: t(`Элсэлт устгах`),
	// 								},
	// 								question: t(`Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?`),
	// 								onClick: () => handleDelete(row.id),
	// 								btnText: t('Устгах'),
	// 							})}
	// 							id={`complaintListDatatableCancel${row?.id}`}
	// 						>
	// 							<Badge color="light-danger" pill><X width={"100px"} /></Badge>
	// 						</a>
	// 						<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
	// 					</>
	// 				}
	// 			</div>
	// 		),
	// 	}
	// 	columns.push(delete_column)
	// }

    return columns

}
