import { useContext, useState, useRef } from 'react'
import { UncontrolledTooltip, Badge } from 'reactstrap'
import { Eye } from 'react-feather'
import { t } from 'i18next'
import { FaUndo } from 'react-icons/fa'
import useModal from '@hooks/useModal'

import AuthContext from "@context/AuthContext"

// Хүснэгтийн баганууд
export function getColumns(currentPage, rowsPerPage, total_count, select_value, exam_date, isDadlaga, handleDetailModal, handleDeleteModal) {

	const { user } = useContext(AuthContext)
	const { showWarning } = useModal()

	const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			header: 'lesson',
			name: `${t('Хичээл')}`,
			selector: (row) => (row?.lesson?.code + '  ' + row?.lesson?.name),
			sortable: true,
			minWidth: "200px",
			left:true,
			wrap:true
		},
		{
			header: 'group',
			name: `${t('Ангийн нэр')}`,
			selector: (row) => (row?.group?.name),
			sortable: true,
			wrap: true,
			center:true
		},
		{
			header: 'student',
			name: `${t('Багшийн нэр')}`,
			selector: (row) => (row?.teacher?.last_name + '  ' + row?.teacher?.first_name),
			sortable: true,
			wrap: true,
			center:true
		},
		{
			header: 'date',
			name: `${t('Дүн баталгаажуулсан эсэх')}`,
			selector: (row) => (
				row?.is_approved
					? <span style={{ color: 'green' }}>{t('Баталгаажсан')}</span>
					: <span style={{ color: 'red' }}>{t('Баталгаажаагүй')}</span>
			),
			sortable: true,
			wrap: true,
			center:true
		},
		{
			header: 'date',
			name: `${t('Дүн баталгаажуулсан огноо')}`,
			selector: (row) => (
				row?.approved_date
			),
			wrap: true,
			center: true,

		},
	]
	if (Object.keys(user).length > 0) {
		var delete_column = {
			name: t("Үйлдэл"),
			width: "200px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a role="button"
						onClick={() => { handleDetailModal(row) }}
						id={`complaintListDatatableEdit${row?.id}`}
						className="me-1"
					>
						<Badge color="light-success" pill><Eye width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row?.id}`} >Дэлгэрэнгүй</UncontrolledTooltip>
					{
						row?.is_approved
						&&
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: `${t('Баталгаажуулсан дүн устгах')}`,
									},
									question: `Та "${row?.group?.name}" ангийн "${row?.lesson?.name}" хичээлийн баталгаажуулсан дүнг буцаахдаа итгэлтэй байна уу?`,
									onClick: () => handleDeleteModal(row),
									btnText: 'Буцаах',
								})}
								id={`Undo${row?.id}`}
								className="me-1"
							>
								<Badge color="light-danger" pill><FaUndo width={"15px"} /></Badge>
							</a>
						</>
					}
				</div>
			),
		}
		columns.push(delete_column)
	}

	return columns
}
