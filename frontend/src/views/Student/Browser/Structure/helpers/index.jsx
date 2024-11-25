import { Edit, X} from "react-feather";
import { useContext } from "react"

import { t } from "i18next";

import useModal from '@hooks/useModal';

import { Badge, UncontrolledTooltip } from "reactstrap";
import AuthContext from '@context/AuthContext'


// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas,  handleUpdateModal, handleDelete) {

    const page_count = Math.ceil(datas.length / rowsPerPage)

	const { showWarning } = useModal()
    const { user } = useContext(AuthContext)


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
			name: `${t('Гарчиг')}`,
            cell: (row) => row?.title,
			minWidth: "80px",
			center: true,
		},
		{
			name: `${t('Файл')}`,
			selector: (row) => <a href={row?.file} className="ms-1">{row?.file.toString().split("/").pop()}</a>,
            sortable: true,
			minWidth: "80px",
			center: true
		},
		{
			name: `${t('линк')}`,
			selector: (row) => <a href={row?.link} className="ms-1">{row?.link}</a>,
			minWidth: "150px",
			center: true
		},
	]

	if(Object.keys(user).length > 0 && user.permissions.includes('lms-browser-structure-update'))
	{
		var UpdateColumn = {
			name: `${t('Үйлдэл')}`,
			minWidth: "180px",
			selector: (row) => (
				<>
					{/* {
						<a
							id={`activeYearUpdate${row?.id}`}
							onClick={
								() => handleUpdateModal(row?.id)
							}
							className="me-50"
						>

							<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
						</a>
					}
					<UncontrolledTooltip placement='top' target={`activeYearUpdate${row?.id}`} >Засах</UncontrolledTooltip> */}
					{	user.permissions.includes('lms-browser-structure-delete') &&
						<>
						<a role="button"
							onClick={() => showWarning({
								header: {
									title: t(`${row?.title} устгах`),
								},
								question: t(`Та ${row?.title} мэдээллийг устгахдаа итгэлтэй байна уу?`),
								onClick: () => handleDelete(row?.id),
								btnText: t('Устгах'),
							})}
							id={`delete${row?.id}`}
						>
							<Badge color="light-danger" pill><X width={"100px"} /></Badge>
						</a>
						<UncontrolledTooltip placement='top' target={`delete${row?.id}`} >Устгах</UncontrolledTooltip>
						</>
					}
				</>
			),
			center: true
		}
		columns.push(UpdateColumn)
	}
    return columns

}
