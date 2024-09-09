import { defaultThemes } from 'react-data-table-component';

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas) {

    const page_count = Math.ceil(datas.length / rowsPerPage)

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }


    const columns = [
        {
            sortField: 'id',
            name: '№',
            center: true,
            width: '11%',
            selector: (row, idx) => (
                <div>
                    {rowsPerPage * (currentPage > 1 && currentPage - 1) + idx + 1}
                </div>
            ),
            style: {
                textAlign: 'left'
            },
        },
        {
            name: "Овог",
            cell: (row) => row?.last_name,
            minWidth: "150px",
        },
        {
            name: "Нэр",
            selector: (row) => (row?.first_name),
            minWidth: "200px",
            wrap: true
        },
        {
            name: "Регистрийн дугаар",
            selector: (row) => (row.register),
        },
        {
            name: "Хүйс",
            selector: (row) => (
                <div>
                    {
                        ['1', '3', '5', '7', '9'].includes(row?.gender)
                        ?
                        'Эрэгтэй'
                        :
                        'Эмэгтэй'
                    }
                </div>
            ),
        },
    ];
    return columns
}

export const customStyles = {
    header: {
		style: {
            fontSize: "14px",
		},
	},
	headRow: {
		style: {
            color: "white",
            fontSize: "11px",
            backgroundColor: "#008cff",
			borderTopStyle: 'solid',
			borderTopWidth: '1px',
			borderTopColor: defaultThemes.default.divider.default,
		},
	},
	headCells: {
		style: {
            minHeight: "42px",
			'&:not(:last-of-type)': {
				borderRightStyle: 'solid',
				borderRightWidth: '1px',
				borderRightColor: defaultThemes.default.divider.default,
			},
		},
	},
	cells: {
		style: {
			'&:not(:last-of-type)': {
				borderRightStyle: 'solid',
				borderRightWidth: '1px',
				borderRightColor: defaultThemes.default.divider.default,
			},
		},
	},
};
