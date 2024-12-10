
import { Trash2 } from 'react-feather'
import { Badge } from 'reactstrap';
import useModal from "@hooks/useModal"

export function getQuestionColumns(currentPage, rowsPerPage, total_count, handleDeleteQuestion, difficultyLevelsOption) {

    const { showWarning } = useModal()

    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: <span title='Онлайн асуулт сан' style={{}}>Онлайн асуулт сан</span>,
            selector: (row) => <span className='text-center' style={{ marginTop: '3px', marginBottom: '3px' }}>{row?.title}</span>,
            minWidth: "40%",
            center: true,
        },
        {
            name: <span className='text-center' style={{ marginTop: '3px', marginBottom: '3px' }}>Асуултын түвшин</span>,
            selector: (row) => difficultyLevelsOption.find(item => item.value === row?.level)?.label,
            minWidth: "15%",
            center: true,
        },
        {
            name: <span className='text-center' style={{ marginTop: '3px', marginBottom: '3px' }}>Асуултын оноо</span>,
            selector: (row) => row?.score,
            minWidth: "15%",
            center: true,
        },
        {
            name: `${'Устгах'}`,
            selector: (row) => (
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
                        <Badge color="light-danger" pill><Trash2 width={"15px"} /></Badge>
                    </a>
                </div>
            ),
            center: true,
            minWidth: "10%",
        }
    ]
    return columns
}
