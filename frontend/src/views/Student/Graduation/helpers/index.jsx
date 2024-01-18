import { useContext, useRef } from 'react';

import { X, Edit, Printer, AlertOctagon } from "react-feather";
import { Badge, UncontrolledTooltip, Input } from 'reactstrap';

import useModal from '@hooks/useModal'

import { t } from 'i18next'

import SchoolContext from "@context/SchoolContext"
import useLoader from "@hooks/useLoader";
import useApi from '@hooks/useApi';

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, editModal, handleDelete, user)
{
	const { school_id } = useContext(SchoolContext)

	const { showWarning } = useModal()
	const { fetchData } = useLoader({ isFullScreen: false })
	const focusData = useRef(undefined)

    const page_count = Math.ceil(total_count / rowsPerPage)

	// Api
	const graduateApi = useApi().student

	/** Input-ээс идэвхгүй болох үеийн event */
	const focusOut = (event) => {
		if (focusData.current || focusData.current == '')
		{
			event.target.value = focusData.current
		}
	}

	const handleSetRegistrationResult = async(event, id, index, key) => {

		var value = event.target.value

        if (["e", "E", "+", "-"].includes(event.key))
        {
            event.preventDefault()
        }
        if (event.key === 'Enter')
        {
			let cdata = {
				[key]: value
			}

			if (id){
				const { success } = await fetchData(graduateApi.putRegNumAndDiplom(cdata, id))
				if(success)

				{
					focusData.current = undefined

					var nextElementId = `${key}-${index + 1}-input`
					var element = document.getElementById(`${nextElementId}`)

					if (element) element.focus()

				}
			}

        }
    };

	const handleSetDiplomResult = async(event, id, index, key) => {

		var value = event.target.value

        if (["e", "E", "+", "-"].includes(event.key))
        {
            event.preventDefault()
        }
        if (event.key === 'Enter')
        {
			let cdata = {
				[key]: value
			}

			if (id){
				const { success} = await fetchData(graduateApi.putRegNumAndDiplom(cdata, id))
				if(success)
				{
					focusData.current = undefined

					var nextElementId = `${key}-${index + 1}-input`
					var element = document.getElementById(`${nextElementId}`)

					if (element) element.focus()


				}
			}
        }
    };

    // /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

	function printMongolianGra(data, printValue)
	{
		localStorage.setItem('blankDatas', JSON.stringify(data))

		let button = document.getElementById('clickBtn')

        switch (printValue)
        {
            case 'mongolian':
                button.href = `/student/graduation/print-mongolia/`
                break;

            case 'english':
                button.href = `/student/graduation/print-english/`
                break;

            case 'uigarjin':
                button.href = `/student/graduation/print-national/`
                break;

            default:
                break;
        }

        button.click()
	}

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			header: 'student__code',
			name: t("Оюутны код"),
			selector: (row) => (row?.student?.code),
            sortable: true,
            center: true,
			minWidth: "180px",
		},
		{
			header: 'student__first_name',
			name: t("Овог Нэр"),
			selector: (row) => row?.student?.full_name,
            sortable: true,
            center: true,
			minWidth: '200px',
			wrap: true,
        },
		// {
		// 	header: 'lesson',
		// 	name: t("Дипломын хичээл"),
		// 	selector: (row) => `${row?.lesson?.code} ${row?.lesson?.name}`,
        //     sortable: false,
		// 	minWidth: "200px",
		// 	center: true,
		// 	wrap: true,
		// },
		// {
		// 	header: 'diplom_topic',
		// 	name: t("Дипломын сэдэв"),
		// 	selector: (row) => row?.diplom_topic,
        //     center: true,
		// 	sortable: false,
		// 	minWidth: "200px",
		// },
		{
			header: 'leader',
			name: t("Удирдагч багш"),
			selector: (row) => row?.leader,
            sortable: false,
            center: true,
			minWidth: "80px",
		},
		{
			header: 'diplom_num',
			name: t("Дипломын дугаар"),
			selector: (row, diplom_num) =>
			{
				return (
					<>
						<div className='d-flex'>
							<Input
								id={`diplom_num-${diplom_num}-input`}
								type="text"
								bsSize='sm'
								placeholder={(`дипломын дугаар`)}
								defaultValue={row?.diplom_num}
								disabled={(Object.keys(user).length > 0 && user?.is_superuser) ? false : true}
								onBlur={focusOut}
								onFocus={(e) => focusData.current = (e.target.value)}
								onKeyPress={(e) => {
									handleSetDiplomResult(e, `${row?.id}`, diplom_num, 'diplom_num')
								}}
							/>
							<AlertOctagon id={`diplomNum${row?.diplom_num}`} width={"20px"} className='ms-1' />
							<UncontrolledTooltip placement='top' target={`diplomNum${row?.diplom_num}`} >Enter дарсан тохиолдолд дипломын дугаар хадгалагдах болно.</UncontrolledTooltip>
						</div>

					</>
				)
			},
			minWidth: "250px",
			sortable: true,
            center: true,
		},
		{
			header: 'registration_num',
			name: t("Бүртгэлийн дугаар"),
			selector: (row, registertion_num) =>
			{
				return (
					<>
						<div className='d-flex'>
							<Input
								id={`registration_num-${registertion_num}-input`}
								type="text"
								bsSize='sm'
								placeholder={(`бүртгэлийн дугаар`)}
								defaultValue={row?.registration_num}
								onBlur={focusOut}
								onFocus={(e) => focusData.current = (e.target.value)}
								disabled={(Object.keys(user).length > 0 && user?.is_superuser) ? false : true}
								onKeyPress={(e) => {
									handleSetRegistrationResult(e, `${row?.id}`, registertion_num, 'registration_num')
								}}
							/>
							<AlertOctagon id={`registrationNum${row?.registration_num}`} width={"20px"} className='ms-1' />
							<UncontrolledTooltip placement='top' target={`registrationNum${row?.registration_num}`} >Enter дарсан тохиолдолд бүртгэлийн дугаар хадгалагдах болно.</UncontrolledTooltip>
						</div>
					</>
				)
			},
			minWidth: "250px",
			sortable: true,
            center: true,
		},
	]

	if(Object.keys(user).length > 0) {
		columns.push(
			{
				name: t("Үйлдэл"),
				width: "200px",
				center: true,
				selector: (row) => (
					<div className="text-center" style={{ width: "auto" }}>
						{
							user.permissions.includes('lms-student-graduate-update')&&
							<>
							<a role="button" onClick={() => { editModal(row.id)} }
								id={`complaintListDatatableEdit${row?.id}`}
								style={{ marginRight: '5px' }}
							>
								<Badge color="light-secondary" pill><Edit  width={"15px"} /></Badge>
							</a>

							<UncontrolledTooltip placement='top' target={`complaintListDatatableEdit${row.id}`} >Засах</UncontrolledTooltip>
						</>
						}
						{
							user.permissions.includes('lms-student-graduate-delete') && school_id &&
							<>
								<a role="button"
									style={{ marginRight: '5px' }}
									onClick={() => showWarning({
										header: {
											title: t(`Төгсөлтийн ажил`),
										},
										question: t(`Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?`),
										onClick: () => handleDelete(row.id),
										btnText: t('Устгах'),
									})}
									id={`complaintListDatatableCancel${row?.id}`}
								>
									<Badge color="light-danger" pill><X width={"100px"} /></Badge>
								</a>
								<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
							</>
						}
						{
							<>
								<a role="button"
									style={{ marginRight: '5px' }}
									onClick={() => printMongolianGra(row, 'mongolian')}
									id={`complaintListDatatablePrintMnt${row?.id}`}
								>
									<Badge color="light-success" pill><Printer width={"100px"} /></Badge>
								</a>
								<UncontrolledTooltip placement='top' target={`complaintListDatatablePrintMnt${row.id}`} ><Printer width={"16px"} style={{ marginRight: '3px' }} />Хэвлэх-MNT</UncontrolledTooltip>
								<a role="button"
									style={{ marginRight: '5px' }}
									onClick={() => printMongolianGra(row, 'english')}
									id={`complaintListDatatablePrintEng${row?.id}`}
								>
									<Badge color="light-success" pill><Printer width={"100px"} /></Badge>
								</a>
								<UncontrolledTooltip placement='top' target={`complaintListDatatablePrintEng${row.id}`} ><Printer width={"16px"} style={{ marginRight: '3px' }} />Хэвлэх-ENG</UncontrolledTooltip>
								<a role="button"
									style={{ marginRight: '5px' }}
									onClick={() => printMongolianGra(row, 'uigarjin')}
									id={`complaintListDatatablePrintNat${row?.id}`}
								>
									<Badge color="light-success" pill><Printer width={"100px"} /></Badge>
								</a>
								<UncontrolledTooltip placement='top' target={`complaintListDatatablePrintNat${row.id}`} ><Printer width={"16px"} style={{ marginRight: '3px' }} />Хэвлэх-UIG</UncontrolledTooltip>
							</>
						}
					</div>
				)
			}
		)
	}


    return columns

}
