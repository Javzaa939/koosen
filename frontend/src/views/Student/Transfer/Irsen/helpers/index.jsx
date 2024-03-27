import { PlusCircle, ExternalLink } from 'react-feather'
import { t } from 'i18next';
import { Badge } from 'reactstrap';

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, UpdateModal,  handleOpenModal) {

	const page_count = Math.ceil(total_count / rowsPerPage)

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
			header: 'code',
			name: `${t('Оюутны код')}`,
			selector: (row)=> row?.student?.code + ' ' +row?.student?.last_name[0] + '.' + row?.student?.first_name,
            sortable: true,
			minWidth: "250px",
			center: true,
			wrap:true
		},
		{
			header: 'school',
			name: `${t('Хаанаас шилжсэн')}`,
			selector: (row) => <span title={`${row?.student?.school_name}`}>{row?.student?.school_name}</span>,
            sortable: true,
			minWidth: "80px",
			center: true,
		},
		{
			header: 'school_pro',
			name: `${t('Суралцах мэргэжил')}`,
			selector: (row) => <span title={`${row?.pro_name}`}>{row?.pro_name}</span>,
            sortable: true,
			minWidth: "80px",
			center: true,
		},
        {
			header: 'code',
			name: `${t('Оюутны шинэ код')}`,
			selector: (row) => row?.student_new?.code,
            sortable: true,
			minWidth: "50px",
			center: true
        },
		{
			header: 'statement_name',
			name: `${t('Тушаал')}`,
			selector: (row) => row?.statement,
            sortable: true,
			minWidth: "50px",
			center: true
        },
		{
			header: 'statement_date',
			name: `${t('Тушаалын огноо')}`,
			selector: (row) => row?.statement_date,
            sortable: true,
			minWidth: "80px",
			center: true
        },
		{
			header: 'score',
			name: `${t('Дүн дүйцүүлэх')}`,
			selector: (row) => {
				return (
					row?.is_solved === 1
					?
						<Badge color="light-info" pill>
							{t(row.corres_type)}
						</Badge>
					:
                        row?.is_solved === 2
                    ?
						<Badge color="light-warning" pill>
							{t('Цуцалсан')}
						</Badge>
                    :
						row?.is_solved === 3
						?
							<Badge color="light-success" pill>
								{t('Зөвшөөрсөн')}
							</Badge>
						:
							<Badge color="light-danger" pill>
								{t('Татгалзсан')}
							</Badge>
				)
			},
			minWidth: "50px",
			center: true
        },
		{
			header: 'score',
			name: `${t('Дүн дүйцүүлэх')}`,
			selector: (row) => {
				var crow = row?.student
				crow['correspond_type'] = 3
				crow['now_group'] = row?.group
				crow['corres_type'] = row?.corres_type
				return (
					<div role="button" onClick={ () => { handleOpenModal(crow) }} >
						<Badge color="light-success" pill><PlusCircle width={"15px"}/></Badge>
					</div>
				)
			},
			minWidth: "50px",
			center: true
        },
		{
			name: `${t('Шийдвэрлэх')}`,
			selector: (row) =>
			{
				var crow = row?.student
				return (
					<div  style={{ width: "auto" }}>
						<a role="button" onClick={() => { UpdateModal(crow, row?.id)} }>
							<Badge color="light-primary" pill><ExternalLink width={"15px"} /></Badge>
						</a>
					</div>
				)
			},
            sortable: true,
			minWidth: "70px",
			center: true
		},
	]

    return columns

}
