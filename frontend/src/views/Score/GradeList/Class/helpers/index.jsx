import { t } from 'i18next';

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count) {

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
			header: 'student__code',
			name: `${t('Оюутны код')}`,
			selector: (row)=> row?.student?.code,
            sortable: true,
			minWidth: "150px",
			wrap: true
		},
		{
			header: 'student__first_name',
			name: `${t('Овог нэр')}`,
			selector: (row) =>row?.student?.last_name + ' ' + row?.student?.first_name,
            sortable: true,
			minWidth: "200px",
			wrap: true
        },
		{
			header: 'lesson__name',
			name: t('Хичээлийн нэр'),
			selector: (row) =>  row?.lesson?.name,
			minWidth: "250px",
			sortable: true,
			left: true,
			wrap: true
		},
		{
			header: 'volume_kr',
			name: `${t('Кр')}`,
			selector: (row) => row?.volume_kr,
            sortable: false,
			center: true
        },
        // {
		// 	header: 'teacher__code',
		// 	name: `${t('Багшийн код')}`,
		// 	selector: (row) => row?.teacher?.code,
        //     sortable: true,
		// 	minWidth: "150px",
		// 	center: true
        // },
		{
			header: 'teacher__first_name',
			name: `${t('Багшийн нэр')}`,
			selector: (row) => row?.teacher?.full_name,
            sortable: true,
			minWidth: "150px",
			center: true,
			wrap: true

        },
		{
			header: 'teach_score',
			name: `${t('Багшийн оноо')}`,
			selector: (row) => row?.teach_score,
            sortable: true,
			minWidth: "180px",
			center: true
        },
		{
			header: 'exam_score',
			name: `${t('Шалгалтын оноо')}`,
			selector: (row) => row?.exam_score,
            sortable: true,
			minWidth: "200px",
			center: true
        },
		{
			header: 'total',
			name: `${t('Нийт оноо')}`,
			selector: (row) => row?.score_total,
            sortable: false,
			minWidth: "130px",
			center: true
        },
		{
			header: 'assessment',
			name: `${t('Үсгэн үнэлгээ')}`,
			selector: (row) => row?.assessment,
            sortable: true,
			minWidth: "180px",
			center: true
        },
		{
			header: 'lesson_year',
			name: `${t('Хичээлийн жил')}`,
			selector: (row) => row?.lesson_year,
            sortable: true,
			minWidth: "180px",
			center: true
        },
		{
			header: 'lesson_season',
			name: `${t('Улирал')}`,
			selector: (row) => row?.lesson_season?.season_name,
            sortable: true,
			minWidth: "50px",
			center: true
        },
	]

    return columns

}
