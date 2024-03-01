import { useContext } from 'react';

import { X, Edit, PlusCircle, AlignCenter } from "react-feather";

import useModal from '@hooks/useModal'

import { Badge, UncontrolledTooltip } from "reactstrap";

import { t } from 'i18next'

import SchoolContext from "@context/SchoolContext";

import moment from 'moment'

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
			center: true,
			maxWidth: "80px",
			minWidth: "80px",
		},
		{
			maxWidth: "200px",
			minWidth: "200px",
			header: 'user__first_name',
			name: t("Овог нэр"),
			cell: (row) => (row?.full_name),
			sortable: true,
			center: true,
			wrap: true,
		},
        {
			maxWidth: "180px",
			minWidth: "180px",
			header: 'register',
			name: t("РД"),
			selector: (row) => row?.user?.register,
			center: true
		},
		{
			maxWidth: "250px",
			minWidth: "250px",
			header: 'profession__profession__name',
			name: 'Хөтөлбөр',
			selector: (row) => <span title={row?.profession}>{row?.profession}</span>,
            sortable: true,
			// left: true,
			center: true,
		},
		{
			maxWidth: "150px",
			minWidth: "150px",
			header: 'gpa',
			sortable: true,
			name: t("Голч дүн"),
			selector: (row) => row?.gpa,
			center: true,
		},
        {
			maxWidth: "250px",
			minWidth: "250px",
			name: t("Төгссөн сургууль"),
			selector: (row) => row?.userinfo?.graduated_school,
			center: true
		},
        {
			maxWidth: "150px",
			minWidth: "150px",
			header: 'state',
			sortable: true,
			name: t("Төлөв"),
			selector: (row) => row?.state_name,
			center: true,
		},
		{
			maxWidth: "100px",
			minWidth: "100px",
			name: t("Хүйс"),
			selector: (row) => row?.gender_name,
			center: true
		},
		{
			// text: center,
			maxWidth: "300px",
			minWidth: "300px",
			header: 'created_at',
			sortable: true,
			name: t("Бүртгүүлсэн огноо"),
			selector: (row) => row?.created_at? moment(row?.created_at).format("YYYY-MM-DD h:mm") : '',
			center: true,
		},
	]

	if(Object.keys(user).length > 0) {
		var delete_column = {
			name: t("Үйлдэл"),
			center: true,
			maxWidth: "100px",
			minWidth: "100px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a role="button" onClick={() => { editModal(row)} }
						id={`edit${row?.id}`}
						className="me-1"
					>
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`edit${row.id}`} >Засах</UncontrolledTooltip>
					{/* <a role="button" onClick={() => { handleAdd(row)} }
						id={`complaintListDatatableEdit${row?.id}`}
						className="me-1"
					>
						<Badge color="light-primary" pill><PlusCircle  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`}>Хөтөлбөр нэмэх</UncontrolledTooltip>
					{
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: t(`Элсэлт устгах`),
									},
									question: t(`Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?`),
									onClick: () => handleDelete(row.id),
									btnText: t('Устгах'),
								})}
								id={`complaintListDatatableCancel${row?.id}`}
							>
								<Badge color="light-danger" pill><X width={"100px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
						</>
					} */}
				</div>
			),
		}
		columns.push(delete_column)
	}

    return columns

}
