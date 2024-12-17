import React, { useState, useEffect } from "react";
import { t } from 'i18next'
import { Badge, UncontrolledTooltip } from 'reactstrap';
import { Eye } from 'react-feather'


export function getColumns(currentPage, rowsPerPage, datas, handleResultModal) {

    const page_count = Math.ceil(datas?.length / rowsPerPage)

    if (currentPage > page_count) {
        currentPage = 1
    }
    const columns = [
        {
            name: "№",
            selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
            maxWidth: "30px",
            center: true,
        },
        {
            name: `${'Шалгалтын нэр'}`,
            selector: (row) => row?.challenge_name,
            minWidth: "100px",
            wrap: true,
        },
        {
            name: `${'Оюутны код'}`,
            selector: (row) => row?.student_code,
            minWidth: "100px",
            wrap: true,
        },
        {
            name: `${'Нэр'}`,
            selector: (row) => row?.student_name,
            minWidth: "100px",
            wrap: true,
        },
        {
            name: `${'Нийт оноо'}`,
            selector: (row) => row?.take_score,
            minWidth: "100px",
            wrap: true,
        },
        {
            name: `${'Авсан оноо'}`,
            selector: (row) => row?.score,
            minWidth: "100px",
            wrap: true,
        },
        {
            name: `${'Хувь үнэлгээ'}`,
            selector: (row) => row?.huvi_unelgee,
            minWidth: "100px",
            wrap: true,
        },
        {
            name: `${'Үсгэн үнэлгээ'}`,
            selector: (row) => row?.usgen_unelgee,
            minWidth: "30px",
            wrap: true,
        },
    ]
    columns.push(
        {
            name: `${t('Шалгалтын оролдлого')}`,
            selector: (row, idx) => (
                <div className="text-center" style={{ width: "auto" }}  >
                    {<>
                        <a
                            role="button"
                            onClick={() => {
                                handleResultModal(row
                                )
                            }}
                            id={`complaintListDatatable${row?.id}`}
                            className='me-1'
                        >
                            <Badge color="light-info" pill><Eye width={"15px"} /></Badge>
                        </a>
                        <UncontrolledTooltip placement='top' target={`complaintListDatatable${row?.id}`}>Харах</UncontrolledTooltip>
                    </>
                    }
                </div>
            ),
            center: true,
            minWidth: "50px",
        },
    )
    return columns
}