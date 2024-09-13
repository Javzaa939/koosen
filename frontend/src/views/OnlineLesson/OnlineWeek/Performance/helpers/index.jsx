import { t } from 'i18next';
import { Badge, UncontrolledTooltip } from 'reactstrap';
import { X } from 'react-feather';
import useModal from "@hooks/useModal";
export function getColumns (currentPage, rowsPerPage, total_count, handleDelete) {

    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

	const { showWarning } = useModal();

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
		},
		{
			header: 'Оюутны код',
			name: t("Оюутны код"),
			selector: (row) => row?.code,
			center: true,
		},
		{
			name: `${t("Овог")}`,
			selector: (row) => (row?.last_name),
			center: true,
			width: '350px'
		},
		{
			header: 'Нэр',
			name: t("Нэр"),
			selector: (row) => row?.first_name,
			center: true,
		},
		{
			name: t("Регистр"),
			selector: (row) => row?.register_num,
			center: true,
		},
		{
			header: 'Анги',
			name: t("Анги"),
			selector: (row) => row?.group_name,
			center: true,
		},
		{
			name: t("Үйлдэл"),
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
						<a role="button"
							onClick={() => showWarning({
								header: {
									title: t(`Мэдээлэл устгах`),
								},
								question: t(`Та ${row?.code} ${row?.first_name} оюутныг цахим хичээлээс устгахдаа итгэлтэй байна уу?`),
								onClick: () => handleDelete(row?.id),
								btnText: t('Устгах'),
							})}
							id={`complaintListDatatableCancel${row?.id}`}
						>
							<Badge color="light-danger" pill><X width={"100px"} /></Badge>
						</a>
						<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
					</div>
			),
			center: true,
		}
	]

    return columns
}
