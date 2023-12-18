import { t } from 'i18next'

import { Badge, UncontrolledTooltip } from 'reactstrap'

import { Book, CheckCircle } from 'react-feather'

export function getColumns (currentPage, rowsPerPage, total_count, is_header, handleRequestSolved) {

    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    const solved_type_color = (solved_flag) => {
        let color = ''
        let solved_flag_name = ''
        if (solved_flag === 1) {
            color = 'light-info'
            solved_flag_name = 'Оюутан илгээсэн'
        }
        else if (solved_flag === 2) {
            color = 'light-warning'
            solved_flag_name = 'Оюутан цуцалсан'
        }
        else if (solved_flag === 3) {
            color = 'light-success'
            solved_flag_name = 'Зөвшөөрсөн'
        }
        else if (solved_flag === 4) {
            color = 'light-danger'
            solved_flag_name = 'Татгалзсан'
        }
        return (
            <Badge color={color} pill>
                {solved_flag_name}
            </Badge>
        )
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
            center: true,
            minWidth: "180px"
        },
        // {
        //     header: 'student',
        //     name: t("Овог, Нэр"),
        //     selector: (row) => row?.student?.full_name,
        //     center: true,
        //     sortable: true,
        // },
	]
    
    var add_columns = [
        {
            header: 'club',
            name: t("Клуб"),
            selector: (row) => row?.club?.name,
            center: true,
            sortable: true,
            minWidth: '200px',
            wrap: true,
        },
        {
            header: 'description',
            name: t("Дэлгэрэнгүй хүсэлт"),
            selector: (row) => row?.description,
            center: true,
            sortable: true,
            minWidth: '180px',
        },
        {
            header: 'answer',
            name: t("Хариулт"),
            selector: (row) => row?.answer,
            center: true,
            sortable: true,
            minWidth: '180px',
        },
        {
            header: 'request_flag',
            name: t("Төлөв"),
            selector: (row) => (
                solved_type_color(row?.request_flag)
            ),
            sortable: true,
            center: true,
            minWidth: '230px'
        },
        {
            name: t("Үйлдэл"),
			maxWidth: "180px",
            minWidth: '180px',
            center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a role="button" onClick={() => { handleRequestSolved(row.id, true)} }
                        id={`complaintListDatatableDetail${row?.id}`}
                    >
						<Badge color="light-info" pill><Book width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableDetail${row.id}`}>Дэлгэрэнгүй</UncontrolledTooltip>
					{
						<>
                            <a role="button"
                                onClick={() => handleRequestSolved(row?.id, false)}
                                id={`complaintListDatatableCancel${row?.id}`}
                                className={` ${[2, 3, 4].includes(row?.request_flag) ? ` pe-none opacity-25 ` : `` } ms-1`}
                            >
                                <Badge color="light-success" pill><CheckCircle width={"100px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`}>Шийдвэрлэх</UncontrolledTooltip>
						</>
					}
				</div>
			),
        }
    ]

    if(is_header) {
        columns = columns.concat(add_columns)
	}

    return columns;

}
