
import { Edit, Trash2 } from 'react-feather'
import { Badge } from 'reactstrap';
import useModal from "@hooks/useModal"

export function getColumns (currentPage, rowsPerPage, total_count, handleDelete) {

    const { showWarning } = useModal()

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
            name: `${'Шалгуулагчийн код'}`,
            selector: (row) => row?.code,
            minWidth: "100px",
            center: true,
        },
        {
            name: `${'Овог'}`,
            selector: (row) => row?.last_name,
            minWidth: "200px",
            wrap:true,
            center: true,
        },
        {
            name: `${'Нэр'}`,
            selector: (row) => row?.first_name,
            minWidth: "200px",
            wrap:true,
            center: true,
        },
        {
            name: `${'Устгах'}`,
            selector:  (row) => (
                <div className="text-center" style={{ width: "auto" }}  >
                    <a
                        role='button'
                        className='ms-1'
                        onClick={() => showWarning({
                            header: {
                                title: `Шалгуулагчийг шалгалтнаас хасах`,
                            },
                            question: `Та энэ шалгуулагчийг тухайн шалгалтнаас хасахдаа итгэлтэй байна уу?`,
                            onClick: () => handleDelete(row?.id),
                            btnText: 'Устгах',
                        })}
                        id={`complaintListDatatableCancel${row?.id}`}
                    >
                        <Badge color="light-danger" pill><Trash2  width={"15px"} /></Badge>
                    </a>
				</div>
            ),
            center: true,
            minWidth: "50px",
        }
    ]
    return columns
}
