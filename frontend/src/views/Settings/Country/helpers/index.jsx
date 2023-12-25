import { Edit } from "react-feather";

import { t } from "i18next";

import useModal from '@hooks/useModal'

import { UncontrolledTooltip } from 'reactstrap'

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
			name: `${t('Улсын код')}`,
            cell: (row) => row?.code,
			minWidth: "280px",
			sortable: true,
			center: true
		},
		{
			name: `${t('Улсын нэр')}`,
			selector: (row) => row?.name,
            sortable: false,
			minWidth: "280px",
			center: true
		},
        {
			name: `${t('Англи нэр')}`,
			selector: (row) => row?.name_eng,
            sortable: false,
			minWidth: "280px",
			center: true
		},
        {
			name: `${t('Уйгаржин нэр')}`,
			selector: (row) => row?.name_uig,
            sortable: false,
			minWidth: "280px",
			center: true,
			style: {fontFamily: 'CMs Urga', fontSize:'15px'}
		},
	]
	if(Object.keys(user).length > 0 && user.permissions.includes('lms-settings-country-update')? true : false) {
		var UpdateColumn =  {
			name: `${t('Үйлдэл')}`,
			minWidth: "140px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
					<a  role="button"
						id = {`CountryUpdates${row?.id}`}
						onClick={
									() => handleUpdateModal(row?.id)
								}>

						<Edit color='#b4b7bd' width={"15px"} />
					</a>
					}
					<UncontrolledTooltip placement='top' target={`CountryUpdates${row.id}`} >Засах</UncontrolledTooltip>
				</div>
			),
		}
		columns.push(UpdateColumn)
	}
    return columns

}
