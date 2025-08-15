import useModal from '@hooks/useModal';
import { t } from 'i18next';
import { Badge, UncontrolledTooltip} from 'reactstrap'
import { Edit, X } from 'react-feather'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas, handleUpdateModal, handleDelete) {
    const { showWarning } = useModal()

    const page_count = Math.ceil(datas.length / rowsPerPage)

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
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
			name: `${t('Нэр')}`,
			selector: (row) => <span title={row?.name}>{row?.name}</span>,
			minWidth: "250px",
			wrap: true,
			left: true
		},
		{
			name: `${t('Код')}`,
			selector: (row) => <span title={row?.org_code}>{row?.org_code}</span>,
			minWidth: "250px",
			wrap: true,
			left: true

		},
		{
			name: `${t('Захирал')}`,
			selector: (row) => <span title={row?.zahiral_name}>{row?.zahiral_name}</span>,
			maxwidth: "150px",
			center: true
		},
		{
			name: `${t('Эрдмийн цол')}`,
			selector: (row) => <span title={row?.erdem_tsol_name}>{row?.erdem_tsol_name}</span>,
			maxwidth: "250px",
			center: true
		},
        // {
		// 	name: `${t('Нийтийн сүлжээ')}`,
		// 	selector: (row) => row?.social,
		// 	maxwidth: "250px",
		// 	wrap: false,
		// 	center: true
		// },
        // {
		// 	name: `${t('Вэб')}`,
		// 	selector: (row) => row?.web,
		// 	maxWidth: "250px",
		// 	wrap: false,
		// 	center: true
		// },
		// {
		// 	name: `${t('Хаяг')}`,
		// 	selector: (row) => (
		// 		<>
		// 			<div id={`address${row?.id}`} className='cursor-default'>
		// 				{row?.address}
		// 			</div>
		// 			<UncontrolledTooltip placement='top' target={`address${row?.id}`}>{row?.address}</UncontrolledTooltip>
		// 		</>
		// 	),
		// 	maxWidth: "250px",
		// 	center: true
		// },
		{
            name: `${t('үйлдэл')}`,
            selector:  (row) => (
                <div className="text-center" style={{ width: "auto" }}>
                    {
                        <>
                            <a role="button"
                                onClick={() => handleUpdateModal(row?.id, false, row)}
                                id={`updateSchool${row?.id}`}
                            >
                                <Badge color="light-primary" pill><Edit width={"100px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`updateSchool${row?.id}`}>засах</UncontrolledTooltip>
						</>
                    }
				{
					<>
						<a role="button"
							className='ms-1'
							onClick={() => showWarning({
								header: {
									title: `${t('Бүрэлдэхүүн сургууль устгах')}`,
								},
								question: `Та  ${row?.name} устгахдаа итгэлтэй байна уу?`,
								onClick: () => handleDelete(row?.id),
								btnText: 'Устгах',
							})}
							id={`complaintListDatatableCancel${row.id}`}
						>
							<Badge color="light-danger" pill><X width={"100px"} /></Badge>
						</a>
						<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row?.id}`} >Устгах</UncontrolledTooltip>
					</>
				}
				</div>
            ),
            Width: "50px",
            // minWidth: "350px",
            center: true,
        },
	]


    return columns

}
