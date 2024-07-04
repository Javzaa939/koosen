
export function getColumns (currentPage, rowsPerPage, total_count) {
    const page_count = Math.ceil(total_count / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }

    const columns = [
        {
            name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true,
        },
        {
            name: `${' Код'}`,
            selector: (row) => row?.code || row?.register,
            minWidth: "200px",
            center: true,
        },
        {
            name: `${'Овог'}`,
            selector: (row) => row?.last_name,
            minWidth: "250px",
            wrap:true,
            center: true,
        },
        {
            name: `${'Нэр'}`,
            selector: (row) => row?.first_name,
            minWidth: "250px",
            wrap:true,
            center: true,
        },
		{
            name: `${'Оноо'}`,
            selector: (row) => row?.score,
            minWidth: "50px",
            wrap:true,
            center: true,
        },
		{
            name: `${'Өгсөн хугацаа'}`,
			selector: (row) => (
				<span>{`${row?.duration !== 0 ? `${row?.duration} минут` : ''}`}</span>
			),
            minWidth: "100px",
            wrap:true,
            center: true,
        },
    ]
    return columns
}