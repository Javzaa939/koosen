import { t } from 'i18next';
import { Badge, UncontrolledTooltip} from 'reactstrap'
import { CheckCircle, X} from 'react-feather'
import useModal from "@hooks/useModal"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas, handleUpdateModal, handleDelete) {
	const { showWarning } = useModal()

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			name: `${t('Тэнхимийн нэр')}`,
			selector: (row) => <span title={row?.name}>{row?.name}</span>,
			width: "250px",
			left: true
		},
		{
			name: `${t('Бүрэлдэхүүн сургууль')}`,
			selector: (row) => <span title={row?.school}>{row?.school}</span>,
			width: "250px",
			center: true
		},
		{
			name: `${t('Тэнхимийн эрхлэгч')}`,
			selector: (row) => row?.leaders,
            sortable: true,
			minWidth: "250px",
			wrap: true,
			center: true
		},
        {
			name: `${t('Нийтийн сүлжээ')}`,
			selector: (row) => row?.social,
			minWidth: "50px",
			center: true
		},
        {
			name: `${t('Вэб')}`,
			selector: (row) => row?.web,
			minWidth: "50px",
			center: true
		},
		{
			name: `${t('Хаяг')}`,
			selector: (row) => row?.address,
			minWidth: "50px",
			center: true
		},
		{
            name: `${t('Үйлдэл')}`,

            selector:  (row) => (
                <div className="text-center" style={{ width: "auto" }}>
                    {
                        <>
                            <a role="button"
                                onClick={() => handleUpdateModal(row?.id, row)}
                                id={`updateSchool${row?.id}`}
                            >
                                <Badge color="light-success" pill><CheckCircle width={"100px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`updateSchool${row?.id}`}>засах</UncontrolledTooltip>
						</>
                    }
					{/* {
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
					} */}
				</div>
            ),
            minWidth: "200px",
            maxWidth: "200px",
            center: true,
        },
	]


    return columns

}
