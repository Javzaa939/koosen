import { useState } from 'react'

import { t } from 'i18next'

import { Badge, UncontrolledTooltip } from 'reactstrap'

import { Book, Edit } from 'react-feather'

import { get_day } from '@utils'

export function getColumns (currentPage, rowsPerPage, total_count, handleRequestDetail, handleEditModal) {

    const page_count = Math.ceil(total_count / rowsPerPage)

    const [weekend_option, setWeekends] = useState(get_day())

    if (currentPage > page_count) {
        currentPage = 1
    }

    // Гарагуудын нэрийг олох функц
    function getWeekendName(days) {
        const week_names = []
        const weekends = JSON.parse(days);
        weekends.map((week) => {
            var selected = weekend_option.find((e) => e.id === week)
            if(selected) {
                week_names.push(selected.name)
            }
        })
        return week_names.join(', ')
    }

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
        {
			header: 'name',
			name: t("Сургалтын нэр"),
            selector: (row) => row?.name,
            sortable: true,
            center: true,
            minWidth: "180px"
        },
        {
            header: 'mount_count',
            name: t("Хичээллэх сар"),
            selector: (row) => row?.mount_count,
            center: true,
            sortable: true,
            minWidth: '200px',
            maxWidth: '250px',
        },
        {
            header: 'week_day',
            name: t("Хичээллэх гарагууд"),
            selector: (row) => getWeekendName(row?.week_day),
            center: true,
            sortable: true,
            minWidth: '250px',
            maxWidth: '250px',
            wrap: true,
        },
		{
			header: 'accepted_count',
			name: t("Долоо хоногт хичээллэх тоо"),
			selector: (row) => row?.accepted_count,
            sortable: true,
            center: true,
            minWidth: '280px',
            maxWidth: '250px'
        },
        {
			header: 'payment',
			name: t("Төлбөр"),
			selector: (row) => row?.payment,
            sortable: true,
            center: true,
            minWidth: '200px',
            maxWidth: '250px'
        },
        {
			header: 'is_freetime',
			name: t("Чөлөөт цагийн хуваарьтай эсэх"),
			selector: (row) => (
                row?.is_freetime
                ?
                    <Badge color="light-success" pill>
                        {t('Тийм')}
                    </Badge>
                :
                    <Badge color="light-primary" pill>
                        {t('Үгүй')}
                    </Badge>
            ),
            sortable: true,
            center: true,
            minWidth: '300px',
            maxWidth: '250px'
        },
        {
			header: 'description',
			name: t("Тайлбар"),
			selector: (row) => row?.description || 'Хоосон байна',
            sortable: true,
            center: true,
            minWidth: '230px'
        },
        {
			name: t("Үйлдэл"),
			maxWidth: "150px",
            center: true,
			selector: (row) => (
				<div className="text-center" style={{ width: "auto" }}>
                    <a role="button"
                        id={`complaintListDatatableDetail${row.id}`}
                        onClick={() => handleRequestDetail(row?.id, row)}
                        className={`me-1`}
                    >
                        <Badge color="light-info" pill><Book width={"100px"} /></Badge>
                    </a>
                    <UncontrolledTooltip placement='top' target={`complaintListDatatableDetail${row.id}`}>Дэлгэрэнгүй</UncontrolledTooltip>

					<a role="button" onClick={() => {handleEditModal(row.id, true)} }
                        id={`complaintListDatatableEdit${row?.id}`}
                        className='me-1'
                    >
						<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
				</div>
			),
		}
	]

    return columns;

}
