import { t } from 'i18next'

import css from '@mstyle/style.module.css'

import useModal from '@hooks/useModal'

import { X, Edit, Book } from 'react-feather'
import { Badge, UncontrolledTooltip } from 'reactstrap'


// Хүснэгтийн баганууд
export function getColumns(currentPage, rowsPerPage, total_count, user, handleEditModal, handleDelete) {

    const page_count = Math.ceil(total_count / rowsPerPage)
    const { showWarning } = useModal()

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
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
            header: 'name',
            name: `${t('нэр')}`,
            selector: (row) => row?.user,
            sortable: true,
            minWidth: "250px",
            wrap: true,
            center: true,
        },
        {
            header: 'now_profession',
            name: `${t('Одоогийн хөтөлбөр')}`,
            selector: (row) => row?.now_profession,
            sortable: true,
            minWidth: "280px",
            center: true,
        },
        {
            header: 'change_profession',
            name: `${t('Сольсон хөтөлбөр')}`,
            selector: (row) => row?.change_profession,
            sortable: true,
            minWidth: "250px",
            wrap: true,
            center: true
        },
        {
            header: 'updated_user',
            name: `${t('Сольсон хэрэглэгч')}`,
            selector: (row) => row?.updated_user,
            sortable: true,
            minWidth: "250px",
            wrap: true,
            center: true
        }
    ]

    // if (Object.keys(user).length > 0) {
    //     columns.push(
    //         {
    //             name: t("Үйлдэл"),
    //             maxWidth: "150px",
    //             mINWidth: "150px",
    //             selector: (row) => (
    //                 <div className="text-center" style={{ width: "auto" }}>
    //                     <a role="button"
    //                         onClick={() => handleEditModal(row.id)}
    //                         id={`complaintListDatatableEdit${row?.id}`}>
    //                         <Badge color="light-secondary" pill><Edit width={"15px"} /></Badge>
    //                     </a>
    //                     <UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
    //                     {
    //                         user.permissions.includes('lms-service-news-delete')
    //                         &&
    //                         <>
    //                             <a
    //                                 className='ms-1'
    //                                 role="button"
    //                                 onClick={() => showWarning({
    //                                     header: {
    //                                         title: t(`Зар мэдээ`),
    //                                     },
    //                                     question: t(`Зар мэдээг устгах уу?`),
    //                                     onClick: () => handleDelete(row.id),
    //                                     btnText: t('Устгах'),
    //                                 })}
    //                                 id={`complaintListDatatableCancel${row?.id}`}
    //                             >
    //                                 <Badge color="light-danger" pill><X width={"100px"} /></Badge>
    //                             </a>
    //                             <UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
    //                         </>
    //                     }

    //                     <a
    //                         id={`complaintListDatatableDetail${row.id}`}
    //                         className='ms-1'
    //                         href={`/service/show/${row.id}`}
    //                         target={'_blank'}
    //                     >
    //                         <Badge color="light-info" pill><Book width={"15px"} /></Badge>
    //                     </a>

    //                     <UncontrolledTooltip placement='top' target={`complaintListDatatableDetail${row.id}`} >Дэлгэрэнгүй</UncontrolledTooltip>
    //                 </div>
    //             ),
    //             center: true,
    //         }
    //     )
    // }

    return columns

}
