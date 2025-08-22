import { t } from 'i18next'
import { request_flag_color } from '@utils'


export function getColumns(currentPage, rowsPerPage, total_count, handleUpdateModal){
    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: "№",
            selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
            maxWidth: "30px",
            center:true,
        },
        {
            header: 'lesson',
            name: `${t('Хичээл')}`,
            selector: (row) => row?.lesson?.code + ' ' + row?.lesson?.name,
            minWidth: "230px",
            maxWidth: "230px",
            wrap:true,
        },
        {
            header: 'student_code',
            name: `${t('Оюутан')}`,
            selector: (row) => row?.student?.code + ' '+ row?.student?.full_name,
            minWidth: "30px",
            center: true,
            wrap:false

        },
        {
            header: 'description',
            name: `${t('Дэлгэрэнгүй хүсэлт')}`,
            selector: (row) => (row?.description),
            minWidth: "350px",
            maxWidth: "150px",
            center: true,
        },
        {
            header: 'teacher',
            name: `${t('Багш')}`,
            selector: (row) => row?.teacher?.code + ' ' + row?.teacher?.full_name,
            minWidth: "230px",
            maxWidth: "230px",
            center:true,

        },
        {
            header: 'request_flag',
            name: `${t('Хүсэлтийн төлөв')}`,
            selector: (row) => (request_flag_color(row?.request_flag)),
            minWidth: "350px",
            maxWidth: "150px",
            center: true,
        },
        {
            name: `${t('үйлдэл')}`,

            selector:  (row) => (
                <div className="text-center" style={{ width: "auto" }}>
                        {/* дэлгэрэнгүй */}
                        <a
                            id={`requestVolunteerDetail${row.id}`}
                            className='ms-1'
                            onClick={
                                () => handleUpdateModal(row?.id, true, row)
                            }>
                            <Badge color="light-info" pill><Book  width={"15px"} /></Badge>
                        </a>

                   <UncontrolledTooltip placement='top' target={`requestVolunteerDetail${row.id}`} >Дэлгэрэнгүй</UncontrolledTooltip>
                    {
                        <>
                            <a role="button"
                                onClick={() => handleUpdateModal(row?.id, false, row)}
                                id={`tutorUpdate${row?.id}`}
                                className={` ${[2, 3, 4].includes(row?.request_flag) ? ` pe-none opacity-25 ` : `` } ms-1`}
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

    ]

    return columns
}
