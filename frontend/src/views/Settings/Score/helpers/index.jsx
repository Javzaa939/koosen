import { X, Edit } from "react-feather";

import { Badge, UncontrolledTooltip } from "reactstrap";

import { t } from "i18next";

import useModal from '@hooks/useModal'

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
			name: `${t('Код')}`,
            cell: (row) => row?.score_code,
			minWidth: "80px",
			sortable: true,
			center: true
		},
		{
			name: `${t('Дүнгийн доод оноо')}`,
			selector: (row) => row?.score_min,
            sortable: true,
			minWidth: "80px",
			center: true
		},
		{
			name: `${t('Дүнгийн дээд оноо')}`,
			selector: (row) => row?.score_max,
            sortable: true,
			minWidth: "80px",
			center: true
		},
		{
			name: `${t('Үсгэн үнэлгээ')}`,
			selector: (row) => row?.assesment,
            sortable: true,
			minWidth: "80px",
			center: true
		},
		{
			name: `${t('Голч дүн')}`,
			selector: (row) => row?.gpa,
            sortable: true,
			minWidth: "80px",
			center: true
		},
	]

	if(Object.keys(user).length > 0 && user.permissions.includes('lms-settings-score-update') && user.permissions.includes('lms-settings-score-delete')? true : false) {
		var UpdateColumn = {
			name: `${t('Үйлдэл')}`,
			minWidth: "80px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
					<a
						role="button"
						id = {`ScoreUpdate${row?.id}`}
						className="me-1"
						onClick={
							() => handleUpdateModal(row?.id)
						} >
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					}
					<UncontrolledTooltip placement="top" target={`ScoreUpdate${row.id}`}>Засах</UncontrolledTooltip>
					{
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: `${t('Үнэлгээний бүртгэл устгах')}`,
									},
									question: `Та "${row?.assesment}" үнэлгээг устгахдаа итгэлтэй байна уу?`,
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
		columns.push(UpdateColumn)
	}
    return columns

}
