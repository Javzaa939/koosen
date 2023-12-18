import { Trash2 } from 'react-feather'

import { t } from 'i18next'

import css from '@mstyle/style.module.css'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, editModal, handleDelete, user, showWarning) {

	const page_count = Math.ceil(total_count / rowsPerPage)

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
			header: 'lesson',
			name: `${t('Хичээл')}`,
			selector: (row) => (
				<p className={`${css.hrefHover} mb-0` }>
                    <a role="button" onClick={() => { editModal(row.id)} }>
                        {row?.lesson?.name}
                    </a>
                </p>
			),
            sortable: true,
			minWidth: "80px",
		},
		{
			header: 'previous_lesson',
			name: `${t('Өмнөх холбоо хичээл')}`,
			selector: (row) => row?.previous_lesson?.name,
            sortable: true,
        },
        {
			header: 'lesson_group',
			name: `${t('Хичээлийн бүлэг')}`,
			selector: (row) => row?.lesson_group?.group_name,
            sortable: true,
        },
		{
			header: 'season',
			name: `${t('Хичээл үзэх улирал')}`,
			selector: (row) => row?.season?.season_name,
            sortable: true,
        },
	]

	if(Object.keys(user).length > 0 && user.permissions.includes('lms-study-learningplan-delete')) {
		var delete_column = {
			name: `${t('Устгах')}`,
			maxWidth: "80px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a role="button"
						onClick={() => showWarning({
							header: {
								title: `${t('Сургалтын төлөвлөгөө устгах')}`,
							},
							question: `Та "${row?.profession?.name}" мэргэжлийн "${row?.lesson?.name}" хичээлийг устгахдаа итгэлтэй байна уу?`,
							onClick: () => handleDelete(row.id),
							btnText: `${t('Устгах')}`,
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
