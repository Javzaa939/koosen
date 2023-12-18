import { t } from 'i18next';
import { Badge, UncontrolledTooltip} from 'reactstrap'
import { CheckCircle} from 'react-feather'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas, handleUpdateModal) {

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			name: `${t('Хөтөлбөрийн багийн нэр')}`,
			selector: (row) => <span title={row?.name}>{row?.name}</span>,
            sortable: true,
			width: "250px",
			center: true
		},
		{
			name: `${t('Салбар сургууль')}`,
			selector: (row) => <span title={row?.school}>{row?.school}</span>,
            sortable: true,
			width: "250px",
			center: true
		},
		{
			name: `${t('Багийн ахлагч')}`,
			selector: (row) => row?.leaders,
            sortable: true,
			minWidth: "120px",
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
            name: `${t('үйлдэл')}`,

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
				</div>
            ),
            minWidth: "230px",
            maxWidth: "230px",
            center: true,
        },
	]


    return columns

}
