import {useContext } from 'react'
import css from '@mstyle/style.module.css'
import { Badge,Button,UncontrolledTooltip } from 'reactstrap';

import { t } from 'i18next';

import { X, Edit } from 'react-feather'

import useModal from '@hooks/useModal'

import SchoolContext from '@context/SchoolContext'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, handleModal) {

	// const { school_id } = useContext(SchoolContext)

	// const { showWarning } = useModal()

	const page_count = Math.ceil(total_count / rowsPerPage)

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
		{
			header: 'teacher__name',
			name: `${t('Заах багш')}`,
			selector: (row) => row?.teacher?.full_name,
            sortable: true,
			minWidth: "100px",
			center: true
        },
		{
			header: 'lesson_season',
			name: `${t('Улирал')}`,
			selector: (row) => row?.lesson_season?.season_name,
            sortable: true,
			maxWidth: "50px",
			center: true
        },
		{
			header: 'lesson__name',
			name: `${t('Хичээл')}`,
			selector: (row) =>row?.lesson?.code +" "+ row?.lesson?.name,
            sortable: true,
			minWidth: "200px",
			center: true,
			wrap: true
		},
		{
			header: 'type',
			name: `${t('Хичээлийн төрөл')}`,
			selector: (row) => row?.lesson_level,
            sortable: true,
			minWidth: "100px",
			center: true
        },
		{
			header: 'lesson__kredit',
			name: `${t('Кр')}`,
			selector: (row) => row?.lesson?.kredit,
            sortable: true,
			maxWidth: "50px",
			center: true
        },
		{
			header: 'exec_kr',
			name: `${t('Гүйцэтгэлийн кр')}`,
			selector: (row) => row?.exec_kr,
            minWidth: "80px",
			center: true
        },
		{
			header: 'credit',
			name: `${t('Цаг')}`,
			selector: (row) => row?.credit,
            sortable: true,
			center: true
        },
		{
			name: `${t('Үйлдэл')}`,
			selector: (row) => (
				<Button color='primary' size='sm' onClick={() => handleModal(row)}>Нэмэх</Button>
			),
			center: true
        },
	]
    return columns
}

export function getDetailColumns ( editModal, handleDelete, user) {

	const { school_id } = useContext(SchoolContext)

	const { showWarning } = useModal()

    const columns = [
		{
			name: "№",
			selector: (row, index) => index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			header: 'type',
			name: `${t('Хичээллэх төрөл')}`,
			selector: (row) => row?.type_name,
            sortable: true,
			maxWidth: "150px",
			center: true
        },
		{
			header: 'exec_kr',
			name: `${t('Гүйцэтгэлийн кр')}`,
			selector: (row) => row?.exec_kr,
            maxWidth: "30px",
			center: true
        },
		{
			header: 'credit',
			name: `${t('Цаг')}`,
			selector: (row) => row?.credit,
			maxWidth: "30px",
            sortable: true,
			center: true
        },
		{
			header: 'group_name',
			name: `${t('Анги бүлэг')}`,
			selector: (row) => row?.group_name,
            minWidth: "400px",
			wrap: true
        },
	]

	if(Object.keys(user).length > 0 && school_id ) {
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

					{
						user.permissions.includes('lms-credit-volume-delete')&&
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: `${t('Хичээлийн цагийн ачаалал устгах')}`,
									},
									question: `Та "${row.lesson?.code}" кодтой хичээлийн цагийн ачааллыг устгахдаа итгэлтэй байна уу?`,
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

