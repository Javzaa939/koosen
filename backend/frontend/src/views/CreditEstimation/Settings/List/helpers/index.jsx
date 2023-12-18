import {useContext } from 'react'
import { Badge,UncontrolledTooltip } from 'reactstrap';

import { t } from 'i18next';

import { X, Edit } from 'react-feather'

import useModal from '@hooks/useModal'

import SchoolContext from '@context/SchoolContext'

const TEACHER_DEGREE_KREDIT = 2

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, editModal, handleDelete, user, type) {

	const { school_id } = useContext(SchoolContext)

	const { showWarning } = useModal()

	const page_count = Math.ceil(total_count / rowsPerPage)

    var name = 'Нэр'
    var kr_name = 'Коэффициент'

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    if (type === TEACHER_DEGREE_KREDIT) {
        name = 'Албан тушаал'
        kr_name = 'Кредит'
    }

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			name: `${t(name)}`,
			selector: (row) => {
                return (
                    type === TEACHER_DEGREE_KREDIT
                    ?
                        row?.position?.name
                    :
                        row?.name
                )
            },
			minWidth: "100px",
			center: true
        },
		{
			name: `${t(kr_name)}`,
			selector: (row) => row?.ratio,
			center: true
        },
	]

    // Сургуультай байх эсэх
	if(Object.keys(user).length > 0 ) {
		var delete_column = {
			name: `${t('Үйлдэл')}`,
			maxWidth: "180px",
			minWidth: "180px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a role="button" onClick={() => { editModal(row)}} id={`complaintListDatatableEdit${row?.id}`} className="me-1">
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>

					{/* {
						user.permissions.includes('lms-credit-settings-delete')&& */}
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: `${t('Тохиргоо устгах')}`,
									},
									question: `Та "${row.name}"  тохиргоог устгахдаа итгэлтэй байна уу?`,
									onClick: () => handleDelete(row.id),
									btnText: 'Устгах',
								})}
								id={`complaintListDatatableCancel${row?.id}`}
							>
								<Badge color="light-danger" pill><X width={"100px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
						</>
					{/* } */}

				</div>
			),
		}
		columns.push(delete_column)
	}

    return columns

}
