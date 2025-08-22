import { t } from 'i18next'



export function getColumns (currentPage, rowsPerPage, total_count, handleEditModal, handleRequestDetail) {

    const page_count = Math.ceil(total_count / rowsPerPage)

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
			header: 'name',
			name: t("Клубын нэр"),
            selector: (row) => row?.name,
            sortable: true,
            center: true,
            minWidth: "180px"
        },
        {
            header: 'type',
            name: t("Үйл ажиллагааны чиглэл"),
            selector: (row) => row?.type_name,
            center: true,
            sortable: true,
            minWidth: "250px",
            maxWidth: "250px"
        },
        {
            name: t("Зорилго"),
            selector: (row) => row?.purpose,
            minWidth: '180px',
            maxWidth: '200px',
            center: true
        },
		{
			header: 'start_year',
			name: t("Байгуулагдсан он"),
			selector: (row) => row?.start_year,
            sortable: true,
            center: true,
            minWidth: '200px',
            maxWidth: '200px',
        },
        {
			header: 'member_count',
			name: t("Идэвхтэй гишүүдийн тоо"),
			selector: (row) => row?.member_count,
            sortable: true,
            center: true,
            minWidth: "250px",
            maxWidth: "250px"
        },
        {
			header: 'leader',
			name: t("Удирдагчийн мэдээлэл"),
			selector: (row) => row?.leader,
            sortable: true,
            center: true,
            minWidth: '230px'
        },
        {
            name: t("Үйлдэл"),
			maxWidth: "180px",
            minWidth: '180px',
            center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
                    <a role="button"
                        id={`complaintListDatatableDetail${row.id}`}
                        onClick={() => handleRequestDetail(row?.id, row)}
                        className={`me-1`}
                    >
                        <Badge color="light-info" pill><Book width={"100px"} /></Badge>
                    </a>
                    <UncontrolledTooltip placement='top' target={`complaintListDatatableDetail${row.id}`}>Дэлгэрэнгүй</UncontrolledTooltip>

                    <a role="button" onClick={() => { handleEditModal(row.id, true)} }
                        id={`complaintListDatatableEdit${row?.id}`}
                    >
						<Badge color="light-secondary" pill><Edit width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`}>Засах</UncontrolledTooltip>
				</div>
			),
        }
	]

    return columns;

}
