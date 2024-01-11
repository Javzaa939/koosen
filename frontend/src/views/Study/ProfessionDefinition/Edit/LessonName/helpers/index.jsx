import useModal from '@hooks/useModal';
import { t } from 'i18next';
import { Badge, UncontrolledTooltip} from 'reactstrap'
import { X } from 'react-feather'


// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, handleDelete, user) {
    const { showWarning } = useModal()
    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "100px",
			center: true
		},
		{
			name: `${t('ЭЕШ хичээл')}`,
			selector: (row) => row?.lesson_name,
			maxWidth: "500px",
			minWidth: "200",
			center: true
		},
        {
			name: `${t('Босго оноо')}`,
			selector: (row) => row?.bottom_score,
			maxWidth: "400px",
			minWidth: "200",
			center: true
		},
	]
	if(Object.keys(user).length > 0 ) {
		var delete_column = {
			name: `${t('Үйлдэл')}`,
			maxWidth: "500px",
			minWidth: "50px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
						user.permissions.includes('lms-study-lessonstandart-delete')&&
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: `${t('ЭЕШ хичээл устгах')}`,
									},
									question: `Та "${row.lesson_name}" хичээлийг ЭЕШ-н хичээл цэснээс устгахдаа итгэлтэй байна уу?`,
									onClick: () => handleDelete(row.id),
									btnText: 'Устгах',
								})}
								id={`complaintListDatatableCancel${row?.id}`}
							>
								<Badge color="light-danger" pill><X width={"100px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
						</>
					}
				</div>
			),
		}
		columns.push(delete_column)
	}
    return columns
}
