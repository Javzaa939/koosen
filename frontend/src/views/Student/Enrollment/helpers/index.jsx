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
			header: 'user__first_name',
			name: t("Овог"),
			selector: (row) => row?.user?.first_name,
            center: true,
			minWidth: "200px",
            sortable: true,


        },
		{
			header: 'user__last_name',
			name: t("Нэр"),
			selector: (row) => row?.user?.last_name,
			minWidth: "200px",
            center: true,
            sortable: true,

        },
		{
			header: 'user__register',
			name: t("Регистр"),
			selector: (row) => row?.user?.register,
			minWidth: "200px",
            center: true,
            sortable: true,

        },
		{
			header: 'admission_number',
			name: t("Тушаалын дугаар"),
			selector: (row) => row?.admission_number,
            sortable: true,
			minWidth: "280px",
            center: true,
        },
        {
			header: 'admission_date',
			name: t("Тушаалын огноо"),
			selector: (row) => row?.admission_date,
            sortable: true,
			minWidth: "280px",
            center: true,
        },
	]

    return columns;

}
