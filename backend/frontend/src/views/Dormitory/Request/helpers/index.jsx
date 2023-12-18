import useModal from '@hooks/useModal'
import { X, Edit } from 'react-feather'

import { t } from 'i18next'
import { useContext } from 'react'
import AuthContext from "@context/AuthContext"
import { Badge,UncontrolledTooltip, Input } from 'reactstrap'
import { state_names  } from '@utils'
import '../style.css'
import empty from "@src/assets/images/empty-image.jpg"


// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, handleEditModal, handleDelete) {

	const { showWarning } = useModal()
	const { user } = useContext(AuthContext)

    const page_count = Math.ceil(total_count / rowsPerPage)

    // /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }
    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center:true
		},
		{
			header: 'name',
			name: `${t("Барааны нэр")}`,
			selector: (row) => (row?.name),
            sortable: false,
			center:true,
			minWidth: '100px',
            maxWidth: '200px',
		},
		{
			header: 'inventory',
			name: `${t("Олгосон бараа")}`,
			selector: (row) => (row?.state==3 ? row?.inventory?.inventory_code : "" ||  row?.state==2 ? "олгоогүй": "" || row?.state==1 ? "хүлээгдэж байгаа": "" ),
            sortable: false,
			center:true,
			minWidth: '200px',
            maxWidth: '200px',
		},
		{
			header: 'description',
			name: `${t("Тайлбар")}`,
			selector: (row) => (row?.description),
			center:true,
            sortable: false,
			minWidth: '200px',
            maxWidth: '400px',
		},
		{
			name: `${t("Тоо хэмжээ")}`,
			header: 'amount',
			selector: (row) => (row?.amount),
            sortable: true,
			center:true,
			minWidth: '100px',
			maxWidth: '400px',
		},
		{
		name: `${t("Бэлэн байх шаардлагатай огноо")}`,
		header: 'deadline',
		selector: (row) => (row?.deadline),
		sortable: true,
		center:true,
		minWidth: '200px',
		maxWidth: '400px',
		},
		{
			name: `${t("Шийдвэрлэх төлөв")}`,
			header: 'state',
			selector: (row) => (state_names(row?.state)),
            sortable: true,
			center:true,
			minWidth: '200px',
            maxWidth: '400px',
		},
		{
			name: `${t("Гэмтсэн бараа")}`,
			header: 'image_old',
			selector: (row) => (
				<img  width={70} className='border' src = {row?.image_old ? row?.image_old : empty } alt=''/>

			),
            sortable: false,
			center:true,
			minWidth:'200px',
            maxWidth: '400px',
		},
		{
			name: `${t("Шинэ бараа")}`,
			header: 'image_new',
			selector: (row) => (
				<img  width={70} className='border' src = {row?.image_new ? row?.image_new : empty} alt=''/>

			),
            sortable: false,
			center:true,
			minWidth:'200px',
            maxWidth: '400px',
		},
	]
		// 2-н эрх зөвшөөрч байж үйлдэл харагдана
		if(Object.keys(user).length > 0 && user.permissions.includes('lms-dormitory-inventory-request-update')? true: false && user.permissions.includes('lms-dormitory-inventory-request-delete') ? true: false) {
			var delete_column = {
				name: t("Үйлдэл"),
				center:true,
				maxWidth: "200px",
				minWidth: "250px",
				selector: (row) => (
					<div className="text-center" style={{ width: "auto" }}>
					 {
					 	<>
					 			<a role="button" onClick={() => { handleEditModal(row?.id)} }
					 					id={`requestEdit${row?.id}`}
                                 		className={` ${[3,2].includes(row?.state) ? ` pe-none opacity-25 ` : `` } ms-1`}
					 				>
					 				<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					 			</a>
								 <UncontrolledTooltip placement='top' target={`requestEdit${row?.id}`} >Засах</UncontrolledTooltip>
					 		</>
					 }

					{
						<>
							<a role="button"
								onClick={() => showWarning({
									header: {
										title: t(`Шаардах хуудас устгах`),
									},
									question: t(`Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?`),
									onClick: () => handleDelete(row?.id),
									btnText: t('Устгах'),
								})}
								id={`complaintListDatatableCancel${row?.id}`}
								// className={` ${[1].includes(row?.state) ? ` pe-none opacity-25 ` : `` } ms-1`}

							>
								<Badge color="light-danger" pill><X width={"100px"} /></Badge>
							</a>
							<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row?.id}`} >Устгах</UncontrolledTooltip>
						</>
					}
					</div>
				),
			}
			columns.push(delete_column)
		}
	// ]
    return columns

}
