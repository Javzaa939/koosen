import { Badge, UncontrolledTooltip } from 'reactstrap';

import { Edit } from 'react-feather';

export function getColumns (currentPage, rowsPerPage, total_count, handleEdit) {

    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true,
        },
        {
            name: `${'Асуултын сэдэв'}`,
            selector: (row) => row?.subject?.title,
            minWidth: "200px",
            wrap:true,
            center: true,
        },
        {
            name: `${'Асуулт'}`,
            selector: (row) => row?.question,
            minWidth: "250px",
            center: true,
            wrap:true,
        },
        {
            name: `${'Асуултын төрөл'}`,
            selector: (row) => row?.kind_name,
            minWidth: "100px",
            center: true,
            wrap:true,
        },
        {
			name: "Үйлдэл",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>

					<a role="button" onClick={() => { handleEdit(row)} }
							id={`complaintListDatatableEdit${row?.id}`}
                            className='me-1'
                        >
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
				</div>
			),
		}
    ]
    return columns
}
