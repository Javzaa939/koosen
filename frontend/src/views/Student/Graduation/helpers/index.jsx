import { useContext } from 'react';

import { X, Edit, Printer } from "react-feather";
import { Badge, UncontrolledTooltip } from 'reactstrap';
import { useNavigate } from 'react-router-dom'

import useModal from '@hooks/useModal'

import { t } from 'i18next'

import SchoolContext from "@context/SchoolContext"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, editModal, handleDelete, user)
{
	const { school_id } = useContext(SchoolContext)

	const { showWarning } = useModal()
	const navigate = useNavigate()

    const page_count = Math.ceil(total_count / rowsPerPage)

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
			selector: (row) => row?.diplom_num,
			minWidth: "80px",
			sortable: true,
            center: true,
		},
		{
			header: 'registration_num',
			name: t("Бүртгэлийн дугаар"),
			selector: (row) => row?.registration_num,
			minWidth: "80px",
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
