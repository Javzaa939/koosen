import { t } from 'i18next';
import { Badge, UncontrolledTooltip} from 'reactstrap'
import { Lock, Edit, X} from 'react-feather'
import useModal from "@hooks/useModal"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, handleEdit, handleDelete, user, changePassModal) {
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
			selector: (row) => <span title={row?.last_name}>{row?.last_name + ' ' + row?.first_name } <span>{row?.code ? '/' + row?.code + '/' : ''}</span></span>,
			maxWidth: "300px",
			center: true
		},
		{
			name: `${t("И-мэйл")}`,
			selector: (row) => row?.email,
			maxWidth: "300px",
			center: true
		},
		{
			name: `${t("Регистр")}`,
			selector: (row) => row?.register,
			maxWidth: "300px",
			center: true
		},
        {
			header: 'org_position',
			name: `${t("Албан тушаал")}`,
			selector: (row) => <span title={row?.org_position_name}>{row?.org_position_name}{row?.rank_name ? ' ' + row?.rank_name  : ''}</span>,
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
			header: 'state',
			name: t("Ажилтны төлөв"),
			selector: (row) => {
                return (
                    row?.state == 1
                    ?
                        <Badge color="light-success" pill>
                            {t('Ажиллаж байгаа')}
                        </Badge>
					:
						row?.state == 5
						?
							<Badge color="light-warning" pill>
								{t('Тэтгэвэрт гарсан')}
							</Badge>
						:
							row?.state == 4
							?
								<Badge color="light-warning" pill>
									{t('Шилжсэн')}
								</Badge>
							:
								<Badge color="light-danger" pill>
									{t('Чөлөөлөгдсөн')}
								</Badge>
                )
            },
            sortable: false,
            center: true,
            minWidth: '230px'
        },
		{
            name: `${t('Үйлдэл')}`,

            selector:  (row) => (
                <div className="text-center" style={{ width: "auto" }}>
                    {
						user?.permissions?.includes('lms-reference-teacher-update')
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
						user?.permissions?.includes('lms-reference-teacher-delete')
						&&
						<>
							<a role="button"
								className='ms-1'
								onClick={() => showWarning({
									header: {
										title: `${t('Багшийн мэдээлэл устгах')}`,
									},
									question: `Та  ${row?.full_name} багшийн мэдээллийг устгахдаа итгэлтэй байна уу?`,
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
					{
						(user.permissions.includes('lms-subschools-password-update')) &&
                        <>
                            <a
								role="button"
								onClick={() => showWarning({
									header: {
										title: t(`Багшийн нууц үг`),
									},
									question: t(`Багшийн нууц үг сэргээх үү?`),
									onClick: () => changePassModal(row?.id)
								})}
								id={`complaintListDatatableEditPass${row?.id}`}
								className="ms-1"
							>
								<Badge color="light-info" pill><Lock  width={"15px"}/></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableEditPass${row.id}`} >Нууц үг сэргээх</UncontrolledTooltip>
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

