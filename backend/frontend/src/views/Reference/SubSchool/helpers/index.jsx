import useModal from '@hooks/useModal';
import { t } from 'i18next';
import { Badge, UncontrolledTooltip} from 'reactstrap'
import { CheckCircle } from 'react-feather'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas, handleUpdateModal, user) {
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
            sortable: true,
			width: "250px",
			wrap: true,
			center: true
		},
		{
			name: `${t('Захирал')}`,
			selector: (row) => <span title={row?.zahiral_name}>{row?.zahiral_name}</span>,
            sortable: true,
			width: "250px",
			wrap: true,
			center: true
		},
        {
			name: `${t('Нийтийн сүлжээ')}`,
			selector: (row) => row?.social,
			width: "250px",
			wrap: false,
			center: true
		},
        {
			name: `${t('Вэб')}`,
			selector: (row) => row?.web,
			maxWidth: "250px",
			wrap: false,
			center: true
		},
		{
			name: `${t('Хаяг')}`,
			selector: (row) => row?.address,
			maxWidth: "250px",
			wrap: true,
			center: true
		},
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
                                <Badge color="light-success" pill><CheckCircle width={"100px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`updateSchool${row?.id}`}>засах</UncontrolledTooltip>
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
