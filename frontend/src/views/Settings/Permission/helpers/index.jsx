import { Edit, Delete } from "react-feather";
import { UncontrolledTooltip } from "reactstrap";
import { t } from "i18next";

import useModal from "@hooks/useModal";


export function getColumns(currentPage, rowsPerPage, datas, handleUpdateModal, handleDeleteModal)
{
    const { showWarning } = useModal()

    const page_count = Math.ceil(datas / rowsPerPage)

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count)
    {
        currentPage = 1
    }

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "70px",
			minWidth: "70px",
			width: "70px",
			center: true
		},
		{
			header: 'name',
			name: `${t('Эрхийн нэр')}`,
            cell: (row) => <div className="heightThreeDots" title={row?.name}>{row?.name}</div>,
			left: true,
            sortable: true,
            minWidth: "200px",
            center: true
		},
		{
            header: 'description',
			name: `${t('Тайлбар')}`,
			cell: (row) => <div className="heightThreeDots" title={row?.description}>{row?.description}</div>,
			left: true,
			sortable: true,
            minWidth: "300px",
            wrap: true,
            center: true
		},
		{
            header: 'created_at',
			name: `${t('Үүссэн')}`,
			selector: (row) => <div className="heightThreeDots" title={row?.created_at}>{row?.created_at}</div>,
			left: true,
            sortable: true,
            minWidth: "260px",
            center: true
        },
        {
            name: `${t('Үйлдэл')}`,
            maxWidth: "80px",
            selector: (row) => (
                <div className="text-center" style={{ width: "auto" }}>
                    <a
                        role="button"
                        id={`permissionUpdate${row?.id}`}
                        onClick={() => handleUpdateModal(row)}
                    >
                        <Edit color='#b4b7bd' width={"15px"}/>
                    </a>
					<UncontrolledTooltip placement='top' target={`permissionUpdate${row.id}`} >Засах</UncontrolledTooltip>
                    <a
                        role="button"
                        id={`permissionDelete${row?.id}`}
                        className="ms-1"
                        onClick={
                            () => showWarning({
                                header: {
                                    title: `${t('Эрх устгах')}`,
                                },
                                question: `Та "${row?.name}" эрхийг устгахдаа итгэлтэй байна уу?`,
                                onClick: () => handleDeleteModal(row?.id),
                                btnText: 'Устгах',
                            })
                        }
                    >
                        <Delete color='#FF0041' width={"15px"}/>
                    </a>
					<UncontrolledTooltip placement='top' target={`permissionDelete${row.id}`} >Устгах</UncontrolledTooltip>
				</div>
            )
        }
	]

    return columns
}
