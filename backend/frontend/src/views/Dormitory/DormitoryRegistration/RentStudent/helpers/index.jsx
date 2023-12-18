

import { t } from 'i18next'

import { Button, Badge, UncontrolledTooltip } from 'reactstrap'

import { Book, CheckCircle } from 'react-feather'

import { solved_type_color } from '@utils'

export function getColumns (currentPage, rowsPerPage, total_count, handleRequestSolved, handleViewModal) {
    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage =1
    }

    const columns = [
        {
            name: "№",
            selector: (row, index) => (currentPage-1) * rowsPerPage + 1 + index,
            maxWidth: "30px",
            center: "true"
        },
        {
            sortField: "teacher",
            name: `${t('Овог, Нэр')}`,
            selector: (row) => row?.teacher?.full_name,
            minWidth: "220px",
            center: "true",
            sortable: true,
        },
        {
            sortField: "room_type",
            name: `${t('Өрөөний төрөл')}`,
            selector: (row) => row?.room_type_name,
            minWidth: "180px",
            maxWidth: "220px",
            center: "true",
            wrap: true,
            sortable: true,
        },
        {
            sortField: "room",
            name: `${t('Өрөө')}`,
            selector: (row) => row?.room_name,
            minWidth: "150px",
            maxWidth: "220px",
            center: "true",
            wrap: true,
        },
        {
            sortField: "solved_start_date",
            name: `${t('Гэрээ эхлэх хугацаа')}`,
            selector: (row) => row?.solved_start_date,
            minWidth: "220px",
            maxWidth: "220px",
            center: "true",
        },
        {
            sortField: "solved_finish_date",
            name: `${t('Гэрээ дуусах хугацаа')}`,
            selector: (row) => row?.solved_finish_date,
            minWidth: "220px",
            maxWidth: "220px",
            center: "true",
        },
        {
            sortField: "request",
            name: `${t('Хүсэлт')}`,
            selector: (row) => row?.request,
            minWidth: "150px",
            maxWidth: "220px",
            center: "true",
        },
        {
            sortField: "request_date",
            name: `${t('Бүртгүүлсэн огноо')}`,
            selector: (row) => row?.request_date,
            minWidth: "200px",
            center: "true",
        },
        {
            sortField: "solved_flag",
            name: `${t('Шийдвэрийн төрөл')}`,
            selector: (row) => solved_type_color(row?.solved_flag),
            minWidth: "200px",
            center: "true",
        },
        {
            name: `${t('Үйлдэл')}`,

            selector:  (row) => (
                <div className="text-center" style={{ width: "auto" }}>
                        <a
                            id={`requestVolunteerDetail${row.id}`}
                            className='ms-1'
                            onClick={
                                () => handleViewModal(row?.id, row)
                            }>
                            <Badge color="light-info" pill><Book  width={"15px"} /></Badge>
                        </a>

                   <UncontrolledTooltip placement='top' target={`requestVolunteerDetail${row.id}`} >Дэлгэрэнгүй</UncontrolledTooltip>
                    {
                        <>
                            <a role="button"
                                onClick={() => handleRequestSolved(row?.id, false, row)}
                                id={`tutorUpdate${row?.id}`}
                                className={` ${[2, 3, 4].includes(row?.solved_flag) ? ` pe-none opacity-25 ` : `` } ms-1`}
                            >
                                <Badge color="light-success" pill><CheckCircle width={"100px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`tutorUpdate${row?.id}`}>Шийдвэрлэх</UncontrolledTooltip>
						</>
                    }
				</div>
            ),
            minWidth: "230px",
            maxWidth: "230px",
            center: true,
        },
        // {
		// 	name: t("Үйлдэл"),
		// 	maxWidth: "180px",
        //     minWidth: '180px',
        //     center: true,
		// 	selector: (row) => (
		// 		row?.solved_flag == 1
        //         ?
        //             <Button color='primary' size='sm' onClick={() => handleViewModal(row?.id, false)}>
        //                 Шийдвэрлэх
        //             </Button>
        //         :
        //             <Button color='primary' size='sm' onClick={() => handleViewModal(row?.id, row)}>
        //                 Харах
        //             </Button>
		// 	),
		// }
    ]
    return columns
}
