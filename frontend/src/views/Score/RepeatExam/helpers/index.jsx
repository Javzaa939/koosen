import { t } from "i18next";
import { Edit } from 'react-feather'
import { Badge, UncontrolledTooltip } from "reactstrap";
import { useContext } from 'react'
import css from '@mstyle/style.module.css'

import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, handleEditModal) {

    const page_count = Math.ceil(total_count / rowsPerPage)

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
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
			header: 'student',
			name: `${t('Оюутан')}`,
			cell: (row) => (row?.student?.code +' '+row?.student?.last_name +' '+ row?.student?.first_name),
			minWidth: "180px",
			sortable: true,
			center: true,
			wrap: true,
		},
		{
			header: 'teach_score',
			name: `${t('Багшийн оноо')}`,
			cell: (row) => row?.score?.teach_score,
			minWidth: "180px",
			// sortable: true,
			center:true,
			left: true,
		},
		{
			header: 'exam_score',
			name: `${t('Шалгалтын оноо')}`,
            cell: (row) => row?.score?.exam_score,
			minWidth: "80px",
			center: true,
			// sortable: true,
		},
		{
			header: 'total',
			name: `${t('Нийт оноо')}`,
            cell: (row) => row?.score?.total_score,
			minWidth: "80px",
			center: true,
			// sortable: true,
		},
		{
			header: 'assessment',
			name: `${t('Үсгэн үнэлгээ')}`,
            cell: (row) => row?.score?.assessment,
			minWidth: "80px",
			center: true
		},
		{
			header: 'status',
			name: `${t('Шалгалтын төлөв')}`,
            cell: (row) => row?.status_name,
			minWidth: "200px",
			center:true,
			left: true,
			sortable: true,
		},
	]
	if(Object.keys(user).length > 0 && school_id) {
		var delete_column = {
			name: t("Үйлдэл"),
			maxWidth: "80px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a role="button" onClick={() => { handleEditModal(row?.id, row?.student?.id)} }
							id={`complaintListDatatableEdit${row?.id}`}>
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Дүн оруулах</UncontrolledTooltip>
				</div>
			),
		}
		columns.push(delete_column)
	}
    return columns

}
