import { Edit, X } from "react-feather";

import { t } from "i18next";

import useModal from '@hooks/useModal';

import { Badge, Button, Input, UncontrolledTooltip } from "reactstrap";

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas, handleUpdateModal, user, handleDelete, handleUpdate) {

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
			name: `${t('Хичээлийн жил')}`,
            cell: (row) => row?.active_lesson_year,
			minWidth: "80px",
			center: true,
		},
		{
			name: `${t('Улирал')}`,
			selector: (row) => row?.active_season_name,
            sortable: true,
			minWidth: "80px",
			center: true
		},
		{
			name: `${t('Өмнөх хичээлийн жил')}`,
			selector: (row) => row?.prev_lesson_year,
			minWidth: "150px",
			center: true
		},
		{
			name: `${t('Өмнөх улирал')}`,
			selector: (row) => row?.prev_season_name,
			minWidth: "80px",
			center: true
		},
		{
			name: `${t('Эхлэх огноо')}`,
			selector: (row) => row?.start_date,
            sortable: true,
			minWidth: "80px",
			center: true
		},
		{
			name: `${t('Дуусах огноо')}`,
			selector: (row) => row?.finish_date,
            sortable: true,
			minWidth: "80px",
		},
		{
			name: `${t('Идэвхтэй эсэх')}`,
			selector: (row) => {
				return (
					row.season_type === 3
					?
						<Badge color="light-success" pill>
							{t('Хаалт хийсэн')}
						</Badge>
					:
						<Input
							className='me-50'
							type='checkbox'
							name='season_type'
							id='season_type'
							disabled={row?.season_type === 2 && user?.permissions?.includes('lms-settings-аctiveyear-update') ? false : datas?.length !== 1 && true}
							defaultChecked={row.season_type === 1 ? true : false}
							onClick={(e) => handleUpdate(row.id, e.target.checked ? 1 : 2)}
						/>
				)
			},
			minWidth: "120px",
			center: true
		},
	]

	if(Object.keys(user).length > 0 && user.permissions.includes('lms-settings-аctiveyear-update'))
	{
		var UpdateColumn = {
			name: `${t('Үйлдэл')}`,
			minWidth: "180px",
			selector: (row) => (
				<>
					<Button
						size="sm"
						color='primary'
						className="me-50"
						disabled={row?.season_type === 1 ? false : true}
						onClick={() => showWarning({
							header: {
								title: `${t('Улирлын хаалт')}`,
							},
							question: `Та улирлын хаалт хийхдээ итгэлтэй байна уу?.
								Тухайн улирлын дүн орсон, оюутнуудаа төгсгөсөн, ангиа дэвшүүлсэн байх шаардлагатайг анхаарна уу!!!.
								Улирын хаалт хийснээр засвар, өөрчлөлт хийх боломжгүй болохыг анхаарна уу !!!`,
							onClick: () => handleUpdate(row?.id, 3),
						})}
					>
						Хаах
					</Button>
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
					<UncontrolledTooltip placement='top' target={`activeYearUpdate${row.id}`} >Засах</UncontrolledTooltip>
					<a role="button"
						onClick={() => showWarning({
							header: {
								title: t(`Устгах`),
							},
							question: t(`Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?`),
							onClick: () => handleDelete(row.id),
							btnText: t('Устгах'),
						})}
						id={`delete${row?.id}`}
						style={{ pointerEvents: row?.season_type !== 2 && `none` }}
					>
						<Badge color="light-danger" pill><X width={"100px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`delete${row.id}`} >Устгах</UncontrolledTooltip>
				</>
			),
			center: true
		}
		columns.push(UpdateColumn)
	}
    return columns

}
