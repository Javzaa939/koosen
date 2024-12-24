import { DownloadCloud, Edit, Printer, XSquare } from 'react-feather'
import { t } from "i18next";
import useModal from "@hooks/useModal"

import { Badge, UncontrolledTooltip } from "reactstrap";

import './helperstyle.css'
// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas, handleEditModal,handleDelete, navigate, handleDownloadScore, user) {

	// const navigate = useNavigate()
	const { showWarning } = useModal()

    const page_count = Math.ceil(datas.length / rowsPerPage)

	// function navHandler(row, rowId){
	// 	navigate(`/timetable/examreport/${rowId}`, { state: row })
	// }

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
			name: `${t('Эхлэх хугацаа')}`,
            cell: (row) => row?.begin_date,
			minWidth: "100px",
			sortable: true,
			wrap: false,
			center: true
		},
		{
			header: 'end_date',
			name: `${t('Дуусах хугацаа')}`,
            cell: (row) => row?.end_date,
			minWidth: "100px",
			sortable: true,
			wrap: false,
			center: true
		},
		{
			header: 'teacher',
			name: `${t('Хянах багш')}`,
            cell: (row) => row?.teacher_names,
			minWidth: "250px",
			sortable: true,
			center: true,
			wrap: true,
		},
		{
			name: `${t('Анги дамжаа')}`,
            cell: (row) => row?.group_names,
			minWidth: "200px",
			center: true,
			wrap: true,
		},
		{
			header: 'stype',
			name: `${t('Төрөл')}`,
            cell: (row) => row?.stype_name,
			minWidth: "150px",
			sortable: true,
			center: true,
			wrap: true,
		},
		{
			name: `${t('Онлайн эсэх')}`,
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
			minWidth: "80px",
		},
		{
			name: `${t('Үйлдэл')}`,
			center: true,
			minWidth: "50px",
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
						// Шалгалт аваад дууссан мөн онлайн шалгалт байгаад сорил төлөвтэй байна
						row?.stype === 1 && row?.is_online && row?.is_expired && user?.permissions?.includes('lms-timetable-exam-score-download') &&
						<>
							<a
								role="button"
								className='ms-25'
								onClick={() => showWarning({
									header: {
										title: `Шалгалтын дүн татах`,
									},
									question: `Та энэ шалгалтын дүн татахдаа итгэлтэй байна уу?`,
									onClick: () => handleDownloadScore(row),
									btnText: 'Дүн татах',

								})}
								id={`downloadScore${row?.id}`}
							>
								<Badge color="light-primary" pill><DownloadCloud width={"20px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`downloadScore${row.id}`} >Дүн татах</UncontrolledTooltip>
						</>
					}
					<a
						id={`requestExamDetail${row.id}`}
						className='ms-25'
						onClick={
							() => handleEditModal(row)
						}>
						<Badge color="light-info" pill><Edit width={"20px"} /></Badge>
					</a>

					<UncontrolledTooltip placement='top' target={`requestExamDetail${row.id}`} >Засах</UncontrolledTooltip>
					{
						<>
							<a
								role="button"
								className='ms-25'
								onClick={() => showWarning({
									header: {
										title: `Шалгалтын хуваарь устгах`,
									},
									question: `Та энэ шалгалтын хуваарь устгахдаа итгэлтэй байна уу?`,
									onClick: () => handleDelete(row.id),
									btnText: 'Устгах',

								})}
								id={`examDelete${row?.id}`}
							>
								<Badge color="light-danger" pill><XSquare width={"20px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`examDelete${row.id}`} >Устгах</UncontrolledTooltip>
						</>
					}
					{/* {
						<>
							<a className='ms-1'>
								<Printer width={"15px"} role='button'  onClick={() => {navHandler(row,row.id)}} />
							</a>
						</>
					} */}
				</div>
			),
		}
	]

	// var print_column = {
	// 	name: `${t('Үйлдэл')}`,
	// 	maxWidth: "80px",
	// 	minWidth: "80px",
	// 	selector: (row) => (
	// 		<div className="text-center" style={{ width: "auto" }}>
	// 				<a
	// 					id={`requestVolunteerDetail${row.id}`}
	// 					className='ms-1'
	// 					onClick={
	// 						() => handleEditModal(row?.id, row)
	// 					}>
	// 					<Badge color="light-info" pill><Edit width={"15px"} /></Badge>
	// 				</a>

	// 			<UncontrolledTooltip placement='top' target={`requestVolunteerDetail${row.id}`} >засах</UncontrolledTooltip>

	// 		</div>
	// 		// <div>
	// 		// 	{/* <Edit width={"15px"} className='me-1' role='button' onClick={() => {navigate(`edit/${row.id}`)}}/> */}
	// 		// 	<Edit width={"15px"} className='me-1' role='button' onClick={() => {handleEditModal(row?.id, row)}}/>
	// 		// 	{/* <Printer width={"15px"} role='button'  onClick={() => {navHandler(row,row.id)}} /> */}
	// 		// </div>
	// 	),
	// }
	// columns.push(print_column)

    return columns

}
