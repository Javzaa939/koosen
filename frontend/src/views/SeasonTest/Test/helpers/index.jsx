import { t } from 'i18next'

import { Eye, Edit, X, Book } from 'react-feather'

import useModal from "@hooks/useModal"
import { Badge, UncontrolledTooltip } from 'reactstrap';
import moment from 'moment';

function request_flag_color(request_flag)
    {
        let color = ''
        let request_flag_name = ''

        if(request_flag === 1)
        {
            color = 'light-info'
            request_flag_name = 'Илгээсэн'
        }
        else if (request_flag === 3)
        {
            color = 'light-warning'
            request_flag_name = 'Цуцалсан'
        }
        else if (request_flag === 2)
        {
			color = 'light-success'
			request_flag_name = 'Баталсан'
        }

        return (
            <Badge color={color} >
                {request_flag_name}
            </Badge>
        )
    }

export function getColumns (currentPage, rowsPerPage, total_count, handleEdit, handleDelete, handleShow, handleSend, difficultyLevelsOption) {

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
            name: `${'Хичээлийн нэр'}`,
            selector: (row) => row?.lesson?.name,
            minWidth: "150px",
            wrap:true,
        },
        {
            name: `${'Шалгалт нэр'}`,
            selector: (row) => row?.title,
            minWidth: "100px",
            wrap:true,
        },
        {
            name: `${'Эхлэх хугацаа'}`,
            selector: (row) => moment(row?.start_date).format('YYYY-MM-DD HH-mm'),
            minWidth: "160px",
        },
        {
            name: `${'Дуусах хугацаа'}`,
            selector: (row) => moment(row?.end_date).format('YYYY-MM-DD HH-mm'),
            minWidth: "160px",
        },
        {
            name: `${'Түвшин'}`,
            selector: (row) => difficultyLevelsOption.find(item => item.value === row?.level)?.label,
            minWidth: "100px",
        },

        // Устгах үед шалгалтын эхлэх хугацаа эхлээд дуусах хугацаа болоогүй үед устгах боломжгүй
        {
			name: "Үйлдэл",
			center: true,
			selector: (row) => {
                var is_remove = true
                var is_edit = true

                return (
                    <div className="text-center" style={{ width: "auto" }}>
                        {
                            is_edit &&
                            <>
                                <a
                                    role="button"
                                    onClick={() => { handleEdit(row)} }
                                    id={`complaintListDatatableEdit${row?.id}`}
                                    className='me-1'
                                >
                                    <Badge color="light-success" pill><Edit  width={"15px"} /></Badge>
                                </a>
                                <UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >{t('Засах')}</UncontrolledTooltip>
                            </>
                        }
                        <>
                            <a
                                role="button"
                                id={`complaintListDatatableShow${row?.id}`}
                                className='me-1'
                                href={`/challenge-season/addstudent/${row?.id}/${row?.lesson?.id}`}
                            >
                                <Badge color="light-info"><Book width={"10px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`complaintListDatatableShow${row.id}`} >{t('Дэлгэрэнгүй')}</UncontrolledTooltip>
                        </>
                        {
                            is_remove &&
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
                                        id={`complaintListDatatableCancel${row?.id}`}
                                    >
                                        <Badge color="light-danger" pill><X width={"100px"} /></Badge>
                                    </a>
                                    <UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
                                </>
                        }
                    </div>
                )
            },
            minWidth: "150px",
		},
        {
            name: `${t('Дүн харах')}`,
            selector:  (row) => (
                <div className="text-center" style={{ width: "auto" }}  >
                    <a
                        id={`complaintListDatatableDetail${row?.id}`}
                        className='ms-1'
                        href={`/challenge/detail/${row?.id}`}
                        target={'_blank'}
                    >
                        <Badge color="light-info" pill><Book  width={"15px"} /></Badge>
                    </a>

				</div>
            ),
            center: true,
            minWidth: "50px",
        },
    ]
    return columns
}
