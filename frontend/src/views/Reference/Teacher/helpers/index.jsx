import { t } from 'i18next';
import { Badge, UncontrolledTooltip} from 'reactstrap'
import { CheckCircle, Edit, X} from 'react-feather'
import useModal from "@hooks/useModal"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, handleEdit) {
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
			selector: (row) => <span title={row?.last_name}>{row?.last_name + ' ' + row?.first_name } <span>{row?.code ? '/' + row?.code + '/' : ''}</span></span>,
			maxWidth: "300px",
			center: true
		},
        {
			header: 'org_position',
			name: `${t("Албан тушаал")}`,
			selector: (row) => <span title={row?.org_position_name}>{row?.org_position_name}</span>,
			minWidth: "30px",
			center: true,
		},
        {
			name: `${t("Тэнхим")}`,
			selector: (row) => row?.salbar?.name,
			minWidth: "30px",
			center: true,
			wrap: true,
		},
		{
            name: `${t('Үйлдэл')}`,

            selector:  (row) => (
                <div className="text-center" style={{ width: "auto" }}>
                    {/* {
                        <>
                            <a role="button"
                                onClick={() => handleEdit(row)}
                                id={`updateSchool${row?.id}`}
                            >
                                <Badge color="light-primary" pill><Edit width={"100px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`updateSchool${row?.id}`}>засах</UncontrolledTooltip>
						</>
                    } */}
					{
						<>
							<a role="button"
								className='ms-1'
								onClick={() => showWarning({
									header: {
										title: `${t('Тэнхимийн мэдээлэл устгах')}`,
									},
									question: `Та  ${row?.name} устгахдаа итгэлтэй байна уу?`,
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

