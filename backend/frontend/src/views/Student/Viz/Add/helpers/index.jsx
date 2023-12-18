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
            sortField: 'code',
            name: "Гадаад пасспорт",
            cell: (row) => row?.foregin_password,
            minWidth: "150px",
            maxWidth: "300px",

        },
        {
            sortField: 'code',
            name: "Регистр",
            cell: (row) => row?.register_num,
            minWidth: "150px",
            maxWidth: "300px",

        },
        {
            sortField: 'code',
            name: "Овог",
            cell: (row) => row?.last_name,
            minWidth: "150px",
            maxWidth: "300px",

        },
        {
            sortField: 'code',
            name: "Нэр",
            cell: (row) => row?.code + " " + row?.first_name,
            minWidth: "150px",
            maxWidth: "300px",

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
