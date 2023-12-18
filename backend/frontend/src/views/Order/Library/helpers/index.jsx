import { t } from 'i18next'

import { Badge, UncontrolledTooltip } from 'reactstrap'

import { Book } from 'react-feather'

export function getColumns (currentPage, rowsPerPage, total_count, handleRequestDetail) {

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
			header: 'student',
			name: t("Оюутан"),
            selector: (row) => row?.student?.code + ' ' + row?.student?.full_name,
            sortable: true,
            center: true,
            minWidth: "180px"
        },
        // {
        //     header: 'student',
        //     name: t("Овог Нэр"),
        //     selector: (row) => row?.student?.full_name ,
        //     center: true,
        //     sortable: true,
        //     minWidth: '200px',
        // },
        {
            header: 'room',
            name: t("Өрөө"),
            selector: (row) => row?.room_name,
            center: true,
            sortable: true,
            minWidth: '200px',
            wrap: true,
        },
		{
			header: 'day',
			name: t("Өдөр"),
			selector: (row) => row?.day,
            sortable: true,
            center: true,
            minWidth: '180px'
        },
        {
			header: 'starttime',
			name: t("Цаг"),
			selector: (row) => row?.starttime + '~' + row?.endtime,
            sortable: true,
            center: true,
            minWidth: '200px'
        },
        {
			header: 'chair_num',
			name: t("Суудал"),
			selector: (row) => row?.chair_num,
            sortable: true,
            center: true,
            minWidth: '150px'
        },
        {
			header: 'order_flag',
			name: t("Төлөв"),
			selector: (row) => {
				return (
					row?.order_flag === 1
					?
						<Badge color="light-info" pill>
							{t('Захиалсан')}
						</Badge>
					:
                        row?.order_flag === 2
                    ?
						<Badge color="light-danger" pill>
							{t('Цуцалсан')}
						</Badge>
                    :
                        <Badge color="light-success" pill>
							{t('Ирсэн')}
						</Badge>
				)
			},
            sortable: true,
            center: true,
            minWidth: '150px'
        },
        {
			name: `${t('Дэлгэрэнгүй')}`,
			maxWidth: "150px",
            center: true,
            selector: (row) => (
                <div className='text-center' style={{ width: 'auto' }} >
                    <a
                        id={`complaintListDatatableDetail${row.id}`}
                        onClick = {
                            () => handleRequestDetail(row?.id, row)}
                    >
                        <Badge color="light-info" pill><Book width={"15px"} /></Badge>
                    </a>
                    <UncontrolledTooltip placement='top' target={`complaintListDatatableDetail${row.id}`}>Дэлгэрэнгүй</UncontrolledTooltip>
                </div>
            ),
		},
        // {
		// 	header: 'description',
		// 	name: t("Дэлгэрэнгүй хүсэлт"),
		// 	selector: (row) => row?.description,
        //     sortable: true,
        //     center: true,
        //     minWidth: '230px',
        // },

	]

    return columns;

}
