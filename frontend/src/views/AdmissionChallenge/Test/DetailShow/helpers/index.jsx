export function getColumns (currentPage, rowsPerPage, datas) {

    const page_count = Math.ceil(datas?.length / rowsPerPage)

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
            name: `${'Овог'}`,
            selector: (row) => row?.elselt_user?.last_name,
            minWidth: "150px",
            wrap:true,
        },
        {
            name: `${'Нэр'}`,
            selector: (row) => row?.elselt_user?.first_name,
            minWidth: "150px",
            wrap:true,
        },
        {
            name: `${'Регистр'}`,
            selector: (row) => row?.elselt_user?.register,
            minWidth: "150px",
            wrap:true,
        },
        {
            name: `${'И-мэйл'}`,
            selector: (row) => row?.elselt_user?.email,
            minWidth: "150px",
            wrap:true,
        },
        {
            name: `${'Хөтөлбөр'}`,
            selector: (row) => row?.profession_name,
            minWidth: "150px",
            wrap:true,
        },
        {
            name: `${'Нийт оноо'}`,
            selector: (row) => row?.take_score,
            minWidth: "100px",
            wrap:true,
        },
        {
            name: `${'Авч байгаа оноо'}`,
            selector: (row) => row?.still_score,
            minWidth: "100px",
            wrap:true,
        },
        {
            name: `${'Авсан оноо'}`,
            selector: (row) =>row?.score,
            minWidth: "100px",
            wrap:true,
        },
    ]
    return columns
}