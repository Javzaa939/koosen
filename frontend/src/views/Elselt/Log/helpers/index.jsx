import { t } from 'i18next'
import moment from 'moment'
import { Badge, UncontrolledTooltip } from 'reactstrap'

// Profession Хүснэгтийн баганууд
export function getColumns(currentPage, rowsPerPage, total_count, user, handleEditModal, handleDelete) {

    const page_count = Math.ceil(total_count / rowsPerPage)

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: "№",
            selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
            maxWidth: "30px",
            center: true,
        },
        {
            header: 'last_name',
            name: `${t('Овог')}`,
            selector: (row) => row?.last_name,
            sortable: true,
            minWidth: "250px",
            wrap: true,
            center: true,
        },
        {
            header: 'fist_name',
            name: `${t('Нэр')}`,
            selector: (row) => row?.first_name,
            sortable: true,
            minWidth: "250px",
            wrap: true,
            center: true,
        },
        {
            header: 'now_profession',
            name: `${t('Одоогийн хөтөлбөр')}`,
            selector: (row) => row?.now_profession,
            sortable: true,
            minWidth: "280px",
            center: true,
        },
        {
            header: 'change_profession',
            name: `${t('Сольсон хөтөлбөр')}`,
            selector: (row) => row?.change_profession,
            sortable: true,
            minWidth: "250px",
            wrap: true,
            center: true
        },
        {
            header: 'updated_user',
            name: `${t('Сольсон хэрэглэгч')}`,
            selector: (row) => row?.admin_name,
            sortable: true,
            minWidth: "250px",
            wrap: true,
            center: true
        },
        {
            sortField: 'updated_at',
            header: 'updated_at',
            maxWidth: "300px",
            minWidth: "300px",
            reorder: true,
            sortable: true,
            name: t("Бүрт/огноо"),
            selector: (row) => row?.updated_at ? moment(row?.updated_at).format("YYYY-MM-DD h:mm") : '',
            center: true,
        },
    ]

    return columns

}


// State хүснэгтийн баганууд
export function getColumnState(currentPage, rowsPerPage, total_count, stateop) {

    const page_count = Math.ceil(total_count / rowsPerPage)

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: "№",
            selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
            maxWidth: "30px",
            center: true,
        },
        {
            header: 'name',
            name: `${t('Овог')}`,
            selector: (row) => row?.last_name,
            sortable: true,
            minWidth: "250px",
            wrap: true,
            center: true,
        },
        {
            header: 'name',
            name: `${t('Нэр')}`,
            selector: (row) => row?.first_name,
            minWidth: "250px",
            wrap: true,
            center: true,
        },
        {
            name: `${t('Шалгуур')}`,
            selector: (row) => row?.indicator_name,
            minWidth: "250px",
            wrap: true,
            center: true,
        },
        {
            maxWidth: "250px",
            minWidth: "250px",
            header: 'now_state',
            reorder: true,
            sortable: true,
            name: t("Одоогийн төлөв"),
            selector: (row) => (
                <Badge
                    color={`${row?.now_state == 1 ? 'primary' : row?.now_state == 2 ? 'success' : row?.now_state == 3 ? 'danger' : 'primary'}`}
                    pill
                >
                    {row?.now_state_name}
                </Badge>),
            center: true,
        },
        {
            maxWidth: "150px",
            minWidth: "150px",
            header: 'state',
            reorder: true,
            sortable: true,
            name: t("Сольсон төлөв"),
            selector: (row) => (
                <Badge
                    color={`${row?.change_state == 1 ? 'primary' : row?.change_state == 2 ? 'success' : row?.change_state == 3 ? 'danger' : 'primary'}`}
                    pill
                >
                    {row?.change_state_name}
                </Badge>),
            center: true,
        },
        {
            header: 'updated_user',
            name: `${t('Сольсон хэрэглэгч')}`,
            selector: (row) => row?.admin_name,
            sortable: true,
            minWidth: "250px",
            wrap: true,
            center: true
        },
        {
            sortField: 'updated_at',
            header: 'updated_at',
            maxWidth: "300px",
            minWidth: "300px",
            reorder: true,
            sortable: true,
            name: t("Бүрт/огноо"),
            selector: (row) => row?.updated_at ? moment(row?.created_at).format("YYYY-MM-DD h:mm") : '',
            center: true,
        },
    ]

    return columns

}
