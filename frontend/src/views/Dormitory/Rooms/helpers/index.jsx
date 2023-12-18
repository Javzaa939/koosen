import { t } from 'i18next'
import css from '@mstyle/style.module.css'

import useModal from "@hooks/useModal"
import AuthContext from "@context/AuthContext"
import { useContext } from 'react'

import { X, Edit } from 'react-feather'
import { Badge, UncontrolledTooltip } from 'reactstrap'

import { get_gender_list } from "@utils"

export function getColumns (currentPage, rowsPerPage, total_count, editModal, handleDelete) {
    const page_count = Math.ceil(total_count / rowsPerPage)
    const { showWarning } = useModal()
    const { user } = useContext(AuthContext)

    if (currentPage > page_count) {
        currentPage =1
    }

    function getGenderName(id) {
        const gender_option = get_gender_list()
        var name = ''

        const gender_name = gender_option.find(gender => gender.id === id)
        if(gender_name) name = gender_name.name

        return name
    }

    const columns = [
            {
                name: "№",
                selector: (row, index) => (currentPage-1) * rowsPerPage + 1 + index,
                maxWidth: "30px",
                center: "true"
            },
            {
                sortField: "room_number",
                name: `${t('Өрөөний дугаар')}`,
                selector: (row) => (row?.room_number),
                minWidth: "150px",
                center: "true",
                sortable: true,
            },
            {
                sortField: "room_type",
                name: `${t('Өрөөний төрөл')}`,
                selector: (row) => row?.room_type?.name,
                minWidth: "150px",
                center: "true",
                sortable: true,
            },
            {
                sortField: "gateway",
                name: `${t('Орц')}`,
                selector: (row) => row?.gateway,
                minWidth: "150px",
                center: "true",
                sortable: true,
            },
            {
                sortField: "floor",
                name: `${t('Давхар')}`,
                selector: (row) => row?.floor,
                minWidth: "150px",
                center: "true",
                sortable: true,
            },
            {
                sortField: "gender",
                name: `${t('Хүйс')}`,
                selector: (row) => getGenderName(row?.gender),
                minWidth: "150px",
                center: "true",
            },
            {
                sortField: "door_number",
                name: `${t('Хаалганы дугаар')}`,
                selector: (row) => row?.door_number,
                minWidth: "150px",
                center: "true",
                sortable: true,
            },
        ]
        if(Object.keys(user).length > 0) {
            var delete_column = {
                name: t("Үйлдэл"),
                maxWidth: "180px",
                minWidth: '180px',
                selector: (row) => (
                    <div className="text-center" style={{ width: "auto" }}>
                        <a role="button" onClick={() => { editModal(row.id)} }
                                id={`complaintListDatatableEdit${row?.id}`}
                                className='me-1'
                            >
                            <Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
                        </a>
                        <UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
                        {
                            user.permissions.includes('lms-dormitory-rooms-delete')&&
                            <>
                            <a role="button"
                            onClick={() => showWarning({
                                header: {
                                    title: `${t('Өрөө устгах')}`,
                                },
                                question: `${t(`Та '${row.room_number}' дугаартай өрөөг устгахдаа итгэлтэй байна уу?`)}`,
                                onClick: () => handleDelete(row.id),
                                btnText: 'Устгах',
                                })}
                                id={`complaintListDatatableCancel${row?.id}`}
                            >
                                <Badge color="light-danger" pill><X width={"100px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
                            </>
                        }
                    </div>
                ),
            }
            columns.push(delete_column)
        }
    return columns
}
