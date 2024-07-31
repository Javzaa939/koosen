import {Badge, UncontrolledTooltip} from 'reactstrap'
import {Edit, Trash, Book} from 'react-feather'
import {t} from 'i18next';

import useModal from "@hooks/useModal"
import moment from 'moment';


export function getColumns (currentPage, rowsPerPage, total_count, handleEditModal, handleDelete, id, handleViewModal)
{
	const page_count = Math.ceil(total_count / rowsPerPage)
	const { showWarning } = useModal()

    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			header: 'title',
			name: t("Сорилын нэр"),
			selector: (row) => (row?.title),
            sortable: true,
			maxWidth: "400px",
			minWidth: "150px",
			center: true
		},
		{
			header: 'description',
			name: t("Тайлбар"),
			selector: (row) =>{
				return(
					row?.description
					?
						<>{row?.description}</>
					:
						<></>
				)
			},
            sortable: true,
			maxWidth: "550px",
			minWidth: "200px",
			center: true
        },
        {
			name: t("Хамрах хүрээ"),
			selector: (row) => row?.scope_name,
			width: '200px',
			center: true,
        },
		{
			header: 'start_date',
			name: t("Эхлэх огноо"),
			selector: (row) => moment(row?.start_date).format("YYYY-MM-DD H:mm"),
            sortable: true,
			width: '160px',
        },
		{
			header: 'end_date',
			name: t("Дуусах огноо"),
			selector: (row) => moment(row?.end_date).format("YYYY-MM-DD H:mm"),
            sortable: true,
			width: '160px',
        },
        {
			header: 'duration',
			name: t("Үргэлжлэх хугацаа"),
			selector: (row) =>{
				return(
					row?.duration
					?
						<>{row?.duration}&nbsp;минут</>
					:
						<></>
				)
			},
            sortable: true,
			maxWidth: "200px",
			minWidth: "100px",
			center: true
        },
	]

	if(Object.keys(id).length > 0) {
		var delete_column = {
			name: t("Үйлдэл"),
			width: "160px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					<a	role="button"
						id={`requestVolunteerDetail${row.id}`}
						className="me-1"
						href={`psychologicaltesting/addstudent/${row?.id}`}
					>
						<Badge color="light-info" pill><Book  width={"15px"} /></Badge>
					</a>
                   <UncontrolledTooltip placement='top' target={`requestVolunteerDetail${row.id}`} >Дэлгэрэнгүй</UncontrolledTooltip>
					<a role="button" onClick={() => { handleEditModal(row)} }
						id={`complaintListDatatableEdit${row?.id}`}
						className="me-1"
					>
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
                    <a role="button"
                        onClick={() => showWarning({
                            header: {
                                title: t(`Сорил устгах`),
                            },
                            question: t("Та энэ сорилыг устгахдаа итгэлтэй байна уу?"),
                            onClick: () => handleDelete(row.id),
                            btnText: t('Устгах'),
                        })}
                        id={`complaintListDatatableCancel${row?.id}`}
                    >
                        <Badge color="light-danger" pill><Trash width={"100px"} /></Badge>
                    </a>
                    <UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
				</div>
			),
		}
		columns.push(delete_column)
	}
    return columns
}