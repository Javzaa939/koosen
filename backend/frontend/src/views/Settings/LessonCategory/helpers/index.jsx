import { t } from "i18next";
import { Edit } from "react-feather";
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
			name: `${t('Хичээлийн ангилалын код')}`,
            cell: (row) => row?.category_code,
			minWidth: "280px",
			sortable: true,
			center: true
		},
		{
			name: `${t('Хичээлийн ангилалын нэр')}`,
			selector: (row) => row?.category_name,
            sortable: true,
			minWidth: "280px",
			center: true
		},
	]

	if(Object.keys(user).length > 0 && user.permissions.includes('lms-settings-lessoncategory-update')? true : false) {
		var update_column =  {
			name: `${t('Үйлдэл')}`,
			minWidth: "380px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a
						role="button"
						id = {`categoryUpdate${row?.id}`}
						onClick={
									() => handleUpdateModal(row?.id)
								}>
						<Edit color="#b4b7bd" width={"15px"} />
					</a>

					<UncontrolledTooltip placement='top' target={`categoryUpdate${row.id}`} >Засах</UncontrolledTooltip>
				</div>
			),
		}
		columns.push(update_column)
	}

    return columns

}
