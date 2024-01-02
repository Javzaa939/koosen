import { X, Edit } from  "react-feather";

import { t } from "i18next";

import useModal from '@hooks/useModal'

import { Badge, UncontrolledTooltip } from "reactstrap";

// хүснэгтийн баганууд
export function getColumns ( currentPage, rowsPerPage, datas, handleUpdateModal, user, handleDelete) {

	const { showWarning } = useModal()

    const page_count = Math.ceil(datas.length / rowsPerPage)

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-с эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: "№",
            selector: (row, index) => (currentPage-1)* rowsPerPage + index + 1,
            maxWidth:"30px",
            center: true
        },
        {
            name: `${t('ЭЕШ-ын хичээлийн код')}`,
            cell: (row) => row?.lesson_code,
			minWidth: "280px",
			center: true
        },
        {
            name: `${t('ЭЕШ-ын хичээлийн нэр')}`,
			selector: (row) => row?.lesson_name,
			minWidth: "280px",
			center: true
        }


    ]
    if(Object.keys(user).length > 0 && user.permissions.includes('lms-settings-admissionlesson-update') && user.permissions.includes('lms-settings-admissionlesson-delete')? true : false) {
		var UpdateColumn =  {
			name: `${t('Үйлдэл')}`,
			minWidth: "380px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
					<a  role="button"
						className="me-1"
						id = {`AddmissionUpdate${row?.id}`}
						onClick={
									() => handleUpdateModal(row?.id)
								}>

						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					}
					<UncontrolledTooltip placement='top' target={`AddmissionUpdate${row.id}`} >Засах</UncontrolledTooltip>
					{
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: `${t('ЭЕШ-ын хичээл устгах')}`,
									},
									question: `Та "${row.lesson_name}" хичээлийг устгахдаа итгэлтэй байна уу?`,
									onClick: () => handleDelete(row.id),
									btnText: 'Устгах',
								})}
								id={`lessonId${row.id}`}
							>
								<Badge color="light-danger" pill><X width={"100px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`lessonId${row.id}`} >Устгах</UncontrolledTooltip>
						</>
					}
				</div>
			),
		}

		columns.push(UpdateColumn)
    }
    return columns
}
