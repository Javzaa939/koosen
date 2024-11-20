import { Edit, X } from "react-feather";

import { t } from "i18next";

import useModal from '@hooks/useModal';

import { Badge, Button, Input, UncontrolledTooltip } from "reactstrap";

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas, handleDelete, handleUpdateModal) {

    const page_count = Math.ceil(datas.length / rowsPerPage)

	const { showWarning } = useModal()

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
			name: `${t('Гарчиг')}`,
            cell: (row) => row?.title,
			minWidth: "80px",
			center: true,
		},
		{
			name: `${t('Файл')}`,
			selector: (row) => row?.file,
            sortable: true,
			minWidth: "80px",
			center: true
		},
		// {
		// 	name: `${t('Өмнөх хичээлийн жил')}`,
		// 	selector: (row) => row?.prev_lesson_year,
		// 	minWidth: "150px",
		// 	center: true
		// },
	]

// 	if(Object.keys(user).length > 0 && user.permissions.includes('lms-settings-аctiveyear-update'))
	{
		var UpdateColumn = {
			name: `${t('Үйлдэл')}`,
			minWidth: "180px",
			selector: (row) => (
				<>
					{
						<a
							id={`activeYearUpdate${row?.id}`}
							onClick={
								() => handleUpdateModal(row?.id)
							}
							className="me-50"
							style={{ pointerEvents: row?.season_type !== 2 && `none` }}
						>

							<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
						</a>
					}
					<UncontrolledTooltip placement='top' target={`activeYearUpdate${row?.id}`} >Засах</UncontrolledTooltip>
					<a role="button"
						onClick={() => showWarning({
							header: {
								title: t(`Устгах`),
							},
							question: t(`Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?`),
							onClick: () => handleDelete(row?.id),
							btnText: t('Устгах'),
						})}
						id={`delete${row?.id}`}
						style={{ pointerEvents: row?.id && `none` }}
					>
						<Badge color="light-danger" pill><X width={"100px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`delete${row?.id}`} >Устгах</UncontrolledTooltip>
				</>
			),
			center: true
		}
		columns.push(UpdateColumn)
	}
    return columns

}
