import {useContext } from 'react'

import css from '@mstyle/style.module.css'

import { X, Edit, BookOpen, Copy } from 'react-feather'

import { Button,Badge, UncontrolledTooltip } from 'reactstrap'

import { useNavigate } from "react-router-dom"

import { useTranslation } from 'react-i18next'

import useModal from '@hooks/useModal'

import SchoolContext from "@context/SchoolContext"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, editModal, handleDelete, planhandleModal, user, copyModalHandler) {

	const { school_id } = useContext(SchoolContext)

	const { t } = useTranslation()
	const { showWarning } = useModal()

	const navigate = useNavigate()

	const page_count = Math.ceil(total_count / rowsPerPage)

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
			name: `${t('Хөтөлбөр')}`,
			selector: (row) => row?.code + ' ' + row?.name + "(" + row?.duration + ')',
            sortable: true,
			minWidth: "350px",
			maxWidth: "250px",
			left: true,
			wrap: true,
			center: true,
		},
		{
			header: 'degree',
			name: `${t('Боловсролын зэрэг')}`,
			selector: (row) => row?.degree?.degree_name,
            sortable: true,
			minWidth: "350px",
			maxWidth: "300px",
			center: true,
        },
		{
			header: 'general_direct',
			name: `${t('Хөтөлбөрийн ерөнхий чиглэл')}`,
			selector: (row) => row?.gen_direct_type_name,
            sortable: true,
			minWidth: "350px",
			maxWidth: "300px",
			center: true,
        },
		{
			header: 'dep_name',
			name: `${t('Хөтөлбөрийн төрөлжсөн чиглэл')}`,
			selector: (row) => row?.dep_name,
			sortable: true,
			minWidth: "300px",
			maxWidth: "250px",
			center: true,
		},
        {
			header: 'confirm_year',
			name: `${t('Батлагдсан он')}`,
			selector: (row) => row?.confirm_year,
			minWidth: "300px",
			maxWidth: "250px",
			sortable: true,
			center: true
		},
	]

	if(Object.keys(user).length > 0 ) {
		var delete_column = {
			name: `${t('Үйлдэл')}`,
			minWidth: '200px',
			maxWidth: "200px",
			center: true,
			selector: (row) => (
				<div style={{ width: "auto" }}>
					{
						user.permissions.includes('lms-study-learningplan-update')&& school_id&&
						<>
							<a role="button" onClick={(e) => { copyModalHandler(e, row)} }
								id={`complaintCopyDatatablePlan${row?.id}`}
								className="me-1"
							>
								<Badge color="light-success" pill><Copy  width={"15px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintCopyDatatablePlan${row.id}`} >Хувилах</UncontrolledTooltip>
						</>

					}
					{
						user.permissions.includes('lms-study-learningplan-read')&& school_id&&
						<>
							<a role="button" onClick={() => { planhandleModal(row.id)} }
								id={`complaintListDatatablePlan${row?.id}`}
								className="me-1"
							>
								<Badge color="light-info" pill><BookOpen  width={"15px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatablePlan${row.id}`} >Сургалтын төлөвлөгөө</UncontrolledTooltip>
						</>

					}
					{
						user.permissions.includes('lms-study-profession-update')&&
						<>
							<a role="button" onClick={() => { editModal(row.id)} }
								id={`complaintListDatatableEdit${row?.id}`}
								className="me-1"
							>
								<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
							</a>

							<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
						</>
					}
					{
						user.permissions.includes('lms-study-profession-delete')&& school_id&&
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: `${t('Хөтөлбөр устгах')}`,
									},
									question: `Та "${row.code}" индекстэй хөтөлбөрыг устгахдаа итгэлтэй байна уу?`,
									onClick: () => handleDelete(row.id),
									btnText: `${t('Устгах')}`,
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
