import { t } from "i18next";
import { X,Edit } from "react-feather";
import useModal from '@hooks/useModal'
import { Badge, UncontrolledTooltip } from "reactstrap";


// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas, handleUpdateModal, user, handleDelete) {
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

	if(Object.keys(user).length > 0 && user.permissions.includes('lms-settings-lessoncategory-update') && user.permissions.includes('lms-settings-lessoncategory-delete')? true : false) {
		var update_column =  {
			name: `${t('Үйлдэл')}`,
			minWidth: "80px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a
						role="button"
						id = {`categoryUpdate${row?.id}`}
						className="me-1"
						onClick={
									() => handleUpdateModal(row?.id)
								}>
						<Edit color="#b4b7bd" width={"15px"} />
					</a>

					<UncontrolledTooltip placement='top' target={`categoryUpdate${row.id}`} >Засах</UncontrolledTooltip>
					{
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: `${t('Хичээлийн ангилал устгах')}`,
									},
									question: `Та "${row?.category_name}" ангилал устгахдаа итгэлтэй байна уу?`,
									onClick: () => handleDelete(row.id),
									btnText: 'Устгах',
								})}
								id={`learnId${row.id}`}
							>
								<Badge color="light-danger" pill><X width={"100px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`learnId${row.id}`} >Устгах</UncontrolledTooltip>
						</>
					}
				</div>
			),
		}
		columns.push(update_column)
	}

    return columns

}
