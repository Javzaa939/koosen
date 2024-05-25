
import { ArrowDown, ArrowRight, Edit } from 'react-feather'
import { Badge, UncontrolledTooltip } from 'reactstrap';

export function getColumns (currentPage, rowsPerPage, total_count, handleEdit) {

    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			center: true,
            width: "30px",
            style: {
            }

        },
        {
            name: <div className='' style={{textWrap: "wrap", textAlign: "center"}}>{`${'Хичээлийн код'}`}</div>,
            selector: (row) => row?.code,
            wrap:true,
            center: true,
            width: "100px",
        },
        {
            name: <div className='' style={{textWrap: "wrap", textAlign: "center"}}>{`${'Хичээлийн нэр'}`}</div>,
            selector: (row) => row?.name,
            wrap:true,
            center: true,
            width: "200px",
        },
        {
            name: `${'Кредит'}`,
            selector: (row) => row?.kredit,
            wrap:true,
            center: true,
            width: "80px",
        },
        {
            name: <div className='' style={{textWrap: "wrap", textAlign: "center"}}>{`${'Сэдэв сонгох'}`}</div>,
            selector:  (row) => (
                <div className="text-center cursor-pointer" style={{ width: "auto" }}  onClick={() => {handleEdit(row)}} >
                    <div
                        id={`complaintListDatatableDetail${row?.id}`}
                        // role='button'
                        className='ms-1'
                        // href={`/challenge/equestion/topic/${row?.id}`}
                        // target={'_blank'}
                        style={{pointerEvents: "none"}}
                    >
                        <Badge color="light-primary" pill><ArrowDown  width={"15px"} /></Badge>
                    </div>
				</div>
            ),
            center: true,
            width: "100px",
        }
    ]
    return columns
}
