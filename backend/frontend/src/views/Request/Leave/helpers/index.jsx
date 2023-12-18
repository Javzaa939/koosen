
import { useContext } from "react"

import { useTranslation } from 'react-i18next'
import { Link } from "react-router-dom"
import { Badge, UncontrolledTooltip, Button } from 'reactstrap'

import { Printer, Book, Square, CheckSquare, AlertCircle, XSquare } from 'react-feather'

import AuthContext from "@context/AuthContext"

import { zeroFill } from "@utils"
import { COMPLAINT_UNIT_BMA_ID } from '@utility/consts'

export function getColumns (currentPage, rowsPerPage, total_count, roleMenus, handleRequestSolve, handleRequestDetail)
{
    const { t } = useTranslation()
    const { user } = useContext(AuthContext)

    var isHaveBma = false
    var countBma = 0
    var countBmaIsSolved = 0

	const page_count = Math.ceil(total_count / rowsPerPage)

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count)
    {
        currentPage = 1
    }

	/** Тухайн шийдвэрлэх нэгж хүсэлтийг шийдвэрлэсэн эсэх */
	function request_answer(row, unit)
    {
		var answers = row?.answers

		var f_answer = answers.find((answer) => {
			if (answer?.id === unit?.id) return answer
		})

		if (f_answer?.is_answer)
        {
            if (f_answer?.is_confirm)
            {
                return (
                    <>
                        <CheckSquare width={"15px"} className='cursor-pointer relative'/>
                        <span className='text-danger'>*</span>
                    </>
                )
            }
            else
            {
                return (
                    <>
                        <XSquare width={"15px"} className='cursor-pointer relative'/>
                        <span className='text-danger'>*</span>
                    </>
                )
            }
		}
        else
        {
			return (
				<>
					<Square width={"15px"} className='cursor-pointer relative' onClick={() => handleRequestSolve(row, unit?.id)} />
					<span className='text-danger'>*</span>
				</>
			)
		}
	}

	function request_flag_color(request_flag)
    {
        let color = ''
        let request_flag_name = ''

        if(request_flag === 1)
        {
            color = 'light-info'
            request_flag_name = 'Оюутан илгээсэн'
        }
        else if (request_flag === 2)
        {
            color = 'light-warning'
            request_flag_name = 'Оюутан цуцалсан'
        }
        else if (request_flag === 3)
        {
			color = 'light-success'
			request_flag_name = 'Зөвшөөрөгдсөн'
        }
        else if (request_flag === 4)
        {
			color = 'light-danger'
			request_flag_name = 'Татгалзсан'
        }

        return (
            <Badge color={color} >
                {request_flag_name}
            </Badge>
        )
    }

	const columns = [
		{
			name: "№",
			selector: (row, index) => {
                return (
                    (currentPage-1) * rowsPerPage + index + 1
                )
            },
			width: "100px",
			center: true
		},
		{
			header: 'student',
			name: `${t('Оюутан')}`,
            center: true,
			selector: (row) => {
				return (
					<a role="button" className='text-decoration-underline' href={`/student/${row.student.id}/info/`} target="_blank" >
						{row?.student?.full_name} {row?.student.code}
					</a>
				)
			},
		},
        {
            header: 'leave_type',
            name: `${t('Чөлөөний төрөл')}`,
            selector: (row) => row?.leave_type.leave_name,
            sortable: false,
            width: "250px",
            left: true,
        },
        {
            header: 'leave_type',
            name: `${t('Чөлөөний хугацаа')}`,
            selector: (row) => {
                let betweenDate = ''

                let startDate = new Date(row?.start_date)

                if (row?.leave_type?.leave_id == 1)
                {
                    const customDate = new Date(row?.start_date)
                    customDate.setFullYear(customDate.getFullYear() + 1)

                    betweenDate = `${startDate.getFullYear()}-${zeroFill(startDate.getMonth() + 1)}-${zeroFill(startDate.getDate())} - ${customDate.getFullYear()}-${zeroFill(customDate.getMonth() + 1)}-${zeroFill(customDate.getDate())}`
                }
                else if (row?.leave_type?.leave_id == 2)
                {
                    const customDate = new Date(row?.start_date)
                    customDate.setMonth(customDate.getMonth() + parseInt(row?.count));
                    betweenDate = `${startDate.getFullYear()}-${zeroFill(startDate.getMonth() + 1)}-${zeroFill(startDate.getDate())} - ${customDate.getFullYear()}-${zeroFill(customDate.getMonth() + 1)}-${zeroFill(customDate.getDate())}`
                }
                else if (row?.leave_type?.leave_id == 3)
                {
                    const customDate = new Date(row?.start_date)
                    customDate.setDate(customDate.getDate() + parseInt(row?.count))
                    betweenDate = `${startDate.getFullYear()}-${zeroFill(startDate.getMonth() + 1)}-${zeroFill(startDate.getDate())} - ${customDate.getFullYear()}-${zeroFill(customDate.getMonth() + 1)}-${zeroFill(customDate.getDate())}`

                }

                return betweenDate
            },
            sortable: false,
            width: "230px",
            center: true,
        },
	]

	if (roleMenus.length > 0)
    {
		roleMenus.map((menu) => {
            if (menu?.id == COMPLAINT_UNIT_BMA_ID)
            {
                isHaveBma = true
            }
            else
            {
                columns.push(
                {
                    name: `${t(`${menu?.name}`)}`,
                    cell: (row) => {
                        countBma++
                        if (row?.answers.find(element => element.id == menu?.id)?.is_confirm)
                        {
                            countBmaIsSolved++
                        }
                        return (
                            menu?.is_solve
                            ?
                                request_answer(row, menu)
                            :
                                row?.answers.find(element => element.id == menu?.id)?.is_confirm
                                ?
                                    <CheckSquare width={"15px"}>Бөглөсөн</CheckSquare>
                                :
                                    <Square width={"15px"} />
                        )
                    },
                    minWidth: "80px",
                    center: true
                })
            }
		})
	}

    if (isHaveBma)
    {
        columns.push(
            {
                name: `${t(`Бүртгэл мэдээллийн алба`)}`,
                cell: (row) => {
                    return (
                        [1, 3].includes(row?.is_solved)
                        ?
                            row?.answers.find(element => element.id == COMPLAINT_UNIT_BMA_ID).is_answer
                            ?
                                row?.answers.find(element => element.id == COMPLAINT_UNIT_BMA_ID)?.is_confirm
                                ?
                                    <Button
                                        color='primary'
                                        disabled={true}
                                        size='sm'
                                    >
                                        <span className='align-middle ms-50'>{t('Зөвшөөрсөн')}</span>
                                    </Button>
                                :
                                    <Button
                                        color='primary'
                                        disabled={true}
                                        size='sm'
                                    >
                                        <span className='align-middle ms-50'>{t('Татгалзсан')}</span>
                                    </Button>
                            :
                                countBma == countBmaIsSolved
                                ?
                                    roleMenus.find(element => element.id == COMPLAINT_UNIT_BMA_ID).is_solve
                                    ?
                                        <Button
                                            color='primary'
                                            size='sm'
                                            onClick={() => handleRequestSolve(row, COMPLAINT_UNIT_BMA_ID)}
                                        >
                                            <span className='align-middle ms-50'>{t('Шийдвэрлэх')}</span>
                                        </Button>
                                    :
                                        <Button
                                            color='primary'
                                            size='sm'
                                            disabled={true}
                                        >
                                            <span className='align-middle ms-50'>{t('Шийдвэрлэхээр хүлээгдэж буй')}</span>
                                        </Button>
                                :
                                    <>
                                        <div id={`requestLeaveDatatableBma2${row.id}`} >
                                            <Square width={"15px"} />
                                            <AlertCircle width={"13px"} className='mb-1' />
                                        </div>
                                        <UncontrolledTooltip placement='top' target={`requestLeaveDatatableBma2${row.id}`}>Цуцлагдсан эсвэл бүрэн шийдвэрлэгдэж амжаагүй байгаа.</UncontrolledTooltip>
                                    </>
                        :
                        <></>
                    )
                },
                minWidth: "80px",
                center: true
            }
        )
    }

    {
        columns.push(
            {
                header: 'title',
                name: `${t('шийдвэрлэсэн эсэх')}`,
                selector: (row) => (
                    [2, 3, 4].includes(row?.is_solved)
                    ?
                        request_flag_color(row?.is_solved)
                    :
                        <>
                            <Badge color={"light-info"} >
                                Оюутан илгээсэн
                            </Badge>
                            <span className='text-danger'>*</span>
                        </>
                ),
                sortable: true,
                minWidth: "220px",
                maxWidth: "220px",
                wrap:true,
                center: true,
            },
            {
                name: `${t('Дэлгэрэнгүй')}`,
                selector: (row) => (
                    <div className='text-center' style={{ width: 'auto' }} >
                        <a
                            id={`requestLeaveDatatableDetails${row.id}`}
                            onClick={() => handleRequestDetail(row?.id, row)}
                        >
                            <Badge color="light-info" pill><Book width={"15px"} /></Badge>
                        </a>

                        <UncontrolledTooltip placement='top' target={`requestLeaveDatatableDetails${row.id}`}>Дэлгэрэнгүй</UncontrolledTooltip>

                        {
                            row?.is_solved == 3
                            &&
                            <>
                                <Link
                                    id={`requestLeaveDatatablePrint${row.id}`}
                                    to={`/request/leave/print/${row.id}`}
                                    target='_blank'
                                    className="ms-1"
                                >
                                    <Badge color="light-secondary" pill><Printer width={"15px"} /></Badge>
                                </Link>

                                <UncontrolledTooltip placement='top' target={`requestLeaveDatatablePrint${row.id}`}>Хэвлэх</UncontrolledTooltip>
                            </>
                        }
                    </div>
                ),
                width: "140px",
                center: true,
            }
        )
    }

    return columns
}
