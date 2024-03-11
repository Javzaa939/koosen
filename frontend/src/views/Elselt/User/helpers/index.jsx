import { useContext, useRef } from 'react';

import { Badge, Input }  from 'reactstrap';

import { AlertOctagon, Eye } from "react-feather";

import { UncontrolledTooltip } from "reactstrap";

import { t } from 'i18next'

import SchoolContext from "@context/SchoolContext";

import moment from 'moment'
import useApi from '@hooks/useApi';
import useLoader from "@hooks/useLoader";

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, page_count, editModal, handleDelete, user, infoModalHandler) {

	const { school_id } = useContext(SchoolContext)

	const { fetchData } = useLoader({ isFullScreen: false })

	const focusData = useRef(undefined)

	const gpaApi = useApi().elselt.gpa

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

	const focusOut = (event) => {
		if (focusData.current || focusData.current == '')
		{
			event.target.value = focusData.current
		}
	}

	const handleSetGpaResult = async(event, id, index, key) => {

		var value = event.target.value

		if(event.key === 'Enter'){
			let cdata = {
				[key]: parseFloat(value)
			}
			if (id){
				const { success } = await fetchData(gpaApi.put(cdata, id))
				if (success){
					focusData.current = undefined

					var nextElementId = `${key}-${index + 1}-input`
					var element = document.getElementById(`${nextElementId}`)

					if (element) element.focus()
				}
			}
		}
	};

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true,
			maxWidth: "80px",
			minWidth: "80px",
		},
		{
			maxWidth: "200px",
			minWidth: "200px",
			header: 'user__first_name',
			name: t("Овог нэр"),
			cell: (row) => (row?.full_name),
			sortable: true,
			center: true,
			wrap: true,
		},
        {
			maxWidth: "180px",
			minWidth: "180px",
			header: 'register',
			name: t("РД"),
			selector: (row) => row?.user?.register,
			center: true
		},
		{
			maxWidth: "250px",
			minWidth: "250px",
			header: 'profession__profession__name',
			name: 'Хөтөлбөр',
			selector: (row) => <span title={row?.profession}>{row?.profession}</span>,
            sortable: true,
			center: true,
		},
		{
			maxWidth: "200px",
			minWidth: "200px",
			header: 'gpa',
			sortable: true,
			name: t("Голч дүн"),
			selector: (row) => {
				return(
					<>
						<div className='d-flex'>
							<Input
								className='text-center'
								// id={`gpa-${row.id}-input`}
								type="number"
								step="0.1"
								min='0'
								max='4'
								bsSize='sm'
								placeholder={(`Голч дүн`)}
								defaultValue={row?.userinfo?.gpa}
								onBlur={focusOut}
								onFocus={(e) => focusData.current = (e.target.value)}
								disabled={(Object.keys(user).length > 0 && user?.is_superuser) ? false : true}
								onKeyPress={(e) => {
									handleSetGpaResult(e, `${row?.userinfo?.id}`, row?.gpa, 'gpa')
								}}
							/>
							<AlertOctagon id={`gpa-${row?.id}-input`} width={"20px"} className='ms-1' />
							<UncontrolledTooltip placement='top' target={`gpa-${row?.id}-input`} >Enter дарсан тохиолдолд бүртгэлийн дугаар хадгалагдах болно.</UncontrolledTooltip>
						</div>
					</>
				)
			},
			center: true,
		},
        {
			maxWidth: "250px",
			minWidth: "250px",
			name: t("Төгссөн сургууль"),
			selector: (row) => row?.userinfo?.graduate_school,
			center: true
		},
        {
			maxWidth: "150px",
			minWidth: "150px",
			header: 'state',
			sortable: true,
			name: t("Төлөв"),
			selector: (row) => row?.state_name,
			center: true,
		},
		{
			maxWidth: "100px",
			minWidth: "100px",
			name: t("Хүйс"),
			selector: (row) => row?.gender_name,
			center: true
		},
		{
			maxWidth: "300px",
			minWidth: "300px",
			header: 'created_at',
			sortable: true,
			name: t("Бүртгүүлсэн огноо"),
			selector: (row) => row?.created_at? moment(row?.created_at).format("YYYY-MM-DD h:mm") : '',
			center: true,
		},
		{
			maxWidth: "100px",
			minWidth: "100px",
			name: t("Үйлдэл"),
			center: true,
			selector: (row) => (
				<div>
					<Badge
						color='light-info'
						pill
						role='button'
						id={`description${row.id}`}
						onClick = {
							() => infoModalHandler(row?.id, row)}
					>
						<Eye />
					</Badge>
	 				{/* <UncontrolledTooltip placement='top' target={`description${row.id}`} >Дэлгэрэнгүй мэдээлэл</UncontrolledTooltip> */}
				</div>
			)
		},
	]

	// if(Object.keys(user).length > 0) {
	// 	var delete_column = {
	// 		name: t("Үйлдэл"),
	// 		center: true,
	// 		maxWidth: "100px",
	// 		minWidth: "100px",
	// 		selector: (row) => (
	// 			<div className="text-center" style={{ width: "auto" }}>
	// 				<a role="button" onClick={() => { editModal(row)} }
	// 					id={`edit${row?.id}`}
	// 					className="me-1"
	// 				>
	// 					<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
	// 				</a>
	// 				<UncontrolledTooltip placement='top' target={`edit${row.id}`} >Засах</UncontrolledTooltip>
	// 				{/* <a role="button" onClick={() => { handleAdd(row)} }
	// 					id={`complaintListDatatableEdit${row?.id}`}
	// 					className="me-1"
	// 				>
	// 					<Badge color="light-primary" pill><PlusCircle  width={"15px"} /></Badge>
	// 				</a>
	// 				<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`}>Хөтөлбөр нэмэх</UncontrolledTooltip>
	// 				{
	// 					<>
	// 						<a role="button"
	// 							onClick={() => showWarning({
	// 								header: {
	// 									title: t(`Элсэлт устгах`),
	// 								},
	// 								question: t(`Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?`),
	// 								onClick: () => handleDelete(row.id),
	// 								btnText: t('Устгах'),
	// 							})}
	// 							id={`complaintListDatatableCancel${row?.id}`}
	// 						>
	// 							<Badge color="light-danger" pill><X width={"100px"} /></Badge>
	// 						</a>
	// 						<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
	// 					</>
	// 				} */}
	// 			</div>
	// 		),
	// 	}
	// 	columns.push(delete_column)
	// }

    return columns

}
