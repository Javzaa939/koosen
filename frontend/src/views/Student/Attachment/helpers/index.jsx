
import { t } from 'i18next'
import { Button } from 'reactstrap';

export function getColumns (currentPage, rowsPerPage, total_count, printAll)
{
    const page_count = Math.ceil(total_count / rowsPerPage)

    // /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count)
	{
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
			header: 'student__code',
			name: t("Оюутны код"),
			selector: (row) => (row?.student?.code),
            sortable: true,
            center: true,
			minWidth: "180px",
		},
		{
			header: 'student__first_name',
			name: t("Овог Нэр"),
			selector: (row) => row?.student?.full_name,
            sortable: true,
            center: true,
			minWidth: '200px',
			wrap: true,
        },
		// {
		// 	header: 'lesson',
		// 	name: t("Дипломын хичээл"),
		// 	selector: (row) => `${row?.lesson?.code} ${row?.lesson?.name}`,
        //     sortable: false,
		// 	minWidth: "200px",
		// 	center: true,
		// 	wrap: true,
		// },
		// {
		// 	header: 'diplom_topic',
		// 	name: t("Дипломын сэдэв"),
		// 	selector: (row) => row?.diplom_topic,
        //     center: true,
		// 	sortable: false,
		// 	minWidth: "200px",
		// },
		{
			header: 'leader',
			name: t("Удирдагч багш"),
			selector: (row) => row?.leader,
            sortable: false,
            center: true,
			minWidth: "80px",
		},
		{
			header: 'diplom_num',
			name: t("Дипломын дугаар"),
			selector: (row) => row?.diplom_num,
			minWidth: "80px",
			sortable: true,
            center: true,
		},
		{
			header: 'registration_num',
			name: t("Бүртгэлийн дугаар"),
			selector: (row) => row?.registration_num,
			minWidth: "80px",
			sortable: true,
            center: true,
		},
		{
			name: t("Үйлдэл"),
			width: "250px",
			minWidth: "250px",
			maxWidth: "250px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
						<>
							<span title='Бүх хавсралт хэвлэх'>
								<Button
									size='sm'
									color='primary'
									onClick={() => printAll(row)}
								>
								Хэвлэх
								</Button>
							</span>
						</>
					}
				</div>
			)
		}
	]

    return columns

}
