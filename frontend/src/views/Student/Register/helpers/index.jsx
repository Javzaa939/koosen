import { useContext } from 'react';

import { X, Edit } from 'react-feather'
import {Badge, UncontrolledTooltip} from 'reactstrap'

import useModal from "@hooks/useModal"
import { t } from 'i18next';

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
			header: 'code',
			name: t("Оюутны код"),
			selector: (row) => (row?.code),
            sortable: true,
			minWidth: "80px",
			center: true
		},
		{
			header: 'last_name',
			name: t("Овог"),
			selector: (row) => `${row?.last_name}`,
            sortable: true,
			center: true
        },
		{
			header: 'first_name',
			name: t("Нэр"),
			selector: (row) => `${row?.first_name}`,
            sortable: true,
			center: true
        },
		{
			header: 'register_num',
			name: t("Регистр дугаар"),
			selector: (row) => row?.register_num,
            sortable: true,
			center: true
        },
        {
			header: 'profession',
			name: t("Хөтөлбөр"),
			selector: (row) => <span title={row?.profession_name}>{row?.profession_name}</span>,
            sortable: true,
			left: true,
			wrap: true
        },
		{
			name: t("Анги"),
			selector: (row) => row?.group_name,
			center: true,
			width: '250px'
        },
		{
			header: 'status',
			name: t("суралцаж буй төлөв"),
			selector: (row) => (
				<Badge color="light-primary" pill>
					{t(row.status_name)}
				</Badge>
			),
            sortable: true,
			center: true
        },
	]

	if(Object.keys(user).length > 0) {
		var delete_column = {
			name: t("Үйлдэл"),
			width: "120px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a role="button" onClick={() => { editModal(row.id)} }
						id={`complaintListDatatableEdit${row?.id}`}
						className="me-1"
					>
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
					{
						(user.permissions.includes('lms-student-register-delete')  && school_id) &&
						<>
						<a role="button"
							onClick={() => showWarning({
								header: {
									title: t(`Оюутан устгах`),
								},
								question: t("Та энэ мэдээллийг устгахдаа итгэлтэй байна уу? Оюутны бүх мэдээлэл устахыг анхаарна уу"),
								onClick: () => handleDelete(row.id),
								btnText: t('Устгах'),
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
