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
			header: 'mergejil_code',
			name: t("Хөтөлбөрийн код"),
			selector: (row) => row?.mergejil_code,
            sortable: false,
			minWidth: "180px",
            center: true,
        },
		{
			header: 'mergejil_name',
			name: t("Хөтөлбөрийн нэр"),
			selector: (row) => row?.mergejil_name,
            sortable: false,
			minWidth: "180px",
            center: true,
        },
		{
			header: 'code',
			name: t("Оюутны код"),
			selector: (row) => row?.code,
            sortable: true,
            center: true,
			minWidth: "150px",
		},
        {
			header: 'first_name',
			name: t("Овог"),
			selector: (row) => row?.first_name,
            sortable: true,
            center: true,
        },
		{
			header: 'last_name',
			name: t("Нэр"),
			selector: (row) => row?.last_name,
            sortable: true,
            center: true,
        },
		{
			header: 'register_num',
			name: t("Регистрийн дугаар"),
			selector: (row) => row?.register_num,
            sortable: true,
			minWidth: "200px",
            center: true,
        },
        {
			header: 'admission_date',
			name: t("Элсэлтийн тушаалын огноо"),
			selector: (row) => row?.admission_date,
            sortable: true,
			minWidth: "280px",
            center: true,
        },
        {
			header: 'admission_number',
			name: t("Элсэлтийн тушаалын дугаар"),
			selector: (row) => row?.admission_number,
            sortable: true,
			minWidth: "280px",
            center: true,
        },
	]

    return columns;

}
