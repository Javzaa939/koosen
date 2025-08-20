import { Trash2 } from 'react-feather'
import { t } from 'i18next'
import { Badge } from 'reactstrap'

// Хүснэгтийн баганууд
export function getColumns(currentPage, rowsPerPage, total_count, handleDelete, user, showWarning) {
    const page_count = Math.ceil(total_count / rowsPerPage)

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const TANHIM = 1
    const ONLINE = 2
    const COMBINED = 3

    const STUDY_TYPE = {
        [TANHIM]: 'Танхим',
        [ONLINE]: 'Онлайн',
        [COMBINED]: 'Хосолсон',
    }

    const columns = [
        {
            name: "№",
            selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
            maxWidth: "1px",
            center: true
        },
        {
            header: 'lesson',
            name: t("Хичээл"),
            selector: (row) => row?.lesson?.name,
            minWidth: "230px",
            wrap: "true",
        },
        {
            header: 'teacher',
            name: t("Багш"),
            selector: (row) => row?.teacher?.full_name,
            center: true,
            minWidth: '200px',
            wrap: true,
        },
        {
            header: 'room',
            name: t("Өрөө"),
            selector: (row) => row?.room_name,
            center: true,
            minWidth: '200px',
            wrap: true,
        },
        {
            header: 'type',
            name: t("Хичээллэх төрөл"),
            selector: (row) => row?.type_name,
            center: true,
            wrap: "true",
            minWidth: "180px",
        },
        {
            header: 'day',
            name: t("Өдөр"),
            selector: (row) => row?.day,
            center: true,
        },
        {
            header: 'time',
            name: t("Цаг"),
            selector: (row) => row?.time,
            center: true,
        },
        {
            header: 'group',
            name: t("Анги"),
            selector: (row) => row?.group_names,
            minWidth: "200px",
            cell: row => (
                <div style={{
                    whiteSpace: 'normal',
                    overflow: 'auto',
                    textOverflow: 'unset',
                    lineHeight: '1.5',
                    height: '100%',
                }}>
                    {row.group_names}
                </div>
            )
        },
        {
            header: 'begin_date',
            name: t("Эхлэх огноо"),
            selector: (row) => row?.begin_date,
            center: true,
            wrap: "true",
            minWidth: "150px",
        },
        {
            header: 'end_date',
            name: t("Дуусах огноо"),
            selector: (row) => row?.end_date,
            center: true,
            wrap: "true",
            minWidth: "150px",
        },
        {
            header: 'begin_week',
            name: t("Эхлэх долоо хоног"),
            selector: (row) => row?.begin_week,
            center: true,
            wrap: "true",
            minWidth: "200px",
        },
        {
            header: 'end_week',
            name: t("Дуусах долоо хоног"),
            selector: (row) => row?.end_week,
            center: true,
            wrap: "true",
            minWidth: "200px",
        },
        {
            header: 'is_block',
            name: t("Блок эсэх"),
            selector: (row) => row?.is_block ?
                <Badge color='success'>{t('Тийм')}</Badge>
                :
                <Badge color='warning'>{t('Үгүй')}</Badge>,
            center: true,
            wrap: "true",
        },
        {
            header: 'is_kurats',
            name: t("Курац эсэх"),
            selector: (row) => row?.is_kurats ?
                <Badge color='success'>{t('Тийм')}</Badge>
                :
                <Badge color='warning'>{t('Үгүй')}</Badge>,
            center: true,
            wrap: "true",
            minWidth: "150px",
        },
        {
            header: 'is_optional',
            name: t("Сонгон хичээл эсэх"),
            selector: (row) => row?.is_optional ?
                <Badge color='success'>{t('Тийм')}</Badge>
                :
                <Badge color='warning'>{t('Үгүй')}</Badge>,
            center: true,
            wrap: "true",
            minWidth: "200px",
        },
        {
            header: 'study_type',
            name: t("Хичээл орох хэлбэр"),
            selector: (row) => STUDY_TYPE[row?.study_type],
            center: true,
            wrap: "true",
            minWidth: "200px",
        },
        {
            header: 'week_number',
            name: t("7 хоногийн дугаар"),
            selector: (row) => row?.week_number,
            center: true,
            wrap: "true",
            minWidth: "200px",
        },
        {
            name: t("Устгах"),
            maxWidth: "80px",
            selector: (row) => (
                <div className="text-center" style={{ width: "auto" }}>
                    <a role="button"
                        onClick={() => showWarning({
                            header: {
                                title: t(`Хичээлийн хуваарь устгах`),
                            },
                            question: t(`Та энэхүү хичээлийн хуваарийг устгахдаа итгэлтэй байна уу?`),
                            onClick: () => handleDelete(row.id),
                            btnText: t('Устгах'),
                        })}
                    >
                        <Trash2 color="red" width={"15px"} />
                    </a>
                </div>
            ),
        }
    ]

    return columns

}
