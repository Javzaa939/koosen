import useModal from '@hooks/useModal'

import { t } from 'i18next'

export function getColumns (currentPage, rowsPerPage, total_count) {

	const { showWarning } = useModal()

    const page_count = Math.ceil(total_count / rowsPerPage)

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
			header: 'profession_index',
			name: t("Мэргэжлийн индекс"),
			selector: (row) => row?.mergejil_code,
            center: true,
			minWidth: "210px",
		},
		{
			header: 'profession_name',
			name: t("Мэргэжлийн нэр"),
			selector: (row) => row?.mergejil_name,
            center: true,
            minWidth: "180px"
        },
        {
			header: 'student',
			name: t("Оюутны код"),
			selector: (row) => row?.student?.code,
            sortable: true,
            center: true,
			minWidth: "140px",
		},
        {
			header: 'student',
			name: t("Оюутны нэр"),
			selector: (row) => row?.student.first_name,
            sortable: true,
            center: true,
			minWidth: "140px",
		},
        {
			header: 'student',
			name: t("Регистрийн дугаар"),
			selector: (row) => row?.student?.register_num,
            center: true,
			minWidth: "180px",
		},
        {
			header: 'lesson',
			name: t("Хичээлийн код нэр"),
			selector: (row) => row?.lesson.code + '' + row?.lesson.name,
            sortable: true,
            center: true,
			minWidth: "200px",
		},
        {
			header: 'diplom_topic',
			name: t("Сэдэв"),
			selector: (row) => row?.diplom_topic,
            center: true,
			minWidth: "80px",
		},
        {
			header: 'leader',
			name: t("Удирдагч"),
			selector: (row) => row?.leader,
            center: true,
			minWidth: "80px",
		},
        {
			header: 'graduation_date',
			name: t("Тушаалын огноо"),
			selector: (row) => row?.graduation_date,
            sortable: true,
            center: true,
			minWidth: "250px",
		},
        {
			header: 'graduation_number',
			name: t("Тушаалын дугаар"),
			selector: (row) => row?.graduation_number,
            sortable: true,
            center: true,
			minWidth: "250px",
		},
	]

    return columns

}
