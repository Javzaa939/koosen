import {Badge, UncontrolledTooltip} from 'reactstrap'
import {Book} from 'react-feather'
import {t} from 'i18next'


export function getColumns (currentPage, rowsPerPage, total_count, handleModal) {
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
            name: `${' Код'}`,
            selector: (row) => row?.code || row?.register,
            minWidth: "150px",
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
            name: `${'Оноо'}`,
            selector: (row) => row?.score,
            minWidth: "50px",
            wrap:true,
            center: true,
        },
		{
            name: `${'Өгсөн хугацаа'}`,
			selector: (row) => (
				<span>{`${row?.duration !== 0 ? `${row?.duration} минут` : ''}`}</span>
			),
            minWidth: "100px",
            wrap:true,
            center: true,
        },
        {
            name: `${t('Үйлдэл')}`,
            selector:  (row) => (
                <div className="text-center" style={{ width: "auto" }}>
                        <a
                            id={`requestVolunteerDetail${row.id}`}
                            className='ms-1'
                            onClick={
                                () => handleModal(row?.id, row)
                            }>
                            <Badge color="light-info" pill><Book  width={"15px"} /></Badge>
                        </a>

                   <UncontrolledTooltip placement='top' target={`requestVolunteerDetail${row.id}`} >Дэлгэрэнгүй</UncontrolledTooltip>
				</div>
            ),
            minWidth: "230px",
            maxWidth: "230px",
            center: true,
        },
    ]
    return columns
}