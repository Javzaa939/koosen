import { X,Edit } from "react-feather";

import { t } from "i18next";

import useModal from '@hooks/useModal'

import { Badge, UncontrolledTooltip } from 'reactstrap'

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
			name: `${t('Дээд')}`,
            cell: (row) => row?.deed,
			minWidth: "280px",
			sortable: false,
			center: true
		},
		{
			name: `${t('Доод')}`,
			selector: (row) => row?.dood,
            sortable: false,
			minWidth: "280px",
			center: true
		},
        {
			name: `${t('Баруун')}`,
			selector: (row) => row?.right,
            sortable: false,
			minWidth: "280px",
			center: true
		},
        {
			name: `${t('Зүүн')}`,
			selector: (row) => row?.left,
            sortable: false,
			minWidth: "280px",
			center: true,
		},
		 {
			name: `${t('Хэмжээс')}`,
			selector: (row) => row?.type_name,
            sortable: false,
			minWidth: "280px",
			center: true,
		},
	]
	if(Object.keys(user).length > 0 ? true : false ) {
	// if(Object.keys(user).length > 0 && user.permissions.includes('lms-settings-print-update') && user.permissions.includes('lms-settings-print-delete')? true : false) {
		var UpdateColumn =  {
			name: `${t('Үйлдэл')}`,
			minWidth: "140px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
					<a  role="button"
						className="me-1"
						id = {`printUpdates${row?.id}`}
						onClick={
									() => handleUpdateModal(row?.id)
								}>

						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					}
					<UncontrolledTooltip placement='top' target={`printUpdates${row.id}`} >Засах</UncontrolledTooltip>
					{
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: `${t('Хэвлэх тохиргоо устгах')}`,
									},
									question: `Та хэвлэх тохиргоо устгахдаа итгэлтэй байна уу?`,
									onClick: () => handleDelete(row.id),
									btnText: 'Устгах',
								})}
								id={`countryId${row.id}`}
							>
								<Badge color="light-danger" pill><X width={"100px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`countryId${row.id}`} >Устгах</UncontrolledTooltip>
						</>
					}
				</div>
			),
		}
		columns.push(UpdateColumn)
	}
    return columns

}
