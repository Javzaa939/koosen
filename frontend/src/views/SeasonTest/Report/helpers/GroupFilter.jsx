import { Label } from "reactstrap"
import Select from 'react-select'
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"

import { ReactSelectStyles } from '@src/utility/Utils'
import useApi from "@src/utility/hooks/useApi"
import useLoader from "@src/utility/hooks/useLoader"

export default function GroupFilter({setSelected}) {
	// states
	const [options, setOptions] = useState([])

	// primitive vars
	const controlName = 'group'

	// other hooks
    const { t } = useTranslation()
    const groupApi = useApi().student.group
    const { isLoading, fetchData } = useLoader({})

	async function getOptions() {
		const { success, data } = await fetchData(groupApi.getList('', '', '', '', ''))

		if (success) {
			setOptions(data)
		}
	}

	useEffect(() => { getOptions() }, [])

	return (
		<>
			<Label className="form-label" for={controlName}>
				{t('Анги')}
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
				getOptionLabel={(option) => option.name}
				isLoading={isLoading}
			/>
		</>
	)
}