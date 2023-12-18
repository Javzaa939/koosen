import { t } from 'i18next';

import { Button, Badge, UncontrolledTooltip } from 'reactstrap'

import { Book, CheckCircle } from 'react-feather'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, handleRequestSolved)
{
	const page_count = Math.ceil(total_count / rowsPerPage)

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
		currentPage = 1
    }

	const solved_type_color = (solved_flag) => {
        let color = ''
        let solved_flag_name = ''
        if (solved_flag === 1) {
            color = 'light-primary'
            solved_flag_name = 'ИЛГЭЭСЭН'
        }
        else if (solved_flag === 2) {
            color = 'light-warning'
            solved_flag_name = 'БУЦААСАН'
        }
        else if (solved_flag === 3) {
			color = 'light-primary'
			solved_flag_name = 'ЗӨВШӨӨРСӨН'
        }
        else if (solved_flag === 4) {
			color = 'light-danger'
			solved_flag_name = 'ТАТГАЛЗСАН'
        }

        return (
			<Badge color={color} pill>
				{solved_flag_name}
			</Badge>
        )
    }

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			header: 'student',
			name: `${t('Оюутан')}`,
			selector: (row) => {
				return <a className='text-decoration-underline' href={`/student/${row.student.id}/info/`} target="_blank" >{row?.student?.full_name}</a>
			},
            sortable: true,
			minWidth: "180px",
			wrap: true,
		},
		{
			header: 'stipent',
			name: `${t('Тэтгэлгийн нэр')}`,
			selector: (row) => row?.stipent?.stipend_type?.name,
			minWidth: "180px",
			sortable: true,
			wrap: true,
        },
		{
			header: 'request',
			name: `${t('Хүсэлт')}`,
			selector: (row) => row?.request,
			minWidth: "200px",
			wrap: true,
        },
		{
			header: 'solved_message',
			name: `${t('Шийдвэрийн тайлбар')}`,
			selector: (row) => row?.solved_message || 'Хоосон байна',
			minWidth: "200px",
			wrap: true
        },
		{
			header: 'solved_flag',
			name: `${t('Шийдвэрийн төрөл')}`,
			selector: (row) => {
				return (
					row?.solved_flag==1 && !row?.check_stipend ?
						<Badge color="light-danger" pill>
							{t('Дууссан')}
						</Badge>
					// :
					// row?.solved_flag == 1?
					// 	<a role="button" onClick={() => handleRequestSolved(row?.id)}>
					// 		{t('Шийдвэрлэх')}
					// 	</a>
					: solved_type_color(row?.solved_flag)
				)
			},
			minWidth: "180px",
			center: true
		},

		{
            name: `${t('Үйлдэл')}`,

            selector:  (row) => (
                <div className="text-center" style={{ width: "auto" }}>
                        <a
                            id={`requestStipendDetail${row.id}`}
                            className='ms-1'
                            onClick={
                                () => handleRequestSolved(row?.id, true, row)
                            }>
                            <Badge color="light-info" pill><Book  width={"15px"} /></Badge>
                        </a>

                   <UncontrolledTooltip placement='top' target={`requestStipendDetail${row.id}`} >Дэлгэрэнгүй</UncontrolledTooltip>
                    {
						// row?.solved_flag == 1?
                        <>
                            <a role="button"
                                onClick={() => handleRequestSolved(row?.id, false, row)}
                                id={`StipendUpdate${row?.id}`}
                                className={` ${[2, 3, 4].includes(row?.solved_flag) ? ` pe-none opacity-25 ` : `` } ms-1`}
                            >
                                <Badge color="light-success" pill><CheckCircle width={"100px"} /></Badge>
                            </a>
                            <UncontrolledTooltip placement='top' target={`StipendUpdate${row?.id}`}>Шийдвэрлэх</UncontrolledTooltip>
						</>
                    }
				</div>
            ),
            minWidth: "230px",
            maxWidth: "230px",
            center: true,
        },
	]

    return columns

}




