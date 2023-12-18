import { Edit } from "react-feather";

import { t } from "i18next";

import useModal from '@hooks/useModal'

import { UncontrolledTooltip } from "reactstrap";

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas, handleUpdateModal, user) {

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
			name: `${t('Суралцах хэлбэрийн код')}`,
            cell: (row) => row?.learn_code,
			center: true,
			maxWidth: "360px"
		},
		{
			name: `${t('Суралцах хэлбэрийн нэр')}`,
			selector: (row) => row?.learn_name,
			center: true,
			maxWidth: "750px"
		},
	]

	if(Object.keys(user).length > 0 && user.permissions.includes('lms-settings-learningstatus-update')? true : false) {
		var UpdateColumn =  {
			name: `${t('Үйлдэл')}`,
			minWidth: "160px",
            maxWidth: "150px",
			center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
					{
					<a  role="button"
						id = {`LearningUpdate${row?.id}`}
						onClick={
									() => handleUpdateModal(row?.id)
								}>

						<Edit color='#b4b7bd' width={"15px"} />
					</a>
					}
					<UncontrolledTooltip placement='top' target={`LearningUpdate${row.id}`} >Засах</UncontrolledTooltip>
				</div>
			),
		}

		columns.push(UpdateColumn)
	}
    return columns

}
