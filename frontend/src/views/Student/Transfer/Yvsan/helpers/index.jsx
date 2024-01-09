import { useContext } from 'react';
import { X, Edit } from 'react-feather'
import { Badge, UncontrolledTooltip } from "reactstrap";

import { t } from 'i18next';

import css from '@mstyle/style.module.css'


import useModal from "@hooks/useModal"
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
			header: 'first_name',
			name: `${t('Оюутан')}`,
			selector: (row) => row?.student?.code +' '+ row?.student?.last_name[0] + '.' + row?.student?.first_name,
            sortable: true,
			minWidth: "250px",
			center: true
        },
		{
			header: 'is_internal',
			name: t("Сургууль дотор шилжих эсэх"),
			selector: (row) => {
				return (
					row.is_internal
					?
						<Badge color="light-success" pill>
							{t('Сургууль доторх')}
						</Badge>
					:
						<Badge color="light-info" pill>
							{t('Сургуулиас гадагш')}
						</Badge>
				)
			},
			minWidth: "250px",
			center: true
		},
		{
			header: 'destination_school',
			name: `${t('Хаашаа шилжих')}`,
			selector: (row) => <span title={`${row?.school_name}`}>{row?.school_name}</span>,
            sortable: true,
			minWidth: "250px",
			center: true,
        },
		{
			header: 'destination_pro',
			name: `${t('Хөтөлбөр')}`,
			selector: (row) => <span title={`${row?.pro_name}`}>{row?.pro_name}</span>,
            sortable: true,
			minWidth: "250px",
			center: true,
        },
		{
			header: 'destination_pro',
			name: `${t('Анги')}`,
			selector: (row) => <span title={`${row?.group?.name}`}>{row?.group?.name}</span>,
            sortable: true,
			minWidth: "250px",
			center: true,
        },
        {
			header: 'statement_name',
			name: `${t('Тушаал')}`,
			selector: (row) => row?.statement,
            sortable: true,
			minWidth: "150px",
			center: true
        },
		{
			header: 'statement_date',
			name: `${t('Тушаалын огноо')}`,
			selector: (row) => row?.statement_date,
            sortable: true,
			minWidth: "100px",
			center: true
        },
	]

	if(Object.keys(user).length > 0 && school_id ) {
		var delete_column = {
			name: `${t('Устгах')}`,
			maxWidth: "80px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
						user.permissions.includes('lms-student-movement-update')&&
						<>
							<a role="button" onClick={() => { editModal(row.id)} }
								id={`complaintListDatatableEdit${row?.id}`}>
								<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
							</a>

							<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
						</>
					}
					{
						user.permissions.includes('lms-student-movement-delete')&&
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: `${t('Шилжилт хөдөлгөөний бүртгэл устгах')}`,
									},
									question: `Та "${row?.full_name}" оюутны шилжилт хөдөлгөөний бүртгэлийг устгахдаа итгэлтэй байна уу?`,
									onClick: () => handleDelete(row.id),
									btnText: 'Устгах',
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
