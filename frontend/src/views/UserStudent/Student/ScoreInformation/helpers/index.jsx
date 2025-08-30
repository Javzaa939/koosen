import { t } from 'i18next'

export function getColumns (currentPage, rowsPerPage, total_count) {

    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true,
        },
        {
            header: 'lesson-code',
            name: `${t('Хичээлийн код')}`,
            selector: (row) => row?.lesson.code +' '+ row?.lesson.name,
            sortable: true,
            mimWidth: "250px",
            wrap:true,
        },
        {
            header: 'credit',
            name: `${t('Кредит')}`,
            selector: (row) => row?.lesson?.kredit,
            sortable: true,
            mimWidth: "30px",
            wrap:true,
            center: true
        },
        {
            header: 'Оноо',
            name: `${t('Дүн')}`,
            selector: (row) => row?.score,
            sortable: true,
            mimWidth: "30px",
            wrap:true,
        },
        {
            header: 'evaluation',
            name: `${t('Үнэлгээ')}`,
            selector: (row) => row?.score,
            sortable: true,
            mimWidth: "150px",
            wrap:true,
        },
        {
            header: 'teacher-code',
            name: `${t('Багшийн код')}`,
            selector: (row) => row?.teacher?.last_name,
            sortable: true,
            mimWidth: "250px",
            wrap:true,
        },

    ]
    return columns
}
