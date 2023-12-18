import { useContext } from 'react'
import { Trash2 } from 'react-feather'

import css from '@mstyle/style.module.css'

import { t } from 'i18next'

import SchoolContext from '@context/SchoolContext'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, editModal, handleDelete, user, showWarning) {

	const { school_id } = useContext(SchoolContext)

	const page_count = Math.ceil(total_count / rowsPerPage)

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "1px",
			center: true
		},
		{
			header: 'lesson',
			name: t("Хичээл"),
			selector: (row) => (
				<p className={`${css.hrefHover} mb-0` }>
					{
						<a role="button" onClick={() => { editModal(row.id)} } >
							{row?.lesson?.name}
						</a>
					}
                </p>
			),
            sortable: true,
			minWidth: "230px",
			center: true,
			wrap: "true",
		},
		{
			header: 'teacher',
			name: t("Багш"),
			selector: (row) => row?.teacher?.full_name,
            sortable: true,
			center: true,
			minWidth: '200px',
			wrap: true,
        },
        {
			header: 'room',
			name: t("Өрөө"),
			selector: (row) => row?.room?.full_name,
            sortable: true,
			center: true,
			minWidth: '200px',
			wrap: true,
        },
		{
			header: 'type',
			name: t("Хичээллэх төрөл"),
			selector: (row) => row?.type_time,
            sortable: true,
			center: true,
			wrap: "true",
			minWidth: "180px",
        },
		{
			header: 'day',
			name: t("Өдөр"),
			selector: (row) => row?.day,
            sortable: true,
			center: true,
        },
		{
			header: 'time',
			name: t("Цаг"),
			selector: (row) => row?.time,
            sortable: true,
			center: true,
        },
		{
			header: 'group',
			name: t("Анги"),
			selector: (row) => row?.group,
            sortable: true,
			center: true,
			wrap: "true",
			minWidth: "250px",
        },
	]

	if(Object.keys(user).length > 0 && user.permissions.includes('lms-timetable-register-delete')&& school_id) {
		var delete_column = {
			name: t("Устгах"),
			maxWidth: "80px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a role="button"
						onClick={() => showWarning({
							header: {
								title: t(`Хичээлийн хуваарь устгах`),
							},
							question: t(`Та энэхүү хичээлийн хуваарийг устгахдаа итгэлтэй байна уу?`),
							onClick: () => handleDelete(row.id),
							btnText: t('Устгах'),
						})}
					>
						<Trash2 color="red" width={"15px"} />
					</a>
				</div>
			),
		}
		columns.push(delete_column)
	}

    return columns

}
