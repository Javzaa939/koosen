import { t } from 'i18next'
import { request_flag_color } from '@utils'
import { Book, CheckCircle} from 'react-feather'
import { Badge, UncontrolledTooltip} from 'reactstrap'

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
            header: 'title',
            name: `${t('Үйл ажиллагааны нэр')}`,
            selector: (row) => row?.action?.title,
            minWidth: "230px",
            maxWidth: "230px",
            wrap:true,
        },
        {
            header: 'organiser',
            name: `${t('Зохион байгуулагч')}`,
            selector: (row) => row?.action?.organiser,
            center:true,
            minWidth: "230px",
            maxWidth: "230px",
            wrap:true,
        },
        {
            header: 'start',
            name: `${t('Эхлэх хугацаа')}`,
            selector: (row) => row?.action?.start,
            center:true,
            minWidth: "230px",
            maxWidth: "230px",
            wrap:false,
        },
        {
            header: 'end',
            name: `${t('Дуусах хугацаа')}`,
            selector: (row) => row?.action?.end,
            minWidth: "230px",
            maxWidth: "230px",
            center:true,
            wrap:false,
        },
        {
            header: 'student_code',
            name: `${t('Оюутан')}`,
            selector: (row) => row?.student?.code + ' '+ row?.student?.full_name,
            minWidth: "30px",
            center: true,

        },
        {
            header: 'description',
            name: `${t('Дэлгэрэнгүй хүсэлт')}`,
            selector: (row) => (row?.description
            ),
            minWidth: "300px",
            maxWidth: "150px",
            center: true,
        },
        {
            header: 'request_flag',
            name: `${t('Хүсэлтийн төлөв')}`,
            selector: (row) => (request_flag_color(row?.request_flag)),
            minWidth: "300px",
            maxWidth: "150px",
            center: true,
        },
        {
            name: `${t('үйлдэл')}`,

            selector:  (row) => (
                <div className="text-center" style={{ width: "auto" }}>
                        {/* дэлгэрэнгүй */}
                        <a
                            id={`requestVolunteerDetail${row?.id}`}
                            className='ms-1'
                            onClick={
                                () => handleUpdateModal(row?.id, true, row)
                            }>
                            <Badge color="light-info" pill><Book  width={"15px"} /></Badge>
                        </a>

                   <UncontrolledTooltip placement='top' target={`requestVolunteerDetail${row?.id}`} >Дэлгэрэнгүй</UncontrolledTooltip>
                    {
                        <>
                            <a role="button"
                                onClick={() => handleUpdateModal(row?.id, false, row)}
                                id={`volentuurUpdate${row?.id}`}
                                className={` ${[2, 3, 4].includes(row?.request_flag) ? ` pe-none opacity-25 ` : `` } ms-1`}
                            >
                                <Badge color="light-success" pill><CheckCircle width={"100px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`volentuurUpdate${row?.id}`}>Шийдвэрлэх</UncontrolledTooltip>
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
