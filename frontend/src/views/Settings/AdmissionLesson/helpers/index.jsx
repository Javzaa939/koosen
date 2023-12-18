import { Edit } from  "react-feather";

import { t } from "i18next";

import useModal from '@hooks/useModal'

import { UncontrolledTooltip } from "reactstrap";

// хүснэгтийн баганууд
export function getColumns ( currentPage, rowsPerPage, datas, handleUpdateModal, user) {

    const page_count = Math.ceil(datas.length / rowsPerPage)

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-с эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: "№",
            selector: (row, index) => (currentPage-1)* rowsPerPage + index + 1,
            maxWidth:"30px",
            center: true
        },
        {
            name: `${t('ЭЕШ-ын хичээлийн код')}`,
            cell: (row) => row?.lesson_code,
			minWidth: "280px",
			center: true
        },
        {
            name: `${t('ЭЕШ-ын хичээлийн нэр')}`,
			selector: (row) => row?.lesson_name,
			minWidth: "280px",
			center: true
        }


    ]
    if(Object.keys(user).length > 0 && user.permissions.includes('lms-settings-admissionlesson-update')? true : false) {
		var UpdateColumn =  {
			name: `${t('Үйлдэл')}`,
			minWidth: "380px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
					<a  role="button"
						id = {`AddmissionUpdate${row?.id}`}
						onClick={
									() => handleUpdateModal(row?.id)
								}>

						<Edit color='#b4b7bd' width={"15px"} />
					</a>
					}
					<UncontrolledTooltip placement='top' target={`AddmissionUpdate${row.id}`} >Засах</UncontrolledTooltip>
				</div>
			),
		}

		columns.push(UpdateColumn)
    }
    return columns
}
