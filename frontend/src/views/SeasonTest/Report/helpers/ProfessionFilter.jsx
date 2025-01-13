import { Label } from "reactstrap"
import Select from 'react-select'
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"

import { ReactSelectStyles } from '@src/utility/Utils'
import useApi from "@src/utility/hooks/useApi"
import useLoader from "@src/utility/hooks/useLoader"

export default function ProfessionFilter({setSelected}) {
	// states
	const [options, setOptions] = useState([])

	// primitive vars
	const controlName = 'profession'

	// other hooks
    const { t } = useTranslation()
    const professionApi = useApi().study.professionDefinition
    const { isLoading, fetchData } = useLoader({})

	async function getOptions() {
		const { success, data } = await fetchData(professionApi.getList(''))

		if (success) {
			setOptions(data)
		}
	}

	useEffect(() => { getOptions() }, [])

	return (
		<>
			<Label className="form-label" for={controlName}>
				{t('Хөтөлбөр')}
			</Label>
			<Select
				id={controlName}
				name={controlName}
				isClearable
				classNamePrefix='select'
				className='react-select'
				placeholder={t(`-- Сонгоно уу --`)}
				options={options || []}
				noOptionsMessage={() => t('Хоосон байна')}
				onChange={(val) => {
					setSelected(val?.id || '')
				}}
				styles={ReactSelectStyles}
				getOptionValue={(option) => option.id}
				getOptionLabel={(option) => option.name + ' ' + option.code}
				isLoading={isLoading}
			/>
		</>
	)
}