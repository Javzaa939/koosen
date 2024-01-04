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
	const page_count = Math.ceil(total_count / rowsPerPage)

	/** Сонгосон хуудасны тоо датаны тооноос их болсон үед хуудаслалт 1-ээс эхлэнэ */
    if (currentPage > page_count) {
        currentPage = 1
    }

	const focusData = useRef(undefined)
	const [ error_message, setErrorMessage ] = useState('')
    const [ index_name, setIndName ] = useState('')

	// Api
	const scoreApi = useApi().score.register
	const { fetchData } = useLoader({ isFullScreen: false })

	/** Input-ээс идэвхгүй болох үеийн event */
	const focusOut = (event) => {
		if (focusData.current || focusData.current == '')
		{
			event.target.value = focusData.current
		}
	}

	const handleSetTeachResult = async(event, rowIdx, row, key) => {
		var value = event.target.value
        if (["e", "E", "+", "-"].includes(event.key))
        {
            event.preventDefault()
        }
        if (event.key === 'Enter')
        {
            // const rowsInput = [...datas];
            // var item_datas = rowsInput[rowIdx]
            if (value > 100) {
                setErrorMessage(`100-иас их утга авах боломжгүй`)
            } else {
                setErrorMessage('')

                row[key] = value || 0;

                const { success, data } = await fetchData(scoreApi.putScore(row?.id, row))
                if(success)
                {
                    focusData.current = undefined
                    var nextElementId = `${key}-${rowIdx + 1}-input`
                    var element = document.getElementById(`${nextElementId}`)

                    if (element) element.focus()
                    else event.preventDefault()

                    setChangeValue('')
                }
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
			name: `${t('Оюутны код')}`,
			selector: (row)=> (row?.student?.code + ' ' + row?.student?.first_name),
            sortable: true,
			minWidth: "200px",
			center: true,
			wrap: true
		},
		{
			header: 'lesson__name',
			name: `${t('Хичээлийн нэр')}`,
			selector: (row) => (row?.lesson?.code + ' ' +  row?.lesson?.name),
            sortable: true,
			minWidth: "200px",
			center: true,
			wrap: true
        },
		{
			header: 'teach_score',
			name: `${t('Багшийн оноо')}`,
			selector: (row) => row?.teach_score,
            sortable: true,
			center: true,
			minWidth: "80px",
        },
		{
			header: 'exam_score',
			name: `${t('Шалгалтын оноо')}`,
			selector: (row) => row?.exam_score,
            sortable: true,
			center: true,
			minWidth: "180px",
        },
		{
			header: 'total',
			name: `${t('Нийт оноо')}`,
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
							disabled={(Object.keys(user).length > 0 && (user?.permissions.includes('lms-score-update')) || user?.is_superuser)  ? false : true}
							onFocus={(e) => focusData.current = (e.target.value)}
							onKeyPress={(e) => {
								setIndName(`score_total-${index}-input`)
								handleSetTeachResult(e, index, row, 'score_total')
							}}
							invalid={(`score_total-${index}-input` === index_name) && error_message ? true : false}
						/>
						{(`score_total-${index}-input` == index_name) && error_message && <FormFeedback className='d-block'>{error_message}</FormFeedback>}
					</>
				)
			},
            sortable: false,
			center: true,
			minWidth: "50px",
        },
		{
			header: 'assessment',
			name: `${t('Үсгэн үнэлгээ')}`,
			selector: (row) => row?.assessment,
            sortable: true,
			minWidth: "50px",
			center: true
        },
		{
			header: 'lesson_year',
			name: `${t('Хичээлийн жил')}`,
			selector: (row) => row?.lesson_year,
            sortable: true,
			minWidth: "50px",
			center: true
        },
		{
			header: 'lesson_season',
			name: `${t('Улирал')}`,
			selector: (row) => row?.lesson_season?.season_name,
            sortable: true,
			minWidth: "50px",
			center: true
        },
	]

    return columns

}
