import useModal from '@hooks/useModal'

import { t } from 'i18next'

import { Badge, UncontrolledTooltip } from 'reactstrap'

import { Edit } from 'react-feather'

export function getColumns (currentPage, rowsPerPage, total_count, is_header) {

    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    var columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
        {
			header: 'student',
			name: t("Оюутан"),
            selector: (row) => row?.student?.code + ' ' + row?.student?.full_name,
            sortable: true,
            minWidth: "220px",
            maxWidth: "220px",
            center: true
        },
	]

    var add_columns = [
        {
            header: 'gym_payment',
            name: t("Сонгосон сургалт"),
            selector: (row) => row?.gym_payment?.name,
            center: true,
            sortable: true,
            minWidth: '200px',
            wrap: true,
        },
        {
            header: 'start_date',
            name: t("Хичээллэх огноо"),
            selector: (row) => row?.start_date,
            center: true,
            sortable: true,
            minWidth: '200px',
            wrap: true,
        },
        {
			header: 'payment',
			name: t("Төлөх дүн"),
			selector: (row) => row?.gym_payment?.payment,
            center: true,
            minWidth: '150px'
        },
        {
			header: 'payment',
			name: t("Төлсөн дүн"),
			selector: (row) => row?.payment,
            center: true,
            minWidth: '150px'
        },
        {
			header: 'stop_date',
			name: t("Сургалт зогсоох огноо"),
			selector: (row) => row?.stop_date,
            center: true,
            minWidth: "220px",
            maxWidth: "220px",
        },
        {
			header: 'stop_duration',
			name: t("Зогсоох хугацаа /өдрөөр/"),
			selector: (row) => row?.stop_duration,
            center: true,
            minWidth: '250px',
            maxWidth: '250px',
        },
    ]

    var add_columns1 = [
        {
			header: 'is_confirm',
			name: t("Баталгаажсан эсэх"),
			selector: (row) => (
                row?.is_confirm
                ?
                    <Badge color="light-success" pill>
                        {t('Тийм')}
                    </Badge>
                :
                    <Badge color="light-danger" pill>
                        {t('Үгүй')}
                    </Badge>
            ),
            sortable: true,
            center: true,
            minWidth: '230px'
        },
    ]

    if(is_header) {
        columns = columns.concat(add_columns).concat(add_columns1)
	} else {
        columns = columns.concat(add_columns1)
    }

    return columns;

}
