import { X, Edit } from "react-feather";

import { t } from "i18next";

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

	if(Object.keys(user).length > 0 && user.permissions.includes('lms-settings-degree-update') && user.permissions.includes('lms-settings-degree-delete')? true : false) {
		var update_column =  {
			name: `${t('Үйлдэл')}`,
			minWidth: "80px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
					<a
						role="button"
						className ="me-1"
						id = {`degreeUpdate${row?.id}`}
						onClick={
									() => handleUpdateModal(row?.id)
								}>
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					}
					<UncontrolledTooltip placement='top' target={`degreeUpdate${row.id}`} >Засах</UncontrolledTooltip>
					{
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: `${t('Боловсролын зэрэг устгах')}`,
									},
									question: `Та "${row.degree_name}" зэргийг устгахдаа итгэлтэй байна уу?`,
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
