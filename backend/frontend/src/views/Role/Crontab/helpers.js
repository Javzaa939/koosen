import { t } from "i18next";
import useModal from "@hooks/useModal"

import { Badge, UncontrolledTooltip, Button } from "reactstrap";
import { X } from 'react-feather'

export function getColumns (currentPage, rowsPerPage, total_count,  handleUpdateModal, user, handleDelete, handleStop) {

	const { showWarning } = useModal()
    const page_count = Math.ceil(total_count / rowsPerPage)

    // /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
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
			name: `${t('Crontab нэр')}`,
            cell: (row) => row?.name,
			center: true,
		},
		{
			name: `${t('Тайлбар')}`,
			selector: (row) => row?.prev_lesson_year,
			center: true
		},
		{
			name: `${t('Идэвхтэй эсэх')}`,
			selector: (row) => {
				return (
					row.is_active
					?
						<Badge color="light-success" pill>
							{t('Идэвхтэй')}
						</Badge>
					:
						<Badge color="light-primary" pill>
							{t('Идэвхгүй')}
						</Badge>
				)
			},
			center: true
		},
	]
	// && user.permissions.includes('lms-settings-crontab-update')? true : false Эрх тавигдахаар шалгана
	if(Object.keys(user).length > 0)
	{
		var UpdateColumn = {
			name: `${t('Үйлдэл')}`,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a
						role="button"
						id = {`activeYearUpdate${row?.id}`}
						onClick={() => handleUpdateModal(row)}
					>
						<Badge color="light-success" pill><i className="far fa-edit text-success"></i></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`activeYearUpdate${row.id}`} >Засах</UncontrolledTooltip>
					<a role="button"
						onClick={() => showWarning({
							header: {
								title: t(`Crontab тохиргоо устгах`),
							},
							question: t(`Та энэ тохиргоог устгахдаа итгэлтэй байна уу?`),
							onClick: () => handleDelete(row.id),
							btnText: t('Устгах'),
						})}
						id={`complaintListDatatableCancel${row?.id}`}
						className='ms-1'
					>
						<Badge color="light-danger" pill><X width={"100px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
				</div>
			),
			width: '120px'
		}

		var add_column = {
			name: `${t('Хязгаарлах')}`,
			selector: (row) => {
				return (
					row.is_active
					?
						<Button
							outline
							color="danger"
							size='sm'
							onClick={() => showWarning({
								question: t(`Та энэ crontab тохиргоог зогсоохдоо итгэлтэй байна уу?`),
								onClick: () => handleStop(row),
								btnText: t('Зогсоох'),
							})}
						>
							{t('Зогсоох')}
						</Button>
					:
						<Button
							outline
							color="success"
							size='sm'
							onClick={() => showWarning({
								question: t(`Та энэ crontab тохиргоог идэвхжүүлэхдээ итгэлтэй байна уу?`),
								onClick: () => handleStop(row),
								btnText: t('Идэвхжүүлэх'),
							})}
						>
							{t('Идэвхжүүлэх')}
						</Button>
				)
			},
			center: true
		}
	}
	columns.push(UpdateColumn)
	columns.push(add_column)
	return columns
}

