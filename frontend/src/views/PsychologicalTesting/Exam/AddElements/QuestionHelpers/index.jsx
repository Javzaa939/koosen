
import { Trash2 } from 'react-feather'
import { Badge } from 'reactstrap';
import useModal from "@hooks/useModal"

export function getQuestionColumns (currentPage, rowsPerPage, total_count, handleDeleteQuestion) {

    const { showWarning } = useModal()

    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: <span title='Сорилын асуултууд'>Сорилын асуултууд</span>,
            selector: (row) => <span className='text-center' style={{ marginTop: '3px', marginBottom: '3px' }}>{row?.question}</span>,
            minWidth: "80%",
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
                                title: `Шалгалтын асуултыг устгах`,
                            },
                            question: `Уг асуултыг шалгалтнаас хасахад итгэлтэй байна уу?`,
                            onClick: () => handleDeleteQuestion(row?.id),
                            btnText: 'Устгах',
                        })}
                        id={`complaintListDatatableCancel${row?.id}`}
                    >
                        <Badge color="light-danger" pill><Trash2  width={"15px"} /></Badge>
                    </a>
				</div>
            ),
            center: true,
            minWidth: "10%",
        }
    ]
    return columns
}
