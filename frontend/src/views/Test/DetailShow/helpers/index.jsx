import React, {useState, useEffect} from "react";
import { t } from 'i18next'
import { Badge, UncontrolledTooltip } from 'reactstrap';
import { Book ,Eye} from 'react-feather'

const AVG_SCORE = 2
const MAX_SCORE = 1

export function getColumns (currentPage, rowsPerPage, datas, helpers_data, handleDetailModal,handleResultModal) {

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
            name: `${'Оюутны код'}`,
            selector: (row) => row?.code,
            minWidth: "100px",
            wrap:true,
        },
        {
            name: `${'Овог'}`,
            selector: (row) => row?.last_name,
            minWidth: "150px",
            wrap:true,
        },
        {
            name: `${'Нэр'}`,
            selector: (row) => row?.first_name,
            minWidth: "150px",
            wrap:true,
        },
        {
            name: `${'Анги'}`,
            selector: (row) => row?.group?.name,
            minWidth: "150px",
            wrap:true,
        },
        {
            name: `${'Нийт оноо'}`,
            selector: (row) => row?.challenge[0]?.take_score,
            minWidth: "100px",
            wrap:true,
        },
        {
            name: `${'Авсан оноо'}`,
            selector: (row, idx) => {
                var student_score =  0
                if(row?.challenge?.length > 1 && helpers_data?.assess === AVG_SCORE){
                    student_score = (row?.challenge[0]?.score + row?.challenge[1]?.score) / row?.challenge?.length
                }

                if(helpers_data?.assess === MAX_SCORE){
                    student_score = row?.challenge[0]?.score
                    if(row?.challenge?.length > 1){
                        var max = row?.challenge[0]?.score
                        for(let i = 0; i < row?.challenge?.length; i++){
                            if (max <= row?.challenge[i]?.score){
                                max = row?.challenge[i]?.score
                            }
                        }
                        student_score = max
                    }
                }
                return (
                    <div>
                        {student_score}
                    </div>
                )
            },
            minWidth: "100px",
            wrap:true,
        },
    ]
    columns.push(
        {
            name: `${t('Шалгалтын оролдлого')}`,
            selector:  (row, idx) => (
                <div className="text-center" style={{ width: "auto" }}  >
                    {
                        // datas[0]?.challenge?.length > 1
                        // ?
                        //     <>
                        //         <a
                        //             role="button"
                        //             onClick={() => { handleDetailModal(row?.challenge[0])} }
                        //             id={`complaintListDatatableEdit${row?.challenge[0]?.id}`}
                        //             className='me-1'
                        //         >
                        //             <Badge color="light-success" pill><Book  width={"15px"} /></Badge>
                        //         </a>
                        //         <UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row?.challenge[0]?.id}`}>Оролдлого 1</UncontrolledTooltip>

                        //         <a
                        //             id={`complaintListDatatableDetail${row?.challenge[1]?.id}`}
                        //             className='ms-1'
                        //             onClick={() => handleDetailModal(row?.challenge[1])}
                        //         >
                        //             <Badge color="light-info" pill><Book  width={"15px"} /></Badge>
                        //         </a>

                        //         <UncontrolledTooltip placement='top' target={`complaintListDatatableDetail${row?.challenge[1]?.id}`}>Оролдлого 2</UncontrolledTooltip>
                        //     </>
                        // :
                        <>
                            {/* <a
                                role="button"
                                onClick={() => { handleDetailModal(row?.challenge[0])} }
                                id={`complaintListDatatableEdit${row?.challenge[0]?.id}`}
                                className='me-1'
                            >
                                <Badge color="light-success" pill><Book  width={"15px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row?.challenge[0]?.id}`}>Оролдлого 1</UncontrolledTooltip> */}
                            <a
                                role="button"
                                onClick={() => { handleResultModal(row?.challenge[0]
                                )} }
                                id={`complaintListDatatable${row?.challenge[0]?.id}`}
                                className='me-1'
                            >
                                <Badge color="light-info" pill><Eye  width={"15px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`complaintListDatatable${row?.challenge[0]?.id}`}>Харах</UncontrolledTooltip>
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