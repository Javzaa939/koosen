import { Edit } from "react-feather";

import { t } from "i18next";

import useModal from '@hooks/useModal'
import { UncontrolledTooltip } from "reactstrap";

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
			name: `${t('Зэргийн код')}`,
            cell: (row) => row?.degree_code,
			maxWidth: "380px",
			center: true,
		},
		{
			name: `${t('Зэргийн нэр')}`,
			selector: (row) => row?.degree_name,
			maxWidth: "380px",
			center: true,
			sortable: true,
		},
		{
			name: `${t('Зэргийн нэр англи')}`,
			selector: (row) => row?.degree_eng_name,
			center: true,
			maxWidth: "480px",
        },
	]

	if(Object.keys(user).length > 0 && user.permissions.includes('lms-settings-degree-update')? true : false) {
		var update_column =  {
			name: `${t('Үйлдэл')}`,
			maxWidth: "80px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
					<a
					role="button"
					id = {`degreeUpdate${row?.id}`}
					onClick={
								() => handleUpdateModal(row?.id)
							}>
						<Edit color='#b4b7bd' width={"15px"}/>
					</a>
					}
					<UncontrolledTooltip placement='top' target={`degreeUpdate${row.id}`} >Засах</UncontrolledTooltip>
				</div>
			),
		}
		columns.push(update_column)
	}

    return columns

}
