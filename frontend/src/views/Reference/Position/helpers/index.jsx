import { t } from 'i18next';
import { Badge, UncontrolledTooltip} from 'reactstrap'
import { Lock, Edit, X} from 'react-feather'
import useModal from "@hooks/useModal"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, handleEdit, handleDelete, user, school_id) {
	const page_count = Math.ceil(total_count/ rowsPerPage)
	if (currentPage > page_count) {
        currentPage = 1
    }
	const { showWarning } = useModal()

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			name: `${t("Нэр")}`,
			selector: (row) => <span title={row?.name}>{row?.name} </span>,
			maxWidth: "300px",
			center: true
		},
        {
			name: `${t("Сургуулийн нэр")}`,
			selector: (row) => row?.org?.name,
			minWidth: "30px",
			center: true,
		},
		    {
			name: `${t("Сургуулийн нэр")}`,
			selector: (row) => row?.created_at,
			minWidth: "30px",
			center: true,
		},
		{
            name: `${t('Үйлдэл')}`,

            selector:  (row) => (
                <div className="text-center" style={{ width: "auto" }}>
                    {
						school_id
						&&
                        <>
                            <a role="button"
                                onClick={() => handleEdit(row)}
                                id={`updateSchool${row?.id}`}
                            >
                                <Badge color="light-primary" pill><Edit width={"100px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`updateSchool${row?.id}`}>Засах</UncontrolledTooltip>
						</>
                    }
					{
						school_id
						&&
						<>
							<a role="button"
								className='ms-1'
								onClick={() => showWarning({
									header: {
										title: `${t('Албан тушаал устгах')}`,
									},
									question: `Та  ${row?.name} албан тушаал устгахдаа итгэлтэй байна уу?`,
									onClick: () => handleDelete(row?.id),
									btnText: 'Устгах',
								})}
								id={`complaintListDatatableCancel${row?.id}`}
							>
								<Badge color="light-danger" pill><X width={"100px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row?.id}`} >Устгах</UncontrolledTooltip>
						</>
					}
				</div>
            ),
            minWidth: "200px",
            maxWidth: "200px",
            center: true,
        },
	]
    return columns
}

