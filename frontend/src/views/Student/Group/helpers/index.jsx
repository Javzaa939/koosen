import { useContext } from 'react';

import { X, Edit } from "react-feather";

import useModal from '@hooks/useModal'

import { Badge, UncontrolledTooltip } from "reactstrap";

import css from '@mstyle/style.module.css'

import { t } from 'i18next'

import SchoolContext from "@context/SchoolContext"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, page_count, editModal, handleDelete, user) {

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
			header: 'name',
			name: t("Ангийн нэр"),
			cell: (row) => (row?.name),
			minWidth: "200px",
			sortable: true,
			left: true,
			wrap: true,
			center: true
		},
		{
			header: 'profession',
			name: t("Мэргэжил"),
			selector: (row) => row?.profession?.name,
            sortable: true,
			minWidth: "80px",
			center: true
		},
		{
			header: 'degree',
			name: t("Боловсролын зэрэг"),
			selector: (row) => row?.degree?.degree_name,
			minWidth: "200px",
			center: true
		},
		// {
		// 	header: 'learning_status',
		// 	name: t("Суралцах хэлбэр"),
		// 	selector: (row) => row?.learning_status?.learn_name,
        //     sortable: true,
		// 	minWidth: "180px",
		// 	center: true
		// },
		{
			name: t("Курс"),
			selector: (row) => row?.level,
			center: true
		},
		{
			header: 'teacher',
			name: t("Багш"),
			selector: (row) => row?.teacher?.first_name,
            sortable: true,
			minWidth: "80px",
			center: true
		},
		{
			header: 'is_finish',
			name: t("Төгссөн эсэх"),
			selector: (row) => {
				return (
					row.is_finish
					?
						<Badge color="light-success" pill>
							{t('Төгссөн')}
						</Badge>
					:
						<Badge color="light-info" pill>
							{t('Суралцаж буй')}
						</Badge>
				)
			},
			minWidth: "120px",
			minWidth: "80px",
			sortable: true,
			center: true
		},
	]

	if(Object.keys(user).length > 0 && school_id) {
		var delete_column = {
			name: t("Үйлдэл"),
			maxWidth: "180px",
			minWidth: "180px",
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
						user.permissions.includes('lms-student-group-delete') &&
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: t(`Ангийн бүртгэл устгах`),
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
					}
				</div>
			),
		}
		columns.push(delete_column)
	}

    return columns

}
