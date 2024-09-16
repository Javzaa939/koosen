import moment from "moment"

export function getColumns (currentPage, rowsPerPage, total_count) {

    const page_count = Math.ceil(total_count / rowsPerPage)

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            header: 'title',
            name: 'title',
            selector: (row) =>
            <div className='border' style={{ padding: '0.5rem' }}>
                <h5>{row?.title}</h5>
                <div className='d-flex justify-content-between align-items-end pt-1'>
                    <div style={{  fontSize: 10 }}>
                        {row?.created_at ? moment(row?.created_at).format("MM/DD/YYYY HH:mm"):''}
                    </div>
                    <a
                        id={`complaintListDatatableDetail${row?.id}`}
                        href={`/service/show/${row?.id}`}
                        target={'_blank'}
                        className='d-flex border rounded align-items-center'
                        style={{  padding: '0.25rem 0.75rem', color: 'inherit', fontSize: 12 }}
                    >
                        Дэлгэрэнгүй
                    </a>
                </div>
            </div>,
            sortable: true,
            minWidth: "100%",
            wrap: true,
            center: true,
            style: {
            },
        },
    ]

    return columns

}
