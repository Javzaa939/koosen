
import { ArrowRight, Edit } from 'react-feather'
import { Badge } from 'reactstrap';

export function getColumns (currentPage, rowsPerPage, total_count, handleEdit) {

    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			width: "30px",
			center: true,
        },
        {
            name: <div className='' style={{textWrap: "wrap", textAlign: "center"}}>{`${'Сэдвийн нэр'}`}</div>,
            selector: (row) => row?.title,
            maxWidth: "140px",
            center: true,
        },
        {
            name: `${'Сэдвийн агуулга'}`,
            selector: (row) => row?.content,
            wrap:true,
            center: true,
        },
        {
            name: <div className='' style={{textWrap: "wrap", textAlign: "center"}}>{`${'Асуулт үүсгэх'}`}</div>,
            selector:  (row) => (
                <div className="text-center cursor-pointer" style={{ width: "auto" }} onClick={() => handleEdit(row)}  >
                    <div
                        id={`complaintListDatatableDetail${row?.id}`}
                        // role='button'
                        className='ms-1'
                        // href={`/challenge/equestion/topic/question/${row?.id}`}
                        // target={'_blank'}
                        style={{pointerEvents: "none"}}
                    >
                        <Badge color="light-primary" pill><ArrowRight  width={"15px"} /></Badge>
                    </div>
				</div>
            ),
            center: true,
            maxWidth: "50px",
        }
    ]
    return columns
}
