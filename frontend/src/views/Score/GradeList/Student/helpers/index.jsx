import React, { useState, useRef, useContext} from "react";

import useLoader from "@hooks/useLoader";

import {
    Input,
	FormFeedback,
} from "reactstrap";

import AuthContext from '@context/AuthContext'

import useApi from '@hooks/useApi';

import { t } from "i18next";

// Хүснэгтийн баганууд
export function getColumns (currentPage, rowsPerPage, total_count) {

	const { user } = useContext(AuthContext)
	const { fetchData } = useLoader({ isFullScreen: true })

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

	/** Input-ээс идэвхгүй болох үеийн event */
	const focusOut = (event) => {
		if (focusData.current || focusData.current == '')
		{
			event.target.value = focusData.current
		}
	}

	async function onSubmit(row, value, index, key)
	{
		let cdata = {}

		cdata = {
			[key]: value
		}
        if(row.id) {
            const { success } = await fetchData(scoreApi.putScore(row?.id, cdata))
            if(success) {
				focusData.current = (undefined)

				row['exam_score'] = value

				var nextElementId = `${key}-${index + 1}-input`
				var element = document.getElementById(`${nextElementId}`)
				if (element) element.focus()
			}
        }
    }

	const handleChangeScore = (event, code, index, key) => {
		if (["e", "E", "+", "-"].includes(event.key)) {
			event.preventDefault()
		}
		else if (event.key === 'Enter') {

			const value = event.target.value || 0

			if (value > 100) {
                setErrorMessage(`100-иас их утга авах боломжгүй`)
            } else {
                setErrorMessage('')

				onSubmit(code, value, index, key)
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
			header: 'student__code',
			name: t("Оюутны код"),
			selector: (row) => row?.student?.code,
            center: true,
			sortable: true,
			minWidth: "150px",
		},
		{
			header: 'student__first_name',
			name: t("Оюутны нэр"),
			selector: (row) => row?.student?.first_name,
            left: true,
			sortable: true,
			minWidth: "150px",
			wrap: true
		},

		{
			header: 'lesson__code',
			name: t("Хичээлийн код"),
			selector: (row) => row?.lesson?.code,
            center: true,
			sortable: true,
			minWidth: "150px",
		},
		{
			header: 'lesson__name',
			name: t("Хичээлийн нэр"),
			selector: (row) => row?.lesson?.name,
			minWidth: "200px",
			sortable: true,
			left: true,
		},
		{
			header: 'volume_kr',
			name: t("Багц цаг"),
			selector: (row) => row?.volume_kr,
			minWidth: "80px",
			center: true,
			wrap: true,
		},
		{
			header: 'teacher__first_name',
			name: t("Багшийн код"),
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
			minWidth: "150px",
		},
		{
			header: 'teach_score',
			name: t("Багшийн оноо"),
			selector: (row) => row?.teach_score,
            sortable: true,
            center: true,
			minWidth: "150px",
		},
		{
			header: 'exam_score',
			name: t("Шалгалтын оноо"),
			selector: (row) => row?.exam_score,
			minWidth: "150px",
			sortable: true,
            center: true,
		},
		{
			header: 'total',
			name: 'Нийт оноо (enter дарж хадгална уу)',
			center: true,
			minWidth: "150px",
			selector: (row, index) => {
				return (
					<>
						<Input
							id={`score_total-${index}-input`}
							defaultValue={row?.score_total}
							onBlur={focusOut}
							type="number"
							bsSize='sm'
							placeholder={`Нийт оноо`}
							disabled={Object.keys(user).length > 0 && (user?.permissions.includes('lms-score-update')) ? false : true}
							onFocus={(e) => focusData.current = (e.target.value)}
							onKeyPress={(e) => {
								setIndName(`score_total-${index}-input`)
								handleChangeScore(e, row, index, 'score_total')
							}}
							invalid={(`score_total-${index}-input` === index_name) && error_message ? true : false}
						/>
						{(`score_total-${index}-input` == index_name) && error_message && <FormFeedback className='d-block'>{error_message}</FormFeedback>}
					</>
				)
			}
		},
		{
			header: 'assessment',
			name: `${t('Үсгэн үнэлгээ')}`,
			selector: (row) => row?.assessment,
            sortable: true,
			minWidth: "180px",
			center: true
        },
		{
			header: 'lesson_year',
			name: `${t('Хичээлийн жил')}`,
			selector: (row) => row?.lesson_year,
			center: true,
			minWidth: "180px",
        },
		{
			header: 'lesson_season',
			name: `${t('Улирал')}`,
			selector: (row) => row?.lesson_season?.season_name,
			center: true,
			minWidth: "130px",
        },
	]


    return columns

}
