
import React, { useContext } from 'react';

import { t } from 'i18next';
import { Button, Badge, UncontrolledTooltip } from 'reactstrap'
import { Link } from "react-router-dom"
import { Book, CheckSquare, XSquare, AlertCircle, Square, Printer } from 'react-feather'

import AuthContext from "@context/AuthContext"
import { COMPLAINT_UNIT_BMA_ID } from '@utility/consts'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, roleMenus, handleRequestDetail, handleRequestSolve)
{

    const { user } = useContext(AuthContext)

	const page_count = Math.ceil(total_count / rowsPerPage)

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count)
    {
        currentPage = 1
    }

    var isHaveBma = false
    var countBma = 0
    var countBmaIsSolved = 0

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
				return (
					<a role="button" className='text-decoration-underline' href={`/student/${row.student.id}/info/`} target="_blank" >
						{row?.student?.full_name} {row?.student.code}
					</a>
				)
			},
		},
        {
            header: 'complaint_type',
            name: `${t('Өргөдлийн зориулалт')}`,
            selector: (row) => row?.complaint_type.complaint_name
            ,
            sortable: true,
            minWidth: "250px",
            maxWidth: "250px",
            wrap:true,
        },
        {
            header: 'title',
            name: `${t('гарчиг')}`,
            selector: (row) => (
                <span className='text-truncate'>{row?.title}</span>
            ),
            sortable: true,
            minWidth: "250px",
            maxWidth: "250px",
            wrap:true,
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
                        if (row?.answers.find(element => element.id == menu?.id).is_confirm)
                        {
                            countBmaIsSolved++
                        }
                        return (
                            menu?.is_solve
                            ?
                                request_answer(row, menu)
                            :
                                row?.answers.find(element => element.id == menu?.id).is_confirm
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
                                row?.answers.find(element => element.id == COMPLAINT_UNIT_BMA_ID).is_confirm
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
                                    !roleMenus.find(element => element.id == COMPLAINT_UNIT_BMA_ID).is_answer
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
                                    id={`requestComplaintDatatableDetails${row.id}`}
                                    to={`/request/complaint/print/${row.id}`}
                                    target='_blank'
                                    className="ms-1"
                                >
                                    <Badge color="light-secondary" pill><Printer width={"15px"} /></Badge>
                                </Link>

                                <UncontrolledTooltip placement='top' target={`requestComplaintDatatableDetails${row.id}`}>Хэвлэх</UncontrolledTooltip>
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
