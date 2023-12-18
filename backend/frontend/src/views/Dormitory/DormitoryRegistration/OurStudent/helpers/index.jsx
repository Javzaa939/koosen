import useModal from '@hooks/useModal'

import { t } from 'i18next'

import { Badge, UncontrolledTooltip } from 'reactstrap'

import { Book, CheckCircle } from 'react-feather'

export function getColumns (currentPage, rowsPerPage, total_count, handleRequestSolved, handleViewModal) {

	const { showWarning } = useModal()

    const page_count = Math.ceil(total_count / rowsPerPage)

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
			header: 'student',
			name: t("Оюутан"),
			selector: (row) => row?.student?.code + ' '+ row?.full_name,
            sortable: true,
            center: true,
            minWidth: "180px"
        },
        {
            header: 'school',
            name: t("Сургууль"),
            selector: (row) => <span title={row?.school_name}>{row?.school_name}</span>,
            sortable: true,
            center: true,
            minWidth: '200px',
        },
        {
            header: 'group',
            name: t("Анги"),
            selector: (row) => row?.student?.group?.name,
            sortable: true,
            center: true,
            minWidth: "200px"
        },
        {
            header: 'room_name',
            name: t("Өрөөний дугаар"),
            selector: (row) => row?.room_name,
            center: true,
            minWidth: "120px"
        },
        {
            header: 'payment',
            name: t("Төлөх дүн"),
            selector: (row) => row?.payment,
            center: true,
            minWidth: "120px"
        },
        {
            header: 'ransom',
            name: t("Барьцаа төлбөр"),
            selector: (row) => row?.ransom,
            center: true,
            minWidth: "120px"
        },
        {
            header: 'in_balance',
            name: t("Төлсөн дүн"),
            selector: (row) => row?.in_balance,
            center: true,
            minWidth: "120px"
        },
		{
			header: 'solved_flag',
			name: t("Шийдвэрийн төрөл"),
			selector: (row) => row?.solved_flag_name,
            sortable: true,
            center: true,
            minWidth: '230px'
        },
        {
            name: `${t('Үйлдэл')}`,

            selector:  (row) => (
                <div className="text-center" style={{ width: "auto" }}>
                        <a
                            id={`requestVolunteerDetail${row.id}`}
                            className='ms-1'
                            onClick={
                                () => handleViewModal(row?.id, row)
                            }>
                            <Badge color="light-info" pill><Book  width={"15px"} /></Badge>
                        </a>

                <UncontrolledTooltip placement='top' target={`requestVolunteerDetail${row.id}`} >Дэлгэрэнгүй</UncontrolledTooltip>
                    {
                        <>
                            <a role="button"
                                onClick={() => handleRequestSolved(row?.id, false, row)}
                                id={`tutorUpdate${row?.id}`}
                                className={` ${[2, 3, 4].includes(row?.solved_flag) ? ` pe-none opacity-25 ` : `` } ms-1`}
                            >
                                <Badge color="light-success" pill><CheckCircle width={"100px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`tutorUpdate${row?.id}`}>Шийдвэрлэх</UncontrolledTooltip>
						</>
                    }
				</div>
            ),
            minWidth: "230px",
            maxWidth: "230px",
            center: true,
        },
        // {
        //     name: t("Дэлгэрэнгүй"),
        //     minWidth: "180px",
        //     center: true,
        //     cell: (row) => (
        //         row?.solved_flag == 1
        //         ?
        //             <Button color='primary' size='sm' onClick={() => handleRequestSolved(row?.id)}>
        //                 Шийдвэрлэх
        //             </Button>
        //         :
        //             <Button color='primary' size='sm' onClick={() => handleViewModal(row?.id, row)}>
        //                 Харах
        //             </Button>
        //     ),
        //     ignoreRowClick: true,
        //     button: true,
        // },
	]

    return columns;

}
