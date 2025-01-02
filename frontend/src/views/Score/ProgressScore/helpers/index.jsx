import  { useContext, useState, useRef } from 'react'
import { AlertOctagon } from 'react-feather'
import { UncontrolledTooltip, Input, FormFeedback } from 'reactstrap'

import { t } from 'i18next'

import useApi from "@hooks/useApi";
import useLoader from "@hooks/useLoader";

import AuthContext from "@context/AuthContext"
import SchoolContext from "@context/SchoolContext"
import ActiveYearContext from "@context/ActiveYearContext"

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, select_value, exam_date, isDadlaga)
{
	const page_count = Math.ceil(total_count / rowsPerPage)

	const [ errors, setErrors ] = useState({ teach_score: [], exam_score: [] })

    const { user } = useContext(AuthContext)
    const { school_id } = useContext(SchoolContext)
	const { cyear_name, cseason_id } = useContext(ActiveYearContext)
	const focusData = useRef(undefined)
	const { fetchData } = useLoader({});

	const scoreApi = useApi().score.register

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }
	async function onSubmit(row, data, type, count)
	{
		let cdata = {}
        cdata['created_user'] = user.id
		cdata['lesson'] = select_value?.lesson
        cdata['lesson_season'] = cseason_id
        cdata['lesson_year'] = cyear_name
        cdata['school'] = school_id
        cdata['status'] = 2
		cdata['student'] = row?.student?.id

		if (type == 'teach_score')
		{
			cdata['teach_score'] = parseInt(data)
			if (row?.exam_score)
			{
				cdata['exam_score'] = row?.exam_score
			}
		}
		else
		{
			cdata['exam_score'] = parseInt(data)
			if (row?.teach_score)
			{
				cdata['teach_score'] = row?.teach_score
			}
		}

		cdata['teacher'] = select_value?.teacher
        cdata['updated_user'] = user.id

        if(row.student?.id)
        {
            const { success, data } = await fetchData(scoreApi.put(cdata, row.student?.id))
            if(success)
			{
				focusData.current = (undefined)

				var nextElementId = `${count + 1}-input`
				var element = document.getElementById(`${nextElementId}`)
				if (element) element.focus()

				document.getElementById(`assessment${row.lesson}${row?.id}`).innerText = data
			}
        }
        else
        {
            const { success, data } = await fetchData(scoreApi.post(cdata))
            if(success)
			{
				focusData.current = (undefined)

				var nextElementId = `${count + 1}-input`
				var element = document.getElementById(`${nextElementId}`)
				if (element) element.focus()

				document.getElementById(`assessment${row.lesson}${row?.id}`).innerText = data
			}
        }
    }

	const handleSetTeachResult = (event, id, score) => {
		if (["e", "E", "+", "-"].includes(event.key))
		{
			event.preventDefault()
		}
		else if (event.key === 'Enter')
		{
			if (event.target.value < 0 || event.target.value > 30 || event.target.value == '' || event.target.value == undefined)
			{
				let teachErrors = errors.teach_score
				teachErrors.push(id)

				setErrors({ teach_score: teachErrors, exam_score: errors.exam_score })
			}
			else
			{
				if (errors.teach_score.includes(id))
				{
					let teachErrors = errors.teach_score
					teachErrors.pop(id)
					setErrors(teachErrors)
				}
				onSubmit(score, event.target.value, 'teach_score')
			}
		}
	};

	const handleSetExamResult = (event, id, score, count) => {
		if (["e", "E", "+", "-"].includes(event.key))
		{
			event.preventDefault()
		}
		else if (event.key === 'Enter')
		{
			if (event.target.value < 0 || event.target.value > (isDadlaga ? 100 : 30) || event.target.value == '' || event.target.value == undefined)
			{
				let examErrors = errors.exam_score
				examErrors.push(id)
				setErrors({ teach_score: errors.teach_score, exam_score: examErrors })
			}
			else
			{
				if (errors.exam_score.includes(id))
				{
					let examErrors = errors.exam_score
					examErrors.pop(id)
					setErrors(examErrors)
				}
				onSubmit(score, event.target.value, 'exam_score', count)
			}
		}
	};


	/** Input-ээс идэвхгүй болох үеийн event */
	const focusOut = (event) => {
		if (focusData.current || focusData.current == ''){
			event.target.value = focusData.current
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
			name: `${t('Оюутны код')}`,
			selector: (row) => (row?.student?.code),
			sortable: true,
			minWidth: "80px",
			center: true,
		},
		{
			header: 'student',
			name: `${t('Оюутны нэр')}`,
			selector: (row) => (row?.student?.last_name + '  ' + row?.student?.first_name),
            sortable: true,
			wrap:true,
			left: true,
        },
		{
			header: 'teach_score',
			name: `${t('Багшийн оноо')}`,
			selector: (row) => (
				<>
					<div className='d-flex'>
						<Input
							className=''
							type='number'
							bsSize='sm'
							placeholder={t('Дүн')}
							defaultValue={row?.teach_score}
							readOnly={true}
							disabled={true}
							onBlur={focusOut}
							onFocus={(e) => focusData.current = (e.target.value)}
							onKeyPress={(e) => handleSetTeachResult(e, `${row.lesson}${row?.id}`, row)}
						/>
						<AlertOctagon id={`complaintListDatatableTeachInput${row?.id}`} width={"20px"} className='ms-1' />
						<UncontrolledTooltip placement='top' target={`complaintListDatatableTeachInput${row.id}`} >Enter дарсан тохиолдолд дүн батлагдах болно.</UncontrolledTooltip>
					</div>
					<FormFeedback className='d-block'>{errors?.teach_score && errors?.teach_score.includes(`${row.lesson}${row?.id}`) && `0-70 хооронд утга оруулна уу.`}</FormFeedback>
				</>
			),
            sortable: true,
			center: true,
        },
        {
			header: 'exam_score',
			name: `${t('Шалгалтын оноо')}`,
			selector: (row, count) =>
			{
				return (
					<>
						<div className='d-flex'>
							<Input
								id={`${count}-input`}
								className=''
								type='number'
								disabled={!exam_date && Object.keys(user).length && user.permissions.includes('lms-score-register-update') ? false : true}
								bsSize='sm'
								placeholder={t('Дүн')}
								defaultValue={row?.exam_score}
								onBlur={focusOut}
								onFocus={(e) => focusData.current = (e.target.value)}
								onKeyPress={(e) => handleSetExamResult(e, `${row.lesson}${row?.id}`, row, count)}
							/>
							<AlertOctagon id={`complaintListDatatableExamInput${row?.id}`} width={"20px"} className='ms-1' />
							<UncontrolledTooltip placement='top' target={`complaintListDatatableExamInput${row.id}`} >Enter дарсан тохиолдолд дүн батлагдах болно.</UncontrolledTooltip>
						</div>
						<FormFeedback className='d-block'>{errors?.exam_score && errors?.exam_score.includes(`${row.lesson}${row?.id}`) && `0-30 хооронд утга оруулна уу.`}</FormFeedback>
					</>
				)
			},
            sortable: true,
			center: true,
        },
		{
			name: `${t('Нийт оноо')}`,
			selector: (row) => <p id={`totalscore${row.lesson}${row?.id}`}>{row?.total_score}</p>,
			center: true,
        },
        {
			name: `${t('Үсгэн үнэлгээ')}`,
			selector: (row) => <p id={`assessment${row.lesson}${row?.id}`}>{row?.assessment?.assesment}</p>,
			center: true,
        },
	]

    return columns
}
