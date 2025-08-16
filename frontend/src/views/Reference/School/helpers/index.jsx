import { t } from 'i18next';
import { Badge, UncontrolledTooltip} from 'reactstrap'
import { Download, Edit } from 'react-feather'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas, handleUpdateModal, handleDelete, is_hr) {

    const page_count = Math.ceil(datas.length / rowsPerPage)

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			center: true,
			minWidth: "60px",
			maxWidth: "60px",
		},
		{
			name: `${t('Нэр')}`,
			selector: (row) => <span title={row?.name}>{row?.name}</span>,
			left: true,
			minWidth: "250px",
			wrap: true,
		},
		{
			name: `${t('Англи нэр')}`,
			selector: (row) => <span title={row?.name}>{row?.name_eng}</span>,
			left: true,
			minWidth: "250px",
			wrap: true,
		},
		{
			name: `${t('Хаяг')}`,
			selector: (row) => (
				<>
					<div id={`address${row?.id}`} className='cursor-default'>
						{row?.address}
					</div>
					<UncontrolledTooltip placement='top' target={`address${row?.id}`}>{row?.address}</UncontrolledTooltip>
				</>
			),
			center: true,
			minWidth: "250px",
			wrap: true,
		},
		{
			name: `${t('Вэб')}`,
			selector: (row) => row?.web,
			center: true,
			minWidth: "250px",
			wrap: true,
		},
		{
			name: `${t('Сошиал холбоос')}`,
			selector: (row) => row?.social,
			center: true,
			minWidth: "250px",
			wrap: true,
		},
		{
			name: `${t('Лого')}`,
			selector: (row) =>
				<Badge
					color="light-info"
					pill
					tag="a"
					href={row?.logo}
  					target="_blank"
					id={`logo`}
					className={row?.logo ? `` : ` opacity-25`}
				>
					<Download width={"15px"} />
					<UncontrolledTooltip placement='top' target={`logo`}>{t('Татах')}</UncontrolledTooltip>
				</Badge>,
			center: true,
			minWidth: "70px",
			maxWidth: "70px",
		},
		{
			name: `${t('И-мэйл')}`,
			selector: (row) => row?.email,
			center: true,
			minWidth: "250px",
			wrap: true,
		},
		{
			name: `${t('Утасны дугаар')}`,
			selector: (row) => row?.phone_number,
			center: true
		},
	]

	// Сургуультай байх эсэх
	if(is_hr) {
		var add_column = {
			name: `${t('Үйлдэл')}`,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
						<>
							<a role="button"
								onClick={() => handleUpdateModal(row)}
								id={`updateSchool${row?.id}`}
							>
								<Badge color="light-primary" pill><Edit width={"100px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`updateSchool${row?.id}`}>{t('Засах')}</UncontrolledTooltip>
						</>
					}
		 		</div>
			),
			center: true,
		}
		columns.push(add_column)
	}

    return columns

}
