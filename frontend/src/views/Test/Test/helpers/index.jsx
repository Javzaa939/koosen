import { t } from 'i18next'

import { Eye, Edit, X, Book, Paperclip, Trash, Trash2, PlusCircle, PlusSquare, Plus, EyeOff } from 'react-feather'

import useModal from "@hooks/useModal"
import { Badge, UncontrolledTooltip } from 'reactstrap';

function request_flag_color(request_flag) {
    let color = ''
    let request_flag_name = ''

    if (request_flag === 1) {
        color = 'light-info'
        request_flag_name = 'Илгээсэн'
    }
    else if (request_flag === 3) {
        color = 'light-warning'
        request_flag_name = 'Цуцалсан'
    }
    else if (request_flag === 2) {
        color = 'light-success'
        request_flag_name = 'Баталсан'
    }

    return (
        <Badge color={color} >
            {request_flag_name}
        </Badge>
    )
}

export function getColumns(currentPage, rowsPerPage, total_count, handleEdit, handleDelete, handleShow, handleSend, handleEditModal, handleExamModal) {

    const { showWarning } = useModal()

    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: "№",
            selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
            maxWidth: "5%",
            center: true,
        },
        {
            name: `${'Шалгалт'}`,
            selector: (row) => row?.title,
            minWidth: "15%",
            wrap: true,
            center: true,
        },
        {
            name: `${'Хичээл'}`,
            selector: (row) => row?.lesson?.name,
            minWidth: "15%",
            wrap: true,
            center: true,
        },
        {
            name: `${'Тайлбар'}`,
            selector: (row) => row?.description,
            minWidth: "20%",
            center: true,
        },
        {
            name: <span className='text-center' style={{ marginTop: '3px', marginBottom: '3px' }}>Шалгалт өгсөн оюутны тоо</span>,
            selector: (row) => row?.is_student,
            minWidth: "10%",
            center: true,
        },
        // {
        //     name: `${'Илгээсэн төлөв'}`,
        //     selector: (row) => {
        // 		if (row?.send_type) {
        // 			return request_flag_color(row?.send_type)
        // 		} else ''
        // 	},
        //     minWidth: "100px",
        // },
        // Устгах үед шалгалтын эхлэх хугацаа эхлээд дуусах хугацаа болоогүй үед устгах боломжгүй
        {
            name: "Үйлдэл",
            center: true,
            selector: (row) => {
                var is_remove = true
                var is_send = false
                var is_edit = true
                var is_question = true

                var end_date = new Date(row?.endAt)
                var start_date = new Date(row?.startAt)
                var today = new Date()

                // Хүсэлт илгээхээс өмнө эхлэх болон дуусах хугацаа
                if ((start_date <= today && today <= end_date) || row?.send_type) {
                    is_remove = false
                }

                // Дуусах хугацаа өнөөдрөөс бага үед л баталгаажуулах хүсэлт илгээнэ
                if (end_date < today && !row?.send_type) {
                    is_send = true
                }

                // Шалгалтыг баталгаажуулах хүсэлт илгээсэн үед засах боломжтой
                if (row?.send_type) {
                    is_edit = false
                }

                return (
                    <div className="text-center" style={{ width: "auto" }}>
                        <>
                            <a
                                role="button"
                                onClick={() => { handleShow(row) }}
                                id={`complaintListDatatableShow${row?.id}`}
                                className='me-1'
                                href={`/challenge/test/addstudent/${row?.id}/${row?.lesson?.id}`}
                            >
                                <Badge color="light-info"><Book width={"15px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`complaintListDatatableShow${row.id}`} >Дэлгэрэнгүй</UncontrolledTooltip>
                        </>
                        <>
                            <a
                                role="button"
                                onClick={() => { handleEditModal(row) }}
                                id={`complaintListDatatableEdit${row?.id}`}
                                className='me-1'
                            // href={`/challenge/funtest/addquestion/${row?.id}`}
                            >
                                <Badge color="light-success"><Edit width={"15px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
                        </>
                        {/* <>
                            <a
                                role="button"
                                onClick={() => showWarning({
                                    header: {
                                        title: `Шалгалт батлуулах`,
                                    },
                                    question: `Та "${row?.title}"  шалгалтыг батлуулах хүсэлт илгээж байна?`,
                                    onClick: () => handleSend(row.id),
                                    btnText: 'Илгээх',
                                })}
                                className='me-1'
                                id={`complaintListDatatableSend${row?.id}`}
                            >
                                <Badge color="light-info" pill><i className="fas fa-paper-plane"></i></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`complaintListDatatableSend${row.id}`}>Илгээх</UncontrolledTooltip>
                        </> */}
                        <>
                            <a
                                role="button"
                                onClick={() => showWarning({
                                    header: {
                                        title: `Шалгалт устгах`,
                                    },
                                    question: `Та энэ асуултыг шалгалтыг устгахдаа итгэлтэй байна уу? Шалгалтын өгсөн оюутнуудын хариулт хамт устахыг анхаарна уу`,
                                    onClick: () => handleDelete(row.id),
                                    btnText: 'Устгах',
                                })}
                                className='me-1'
                                id={`complaintListDatatableCancel${row?.id}`}
                            >
                                <Badge color="light-danger" ><Trash2 width={"100px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
                        </>
                        <>
                            <a
                                role="button"
                                onClick={() => { handleExamModal(row?.id) }}
                                id={`complaintListDatatableExam${row?.id}`}
                            >
                                <Badge color="light-primary" ><Eye width={"20px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`complaintListDatatableExam${row.id}`} >Шалгалт харах</UncontrolledTooltip>
                        </>
                    </div>
                )
            },
            wrap: true,
            minWidth: "10%",
            center: true,
        },
        {
            name: `${t('Дүн харах')}`,
            selector: (row) => (
                <div className="text-center" style={{ width: "auto" }}  >
                    <a
                        id={`complaintListDatatableDetail${row?.id}`}
                        className={` ${row?.is_student === 0 ? ` pe-none opacity-25 ` : ``} ms-1`}
                        href={`/challenge/detail/${row?.id}`}
                        target={'_blank'}
                    >
                        <Badge color="light-primary"><Eye width={"20px"} /></Badge>
                    </a>

                </div>
            ),
            center: true,
            minWidth: "5%",
        },
    ]
    return columns
}
