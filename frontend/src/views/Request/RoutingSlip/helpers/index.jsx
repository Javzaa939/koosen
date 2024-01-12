import { useContext } from "react"

import { useTranslation } from 'react-i18next'
import { Link } from "react-router-dom"

import { Badge, UncontrolledTooltip, Button } from 'reactstrap'

import { Book, Square, CheckSquare, AlertCircle, Printer } from 'react-feather'

import AuthContext from "@context/AuthContext"

import { COMPLAINT_UNIT_BMA_ID, COMPLAINT_ALLOW } from '@utility/consts'

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, datas, handleRequestSolve, handleRequestDetail, roleMenus) {
    const { t } = useTranslation()

    const { user } = useContext(AuthContext)

    const page_count = Math.ceil(datas.length / rowsPerPage)

	var isHaveBma = false

    /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

	/** Тухайн шийдвэрлэх нэгж хүсэлтийг шийдвэрлэсэн эсэх */
	function request_answer(row, unit) {
		var answers = row?.answers
		var f_answer = answers.find((answer) => {
			if (answer?.id === unit) return answer
		})

		if (f_answer?.is_answer) {
			return (
				<>
					<CheckSquare width={"15px"} className='cursor-pointer relative'/>
					<span className='text-danger'>*</span>
				</>
			)
		} else {
			return (
				<>
					<Square width={"15px"} className='cursor-pointer relative' onClick={() => handleRequestSolve(row, unit)} />
					<span className='text-danger'>*</span>
				</>
			)
		}
	}

	function request_flag_color(request_flag)
    {
        let color = ''
        let request_flag_name = ''

        if(request_flag === 0)
        {
            color = 'light-info'
            request_flag_name = 'ИЛГЭЭСЭН'
        }
        else if (request_flag === 1)
        {
            color = 'light-warning'
            request_flag_name = 'ШИЙДЭГДЭЖ БАЙГАА'
        }
        else if (request_flag === 2)
        {
			color = 'light-danger'
			request_flag_name = 'ТАТГАЛЗСАН'
        }
        else if (request_flag === 3)
        {
			color = 'light-success'
			request_flag_name = 'ЗӨВШӨӨРСӨН'
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
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			header: 'last_name',
			name: `${t('Овог нэр')}`,
            cell: (row) => row?.student?.full_name,
			wrap: true,
			width: '150px'
		},
		{
			name: `${t('Сургууль')}`,
            cell: (row) => row?.school_name,
			minWidth: "80px",
			center: true
		},
        {
			header: 'profession',
			name: `${t('Хөтөлбөр')}`,
            cell: (row) => row?.profession_name,
			minWidth: "80px",
			sortable: true,
			center: true
		},
        {
			header: 'is_solved',
			name: `${t('Хүсэлтийн төлөв')}`,
            selector: (row) => request_flag_color(row?.isSolved),
			minWidth: "80px",
			sortable: true,
			center: true,
		},
	]

	if (roleMenus.length > 0) {
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
                        return (
                            menu?.is_solve
                            ?
                                request_answer(row, menu?.id)
                            :
                                row?.answers.find(element => element.id === menu?.id)?.is_confirm
                                ?
                                    <CheckSquare width={"15px"}></CheckSquare>
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
                        (row?.is_solved === COMPLAINT_ALLOW)
                        ?
							<Button
								color='success'
								disabled={true}
								size='sm'
							>
								<span className='align-middle ms-50'>{t('Шийдвэрлэгдсэн')}</span>
							</Button>
						:
                            row?.answer_count
                                ?
									<Button
										color='primary'
										size='sm'
										onClick={() => { handleRequestSolve(row, COMPLAINT_UNIT_BMA_ID) } }
									>
										<span className='align-middle ms-50'>{t('Шийдвэрлэх')}</span>
									</Button>
                                :
                                    <>
                                        <div id={`requestLeaveDatatableBma2${row.id}`} >
                                            <Square width={"15px"} />
                                            <AlertCircle width={"13px"} className='mb-1' />
                                        </div>
                                        <UncontrolledTooltip placement='top' target={`requestLeaveDatatableBma2${row.id}`}>Цуцлагдсан эсвэл бүрэн шийдвэрлэгдэж амжаагүй байгаа.</UncontrolledTooltip>
                                    </>
                    )
                },
                minWidth: "100px",
                width: "240px",
                center: true
            }
        )
    }

    if(Object.keys(user).length > 0) {
		columns.push(
			{
				name: t("Үйлдэл"),
                center: true,
				width: "150px",
				selector: (row) => (
					<div className="text-center ms-0" style={{ width: "auto" }}>
						{
							user.permissions.includes('lms-request-correspond-update')&&
							<>
								<a role="button" onClick={() => { handleRequestDetail(row) } }
									id={`correspondDatatableDetail${row?.id}`}
									className='me-1'
								>
									<Badge color="light-info" pill ><Book width={"20px"}/></Badge>
								</a>

								<UncontrolledTooltip placement='top' target={`correspondDatatableDetail${row.id}`}>Дэлгэрэнгүй</UncontrolledTooltip>
							</>
						}
                        {
                            row?.is_solved == 3
                            &&
                                <>
                                    <Link
                                        id={`requestCorrespondDatatablePrint${row.id}`}
                                        to={`/request/routingslip/print/${row.id}`}
                                        target='_blank'
                                        className="ms-1"
                                    >
                                        <Badge color="light-secondary" pill><Printer width={"15px"} /></Badge>
                                    </Link>

                                    <UncontrolledTooltip placement='top' target={`requestCorrespondDatatablePrint${row.id}`}>Хэвлэх</UncontrolledTooltip>
                                </>
                        }
					</div>
				)
			}
		)
	}
    return columns
}
