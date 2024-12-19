import { Edit, Printer } from 'react-feather'
import { t } from "i18next";

import { Badge } from "reactstrap";

import css from '@mstyle/style.module.css'
import './helperstyle.css'
// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas, handleEditModal, navigate) {

	// const navigate = useNavigate()

    const page_count = Math.ceil(datas.length / rowsPerPage)

	function navHandler(row, rowId){
		navigate(`/timetable/examreport/${rowId}`, { state: row })
	}

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
			header: 'lesson__name',
			name: `${t('Хичээл')}`,
			cell: (row) => (
				<div className='w-100 text-wrap'>
                    <div className={`text-wrap`}>
						{row?.lesson_code + ' ' + row?.lesson_name}
                    </div>
				</div>
            ),
			minWidth: "300px",
			sortable: true,
			center: true,
			wrap: true,
		},
		{
			header: 'begin_date',
			name: `${t('Шалгалт авах өдөр')}`,
            cell: (row) => row?.begin_date,
			minWidth: "80px",
			sortable: true,
			wrap: false,
			center: true
		},
		{
			header: 'end_date',
			name: `${t('Шалгалт дуусах өдөр')}`,
            cell: (row) => row?.end_date,
			minWidth: "80px",
			sortable: true,
			wrap: false,
			center: true
		},
		{
			header: 'teacher',
			name: `${t('Хянах багш')}`,
            cell: (row) => row?.teacher_name,
			minWidth: "180px",
			sortable: true,
			center: true,
			wrap: true,
		},
		{
			name: `${t('Онлайн шалгалт эсэх')}`,
			selector: (row) => {
				return (
					row?.is_online
					?
						<Badge color="light-success" pill>
							{t('Тийм')}
						</Badge>
					:
						<Badge color="light-primary" pill>
							{t('Үгүй')}
						</Badge>
				)
			},
            sortable: true,
			minWidth: "120px",
		},
	]

	var print_column = {
		name: `${t('Үйлдэл')}`,
		maxWidth: "80px",
		selector: (row) => (
			// Onclick хийх функц орно
			<div>
				<Edit width={"15px"} className='me-1' role='button' onClick={() => {navigate(`edit/${row.id}`)}}/>
				<Printer width={"15px"} role='button'  onClick={() => {navHandler(row,row.id)}} />
			</div>
		),
	}
	columns.push(print_column)

    return columns

}
