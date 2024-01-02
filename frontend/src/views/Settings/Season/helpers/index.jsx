import { Edit } from "react-feather";

import { Badge, UncontrolledTooltip } from "reactstrap";

import useModal from '@hooks/useModal'

import { t } from "i18next";

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas, handleUpdateModal, user) {

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
			name: `${t('Улиралын код')}`,
            cell: (row) => row?.season_code,
			minWidth: "280px",
			sortable: true,
			center: true
		},
		{
			name: `${t('Улиралын нэр')}`,
			selector: (row) => row?.season_name,
            sortable: true,
			minWidth: "280px",
			center: true
		},
	]

	if(Object.keys(user).length > 0 && user.permissions.includes('lms-settings-season-update')? true : false) {
		var UpdateColumn =  {
			name: `${t('Үйлдэл')}`,
			minWidth: "380px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
					<a  role="button"
						id = {`SeasonUpdate${row?.id}`}
						onClick={
									() => handleUpdateModal(row?.id)
								}>

						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					}
					<UncontrolledTooltip placement='top' target={`SeasonUpdate${row.id}`} >Засах</UncontrolledTooltip>
				</div>
			),
		}

		columns.push(UpdateColumn)
	}
    return columns

}
