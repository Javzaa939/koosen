import React, { useState, useRef, useContext} from "react";

import useLoader from "@hooks/useLoader";
import useModal from '@hooks/useModal'

import {
    Input,
	FormFeedback,
	Badge,
	UncontrolledTooltip
} from "reactstrap";

import AuthContext from '@context/AuthContext'

import useApi from '@hooks/useApi';
import { X } from 'react-feather'

import { t } from "i18next";

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count, seasonNameOption, handleDelete) {

	const { user } = useContext(AuthContext)
	const { fetchData } = useLoader({ isFullScreen: false })

    const page_count = Math.ceil(total_count / rowsPerPage)

    // /** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

	const focusData = useRef(undefined)
	const [ error_message, setErrorMessage ] = useState('')
    const [ index_name, setIndName ] = useState('')

	// Api
	const scoreApi = useApi().score.register
	const { showWarning } = useModal()

	/** Input-ээс идэвхгүй болох үеийн event */
	const focusOut = (event) => {
		if (focusData.current || focusData.current == '')
		{
			event.target.value = focusData.current
		}
	}

	async function onSubmit(row, value, index, key, not_score=true)
	{
		let cdata = {}

		cdata = {
			[key]: value,
			'not_score': not_score
		}
        if(row.id) {
            const { success } = await fetchData(scoreApi.putScore(row?.id, cdata))
            if(success) {
				focusData.current = (undefined)

				row[`${key}`] = value

				var nextElementId = `${key}-${index + 1}-input`
				var element = document.getElementById(`${nextElementId}`)
				if (element) element.focus()
			}
        }
    }

	const handleChangeScore = (event, code, index, key, check_score=100) => {
		setErrorMessage('')
		if (["e", "E", "+", "-"].includes(event.key)) {
			event.preventDefault()
		}
		else if (event.key === 'Enter') {

			const value = event.target.value || 0

			if (value > check_score) {
                setErrorMessage(`${check_score}-иас их утга авахгүй`)
            } else {
                setErrorMessage('')

				onSubmit(code, value, index, key)
            }
		}
	};

	const handleChangeValue = (event, code, index, key) => {
		if (["e", "E", "+", "-"].includes(event.key)) {
			event.preventDefault()
		}
		else if (event.key === 'Enter') {

			const value = event.target.value || ''

			if (value ) {
				onSubmit(code, value, index, key, false)
            }
		}
	};

    const columns = [
		{
			name: "№",
			selector: (row, index) => (currentPage-1) * rowsPerPage + index + 1,
			maxWidth: "30px",
			center: true
		},
		{
			header: 'student__first_name',
			name: t("Оюутны нэр"),
			selector: (row) => row?.student?.code + ' ' +  row?.student?.last_name + ' ' + row?.student?.first_name,
            center: true,
			sortable: true,
			minWidth: "150px",
		},
		{
			header: 'lesson__name',
			name: t("Хичээлийн нэр"),
			selector: (row) => (<span title={row?.lesson?.code + ' ' + row?.lesson?.name}>{ row?.lesson?.code + ' ' + row?.lesson?.name}</span>),
			minWidth: "200px",
			sortable: true,
			left: true,
			wrap: true
		},
		{
			header: 'teacher__first_name',
			name: t("Багш"),
			selector: (row) => {
				if(row?.teacher) {
					if(row?.teacher?.code && row?.teacher?.first_name) {
						return row?.teacher?.code +' '+ row?.teacher?.first_name
					}
					else if(row?.teacher?.first_name) return row?.teacher?.first_name

				}
			},

            sortable: true,
            center: true,
		},
		{
			header: 'teach_score',
			name: t("Багшийн оноо  (enter дарж хадгална уу)"),
			selector: (row, index) => {
				return (
					<>
						<Input
							id={`teach_score-${index}-input`}
							defaultValue={row?.teach_score}
							onBlur={focusOut}
							type="number"
							bsSize='sm'
							placeholder={`Багшийн оноо`}
							disabled={(Object.keys(user).length > 0 && (user?.permissions.includes('lms-score-update')) || user?.is_superuser) ? false : true}
							onFocus={(e) => focusData.current = (e.target.value)}
							onKeyPress={(e) => {
								setIndName(`teach_score-${index}-input`)
								handleChangeScore(e, row, index, 'teach_score', 70)
							}}
							invalid={(`teach_score-${index}-input` === index_name) && error_message ? true : false}
						/>
						{(`teach_score-${index}-input` == index_name) && error_message && <FormFeedback className='d-block'>{error_message}</FormFeedback>}
					</>
				)
			},
            sortable: true,
            center: true,
			minWidth: "150px",
		},
		{
			header: 'exam_score',
			name: t("Шалгалтын оноо (enter дарж хадгална уу)"),
			selector: (row, index) => {
				return (
					<>
						<Input
							id={`exam_score-${index}-input`}
							defaultValue={row?.exam_score }
							onBlur={focusOut}
							type="number"
							bsSize='sm'
							placeholder={`Шалгалтын оноо`}
							disabled={(Object.keys(user).length > 0 && (user?.permissions.includes('lms-score-update')) || user?.is_superuser) ? false : true}
							onFocus={(e) => focusData.current = (e.target.value)}
							onKeyPress={(e) => {
								setIndName(`exam_score-${index}-input`)
								handleChangeScore(e, row, index, 'exam_score', 30)
							}}
							invalid={(`exam_score-${index}-input` === index_name) && error_message ? true : false}
						/>
						{(`exam_score-${index}-input` == index_name) && error_message && <FormFeedback className='d-block'>{error_message}</FormFeedback>}
					</>
				)
			},
			minWidth: "150px",
			sortable: true,
            center: true,
		},
		{
			header: 'lesson_year',
			name: `${t('Хичээлийн жил (enter дарж хадгална уу)')}`,
			selector: (row, index) => {
				return (
					<Input
						id={`lesson_year-${index}-input`}
						defaultValue={row?.lesson_year}
						onBlur={focusOut}
						type="text"
						bsSize='sm'
						placeholder={`Хичээлийн жил`}
						disabled={(Object.keys(user).length > 0 && (user?.permissions.includes('lms-score-update')) || user?.is_superuser) ? false : true}
						onFocus={(e) => focusData.current = (e.target.value)}
						onKeyPress={(e) => {
							setIndName(`lesson_year-${index}-input`)
							handleChangeValue(e, row, index, 'lesson_year')
						}}
					/>
				)
			},
			center: true,
			minWidth: "180px",
        },
		{
			header: 'lesson_season',
			name: `${t('Улирал (enter дарж хадгална уу)')}`,
			selector: (row, index) => {
				return (
					<Input
						id={`lesson_season-${index}-input`}
						defaultValue={row?.lesson_season?.id || ''}
						onBlur={focusOut}
						type="select"
						bsSize='sm'
						disabled={(Object.keys(user).length > 0 && (user?.permissions.includes('lms-score-update')) || user?.is_superuser) ? false : true}
						onFocus={(e) => focusData.current = (e.target.value)}
						onKeyPress={(e) => {
							setIndName(`lesson_season-${index}-input`)
							handleChangeValue(e, row, index, 'lesson_season')
						}}
					>
						{
							seasonNameOption.map((season, idx) => (
								<option
									key={idx}
									value={season.id}
								>
									{season.season_name}
								</option>
						))}
					</Input>
				)
			},
			center: true,
			minWidth: "130px",
        },
		{
			header: 'total',
			name: 'Нийт оноо үнэлгээ',
			center: true,
			selector: (row) => row?.score_total + ' ' + row?.assessment
		},
		{
			name: 'Үйлдэл',
			center: true,
			selector: (row) => (
				<>
					<a role="button"
						onClick={() => showWarning({
							header: {
								title: `${t('Дүн устгах')}`,
							},
							question: `Та "${row?.lesson?.code + ' ' + row?.lesson?.name}" хичээлийн дүн устгахдаа итгэлтэй байна уу?`,
							onClick: () => handleDelete(row.id),
							btnText: 'Устгах',
						})}
						id={`complaintListDatatableCancel${row?.id}`}
					>
						<Badge color="light-danger" pill><X width={"100px"} /></Badge>
					</a>
					<UncontrolledTooltip placement='top' target={`complaintListDatatableCancel${row.id}`} >Устгах</UncontrolledTooltip>
				</>
			)
		},
	]

    return columns

}
