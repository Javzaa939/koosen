
import React, { Fragment } from "react";
import { Clipboard } from "react-feather";
import { UncontrolledTooltip } from "reactstrap";

import useModal from '@hooks/useModal'

import { t } from "i18next";

// Хүснэгтийн баганууд
export function getColumns(currentPage, rowsPerPage, datas, handleModal, setClicked)
{
    const page_count = Math.ceil(datas.length / rowsPerPage)

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count)
	{
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
			name: `${t('Тодорхойлолтын нэр')}`,
			selector: (row) => row?.name,
            sortable: false,
			center: true
		},
		{
			name: `${t('Үйлдэл')}`,
			selector: (row) => {
				return (
					<Fragment>
						<a
							id={`detail${row.id}`}
							onClick={() => {
								handleModal()
								setClicked(row)
							}}
						>
							<Clipboard size={15} />
						</a>
						<UncontrolledTooltip placement="top" target={`detail${row.id}`} >
							Дэлгэрэнгүй
						</UncontrolledTooltip>
					</Fragment>
				)
			},
            sortable: false,
			center: true
		},
	]

    return columns
}
