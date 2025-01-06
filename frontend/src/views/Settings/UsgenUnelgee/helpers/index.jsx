import {X, Edit } from "react-feather";

import { Badge, UncontrolledTooltip } from "reactstrap";

import useModal from '@hooks/useModal'

import { t } from "i18next";

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
			name: `${t('Үсгэн тэмдэглэгээ')}`,
            cell: (row) => row?.letter,
			minWidth: "280px",
			sortable: true,
			center: true
		},
		{
			name: `${t('Тайлбар')}`,
			selector: (row) => row?.description,
            sortable: true,
			minWidth: "280px",
			center: true
		},
	]

	if(Object.keys(user).length > 0 && user.permissions.includes('lms-settings-season-update') && user.permissions.includes('lms-settings-season-update')? true : false) {
		var UpdateColumn =  {
			name: `${t('Үйлдэл')}`,
			minWidth: "380px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
					<a  role="button"
						className="me-1"
						id = {`letterUpdate${row?.id}`}
						onClick={
									() => handleUpdateModal(row?.id)
								}>

						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					}
					<UncontrolledTooltip placement='top' target={`letterUpdate${row?.id}`} >Засах</UncontrolledTooltip>
					{
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: `${t('Үсгэн тэмдэглэгээ устгах')}`,
									},
									question: `Та "${row?.letter}" үсгэн тэмдэглэгээ устгахдаа итгэлтэй байна уу?`,
									onClick: () => handleDelete(row?.id),
									btnText: 'Устгах',
								})}
								id={`letterId${row?.id}`}
							>
								<Badge color="light-danger" pill><X width={"100px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`letterId${row.id}`} >Устгах</UncontrolledTooltip>
						</>
					}
				</div>
			),
		}

		columns.push(UpdateColumn)
	}
    return columns

}
