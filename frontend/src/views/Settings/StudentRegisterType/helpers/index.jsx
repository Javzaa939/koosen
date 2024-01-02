import { Edit } from "react-feather";

import useModal from '@hooks/useModal'
import { t } from "i18next";
import { Badge, UncontrolledTooltip } from "reactstrap";

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas, handleUpdateModal, user) {
    const { showWarning } = useModal()

    const page_count = Math.ceil(datas.length / rowsPerPage)

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
			name: `${t('Оюутны бүртгэлийн код')}`,
            cell: (row) => row?.code,
			minWidth: "280px",
			center: true
		},
		{
			name: `${t('Оюутны бүртгэлийн нэр')}`,
			selector: (row) => row?.name,
            sortable: true,
			minWidth: "280px",
			center: true
		},
	]

	if(Object.keys(user).length > 0 && user.permissions.includes('lms-settings-registerstatus-update')? true : false) {
		var delete_column = {
			name: `${t('Үйлдэл')}`,
			minWidth: "380px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a
						role="button"
						id = {`learningUpdate${row?.id}`}
						onClick={
								() => handleUpdateModal(row?.id)
							}>
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`learningUpdate${row.id}`} >Засах</UncontrolledTooltip>
				</div>
			),
		}
		columns.push(delete_column)
	}

    return columns

}
