import { t } from 'i18next'

import { Badge, UncontrolledTooltip} from 'reactstrap'
import { Book, Edit, X} from 'react-feather'
import useModal from '@hooks/useModal'

export function getColumns(currentPage, rowsPerPage, total_count, handleUpdateModal, handleDetailModal, handleDelete){
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
            center:true,
        },
        {
            header: 'teacher_scoretype',
            name: `${t('Багшийн код нэр')}`,
            selector: (row) => row?.teacher_scoretype?.lesson_teacher?.teacher?.code,
            center:true,
            minWidth: "230px",
            maxWidth: "230px",
            wrap:false,
        },
        {
            header: 'teacher_scoretype',
            name: `${t('Хичээлийн нэр')}`,
            selector: (row) => row?.teacher_scoretype?.lesson_teacher?.lesson?.name,
            center:true,
            minWidth: "230px",
            maxWidth: "230px",
            wrap:false,
        },
        {
            header: 'teacher_scoretype',
            name: `${t('Хичээлийн код')}`,
            selector: (row) => row?.teacher_scoretype?.lesson_teacher?.lesson?.code,
            center:true,
            minWidth: "230px",
            maxWidth: "230px",
            wrap:false,
        },
        {
            header: 'teacher_scoretype',
            name: `${t('Дүгнэх хэлбэр')}`,
            selector: (row) => row?.teacher_scoretype?.score_type_name,
            center:true,
            minWidth: "230px",
            maxWidth: "230px",
            wrap:false,
        },
        {
            header: 'description',
            name: `${t('Тайлбар')}`,
            selector: (row) => row?.description,
            center:true,
            minWidth: "230px",
            maxWidth: "230px",
            wrap:false,
        },
        {
            header: 'start_date',
            name: `${t('Эхлэх хугацаа')}`,
            selector: (row) => row?.start_date,
            minWidth: "30px",
            center: true,

        },
        {
            header: 'finish_date',
            name: `${t('Дуусах хугацаа')}`,
            selector: (row) => row?.finish_date,
            minWidth: "230px",
            maxWidth: "230px",
            center:true,
            wrap:false,
        },
        {
            name: `${t('үйлдэл')}`,

            selector:  (row) => (
                <div className="text-center" style={{ width: "auto" }}>
                        {/* дэлгэрэнгүй */}
                        <a
                            id={`permissionsTeachScoreDetail${row?.id}`}
                            className='ms-1'
                            onClick={
                                () => handleDetailModal(row)
                            }>
                            <Badge color="light-info" pill><Book  width={"15px"} /></Badge>
                        </a>

                   <UncontrolledTooltip placement='top' target={`permissionsTeachScoreDetail${row?.id}`} >Дэлгэрэнгүй</UncontrolledTooltip>
                    {
                        <>
                            <a
                                id={`roleUpdate${row?.id}`}
                                className='ms-1'
                                role="button"
                                onClick={() => handleUpdateModal(row?.id)}
                            >
                                <Badge color="light-secondary" pill><Edit width={"100px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`roleUpdate${row?.id}`}>Засах</UncontrolledTooltip>
						</>
                    }
                    {
                        <>
                            <a
                                id={`roleDelete${row?.id}`}
                                // disabled={Object.keys(user).length > 0 && user.permissions.includes('lms-calendar-delete') ? false : true}
                                className='ms-1'
                                onClick={() => showWarning({
                                    header: {
                                        title: `${t('Багшийн дүн оруулах эрх устгах')}`,
                                    },
                                    question: `Та  ${row?.teacher_scoretype?.lesson_teacher?.teacher?.code} кодтой ${row?.teacher_scoretype?.lesson_teacher?.teacher?.full_name} багшийн ${row?.teacher_scoretype?.score_type_name} дүгнэх хэлбэрийг устгахдаа итгэлтэй байна уу?`,
                                    onClick: () => handleDelete(row?.id),
                                    btnText: 'Устгах',
                                })}
                            >
                                <Badge color="light-danger" pill><X width={"100px"} /></Badge>
                            </a>
                             <UncontrolledTooltip placement='top' target={`roleDelete${row?.id}`}>Устгах</UncontrolledTooltip>
                        </>

                    }
				</div>
            ),
            minWidth: "230px",
            maxWidth: "230px",
            center: true,
        },

    ]

    return columns
}
